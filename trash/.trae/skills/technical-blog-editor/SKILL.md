---
name: "technical-blog-editor"
description: "Turns raw engineering notes into high-quality technical blog posts. Invoke when drafting, rewriting, or publishing blog articles."
---

# Technical Blog Editor

Use this skill for this Hexo blog when the user asks to write, rewrite, polish, sanitize, or publish a technical article.

The goal is a shareable engineering article, not a knowledge-base dump and not an SEO article. A good post should leave the reader with a usable mental model, a repeatable workflow, and clear boundaries.

## Source Policy

When the user says the source is a local note project, treat those notes as source material only.

- Do not modify the source note project.
- Copy or synthesize into `review/sanitized/`.
- Do not publish into `source/_posts/` until the user explicitly approves.
- Remove local absolute paths, private hostnames, internal URLs, account identifiers, and secrets.
- If sensitivity is uncertain, omit the passage and add:

```markdown
<!-- REVIEW: 这里可能包含敏感信息，需要人工确认后再发布。 -->
```

## Article Standard

A精品技术分享文章 should have:

- a concrete reader scenario in the first 3 paragraphs;
- one main claim or workflow, not a pile of unrelated tips;
- commands that are explained by intent, not listed as a cheat sheet;
- conceptual sections only when they help the reader operate the tool;
- tradeoffs and failure modes;
- a final reusable pattern, checklist, or decision rule.

It should not have:

- "本文将介绍..." openings;
- generic "随着技术发展..." background;
- paragraphs that sound like documentation boilerplate;
- obvious AI section symmetry where every heading has the same rhythm;
- excessive numbered lists with no narrative;
- hollow summaries such as "总之，掌握 X 可以提高效率".

## Preferred Shape

For tool-sharing articles, use this shape by default:

```markdown
## 先解决一个具体问题

Describe the real situation and pain.

## 最小可用工作流

Give the smallest command set that solves the problem.

## 这个工具保住了什么

Explain the core abstraction only after the reader sees the workflow.

## 日常使用模式

Show how to organize work in real projects.

## 配置建议

Give a small, justified config.

## 边界

Say when this tool is not enough.

## 可复制的习惯

End with a concrete operating pattern.
```

Adjust the shape when the topic is not a tool.

## Writing Rules

- Chinese by default.
- Keep technical terms in English when they are the actual interface or command vocabulary.
- Prefer "如果 / 当 / 适合 / 不适合 / 代价 / 边界" over broad claims.
- Prefer concrete examples from systems, storage, Linux, databases, performance, and AI engineering.
- Use one idea per paragraph.
- Keep jokes and attitude low; a little personality is acceptable, performance is not.
- Do not invent benchmark numbers or operational claims.
- Do not cite sources you did not actually inspect.

## Drafting Workflow

1. Read relevant local source notes.
2. Extract facts, commands, conventions, caveats, and examples.
3. Choose a single reader problem.
4. Write an outline with the problem first and the glossary later.
5. Draft into `review/sanitized/`.
6. Run an anti-AI-prose pass.
7. Run a sensitivity pass.
8. Run `npm run build` if the draft is moved into `source/_posts/`, or if the change could affect site generation.

## Publishability Gate

Before saying a draft is ready, check:

- Does the first section make a real person want to keep reading?
- Can the reader copy a minimal workflow and succeed?
- Are commands, config files, and shortcuts accurate enough to try?
- Are boundaries stated?
- Is there any private or internal information?
- Does the article sound like this blog rather than a generic AI tutorial?
