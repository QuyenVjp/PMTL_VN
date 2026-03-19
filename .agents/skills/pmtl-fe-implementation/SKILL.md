---
name: pmtl-fe-implementation
description: Frontend implementation rules for PMTL_VN. Use for React or Next.js feature work, UI refactors, and frontend code reviews that should follow repo conventions, human-like code quality, and strict production-ready discipline.
---

# PMTL Frontend Implementation

## Purpose

Guide day-to-day React and Next.js implementation in PMTL so frontend work stays feature-first, type-safe, and production-ready.

## Use When

- Adding or refactoring frontend features in `apps/web`.
- Updating client/server boundaries, component structure, or fetch flows.
- Reviewing whether a frontend change follows PMTL implementation habits.

## Expected Output

- Frontend code placed in the right layer with clear domain ownership.
- No placeholder branches, weak typing, or accidental client-side sprawl.

## Execution Approach

1. Inspect the existing feature folder before creating new abstractions.
2. Default to Server Components and only move to the client when interactivity requires it.
3. Keep data contracts typed and validated close to the boundary.
4. Finish with a verification pass through the quality gate.

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

## Verification

- Run `py infra/tools/codex_actions.py quality-gate --scope web` after meaningful changes.
- Recheck that the final file placement still respects feature-first boundaries.

## Edge Cases

- Quick fixes often leak business logic into route files or shared UI.
- Over-eager client components usually indicate missing server-first design, not a requirement.

## References

- `AGENTS.md`
- `docs/architecture/conventions.md`
- `apps/web/src/features`

## Pair with

- `pmtl-ui-behavior` for accessibility, forms, and state discipline.
- `pmtl-ui-style-system` for visual direction.
- `vercel-react-best-practices` when performance is part of the task.
