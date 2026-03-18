---
name: pmtl-fe-implementation
description: Frontend implementation rules for PMTL_VN. Use for React or Next.js feature work, UI refactors, and frontend code reviews that should follow repo conventions, human-like code quality, and strict production-ready discipline.
---

# PMTL Frontend Implementation

## Core rules

- Default to Server Components. Add `"use client"` only for real interactivity.
- Reuse existing feature folders before creating new shared abstractions.
- Keep code flat with early returns and domain naming.
- Never ship `TODO`, placeholder comments, or half-finished state branches.
- Validate API inputs and responses with Zod-backed shapes.
- Avoid `any`. Use narrow unions and explicit types.
- Trigger independent async work in parallel.
- Add concise comments only when the reason is not obvious from the code.

## File placement

- Route entrypoints: `apps/web/src/app`
- Feature code: `apps/web/src/features/<domain>`
- Shared web utilities: `apps/web/src/lib`
- Shared UI primitives: `apps/web/src/components`

## Pair with

- `pmtl-ui-behavior` for accessibility, forms, and state discipline.
- `pmtl-ui-style-system` for visual direction.
- `vercel-react-best-practices` when performance is part of the task.
