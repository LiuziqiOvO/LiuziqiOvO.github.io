---
title: 用 git worktree 隔离多 Agent 协作：工作区、分支与行为审计
date: 2026-06-25 11:00:00
categories:
  - 技术笔记
tags:
  - Agent
  - Git
  - Worktree
  - 工程工具
description: 从 git worktree 的隔离语义出发，整理多 Agent 并行协作时的分支策略、常见坑、subagent 触发边界和 trace 观测方法。
review_status: pending
---

## git worktree 与多 Agent 协作

`git worktree` 允许一个仓库同时挂出多个 working tree。多个目录共享同一份对象库和大部分 ref，但每个 worktree 有自己独立的 `HEAD`、index 和工作目录，因此可以在不重复 clone 整仓库的前提下，并行处理多个分支或多个任务。

## 它到底共享什么，隔离什么

| 维度 | 语义 |
| --- | --- |
| 对象库 | 共享。同一个仓库的 commit、tree、blob 只存一份，不需要为每个 Agent 重复 clone。 |
| 普通 refs | 大多共享。`refs/heads/*`、`refs/tags/*` 仍属于同一个仓库命名空间。 |
| `HEAD` | 每个 worktree 独立。不同 Agent 可以各自 checkout 到不同分支或 detached commit。 |
| index | 每个 worktree 独立。一个 Agent 的 `git add`、冲突状态或 staged 集不会污染另一个 Agent。 |
| 工作目录文件 | 每个 worktree 独立。Agent 在各自目录里的改动互不覆盖。 |
| 配置 | 默认共享 `.git/config`；开启 `extensions.worktreeConfig` 后，可为单个 worktree 挂独立配置。 |

Git 官方文档把它称为 linked working tree。主仓库仍保留 main worktree，其他目录通过 `.git` 文件回指主仓库的 `.git/worktrees/<id>/` 管理目录。实际效果是“多个 checkout，共享底层仓库，但各自维护自己的现场”。

## 为什么多 Agent 常配 worktree

多 Agent 编码或调研的核心问题不是“能不能并行”，而是“并行时如何避免互相踩工作区状态”。`git worktree` 刚好把最容易相互污染的三类状态拆开：

- 文件系统改动隔离：两个 Agent 同时改同名文件时，不会直接在同一个目录里互相覆盖。
- 分支现场隔离：每个 Agent 可以绑定自己分支，避免主线程频繁 `stash`、`checkout`、`restore`。
- 暂存区隔离：每个 Agent 独立组织 staged 变更，提交粒度更清楚。

因此它很适合下面两类协作模式：

- 主线程 + worker：主线程负责调度和集成，worker 在各自 worktree 做局部实现或验证。
- 一任务一分支：每个 Agent 从同一基线拉出独立分支，完成后统一 merge 或 cherry-pick。

这类模式比“同一目录里多个 Agent 轮流改”更稳定，因为冲突被推迟到显式集成点，而不是在执行过程中随机发生。

## 常见工作流

### 从主分支切多个 Agent 工作目录

```bash
git worktree add -b agent/search ../repo-agent-search main
git worktree add -b agent/docs ../repo-agent-docs main
git worktree add -b agent/fix ../repo-agent-fix main
```
<!-- 上面应该解释一下命令的参数含义 -->

含义：

- 共享当前仓库对象库，不重复 clone。
- 为每个 Agent 新建一个分支。
- 每个 Agent 在自己的目录内读写文件、暂存、测试、提交。

### Agent 完成后回主线集成

常见做法不是让多个 Agent 直接都在主 worktree 上 merge，而是：

1. 主线程检查各 Agent 分支产物。
2. 逐个 merge、rebase 或 cherry-pick 到集成分支。
3. 解决真正的文本冲突和语义冲突。
4. 集成完成后删除临时 worktree。

```bash
git worktree remove ../repo-agent-search
git branch -d agent/search
```

> TODO：其实现在很多harness都不具备这种能力，我经常发现他开子Agent干完活不merge回主线，好久之后才发现，白干了。

## 它为什么比重复 clone 更常见

