---
title: Prompt-工程开发流程
date: 2026-08-17 05:00:00
categories:
  - 开发工具
tags:
  - 开发工具
  - Prompt-RIPER5工程开发流程
  - tooling
  - prompt
  - workflow
description: 1:1 发布自知识库：古法工具/Prompt-RIPER5工程开发流程.md
source_note: 古法工具/Prompt-RIPER5工程开发流程.md
---
# Prompt-工程开发流程

## RIPER-5 定位

RIPER-5 是面向大型工程二次开发的 man-in-loop 工作流提示词。核心目标是限制 Agent 在代码仓库中擅自实现、擅自扩范围或把未确认方案直接落地。

```text
RESEARCH -> INNOVATE -> PLAN -> EXECUTE -> REVIEW
```

## 模式职责

| 模式         | 目标              | 允许                                | 禁止                 |
| ---------- | --------------- | --------------------------------- | ------------------ |
| `RESEARCH` | 收集信息、理解代码结构和约束。 | 读文件、梳理架构、识别技术债、创建任务文件。            | 提方案、写代码、暗示实现路径。    |
| `INNOVATE` | 发散多个方案。         | 比较优劣、讨论架构替代方案、记录候选思路。             | 写具体计划、写代码、承诺方案。    |
| `PLAN`     | 形成可执行技术规格。      | 列文件、函数、数据结构、错误处理、测试方式和 checklist。 | 任何实现或示例代码。         |
| `EXECUTE`  | 严格按已批准计划执行。     | 只实现计划中的原子步骤，更新任务进度。               | 偏离计划、顺手改无关代码、自行扩展。 |
| `REVIEW`   | 对照计划逐项验证。       | 检查偏差、准备提交、写最终审查。                  | 忽略小偏差或把未验证实现标为完成。  |

## 使用规则

- 每次回复以当前模式声明开头，例如 `[MODE: RESEARCH]`。
- 没有明确模式切换信号时，保持当前模式。
- 进入 `EXECUTE` 前必须有已批准的 `PLAN` checklist。
- `EXECUTE` 中发现需要偏离计划时，立即回到 `PLAN`。
- `REVIEW` 必须明确给出实现是否完全匹配计划。

## 任务文件模板

```text
# Context
File name: [TASK_FILE_NAME]
Created at: [DATETIME]
Created by: [USER_NAME]
Main branch: [MAIN_BRANCH]
Task Branch: [TASK_BRANCH]
Yolo Mode: [YOLO_MODE]

# Task Description
[Full task description from user]

# Project Overview
[Project details]

# Analysis
[Code investigation results]

# Proposed Solution
[Action plan]

# Current execution step: "[STEP_NUMBER_AND_NAME]"

# Task Progress
[Change history]

# Final Review
[Post-completion summary]
```

## 执行偏好

- 本地编辑、远端执行时，启动 Agent 前确认当前路径、远端路径和执行环境。
- 需要跨会话保留项目状态时，写入 `README4ai.md` 或同类 AI 记忆文档。
- 面向人类的回答保持技术性、简洁、中文优先。
- 面向其他 AI 的状态摘要可以压缩字符数，提高信息密度。

## 参考

- [[Prompt]]
- [RIPER-5-CN](https://github.com/NeekChaw/RIPER-5/blob/main/RIPER-5-CN.md)
