# REPO_CONSTITUTION — Git Workflow & Quality Gates

File này chốt conventions cho version control và quality gates.

> **Related**: `.commitlintrc.mjs`, `.github/workflows/ci.yml`

---

## 1. Branch Strategy: Trunk-Based Development (Modified)

```
main                  ←── production-ready code
  │
  └── develop         ←── integration branch (staging)
        │
        ├── feat/xxx  ←── feature branches
        ├── fix/xxx   ←── bugfix branches
        ├── refactor/xxx
        └── infra/xxx
```

### Rules:

1. **main** is always deployable
2. **develop** is the integration branch for testing
3. Feature branches live ≤ 3 days (small PRs)
4. Direct commits to `main` are blocked
5. Squash merge for clean history

---

## 2. Branch Naming Convention

```
<type>/<short-description>
```

Examples:
- `feat/guestbook-moderation`
- `fix/auth-cookie-samsite`
- `refactor/audit-service-cleanup`
- `infra/caddy-rate-limit`
- `docs/migration-zero-downtime`

### Types (match commitlint):
| Type       | Mô tả |
|------------|-------|
| `feat`     | Tính năng mới |
| `fix`      | Sửa bug |
| `docs`     | Chỉ docs |
| `refactor` | Code change không đổi behavior |
| `perf`     | Performance improvement |
| `test`     | Tests |
| `infra`    | Docker, VPS, CI/CD |
| `chore`    | Tooling, deps |

---

## 3. Commit Messages

Tuân theo [Conventional Commits](https://conventionalcommits.org/).

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Examples:

```bash
feat(guestbook): add moderation queue

Implemented BullMQ-based moderation queue with AI pre-filter.
Supports quarantine, approve, reject flows.

Closes #123
```

```bash
fix(auth): correct SameSite cookie for cross-origin

The cookie was not being sent in iframe contexts due to
SameSite=Strict. Changed to SameSite=Lax for better compatibility.
```

### Commitlint Config

See `.commitlintrc.mjs` for full config. Key rules:
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`, `design`, `infra`
- Subject max 100 chars
- Vietnamese allowed in subject
- Merge commits ignored

---

## 4. Pull Request Process

### PR Title
Follow same format as commits:
```
feat(auth): implement session invalidation
```

### PR Size
- **Small**: < 200 lines (ideal)
- **Medium**: 200-500 lines (acceptable)
- **Large**: > 500 lines (split if possible)

### Required Checks

| Check | Required | Notes |
|-------|----------|-------|
| `commitlint` | ✅ | All commits must follow conventional commits |
| `lint` | ✅ | ESLint pass |
| `typecheck` | ✅ | TypeScript strict mode |
| `test` | ✅ | All tests pass |
| `security` | ✅ | Trivy scan (no CRITICAL/HIGH) |
| `build` | ✅ | Apps must build successfully |
| Code Review | ✅ | 1 approval minimum |

### Review Checklist

Reviewer should check:
- [ ] Code follows repo conventions
- [ ] No secrets committed
- [ ] Input validation present
- [ ] Vietnamese text has proper dấu
- [ ] Relevant tests added/updated
- [ ] Breaking changes documented

---

## 5. Quality Gates in CI

### On Pull Request:
1. **commitlint** — Validate all PR commits
2. **lint** — ESLint (apps/web, apps/api, packages/*)
3. **typecheck** — `tsc --noEmit` strict
4. **test** — Unit tests with Vitest
5. **security** — Trivy vulnerability scan
6. **build** — Matrix build (web, api, admin)

### On Main Push:
1. All PR checks
2. **integration** — E2E tests (Playwright)
3. **deploy** — Auto-deploy to staging

### Coverage Gate (Target)
- [ ] 80% overall coverage
- [ ] 90% for core modules (auth, audit, search)

---

## 6. Protected Branch Rules

### main
- Require PR (no direct push)
- Require 1 approval
- Require status checks: lint, typecheck, test, security, build
- Require branches be up to date
- Include administrators

### develop
- Require PR (no direct push)
- Require status checks: lint, typecheck, test
- Allow squash merge only

---

## 7. Release Process

### Versioning: SemVer
```
v0.MAJOR.MINOR-PATCH

v0.1.0   — MVP release
v0.1.1   — patch fixes
v0.2.0   — new features
```

### Release Flow:
1. Create release branch from `develop`: `release/v0.2.0`
2. Final testing on release branch
3. Merge to `main` (squash)
4. Tag: `git tag v0.2.0`
5. Deploy to production
6. Merge back to `develop`

### Changelog
Auto-generated from conventional commits using `standard-version` or `release-please`.

---

## 8. Hooks (Local)

### Husky Setup
```bash
pnpm add -D husky lint-staged
pnpm husky init
```

### Pre-commit
```bash
# .husky/pre-commit
pnpm lint-staged
```

### Commit-msg
```bash
# .husky/commit-msg
npx commitlint --edit $1
```

### lint-staged.config.mjs
```js
export default {
  "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml}": ["prettier --write"],
};
```

---

## 9. Checklist

- [x] Commitlint configured
- [x] CI pipeline with quality gates
- [x] PR template
- [ ] Branch protection rules (requires GitHub admin)
- [ ] Husky hooks setup
- [ ] lint-staged setup
- [ ] Coverage gate enabled
- [ ] Release workflow automation

---

*Owner: `infra/` · Last updated: 2026-03-31*
