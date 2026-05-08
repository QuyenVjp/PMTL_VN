---
name: refactor
description: Systematic, safe refactoring following incremental steps. Preserves external behavior. Use when cleaning up a module, decomposing large functions, removing duplication, or improving naming. Always reads tests first.
argument-hint: [file-or-module to refactor]
---

# Refactor

Target: **$ARGUMENTS**

Refactoring principle: change internal structure without altering external behavior.

---

## Phase 1 — Understand before touching

1. Read the target file(s) fully
2. Read existing tests: `apps/api/src/modules/$ARGUMENTS/*.spec.ts` or `apps/web/src/**/$ARGUMENTS*.test.ts`
3. Run current tests to confirm green baseline: `pnpm test --testPathPattern="$ARGUMENTS"`
4. If test coverage is below 60% on the target — **stop and write tests first** before refactoring

## Phase 2 — Identify what to improve

Prioritize these code smells:

| Smell | Signal | Technique |
|---|---|---|
| Long method | > 50 lines | Extract function |
| Duplicated code | Same logic in 2+ places | Extract to shared helper |
| Large class/service | > 300 lines, > 10 methods | Split by responsibility |
| Deep nesting | > 3 levels of if/for | Early return / guard clauses |
| Feature envy | Method uses another module's data heavily | Move method |
| Magic values | Raw strings/numbers inline | Named constants |
| Long parameter list | > 4 params | Introduce params object |

## Phase 3 — Plan (confirm before implementing)

List each refactor step as an atomic, independently-testable change.
Present the plan and ask: "Xác nhận refactor theo kế hoạch này không?"

## Phase 4 — Implement incrementally

For each step:
1. Make the smallest possible change
2. Ensure tests still pass: `pnpm test --testPathPattern="$ARGUMENTS"`
3. Only then move to the next step

**Stop and consult user if:**
- Business logic is unclear — don't guess intent
- Test coverage is inadequate for the area being changed
- The refactor would change a public contract (API routes, exported types, service interfaces)
- An architectural decision is required (e.g. moving code between modules)

## Phase 5 — Verify and report

Run: `pnpm test` + `pnpm typecheck` + `pnpm lint`

Report:
- Files changed and how
- Tests added or modified
- Any follow-up work identified but not done
