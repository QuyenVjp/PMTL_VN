---
name: pmtl-karpathy-coding-discipline
description: PMTL pre-code discipline inspired by Andrej Karpathy coding-agent guidance. Use before non-trivial code edits, reviews, refactors, bug fixes, or UI/API implementation to keep changes simple, surgical, assumption-aware, and verified against PMTL design and app constitutions.
license: MIT
---

# PMTL Karpathy Coding Discipline

## Purpose

Keep PMTL coding agents from drifting into broad, speculative, or unverified changes.
This skill adapts the global `karpathy-guidelines` behavior to PMTL's `design/`,
GitNexus, shadcn-admin, and app constitution workflow.

## Use When

- Before any non-trivial code edit in `apps/web`, `apps/admin`, `apps/api`, `packages/*`, or `infra`.
- Before refactors, bug fixes, CRUD/template alignment, seed changes, API contract changes, or UI implementation.
- Before accepting a broad user request such as "fix all", "make it 100%", "optimize", or "make it enterprise-grade".

Skip only for tiny read-only answers, one-line commands, or pure documentation lookup.

## Pre-Code Checklist

1. Name the concrete user-visible failure or outcome.
2. Scout before diagnosing:
   - identify the boundary, source-of-truth docs, existing implementation, and affected verification lane.
   - do not propose a code fix from the first visible symptom.
3. Read the nearest constitution first:
   - `apps/admin/AGENTS.override.md` for admin UI.
   - `apps/api/AGENTS.override.md` for API/runtime.
   - root `AGENTS.md` and relevant `design/` docs for shared decisions.
4. Diagnose the smallest root cause that explains the symptom or requested gap.
5. For PMTL code changes, use GitNexus before edits when the touched symbol is known:
   - `gitnexus_context` for symbol shape.
   - `gitnexus_impact` for upstream blast radius on shared logic.
6. Choose the smallest implementation that satisfies the request.
7. Define the strongest targeted verification before editing.

## Coding Rules

- Keep changes surgical. Every changed line must trace to the current request.
- Prefer existing PMTL patterns, shadcn-admin components, and local query/form/media helpers.
- Do not create new abstractions unless duplication or complexity is real now.
- Do not "clean up" unrelated files, generated outputs, or user edits.
- Surface assumptions early when design docs, API contracts, or runtime data disagree.
- If a request asks for "all pages" or "100%", convert it into auditable batches with checks.
- If three fix attempts fail, stop changing code and re-open the diagnosis; repeated patching usually means the boundary or assumption is wrong.

## PMTL-Specific Guardrails

- `design/` and app constitutions outrank design inspiration packs and global style skills.
- Admin FE must not become business authority; backend contracts stay in `apps/api`.
- Public Buddhist surfaces must preserve PMTL tone and domain language; do not blindly copy SaaS/product design systems.
- For shadcn/ui, use canonical component composition before custom controls.
- For data reset/seed work, verify the target is local dev before destructive commands.

## Verification

After meaningful edits, run the strongest relevant check for the touched area:

- Admin UI: `pnpm --filter @pmtl/admin typecheck`, then targeted lint/build if needed.
- API: `pnpm --filter @pmtl/api typecheck`, targeted tests, lint/build if needed.
- Runtime/data: verify with API/DB checks against the actual record or route.
- Before commit or final large handoff: run `gitnexus_detect_changes` and call out unrelated dirty worktree noise.

## Closeout

Report only:

- What changed.
- Where it changed.
- What was verified.
- What remains risky or unverified.
