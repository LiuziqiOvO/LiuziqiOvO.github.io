# Agent / 工具文章筛选记录

来源仓库：`/Users/bytedance/Proj/md`

目标：从现有 Agent / 工具相关 Markdown 中筛选适合博客发布的材料。处理原则仍是评分、拼接和脱敏，不生成新的空泛观点。

## 候选评分

| 主题 | 候选文件 | 分数 | 判断 |
| --- | --- | ---: | --- |
| git worktree 与多 Agent 协作 | `WIKI/Agent相关/git worktree 与多 Agent 协作.md` | 92 | 结构完整，主题明确，可发布性高。适合作为主文。 |
| Subagent 设计策略 | `WIKI/Agent相关/御三家的三种Subagent设计思路.md` | 78 | 内容短但判断密度高，可作为“为什么不是所有 agent 都该自主委派”的补充。 |
| Claude Tap / Agent Trace | `WIKI/Agent相关/Claude Tap：Agent Trace工具.md` | 76 | 工具介绍完整，适合补“观测与审计”部分；需避免启动命令中本机路径和潜在敏感 trace 内容。 |
| Claude Code 技巧 | `WIKI/AI工具、技巧/Claude Code技巧.md` | 55 | 有价值但本机目录、配置语义和个人使用痕迹较多，本轮不直接拼入。 |
| MCP / mcp-study | `WIKI/Agent相关/MCP.md`; `WIKI/Agent相关/mcp-study.md` | 72 | 可另起一篇 MCP 工具接口文章。本轮主题先聚焦多 Agent 协作。 |
| Understand-Anything 系列 | `WIKI/Agent相关/Understand-Anything-study/*` | 70 | 内容量大，适合独立成系列；部分 dashboard token / 本机图谱安全边界需单独审。 |
| 字节 recoCli | `WIKI/Agent相关/字节recoCli/*` | 0 | 明确内部项目相关，不选，不发布。 |
| Git 大手册 | `WIKI/古法工具/Git.md` | 45 | 含 AICache 分支名、token 登录等敏感/不适合直接发布内容，本轮不选。 |

## 本轮选题

选题：`用 git worktree 隔离多 Agent 协作：工作区、分支与行为审计`

采用来源：

- `/Users/bytedance/Proj/md/WIKI/Agent相关/git worktree 与多 Agent 协作.md`
- `/Users/bytedance/Proj/md/WIKI/Agent相关/御三家的三种Subagent设计思路.md`
- `/Users/bytedance/Proj/md/WIKI/Agent相关/Claude Tap：Agent Trace工具.md`

处理原则：

- 以 `git worktree` 原文为主体，保留表格、工作流、坑点和判断标准。
- 从 subagent 策略中摘取通用产品取向和设计原则，不扩写。
- 从 Claude Tap 中摘取 Agent 行为观测、trace 内容、适用场景和风险，不保留本机启动路径。
- 删除内部项目、字节、recoCli、推荐系统、AICache/Flink、token 示例和本机绝对路径。
- 输出到 `review/sanitized/`，不进入 `source/_posts/`。
