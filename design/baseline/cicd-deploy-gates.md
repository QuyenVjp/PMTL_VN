# CICD_DEPLOY_GATES — CI/CD Pipeline & Deploy Gates

File này chốt pipeline CI/CD và các gate bắt buộc trước khi deploy.
Không có doc này, "deploy khi thấy đúng" thay vì "deploy khi gate pass".

> **Deploy runbook**: `ops/deploy-runbook.md` — manual deploy procedure
> **Testing strategy**: `baseline/testing-strategy.md`
> **Secret management**: `baseline/secret-management.md`

---

## Philosophy

Phase 1: GitHub Actions (free tier) với manual deploy confirm.
Phase 2+: Automated deploy khi all gates pass (CD pipeline).

**Non-negotiables**:
- Không deploy khi tests fail
- Không deploy khi typecheck fail
- Không deploy khi migration is destructive mà chưa có rollback plan
- Backup trước mọi production deploy

---

## CI Pipeline (bắt buộc cho mọi PR và push to main)

### Trigger
```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

### Jobs

#### Job 1: `lint-and-typecheck`
```yaml
steps:
  - uses: actions/checkout@v4
  - uses: pnpm/action-setup@v5
  - uses: actions/setup-node@v4
    with:
      node-version: '24.x'
      cache: 'pnpm'
  - run: pnpm install --frozen-lockfile
  - run: pnpm lint
  - run: pnpm typecheck
```
**Gate**: Fail → block merge, block deploy.

**Workflow permissions**:
```yaml
permissions:
  contents: read
```
Chỉ nâng quyền ở job nào thật sự cần deploy/comment.

#### Job 2: `unit-and-integration-tests`
```yaml
services:
  postgres:
    image: postgres:18
    env:
      POSTGRES_DB: pmtl_test
      POSTGRES_USER: pmtl
      POSTGRES_PASSWORD: test
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5

steps:
  - run: pnpm install --frozen-lockfile
  - run: pnpm -F api prisma migrate deploy
    env:
      DATABASE_URL: postgresql://pmtl:test@localhost:5432/pmtl_test
  - run: pnpm test
    env:
      DATABASE_URL: postgresql://pmtl:test@localhost:5432/pmtl_test
      NODE_ENV: test
      JWT_ACCESS_SECRET: test-secret-access
      JWT_REFRESH_SECRET: test-secret-refresh
      # ...other test env vars from .env.test.example
```
**Gate**: Fail → block merge, block deploy.
**Coverage target**: ≥ 70% statement coverage (see `baseline/testing-strategy.md`)

**Version note**: examples in this file target current stable/LTS majors as of `2026-03-21` to reduce design drift.
**Cache note**: dependency cache không được chứa secret-bearing files; chỉ cache package-manager artifacts theo GitHub guidance.

#### Job 3: `build-check`
```yaml
steps:
  - run: pnpm build
```
**Gate**: Fail → block merge. Build must succeed before any deploy.

#### Job 4: `migration-safety-check`
```yaml
steps:
  - run: |
      # Check for destructive migration operations
      git diff HEAD~1 HEAD -- prisma/migrations/ | \
        grep -E '(DROP TABLE|DROP COLUMN|ALTER.*NOT NULL|TRUNCATE)' && \
        echo "WARN: Destructive migration detected — manual review required" && \
        exit 1 || true
```
**Gate (soft)**: Warn on destructive ops, require manual confirmation to proceed.
Do not auto-block — destructive migrations are sometimes necessary.
Annotate PR with warning comment.

---

## CD Pipeline (Phase 2+: Automated deploy)

### Trigger
Only on main branch after CI passes:
```yaml
on:
  push:
    branches: [main]
    # Only after CI jobs complete
needs: [lint-and-typecheck, unit-and-integration-tests, build-check]
```

### Deploy job
```yaml
deploy:
  runs-on: ubuntu-latest
  environment: production  # Requires manual approval in GitHub UI
  steps:
    - name: Pre-deploy backup
      run: |
        ssh deploy@pmtl.vn './scripts/backup-db.sh'
        ssh deploy@pmtl.vn './scripts/verify-backup.sh'

    - name: Deploy
      run: |
        ssh deploy@pmtl.vn 'cd /opt/pmtl && git pull && just dev-rebuild'

    - name: Health check
      run: |
        sleep 15
        curl -f https://api.pmtl.vn/health/live || exit 1
        curl -f https://api.pmtl.vn/health/ready || exit 1

    - name: Smoke test
      run: |
        curl -f https://pmtl.vn/ || exit 1
        curl -f https://api.pmtl.vn/health/startup || exit 1
