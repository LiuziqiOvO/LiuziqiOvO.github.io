---
title: Prompt-Agent 设计
date: 2026-08-17 05:00:00
categories:
  - 开发工具
tags:
  - 开发工具
  - Prompt-Agent 设计
  - tooling
  - prompt
  - agent
description: 1:1 发布自知识库：古法工具/Prompt-Agent 设计.md
source_note: 古法工具/Prompt-Agent 设计.md
---
# Prompt-Agent 设计

## Agent 操作偏好

- 需要跨会话保留项目状态时，写入 `README4ai.md` 或同类 AI 记忆文档；内容面向后续 Agent，可优先记录项目状态、关键路径和下一步。
- 本地编辑、远端执行时，启动 Agent 前先确认当前路径、远端路径和执行环境。
- 工具、MCP 或脚本 wrapper 的错误输出应面向 Agent，优先给出失败阶段、可重试性、关键参数和下一步建议；更详细规范见 [[Agent 开发技巧]]。

## MCP 配置速记

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    },
    "git": {
      "command": "uvx",
      "args": ["mcp-server-git"]
    }
  }
}
```

| MCP | 用途 |
| --- | --- |
| `playwright` | 浏览器自动化与页面观察。 |
| `sequential-thinking` | 多步推理和任务拆解。 |
| `context7` | 自动查官方文档。 |
| `git` | Git 仓库读取与操作封装。 |

## Skills 

| Skill | 位置 / 来源 | 作用 |
| --- | --- | --- |
| `find-skills` | `~/.openclaw/extensions/find-skills/` | 查找其他 skill。 |
| `proactive-agent` | `~/.openclaw/extensions/proactive-agent/` | 主动式架构。 |
| `self-improvement` | `~/.openclaw/extensions/self-improvement/` | 记录学习和错误，持续改进。 |
| `superpower` | [superpowers](https://github.com/obra/superpowers) | Agent 能力扩展参考。 |
| `supermemory` | [supermemory](https://github.com/supermemoryai/supermemory) | AI memory / context layer 参考。 |

## 参考

- [[Prompt]]
- [[Agent 开发技巧]]
- [system-design-primer](https://github.com/donnemartin/system-design-primer/blob/master/README-zh-Hans.md)
- [Remotion AI docs](https://www.remotion.dev/docs/ai/)
