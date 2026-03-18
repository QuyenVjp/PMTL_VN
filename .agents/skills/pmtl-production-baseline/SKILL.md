---
name: pmtl-production-baseline
description: PMTL_VN production-grade coding and runtime baseline. Use when implementing or refactoring features that need repo-specific defaults for logging, validation, security posture, caching, monitoring, deployment boundaries, and documentation sync.
---

# PMTL Production Baseline

Use this skill for project-wide defaults, not for ad hoc review output.

## Read first

1. Read `AGENTS.md`.
2. Read `docs/architecture/conventions.md`.
3. Read `docs/architecture/skills-taxonomy.md` when changing AI workflow or skill routing.
4. Read `docs/runbooks.md` and `docs/troubleshooting.md` when the task touches monitoring or recovery.

## Baseline rules

- Preserve monorepo boundaries from `pmtl-vn-architecture`.
- Validate user input and env contracts with Zod.
- Log operational failures with structured context using pino.
- Keep Vietnamese text fully accented in UI, API messages, and seeded content.
- Keep Next.js request-boundary logic in `apps/web/src/proxy.ts` unless official versioned guidance proves otherwise.
- Prefer `"use cache"` helpers and data-layer caching over page-level cache flags.
- Do not leave runtime rule changes undocumented. Update `AGENTS.md`, local skills, and affected docs together.

## Use this skill with

- `pmtl-fe-implementation` for frontend code changes.
- `pmtl-ui-behavior` and `pmtl-ui-style-system` for UI work.
- `pmtl-verify-quality-gate` after meaningful edits.
- `pmtl-runbook-cms-runtime-errors` when the task is incident-oriented.