```

**GitHub Environment**: `production` environment requires 1 manual approver.
This is the human gate — automated only after explicit approval.

## Release artifact discipline

- Không rollback production bằng `git checkout HEAD~1` như default mental model nếu deploy artifact không được pin rõ.
- Phase 1 tối thiểu phải chốt một trong hai:
  - image tag / build artifact immutable theo commit SHA
  - release bundle/version manifest immutable theo commit SHA
- Deploy log phải ghi rõ:
  - commit SHA
  - artifact version hoặc image tag
  - migration revision áp dụng
  - backup artifact id / timestamp dùng trước deploy
- Backup artifact naming nên khớp contract trong `ops/backup-restore.md`
- Retention của release artifact và backup artifact phải được ghi rõ trong deploy pipeline notes hoặc runbook liên quan

Nếu chưa có artifact pinning rõ, rollback chỉ được coi là `best effort manual rollback`, chưa phải rollback contract mạnh.

---

## Deploy gates summary

| Gate | Type | Blocks |
|---|---|---|
| `pnpm lint` pass | Automated | PR merge + deploy |
| `pnpm typecheck` pass | Automated | PR merge + deploy |
| Unit + integration tests pass | Automated | PR merge + deploy |
| Coverage ≥ 70% | Automated (soft) | Warn only, not hard block |
| `pnpm build` pass | Automated | PR merge + deploy |
| Migration safety check | Automated (soft) | Warn on destructive ops |
| Backup verified | Automated (CD) | Deploy |
| Health endpoints pass | Automated (post-deploy) | Trigger rollback if fail |
| Human approval | Manual (GitHub Environment) | CD deploy |

---

## GitHub Actions secrets required

| Secret name | Purpose | Rotation |
|---|---|---|
| `VPS_SSH_KEY` | SSH key for deploy user on VPS | On key compromise or personnel change |
| `VPS_HOST` | VPS hostname/IP | When VPS changes |
| `VPS_DEPLOY_USER` | SSH username | When user changes |
| `SLACK_WEBHOOK_URL` | Deploy notifications | Optional |

**Store in**: GitHub repository secrets (Settings → Secrets → Actions)

---

## Branch strategy

```
main              → always deployable, protected branch
  ↑
feature/<name>    → short-lived, PR to main
fix/<name>        → bug fixes, PR to main
```

**Branch protection rules for `main`**:
- Require PR (no direct push)
- Require CI to pass
- Require 1 reviewer approval (when team > 1)
- Require branches to be up-to-date before merge
- No force push

---

## Rollback gate

If health check fails post-deploy:
```yaml
- name: Auto-rollback on health failure
  if: failure()
  run: |
    ssh deploy@pmtl.vn 'cd /opt/pmtl && ./scripts/deploy-rollback.sh <last-known-good-artifact>'
    curl -f https://api.pmtl.vn/health/ready || echo "CRITICAL: Rollback also failed"
```

**Design note**:
- `git checkout HEAD~1` chỉ là placeholder cho local recovery reasoning, không phải rollback contract production-grade
- rollback chuẩn phải target `last known good artifact` hoặc pinned image, không phụ thuộc working tree state trên server
- nếu `deploy-rollback.sh` chưa tồn tại, CD rollback hiện chỉ là design intent, chưa phải implementation proof

---

## Environment files for CI

```
apps/api/.env.test.example     — test env vars (no real secrets, safe to commit)
apps/web/.env.test.example     — test env vars for web
```

**Rule**: `.env.test.example` contains only fake/test values. Real values injected via GitHub secrets.

---

## Code locations

| Artifact | Location |
|---|---|
| CI workflow | `.github/workflows/ci.yml` |
| CD workflow | `.github/workflows/deploy.yml` |
| Test env example | `apps/api/.env.test.example` |
| Pre-commit hook | `.husky/pre-commit` |
| Just deploy commands | `Justfile` — `just dev-rebuild`, `just smoke` |

---

## Implementation proof criteria

| Check | Proof |
|---|---|
| CI runs on PR | GitHub Actions tab shows CI job on PR open |
| Lint/typecheck blocks merge | PR with lint error cannot be merged |
| Tests run against real DB | CI logs show Postgres service + migration deploy |
| Health check post-deploy | CD logs show health endpoint returning 200 |
| Backup before deploy | CD logs show backup + verify steps before deploy |
| Human gate works | Production deploy requires manual approval in GitHub UI |
