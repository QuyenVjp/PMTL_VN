---
description: Analyze code for performance bottlenecks, memory leaks, and optimization opportunities
argument-hint: [file-or-module]
---

Analyze performance for: $ARGUMENTS

If no argument, check files changed since last commit via `git diff --name-only HEAD`.

## Analysis order (run in this priority)

1. **Performance bottlenecks** — O(n²) loops, repeated DB queries in loops (N+1), synchronous blocking in async paths
2. **Memory leaks** — uncleaned event listeners, unreleased connections, growing caches without eviction
3. **Algorithm improvements** — better data structures, indexed lookups vs. linear scans
4. **Caching opportunities** — repeated Prisma queries that could use Valkey/Redis, Meilisearch search fallback overhead
5. **Concurrency issues** — missing `await`, unhandled promise chains, race conditions in concurrent writes

## PMTL_VN specific checks

- Are Prisma queries using `select` to avoid over-fetching raw entities?
- Are search queries hitting Meilisearch first before falling back to Postgres?
- Are `auditService.append()` calls non-blocking (fire-and-forget is OK for audit side-effects)?
- Are large list endpoints paginated?
- Are images/uploads served via CDN, not direct API?

## Output format per issue

```
[SEVERITY] Category
File: path/to/file.ts:line
Problem: what's slow/leaking and why
Fix: concrete recommendation with code sketch
Impact: estimated improvement
```

SEVERITY: `CRITICAL` | `HIGH` | `MEDIUM` | `LOW`

End with: total issue count + top 3 quick wins.
