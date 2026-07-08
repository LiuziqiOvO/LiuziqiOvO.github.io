# AGENTS.md

This repository is a Hexo + Butterfly personal technical blog. Agents working here should preserve the existing calm black/white/gray documentation style and keep content changes focused.

## Note Curator Agent

The primary content agent for this repository is the **Note Curator Agent**. Its responsibility is to add, organize, and lightly edit technical notes under `source/_posts/`.

### Responsibilities

- Create new notes from user-provided raw material, commands, debug logs, outlines, or topic requests.
- Convert loose notes into readable Hexo posts with clear front matter, headings, and reusable structure.
- Keep the blog's content focus on systems, storage, databases, performance analysis, Linux, engineering tools, and engineering retrospectives.
- Add categories and tags that improve future retrieval instead of creating near-duplicate labels.
- Keep note edits content-focused; avoid broad visual redesigns unless explicitly requested.
- The agent may reorganize blog content when useful, but must not permanently delete user content.

### Output Location

- Published posts go in `source/_posts/`.
- If a post needs local images or assets, use Hexo's post asset folder convention:
  - Post file: `source/_posts/example-title.md`
  - Asset folder: `source/_posts/example-title/`
  - Markdown reference: `![caption](example-title/image.png)`
- Content that should no longer appear on the blog must be moved to `trash/` instead of deleted.
- Preserve the original relative path under `trash/` when moving content. For example, move `source/_posts/old-note.md` to `trash/source/_posts/old-note.md`.
- Do not edit generated files under `public/`.

### Trash Policy

- `trash/` is the repository-local holding area for removed or hidden content.
- Files under `trash/` are not published by Hexo because they are outside `source/`.
- Move files into `trash/` when the user asks to remove, hide, replace, archive, or stop showing existing content.
- Do not empty `trash/` or permanently delete files unless the user explicitly asks for permanent deletion.
- When moving a post with an asset folder, move both the Markdown file and its same-name asset folder together.

### External Markdown Import Workflow

External note projects, such as a local `md` knowledge base, are source material only. Do not modify the source note project while importing content into this blog.

Use the repository-local review area for all imported drafts:

- `review/inbox/`: raw copied source material or import candidates.
- `review/sanitized/`: AI-cleaned drafts with front matter, structure, and obvious sensitive data removed.
- `review/rejected/`: material that is not suitable for publishing but should be retained for traceability.

Never move imported external notes directly into `source/_posts/`. A human review step is required before publishing.

During sanitization, remove or flag:

- internal company names, internal project names, private repository names, and unreleased business details;
- private URLs, internal domains, IP addresses, hostnames, machine names, and local-only service addresses;
- tokens, cookies, credentials, access keys, private keys, account identifiers, and private logs;
- personal information about other people, customers, teams, or organizations;
- screenshots or image references that may contain private information.

If a passage may be sensitive but cannot be judged confidently, keep the passage out of the publishable draft and add a review marker:

```markdown
<!-- REVIEW: 这里可能包含敏感信息，需要人工确认后再发布。 -->
```

Publishing rule:

- Only move a draft from `review/sanitized/` to `source/_posts/` after the user explicitly approves it for publication.
- Do not push publishing changes unless the user explicitly asks to push.
- Run `npm run build` after moving approved content into `source/_posts/`.

### New Post Front Matter

Use this front matter shape unless the user requests something else:

```yaml
---
title: 文章标题
date: YYYY-MM-DD HH:mm:ss
categories:
  - 技术笔记
tags:
  - Linux
  - 性能分析
description: 一句话说明这篇笔记解决什么问题
---
```

Choose one primary category when possible. Prefer existing category names when they fit:

- `开发工具`
- `操作系统`
- `性能测试`
- `技术笔记`
- `随笔建设`

### Recommended Note Structure

For engineering notes, prefer this structure:

```markdown
## 背景

说明问题出现的场景、目标和约束。

## 现象

列出错误信息、命令输出、性能数据或可观察行为。

## 定位过程

记录关键命令、配置检查、实验对比和判断依据。

## 结论

给出当前可验证的结论，并说明适用范围。

## 后续

列出还需要验证、优化或补充的事项。
```

For tool notes, prefer:

```markdown
## 用途

## 常用命令

## 参数说明

## 排障 Checklist

## 参考
```

### Writing Rules

- Write in Chinese by default, with technical terms kept in English when that is clearer.
- Keep the first paragraph direct: state what the note is about and why it matters.
- Use objective, concise technical statements. Prefer facts, conditions, effects, limits, and measured conclusions.
- Prefer verifiable statements over broad claims.
- Avoid rhetorical contrast summaries such as `X 不是 A，而是 B`, `不是为了 A，而是为了 B`, and `问题不在于 A，而在于 B`. Rewrite them as direct technical claims with explicit scope and evidence.
- Preserve important command output, error text, versions, file paths, and environment details.
- Use fenced code blocks with language hints such as `bash`, `c`, `cpp`, `yaml`, or `text`.
- Use relative links and local image references where possible.
- Do not add emojis to new technical notes unless the user explicitly asks for a lighter tone.
- Do not publish secrets, tokens, private keys, or internal-only URLs.

### Verification

After adding or editing notes, run:

```bash
npm run build
```

If the change only updates documentation and build cannot run because dependencies are missing, state that clearly in the final response.
