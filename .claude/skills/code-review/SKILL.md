---
name: code-review
description: Comprehensive code review across security, performance, quality, and maintainability. Complements arch-check (which focuses on PMTL contract violations). Use this for general code quality review on any file or module.
argument-hint: [file-or-module]
---

# Code Review

Review: **$ARGUMENTS**

If no argument, review all files changed since last commit via `git diff --name-only HEAD`.

---

## Review dimensions (run all four)

### 1. Security
- Authentication/authorization issues — missing JwtAuthGuard, RolesGuard, or policy check
- Data exposure — raw Prisma entities returned (must go through mapper), sensitive fields in response
- Injection vulnerabilities — unsanitized inputs reaching SQL raw queries or shell commands
- Secrets/credentials hardcoded in source
- CSRF protection on mutation endpoints

### 2. Performance
- N+1 queries — loops containing Prisma calls
- Missing `select` on Prisma queries (over-fetching)
- Synchronous blocking operations in async routes
- Missing pagination on list endpoints
- Repeated computations that should be cached in Valkey

### 3. Code quality (SOLID + PMTL conventions)
- **Single Responsibility**: controllers only validate+delegate, services own business logic, repositories only query
- **Naming**: clear, descriptive, consistent with existing module conventions
- **Function length**: > 50 lines is a signal to decompose
- **Cyclomatic complexity**: > 10 branches in one function is a signal
- **Type safety**: no `any` without justification, no TypeScript-only validation (must have Zod runtime check)
- **Dead code**: unused imports, variables, commented-out blocks

### 4. Maintainability
- Is the code readable without needing to trace 3+ files?
- Are error messages descriptive enough for debugging?
- Are magic numbers/strings extracted to named constants?
- Is the test surface reasonable (testable functions, not tangled dependencies)?

---

## Output format

```
## Code Review: [file or module]

### Summary
Quality rating: N/5
Critical: X | High: Y | Medium: Z | Low: W

### Findings

[SEVERITY] Category — short title
File: path/to/file.ts:line
Problem: what is wrong
Fix: concrete recommendation
```

SEVERITY: `CRITICAL` | `HIGH` | `MEDIUM` | `LOW`

End with: "No findings" if clean, or list items that must be fixed before merging.
