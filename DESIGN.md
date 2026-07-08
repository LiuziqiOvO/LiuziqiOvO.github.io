# DavLiu Blog Design System

> Branch contract for `anthropic-style-redesign`.
> This file describes the project-owned visual direction for a Hexo + Butterfly blog experiment inspired by Anthropic's public website. It imitates high-level design language only; do not copy Anthropic text, assets, logos, or proprietary layout details.

## Intent

This branch turns the blog from a dark/gray documentation surface into a warm editorial technical journal. The site should feel quiet, serious, and readable: ivory paper, ink text, precise separators, large measured whitespace, and small clay accents. Butterfly's structure remains intact so content work can continue independently.

## Visual Reference

The reachable Anthropic homepage currently uses these broad traits:

- Warm ivory/cream page surfaces rather than pure white or dark gradients.
- High-contrast near-black typography with muted secondary text.
- Editorial composition: wide hero spacing, calm navigation, thin rules, restrained cards.
- Minimal dependence on imagery; layout, type, and spacing carry the brand feel.
- Occasional warm clay/terracotta accent for emphasis, never a saturated neon palette.
- Footer and navigation are information-dense but visually quiet.

## Principles

- Preserve Butterfly structure: customize through `_config.butterfly.yml` and `source/css/custom.css`; do not edit theme internals.
- Keep the blog Chinese-first and technical-first; visual polish must not reduce article readability.
- Prefer paper-like planes, 1px borders, and flat depth over shadows, glass, blur, gradients, or decorative backgrounds.
- Let whitespace create hierarchy. Avoid dense visual noise, oversized rounded cards, and floating nested panels.
- Use black/ivory/clay as the main palette. Blue/cyan/purple accents are out of scope for this branch.
- Keep dark mode available, but treat it as a quiet inverse reading mode rather than a new visual identity.
- Existing background images are disabled or visually ignored in this branch.

## Tokens

Use `--oz-*` CSS custom properties in `source/css/custom.css` as the source of truth.

- `--oz-bg`: warm ivory page background.
- `--oz-surface`: slightly lighter paper panel.
- `--oz-surface-soft`: subtle warm secondary panel.
- `--oz-text`: near-black ink.
- `--oz-muted`: warm gray metadata and captions.
- `--oz-accent`: clay/terracotta accent used sparingly for links, active states, and focus.
- `--oz-border`: thin warm gray separators.
- `--oz-radius`: small radius, usually 6px or less, with pills only for icon controls.
- `--oz-shadow`: none or nearly none.
- Type: system UI for dependable Chinese rendering, with Georgia-style serif only for large display headings where it improves the editorial feel.

## Components

- Navigation: fixed-height, cream background, thin bottom border, compact links, high contrast, no hero-image glass effect.
- Home hero: editorial text block on ivory, no bitmap background, no visual effects.
- Post cards: flat paper sections separated by thin rules; title first, metadata second, excerpt third.
- Sidebar author card: contact buttons should be icon-first, evenly spaced, and use the same quiet border system.
- Article body: generous line height, clear heading spacing, warm code backgrounds, calm blockquotes.
- Tags and pagination: small bordered controls with clay hover/active states.
- Footer: dark ink band with ivory text, thin separators, no background image.

## Content Safety

- Do not permanently delete content. Move hidden or replaced content to `trash/` while preserving the original relative path.
- Do not edit generated files under `public/`.
- Do not modify posts for this redesign unless a visual regression absolutely requires it.
- Do not add new dependencies for styling unless explicitly requested.
