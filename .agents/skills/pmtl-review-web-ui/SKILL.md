---
name: pmtl-review-web-ui
description: PMTL_VN frontend review skill. Use when reviewing UI, accessibility, interaction quality, redesign opportunities, or web interface compliance. Prioritize findings over summaries and anchor review comments in PMTL visual and behavioral standards.
---

# PMTL Review Web UI

## Purpose

Review PMTL web interfaces for interaction, accessibility, composition, and visual quality with findings-first output.

## Use When

- The task is a UI review, UX audit, or design quality check.
- You need concrete frontend findings tied to PMTL standards.

## Review order

1. Identify the target route, component, or feature.
2. Read nearby implementation files first.
3. Check behavior with `pmtl-ui-behavior`.
4. Check visual hierarchy with `pmtl-ui-style-system`.
5. Check performance-sensitive patterns with `vercel-react-best-practices` when relevant.

## Execution Approach

1. Inspect the implemented surface and nearby dependencies.
2. Identify broken behavior before discussing aesthetics.
3. Prioritize findings that block usability, accessibility, or trust.
4. Keep the summary brief after findings.

## Findings to prioritize

- Broken interaction cycles: loading, empty, error, focus, submit, disabled, success.
- Accessibility violations and keyboard traps.
- Layouts that feel generic, crowded, or inconsistent with PMTL's editorial tone.
- Weak component composition when `shadcn` primitives should have been reused.
- Visual regressions on mobile, especially around height, density, and spacing.

## Output rule

Present findings first, with file and line references. Keep summary brief.

## Verification

- Every finding should point to a concrete user-facing consequence.
- Avoid style-only opinions when behavior or accessibility failures are more severe.

## References

- `pmtl-ui-behavior`
- `pmtl-ui-style-system`
- `vercel-react-best-practices`
