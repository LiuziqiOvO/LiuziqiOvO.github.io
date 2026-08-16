---
title: Codex 配置与上下文注入
date: 2026-08-17 05:00:00
categories:
  - 开发工具
tags:
  - 开发工具
  - Codex 配置与上下文注入
  - tooling-codex
  - context-engineering
description: 1:1 发布自知识库：古法工具/Codex 配置与上下文注入.md
source_note: 古法工具/Codex 配置与上下文注入.md
---
# Codex 配置与上下文注入

## 文件速查

| 文件/目录 | 层级 | 作用 | 进入上下文方式 |
| --- | --- | --- | --- |
| `~/.codex/AGENTS.md` | 全局 | 用户级长期指令 | 启动时注入，早于项目规则。 |
| `<repo>/AGENTS.md` | 项目 | repo 级长期指令 | 启动或进入项目时注入。 |
| `AGENTS.override.md` | 覆盖 | 替代同级 `AGENTS.md` | 启动时注入，优先同级普通文件。 |
| `~/.codex/config.toml` | 全局配置 | model、effort、sandbox、approval、MCP、plugins、trust | 宿主读取生效，通常不整段注入。 |
| `~/.codex/skills/` | 全局能力 | 所有项目可用的 skills | 启动只暴露名称 / 描述；触发后读取 `SKILL.md`。 |
| `<repo>/.agents/skills/` | 项目能力 | 当前项目专属 skills | 同上，作用域限当前 repo。 |
| `~/.codex/plugins/` | 全局能力 | 注册 tools、MCP、apps、skills、hooks | plugin 本体不注入；工具结果或 skill 正文按需进入。 |
| `.codex/agents/*.toml` | 项目能力 | subagent 定义 | 调用后开独立上下文，返回摘要。 |
| `sessions/`、`memories/` | 状态 | resume、fork、memory | 不是项目规则；按宿主恢复或记忆机制进入。 |

## 注入链

```text
system / developer / app rules
  -> ~/.codex/AGENTS*
  -> <repo>/AGENTS*
  -> <subdir>/AGENTS*
  -> triggered SKILL.md
  -> tool / MCP / app results
  -> user prompt
```

## 放置规则

| 想做什么 | 放哪里 |
| --- | --- |
| 每次都要遵守的短规则 | `AGENTS.md` |
| 只对当前 repo 生效 | `<repo>/AGENTS.md`、`<repo>/.agents/skills/` |
| 对所有项目生效 | `~/.codex/AGENTS.md`、`~/.codex/skills/`、`~/.codex/config.toml` |
| 长流程 / 模板 / 参考资料 | skill，不要塞进 `AGENTS.md` |
| 硬权限 / sandbox / MCP / plugin 开关 | `config.toml` / rules / hooks |
| 大范围探索，避免污染主线程 | subagent |

## 参考

- [[Claude Code技巧]]
- [[WIKI/Agent相关/index]]