| 方案 | 优点 | 代价 |
| --- | --- | --- |
| `git worktree` | 轻量、共享对象库、切分支快、磁盘占用低、适合同仓库多任务并行 | 分支和 refs 仍共享，需要有纪律地命名与清理 |
| 重复 clone | 仓库状态绝对隔离，心智简单 | 磁盘和网络开销大，fetch/依赖缓存/环境重复，主线同步更慢 |
| 同目录多 Agent | 没有额外目录管理成本 | 最容易互相污染 index、未提交改动和 branch state |

对 coding agent 来说，`git worktree` 的关键收益不是省磁盘，而是让“工作区现场”成为可管理资源。每个 Agent 都有自己的 checkout、index 和未提交改动集合，但不用把整个 repo 复制一遍。

## 典型收益

- 降低 `stash` 依赖。主线程不用为了临时切去处理别的任务而频繁藏改动。
- 降低未提交状态污染。一个 Agent 的实验性改动不会卡住另一个 Agent checkout 分支。
- 更容易做并行验证。不同 Agent 可以在各自目录运行测试、静态检查或构建。
- 更容易回收。任务结束后直接 `git worktree remove`，比手动清理散乱目录更可控。

## 常见坑

### 同一分支不能同时被多个 worktree checkout

这是 Git 的保护机制。一个分支一旦被某个 worktree checkout，另一个 worktree 不能再直接 checkout 同一分支，否则会产生“哪个工作区代表该分支现场”的歧义。多 Agent 场景通常用“一 Agent 一分支”规避。

### refs 不是全隔离的

工作目录和 index 是隔离的，但大多数 `refs/heads/*` 仍然共享。一个 Agent 删除、重命名或强推本地分支名，可能影响其他 Agent 的引用语义。因此分支命名最好带任务前缀，例如 `agent/<task>` 或 `worktree-agent-<task>`。

### 默认配置是共享的

如果某个 Agent 需要单独的 sparse checkout、工具路径或实验配置，不能假设改 `.git/config` 只影响自己。需要用 `git config extensions.worktreeConfig true` 后，再用 `git config --worktree` 写 worktree 级配置。

### 子模块支持不是完全无坑

Git 官方文档明确提醒 multiple checkout 仍有实验性边角，submodule 场景尤其要谨慎。复杂 superproject 如果同时由多个 Agent 操作子模块更新、初始化或同步，风险高于普通仓库。

### 临时目录删了，不等于元数据自动干净

如果手动删了 worktree 目录，主仓库下的 `.git/worktrees/<id>/` 元数据可能残留。此时需要 `git worktree prune` 或 `git worktree repair` 进行修复，而不是假设 Git 会立刻感知。

## 多 Agent 调度时的工程约束

- 主线程只负责分派、评审和集成，不和 worker 共用同一 worktree 改代码。
- 每个 Agent 使用独立分支，避免共享 branch HEAD。
- 把冲突解决推迟到 merge 点，不在执行过程中靠口头约定避免碰撞。
- 对写范围敏感的任务，先按目录或模块切分，再决定是否真的需要并行 Agent。
- 长时间存在的 worktree 要定期 `git worktree list` 检查是否 prunable、locked 或已失效。

## Subagent 触发策略

Subagent 的设计不同，本质上是因为要和底层模型的训练分布、产品控制权边界和奖励信号匹配。

| 产品 | subagent 触发方式 | 适配逻辑 |
| --- | --- | --- |
| Codex | 用户显式触发，模型默认不主动创建 | 更贴近“精确遵循指令 + 测试通过”的奖励目标，减少委派决策导致的奖励归因模糊。 |
| Claude Code | 模型自主判断，默认可主动委派 | 把任务拆分和委派判断视为模型能力的一部分，适合由模型动态决定是否需要并行读代码、审阅或规划。 |
| Cursor | 模型判断，但产品层给强引导和预定义角色 | 面向第三方模型时，产品无法控制训练分布，只能用 prompt、角色和 UI 约束降低模型能力差异。 |

设计原则：

