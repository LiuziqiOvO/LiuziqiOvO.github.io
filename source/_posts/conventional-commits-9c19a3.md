---
title: Conventional Commits
date: 2026-08-17 05:00:00
categories:
  - 开发工具
tags:
  - 开发工具
  - Conventional Commits
  - tooling-git
  - release
description: 1:1 发布自知识库：古法工具/Conventional Commits.md
source_note: 古法工具/Conventional Commits.md
---
# Conventional Commits

Conventional Commits 是一种提交信息格式规范，用结构化 commit message 表达变更类型、影响范围和破坏性变更。它常与 changelog 生成、[[Semantic Versioning|语义化版本]] 和发布流水线联动。

## 格式

```text
<type>[optional scope][optional !]: <description>

[optional body]

[optional footer(s)]
```

- `type` 表示变更类型，常见值包括 `feat`、`fix`、`docs`、`style`、`refactor`、`perf`、`test`、`build`、`ci`、`chore`。
- `scope` 用名词标识影响范围，例如 `api`、`parser`、`ui`。
- `!` 表示破坏性变更，也可以在 footer 中写 `BREAKING CHANGE:`。
- `description` 用简短祈使句说明本次提交做了什么。
- `body` 解释变更背景、取舍和迁移说明。
- `footer` 使用 Git trailer 风格记录元数据，例如 `Reviewed-by: Alice`、`Refs #456`。

## 与 SemVer 的关系

| 提交信号 | 版本影响 | 说明 |
| --- | --- | --- |
| `fix:` | PATCH | 向后兼容的 bug fix。 |
| `feat:` | MINOR | 向后兼容的新功能。 |
| `!` 或 `BREAKING CHANGE:` | MAJOR | API、协议、配置或行为出现不兼容变化。 |

对外发布库、SDK、CLI 或接口时，破坏性变更必须显式标记，避免发布工具误判兼容性。

## 示例

```text
feat(parser): add array parsing

fix(api): handle empty response

docs: update SPDK storage notes

refactor(cache)!: replace legacy metadata format

BREAKING CHANGE: old cache metadata files must be migrated before startup.
```

## 实践建议

- 一次提交只表达一类变化；同时包含新功能和修复时优先拆分提交。
- PR squash message 也应按 Conventional Commits 写清长期含义。
- 文档库可以使用 `docs:` 标识知识页、规则、索引和来源整理。
- 不要把临时调试输出、无关格式化和业务修改混在同一个 commit。
- 需要自动生成 changelog 或自动发版时，团队应固定允许的 `type` 列表和 scope 口径。

## 参考

- [[Git#合并多个commit]]
- [[Semantic Versioning]]
- `RAW/Conventional Commits.md`
- [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)
