---
name: pmtl-review-web-ui
description: PMTL_VN frontend review skill. Use when reviewing UI, accessibility, interaction quality, redesign opportunities, or web interface compliance. Prioritize findings over summaries and anchor review comments in PMTL visual and behavioral standards.
---

# PMTL Review Web UI

## Review order

1. Identify the target route, component, or feature.
2. Read nearby implementation files first.
3. Check behavior with `pmtl-ui-behavior`.
4. Check visual hierarchy with `pmtl-ui-style-system`.
5. Check performance-sensitive patterns with `vercel-react-best-practices` when relevant.

## Findings to prioritize

- Broken interaction cycles: loading, empty, error, focus, submit, disabled, success.
- Accessibility violations and keyboard traps.
- Layouts that feel generic, crowded, or inconsistent with PMTL's editorial tone.
- Weak component composition when `shadcn` primitives should have been reused.
- Visual regressions on mobile, especially around height, density, and spacing.

## Output rule

Present findings first, with file and line references. Keep summary brief.