- 先判断模型是否在训练中学过“自主委派”和“多 Agent 协同”这类行为，再决定是否让它主动创建 subagent。
- 如果奖励目标强调精确执行和可验证结果，显式触发更稳，避免模型把任务拆错或把责任分散到不可控子任务。
- 如果模型本身擅长规划和工具调度，可以开放自主委派，但仍要限制外部写操作、删除、批量迁移等高风险动作。
- 如果接入的是能力差异大的第三方模型，预定义角色、固定任务入口和明确触发词比完全自主委派更可控。

这部分和 `git worktree` 的关系是：subagent 解决“谁来做哪部分任务”，worktree 解决“它在哪里安全地做”。前者是调度策略，后者是工作区隔离策略。两个问题不应该混在一起。

## Agent 行为观测：Trace 工具的作用

多 Agent 并行时，工作区隔离只能解决文件现场互相污染的问题。它不能解释一个 Agent 为什么调用某个工具、为什么拿到某段上下文、为什么输出某个结论。这个问题需要 trace。

Agent trace 工具可以在本机捕获并记录真实 API 请求与响应，再用本地 HTML / dashboard 展示 system prompt、message history、tool schema、tool call、streaming response、token usage 和相邻请求 diff。

### 定位

- 适合用于回答“Agent 为什么这样做”：对比相邻请求中 system prompt、message、tool definition、参数或模型选择的变化，而不是只看终端最终输出。
- 默认本地保存 trace，不依赖托管 dashboard；常见鉴权 header 会在 trace 中脱敏。

### Trace 内容与 viewer 能力

- 请求侧：method、path、脱敏 headers、解析后的 JSON body、model、turn 编号、upstream base URL。
- 响应侧：status、脱敏 headers、JSON body 或重组后的 SSE / WebSocket / Bedrock EventStream 结果。
- 统计侧：input tokens、output tokens、cache read、cache creation、models used、error 状态。
- Viewer：结构化 diff、endpoint path filter、按模型分组、token usage breakdown、tool inspector、全文搜索、复制 request JSON / cURL。

### 适用场景

- 调试 Claude Code / Codex / Cursor 等 Agent CLI 的真实上下文：确认 system prompt、工具列表、消息历史和参数是否符合预期。
- 比较不同模型、不同 wrapper、不同配置或不同 permission mode 下的请求差异。
- 归档 prompt snapshot 或 trace artifact，给团队 review、复现 Agent 行为或构建 prompt diff viewer。
- 检查 token usage 与 prompt cache usage，定位 cache miss、上下文膨胀或工具 schema 过大。
- 接入 Claude-compatible gateway 或本地代理时，验证 base URL、path rewrite、streaming 协议和 usage 字段。

### 边界与风险

- Trace 工具是观测层，不是安全沙箱；它会启动真实 CLI 并把真实请求转发给 upstream。高风险权限模式仍然是被观测客户端自身的高风险权限模式。
- forward proxy 涉及本地 CA 信任；应只在可信本机环境使用，避免把代理监听地址暴露到不可信网络。
- Trace 会记录 prompt、message、tool schema、tool call input/output 等敏感上下文；虽然常见 auth header 会脱敏，业务数据和提示词仍应按敏感资料处理。
- 代理只应放行已知 API path 前缀，减少被扫描器误用为开放代理的风险。

## 判断标准

适合用 `git worktree` 的信号：

- 同一仓库里要并行做多个相对独立的子任务。
- 主线程当前 worktree 很脏，不适合频繁切分支。
- 需要保留多个任务的未提交现场。
- 希望多个 Agent 从同一基线出发，再统一集成。

不一定要用 `git worktree` 的情况：

- 只是单线程开发，切分支频率很低。
- 任务非常小，开新 worktree 的管理成本高于收益。
- 仓库强依赖复杂 submodule 或本地环境状态，worktree 隔离不足以覆盖真实冲突面。

## 参考

- [Git - git-worktree Documentation](https://git-scm.com/docs/git-worktree)
- [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)
- [liaohch3/claude-tap](https://github.com/liaohch3/claude-tap)
- [Local AI Agent Trace Viewer](https://liaohch3.com/claude-tap/)
