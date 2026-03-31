---
description: Expand test coverage for a module — find gaps, write missing tests
argument-hint: [module-name or file path]
---

Expand test coverage for: $ARGUMENTS

## Step 1 — Measure current coverage

```bash
pnpm test --coverage --testPathPattern="$ARGUMENTS" 2>/dev/null || pnpm test
```

## Step 2 — Identify gaps

Target these areas in priority order:
1. **Error handling** — what happens when Prisma throws, when Zod rejects input, when external service fails
2. **Boundary conditions** — empty arrays, null/undefined inputs, max/min values, empty strings
3. **Auth/permission edge cases** — unauthenticated, wrong role, owner-vs-admin scenarios
4. **State transitions** — publish/unpublish, soft-delete, status changes
5. **Side effects** — does auditService.append get called? does the outbox event fire?

## Step 3 — Write tests

Framework: **Vitest** (apps/web) or **Jest** (apps/api)

Rules:
- Follow Arrange-Act-Assert pattern
- Name tests: `it('should <verb> when <condition>')`
- Mock only external boundaries (Prisma, Redis, Meilisearch) — not internal service calls
- Use `prisma.$transaction` test helpers where available
- **Critical paths require 100% coverage**: auth flows, write paths with audit, upload handlers
- **Other paths target 80%**

## Step 4 — Verify

```bash
pnpm test --coverage
```

Output new test code blocks only. Follow existing naming and file conventions in the module.
