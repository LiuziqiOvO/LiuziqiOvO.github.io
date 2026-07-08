---
name: "docs-style"
description: "Improves technical documentation clarity and structure. Invoke when writing or reviewing docs, tutorials, guides, or technical blog drafts."
---

# Documentation Style

Use this skill when writing or reviewing reader-facing technical documentation, including blog posts, tutorials, tool notes, READMEs, and troubleshooting guides.

This skill is adapted from public documentation-style skill guidance found on GitHub skill directories, especially the `openclaw/skills` docs-style listing. Keep the rules below subordinate to this repository's `AGENTS.md` writing rules.

## Core Standard

Good technical documentation should help a reader make a correct decision or complete a real task. It should not sound polished for its own sake.

Prefer:

- concrete nouns and verbs;
- explicit scope and assumptions;
- examples that map to real commands or workflows;
- short paragraphs with one job each;
- headings that tell the reader what the section contains;
- code blocks with language hints.

Avoid:

- vague praise, marketing language, and motivational filler;
- generic phrases such as "seamlessly", "robust", "powerful", "leverage", "dive into", "game changer";
- paragraphs that merely restate the heading;
- lists where every item has the same AI-generated rhythm;
- conclusions that summarize without adding a decision, checklist, or boundary.

## Voice

For English documentation, address the reader directly as "you" when it improves clarity.

For this blog's default Chinese writing:

- use direct technical Chinese;
- keep terms such as `session`, `window`, `pane`, `WAL`, `compaction`, `agent`, and `CLI` in English when that is clearer;
- avoid inflated translations of simple terms;
- avoid rhetorical contrast patterns such as `不是 A，而是 B`;
- use "适合 / 不适合 / 代价 / 边界 / 判断标准" to express tradeoffs.

## Structure

Before drafting a long document, create or infer a small outline:

1. Reader problem.
2. The minimal useful workflow.
3. Concepts needed to understand the workflow.
4. Configuration or implementation details.
5. Failure modes and boundaries.
6. Checklist or final operating pattern.

If the piece is a technical blog post, the opening must quickly answer:

- Who is this for?
- What concrete problem does it solve?
- Why does the tool or mechanism matter?

## Editing Pass

When reviewing a draft:

1. Remove filler sentences.
2. Split long paragraphs that mix motivation, mechanism, and commands.
3. Replace generic claims with concrete conditions.
4. Check whether every command has enough surrounding context.
5. Check whether examples use safe placeholder names instead of private paths, hosts, or accounts.
6. Make headings descriptive.
7. Keep tables only when they compare dimensions clearly.

## Output Expectations

When asked to revise a file, edit the file directly if appropriate. When only reviewing, return:

- the main problems;
- the highest-impact edits;
- any sensitive-data risk;
- whether the draft is publishable, needs revision, or should stay in review.
