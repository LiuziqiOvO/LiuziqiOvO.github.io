---
name: "anti-ai-prose-review"
description: "Reviews and rewrites prose to remove generic AI style. Invoke before finalizing blog posts, docs, summaries, and article drafts."
---

# Anti-AI Prose Review

Use this skill before delivering or publishing long-form prose. Its job is to identify and remove writing patterns that make a draft feel generated, over-smoothed, or generic.

This skill is informed by public writing-process notes about teaching AI systems a personal voice through contrastive examples, banned patterns, and source-grounded style guides. For this repository, the target voice is Chinese technical writing: direct, practical, evidence-oriented, and calm.

## What "AI 味" Looks Like

Flag these patterns:

- overly balanced paragraph structure where every section has the same length and cadence;
- generic opener: "在现代软件开发中", "随着 AI 的发展", "本文将深入探讨";
- generic closer: "总而言之", "通过掌握这些技巧", "希望本文能帮助你";
- inflated words: "强大", "高效", "优雅", "无缝", "显著提升", "最佳实践" without evidence;
- motivational filler;
- repeated contrast formulas: "不是 A，而是 B";
- too many broad claims before any concrete example;
- fake precision: unsupported percentages, rankings, or universal rules;
- bland transitions: "此外", "值得注意的是", "另一方面" repeated mechanically;
- list-heavy prose where bullets replace thinking;
- every heading shaped as a slogan instead of a reader question or operational decision.

## Rewrite Principles

When rewriting:

- start with a concrete scene, command, failure, or decision;
- replace claims with conditions;
- replace "why it matters" boilerplate with the actual cost of getting it wrong;
- vary paragraph length naturally;
- keep some rough edges if they make the article sound human and precise;
- cut conclusion paragraphs unless they add a checklist or operating rule;
- preserve technical accuracy over elegance.

## Contrastive Examples

Avoid:

```markdown
随着 AI 工具的普及，开发者越来越需要高效管理远程任务。Tmux 是一个强大的终端复用工具，能够显著提升开发效率。
```

Prefer:

```markdown
SSH 断开时，最麻烦的不是命令失败，而是交互现场丢了。AI CLI 可能正停在确认提示上，普通终端已经回不去了。Tmux 先解决这个入口问题。
```

Avoid:

```markdown
总而言之，掌握 Tmux 可以让你更好地管理服务器任务，并提升整体开发体验。
```

Prefer:

```markdown
只记一个习惯：超过几分钟的交互式 AI 任务，先放进 Tmux session，再把 SSH 当成随时可断、随时可接回的连接。
```

Avoid:

```markdown
Tmux 不仅是一个终端工具，更是一种工作流。
```

Prefer:

```markdown
Tmux 的价值不在分屏本身，而在把远程工作现场从本地 SSH 连接里拆出来。
```

## Review Procedure

For a draft:

1. Read the first 5 paragraphs and mark where a real reader might stop.
2. Search for generic openers, generic closers, inflated adjectives, and repeated transition phrases.
3. Check whether the article makes a concrete promise early.
4. Check whether every section either advances the scenario, explains a necessary concept, or gives an operating rule.
5. Rewrite the worst paragraphs, not just comment on them.
6. Keep the author's technical intent and examples.

## Output Format

When reviewing only, return:

```markdown
## 判断

可发布 / 需要重写 / 不建议发布

## 主要 AI 味

- ...

## 必改段落

- 文件位置或标题：问题 -> 改法

## 建议替换稿

...
```

When editing files, apply the rewrite directly and summarize the changes.
