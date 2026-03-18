---
name: pmtl-ui-style-system
description: PMTL_VN visual system and style variants. Use for new frontend UI, redesigns, typography, layout rhythm, premium polish, and explicit style directions such as default, soft, minimalist, or redesign mode.
---

# PMTL UI Style System

Use this skill to choose the right visual direction without keeping multiple overlapping local UI skills alive.

## Variant selection

- Default: read `references/default.md`
- Soft / luxury: read `references/soft.md`
- Minimalist / editorial: read `references/minimalist.md`
- Redesign of an existing surface: read `references/redesign.md`

If the user does not request a variant explicitly, use the default variant.

## Shared rules

- Keep PMTL warm, calm, and premium. Avoid neon, generic SaaS gradients, and purple-glow AI defaults.
- Do not use Inter as the default personality font for premium surfaces.
- Respect mobile collapse and avoid layout gimmicks that break below `md`.
- Prefer one strong accent and restrained contrast over noisy multi-accent palettes.
- Pair this skill with `pmtl-fe-implementation` and `pmtl-ui-behavior`.
