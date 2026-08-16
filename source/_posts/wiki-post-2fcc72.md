---
title: Prompt
date: 2026-08-17 05:00:00
categories:
  - 开发工具
tags:
  - 开发工具
  - Prompt
  - tooling
  - prompt
description: 1:1 发布自知识库：古法工具/Prompt.md
source_note: 古法工具/Prompt.md
---
# Prompt

提示词、Agent 使用偏好、工程流程和 MCP / Skills 速查入口。长段提示词已拆到专题页，本页只保留导航和少量高频偏好。

## 拆分页

- [[Prompt-Mermaid 绘图]]：Mermaid 流程图、函数调用图、状态图、序列图、类图和样式偏好。
- [[Prompt-RIPER5工程开发流程]]：RIPER-5 工程开发工作流、模式职责、任务文件模板和执行边界。
- [[Prompt-Agent 设计]]：Agent 操作偏好、MCP 配置、Skills 速记和 Agent 想法。
- [[Agent 开发技巧]]：tool、MCP、脚本 wrapper 的错误输出设计等 Agent 工程经验。

## 算法与代码块回答偏好

### 避免情绪化废话

回答算法题或代码问题时，不写“思路是对的”“已经快对了”“只差一步”等情绪性评价，不写鼓励、过渡性废话或 emoji。只给结论、错误点、修正方案和必要测试。

### 直接做题并给测试

用于算法机考题：

1. 简要重述题目并抽象模型。
2. 使用 C++ 和 ACM 模式处理输入输出；如果用户给样例，先自检样例能否通过。
3. 代码变量名不要过长，逻辑保持精炼，关键步骤加中文注释。
4. 自建多组测试用例并给出正确答案，便于本地验证。
5. 如果输入可能残缺，避免程序一直等待，给出边界处理。

### 教我思路

用户要求“教教我”时，不直接给最终代码；说明原思路错在哪里，给出反例或具体错误点，再给可执行的推导路线。

## C++ 代码生成偏好

- 使用现代 C++17/20、STL、RAII、智能指针和标准算法，优先写简洁、惯用实现。
- 类型名用 PascalCase；变量和方法用 camelCase；常量和宏用 SCREAMING_SNAKE_CASE；成员变量可用 `_name` 或 `m_name`。
- 优先使用 `std::unique_ptr`、`std::shared_ptr`、`std::optional`、`std::variant`、`constexpr`、`const`、`std::string_view`。
- 错误处理优先用异常或明确错误返回；函数边界做输入校验；资源管理遵循 RAII。
- 性能敏感路径避免不必要堆分配和复制；必要时用 `std::move`，并用 Valgrind / Perf profile。
- 测试优先使用 Google Test / Catch2；依赖可用 Google Mock 替换。
- 避免裸数组、C 风格 cast、悬垂指针和全局可变状态，保持 const-correctness。

## 语言风格

- 给人类读：默认中文，短、准、技术性，不做冗余铺垫。
- 给其他 AI 读：可压缩字符数，提高信息密度，用于重新启动会话时快速恢复任务状态。

## 参考

- [[WIKI/古法工具/README]]
- [[Prompt-Mermaid 绘图]]
- [[Prompt-RIPER5工程开发流程]]
- [[Prompt-Agent 设计]]
