# DEPENDENCY_GOVERNANCE — Version Matrix, Release Policy, and Upgrade Discipline

File này chốt cách PMTL_VN theo dõi bản mới, pin version, tiếp nhận security advisory, và xử lý major upgrade mà không phá `design-first rebuild`.

Nó không thay thế quyết định công nghệ trong `design/01-repo-constitution/DECISIONS.md`.
Nó bổ sung phần còn thiếu: cơ chế governance để tránh hai cực đoan:

- “giữ stack cũ quá lâu”
- “thấy bản mới là nâng tất cả”

> **Library choices authority**: `design/01-repo-constitution/DECISIONS.md` section 14
> **Exact version pin authority**: `design/02-platform-baseline/dependency-version/VERSION_MATRIX.md`
> **Deferred / excluded technology authority**: `design/01-repo-constitution/DECISIONS.md` section 15
> **Anti-goals authority**: `design/01-repo-constitution/DECISIONS.md` section 17
> **Monorepo boundaries authority**: `AGENTS.md`
> **Migration baseline**: `design/02-platform-baseline/data-runtime/MIGRATION_STRATEGY.md`
> **CI/CD gates**: `design/02-platform-baseline/deploy-ops/CICD_DEPLOY_GATES.md`
> **Security baseline**: `design/02-platform-baseline/security-runtime/SECURITY_POLICY.md`

---

## 1. Core principles

1. PMTL ưu tiên `stable supported versions`, không ưu tiên “latest” một cách mù quáng.
2. Bản mới chỉ đáng nâng khi có ít nhất một lý do thật:
   - security patch
   - production bug fix
   - measurable DX/performance gain
   - feature gap thật sự cần cho design đã chốt
   - ecosystem support pressure rõ ràng
3. Không dùng `beta`, `rc`, `canary`, `nightly`, hay `preview` trên runtime production path trừ khi doc này ghi ngoại lệ rõ.
4. Với tech còn `planned` hoặc `deferred`, exact numbers phải mirror `VERSION_MATRIX.md`; nếu chưa có activation PR thì chỉ dùng như approved line cho doc/governance, không được claim installed proof.
5. `packages/shared` và các app consumer phải giữ các thư viện boundary-critical đồng bộ version khi doc này yêu cầu.
6. Nếu official docs mới mâu thuẫn với repo docs cũ, phải cập nhật docs owner trong cùng task thay vì lặng lẽ follow drift.

---

## 2. Release channel policy

### Allowed by default

- `stable`
- `patch`
- `minor`

### Forbidden by default

- `alpha`
- `beta`
- `rc`
- `preview`
- `canary`
- `nightly`

### Narrow exceptions

RC/beta chỉ được dùng khi **tất cả** điều kiện sau đúng:

1. Nó là dev-only tooling, không nằm trên production runtime path.
2. Có blocker thật mà bản stable hiện tại chưa giải quyết được.
3. Có rollback đơn giản về stable.
4. PR ghi rõ:
   - tại sao cần ngoại lệ
   - expiry condition
   - stable target sẽ quay về

### Current repo-specific exceptions

| Package | Current state | Why tolerated | Exit condition |
|---|---|---|---|
| `@rolldown/binding-win32-x64-msvc@1.0.0-rc.9` | dev-only exception | tooling support for current Vite/Rolldown path in workspace root | remove when stable binding path no longer needs explicit RC package |

Rule:

- Exception dev-only không tự động hợp thức hóa việc đưa RC vào `apps/web`, `apps/api`, `apps/admin`, container runtime, hay production ops stack.

---

## 3. Approved version policy mirror

Section này là `governance mirror` của exact pins trong [VERSION_MATRIX.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/dependency-version/VERSION_MATRIX.md).
Nếu bảng này lệch `VERSION_MATRIX.md`, coi như drift bug và `VERSION_MATRIX.md` thắng.

### 3.1 Interpretation

This section intentionally does **not** mirror exact numbers nữa.
Exact pins, installed truth, and activation-time pins chỉ sống ở `VERSION_MATRIX.md`.
File này chỉ mirror `governance shape` để tránh phải maintain hai bảng version lớn song song.

### 3.2 Governance groups

| Group | Status family | Upgrade mode | Exact-pin authority | Notes |
|---|---|---|---|---|
| Workspace root toolchain | active | patch/minor in cadence; major by decision | `VERSION_MATRIX.md` | Node/pnpm/Turbo/TypeScript/ESLint/Prettier/Vitest/plugin-react |
| Web runtime and shared UI | active | patch/minor in cadence; major by decision | `VERSION_MATRIX.md` | Next.js/React/Zod/RHF/Tailwind/Pino/Sentry/shadcn CLI |
| Shared boundary-critical packages | active | exact sync or same-line sync | `VERSION_MATRIX.md` | `zod`, `react`, `react-dom`, generated boundary clients |
| `apps/api` scaffold target line | target | exact pin in scaffold PR | `VERSION_MATRIX.md` | NestJS, Prisma, Zod, Pino, swagger, auth/upload/metrics helpers |
| `apps/admin` scaffold target line | target | exact pin in scaffold PR | `VERSION_MATRIX.md` | Vite, React, TanStack Router/Table, shadcn-generated surface |
| Infra and optional-scale components | planned or explicit exclusion | activation-time pin or do-not-add | `VERSION_MATRIX.md` | Valkey, BullMQ, Meilisearch, PgBouncer, Prometheus, Grafana, OTEL, pgvector |

### 3.3 Mirror intent

- `active` = workspace hiện có thể dùng ngay; cadence review áp dụng trực tiếp
- `target` = approved line cho scaffold sắp tới; chưa được coi là installed proof
- `planned` = chỉ pin exact ở activation PR khi measured trigger đã đủ
- `explicit exclusion` = không được thêm chỉ vì upstream có feature mới

### 3.4 Exact-pin workflow

Khi một approved line đổi:

1. sửa `VERSION_MATRIX.md` trước
2. chạy verification phù hợp
3. chỉ sửa file này nếu governance shape đổi
4. không thêm lại bảng exact version dài vào đây

---

## 4. Synchronization rules

### Exact-sync packages

Các package sau phải giữ exact version hoặc exact major/minor alignment giữa các workspaces liên quan:

- `zod`
- `react`
- `react-dom`
- any generated client package that shares runtime boundary contracts later

### Same-line packages

Các package sau không nhất thiết exact patch, nhưng phải cùng stable line tương thích:

- `@hookform/resolvers` với `react-hook-form`
- `@nestjs/swagger` với NestJS major
- `nestjs-pino` với NestJS major
- TanStack packages trong cùng app surface

### Forbidden drift patterns

- web dùng `zod` major mới nhưng `packages/shared` chưa nâng
- `packages/ui` peer React khác major với `apps/web`
- thêm auth, storage, search, queue SDK vào client bundle mà tạo authority thứ hai
- dùng provider-specific feature làm shortcut phá contract của `apps/api`

---

## 5. Monthly upgrade cadence

### Schedule

- tuần đầu tiên của mỗi tháng
- một batch review cho dependency đang active trong workspace
- major upgrade không đi chung batch patch/minor

### Expected outputs

Mỗi cadence run phải tạo hoặc cập nhật:

1. một PR dependency review
2. changelog note ngắn trong PR description
3. cập nhật `VERSION_MATRIX.md` nếu exact pin hoặc approved line đổi; chỉ sửa section 3 của file này khi governance shape hoặc sync rule đổi
4. patch log trong section 7 nếu có security-driven hotfix

### Minimum review steps

- [ ] chạy `pnpm outdated` ở root
- [ ] xem release notes / migration guide của package định nâng
- [ ] phân loại package vào một trong ba nhóm:
  - `upgrade now`
  - `watch next cadence`
  - `defer with reason`
- [ ] chạy verification phù hợp với bề mặt chạm vào
- [ ] cập nhật doc này nếu approved current hoặc policy thay đổi

### Verification mapping

| Touched area | Minimum verification |
|---|---|
| root tooling only | `pnpm lint`, `pnpm typecheck`, `pnpm test` |
| web runtime | `pnpm --filter @pmtl/web test`, `pnpm typecheck`, `pnpm build` |
| shared + web | `pnpm --filter @pmtl/web test`, `pnpm typecheck`, targeted import smoke |
| infra / future activation docs only | doc consistency search + targeted diff review |
| CI/CD dependency changes | read `design/02-platform-baseline/deploy-ops/CICD_DEPLOY_GATES.md` and verify workflow assumptions stay valid |

### Skip policy

Cadence có thể skip nếu:

- tháng đó vừa có emergency security patch cho cùng stack
- hoặc repo đang giữa major migration chưa đóng

Nếu skip:

- phải ghi lý do trong PR hoặc issue tracking
- không được skip 2 tháng liên tiếp cho active security-sensitive packages

---

## 6. Security advisory intake

### Sources

- GitHub Dependabot alerts
- official release notes / security advisories của vendor
- `pnpm audit` như tín hiệu phụ, không phải authority duy nhất
- runtime incident hoặc external scanner evidence khi có

### Intake triage

| Class | Examples | Priority | SLA |
|---|---|---|---|
| Runtime critical | auth, crypto, Next.js server, Prisma query engine, Caddy, Meilisearch public issue | immediate | 48h |
| Runtime high | upload parser, session middleware, logging leak, metrics exposure bug | high | 7 ngày |
| Tooling high | Vite dev-server issue chỉ ảnh hưởng local/dev | medium | next cadence unless exploit path is real |
| Low / maintenance | formatting, CLI, IDE helper | low | batch in cadence |

### Escalation overrides

Treat as `high` regardless of vendor score when package sits on these paths:

- auth
- session transport
- password hashing
- upload validation
- public HTTP ingress
- SQL / ORM migration
- search engine exposed to untrusted input

### Response policy

1. xác nhận có thật package/version bị ảnh hưởng không
2. xác nhận có reachable path trong PMTL không
3. nếu có fix stable:
   - patch ngay
   - chạy verification phù hợp
   - ghi vào patch log
4. nếu chưa có fix stable:
   - ghi mitigation
   - mở tracking issue
   - note rõ temporary exception

### Forbidden reactions

- `npm audit fix --force` không qua review changelog
- suppress alert mà không có dated justification
- nâng major version chỉ vì advisory trong khi patch/minor fix đã đủ
- lấy RC/beta làm security fix production nếu stable chưa được vendor khuyến nghị

---

## 7. Security and hotfix patch log

Append-only log. Mỗi lần patch ngoài cadence thường lệ phải thêm một dòng.

| Date | Package / component | From | To | Reason / CVE / incident | Verification | Owner note |
|---|---|---|---|---|---|---|
| 2026-03-24 | governance baseline | n/a | initial doc | establish central dependency policy | doc consistency search | initial setup |

---

## 8. Migration checklist by stack

## 8.1 Next.js major

- [ ] đọc official migration guide cho major đích
- [ ] re-check `design/02-platform-baseline/web-runtime/FRONTEND_ARCHITECTURE.md` for cache and request-boundary rules
- [ ] verify `cacheComponents`, `use cache`, `cacheTag`, `after()` semantics still fit repo policy
- [ ] verify server/client boundary did not silently change route behavior
- [ ] verify image, metadata, and route handlers if touched
- [ ] run web verification commands
- [ ] update owner docs if behavior changed

## 8.2 React major

- [ ] verify React + React DOM stay exact-sync
- [ ] verify `packages/ui` peers stay aligned
- [ ] re-check form libs, query libs, animation libs, command palette compatibility
- [ ] smoke render critical shared components
- [ ] confirm no deprecated runtime API remains in app code

## 8.3 Vite major

- [ ] confirm stable release, not beta/rc
- [ ] verify plugin ecosystem compatibility
- [ ] verify build output and dev server assumptions for admin path
- [ ] verify no hidden dependency on Babel-only transforms if plugin behavior changed
- [ ] verify monorepo path resolution and test runner integration

## 8.4 Prisma major

- [ ] đọc migration guide chính thức
- [ ] verify schema syntax still supports repo plan
- [ ] verify `omit`, `strictUndefinedChecks`, and `Prisma.skip` rules still map correctly
- [ ] run schema validation and migration diff review
- [ ] verify `/health/ready` migration check assumptions still hold
- [ ] do not merge destructive migration change without rollback note

## 8.5 NestJS major

- [ ] verify guards, interceptors, filters, pipes, and module bootstrap semantics
- [ ] verify `nestjs-pino` compatibility
- [ ] verify OpenAPI generation path still works
- [ ] verify Zod boundary integration still stays explicit and does not drift to TS-only validation
- [ ] verify health/metrics/platform module boot order assumptions still hold

## 8.6 Zod major

- [ ] move all Zod consumers together
- [ ] search for API removals and renamed fields
- [ ] typecheck whole workspace
- [ ] verify schema error handling shape expected by API/client still matches
- [ ] verify metadata/registries, JSON Schema export, and codecs usage still stay derivative, not source-of-truth
- [ ] verify deprecated `ZodError.format()` / `.flatten()` are not reintroduced; use top-level helper path
- [ ] verify `zod/mini` or `zod/v4/core` have not leaked into app runtime without owner exception
- [ ] update examples and docs if error shape changed

## 8.7 TanStack Query major

- [ ] verify `queryOptions()` / `infiniteQueryOptions()` patterns still work
- [ ] verify `skipToken` usage still behaves as expected
- [ ] verify invalidation patterns in web/admin docs if affected
- [ ] verify streaming or persistence features are opt-in and do not become accidental default

## 8.8 Sentry SDK major

- [ ] confirm framework support for current Next/React line
- [ ] verify server/client instrumentation split
- [ ] verify source map upload or release tagging assumptions
- [ ] ensure observability remains additive, not authority-bearing

## 8.9 Caddy / ingress major

- [ ] confirm official stable release
- [ ] review security notes and config syntax changes
- [ ] verify HTTPS automation, reverse proxy behavior, header policy, and health endpoint exposure
- [ ] verify trusted proxy chain assumptions with Cloudflare still hold
- [ ] test rollback path before rollout

## 8.10 Valkey / BullMQ / Meilisearch / PgBouncer activation or major bump

- [ ] confirm design trigger has been met
- [ ] pin exact stable version in the activation PR
- [ ] add or update runtime-specific env vars and owner docs
- [ ] define health checks and degraded behavior before rollout
- [ ] verify fallback / rebuild / rollback path
- [ ] do not import runtime complexity just because upstream got faster

## 8.11 Prometheus / Alertmanager / Grafana / OTEL collector major

- [ ] confirm phase trigger in `design/02-platform-baseline/deploy-ops/OBSERVABILITY_ARCHITECTURE.md`
- [ ] verify no public exposure is introduced accidentally
- [ ] verify dashboards/alerts answer a real operator question
- [ ] verify logs, metrics, traces use consistent vocabulary with PMTL modules
- [ ] keep rollout incremental; do not light up all layers at once

---

## 9. Official-source rule

Khi review bản mới hoặc migration:

- dùng official release notes / migration guide / changelog trước
- nếu third-party article mâu thuẫn, official source thắng
- nếu official source chưa đủ rõ, giữ nguyên current approved version thay vì đoán

For security-sensitive or operational components, the review note should capture:

- source URL
- release date
- package/component name
- why PMTL should care or not care

---

## 10. What this doc does not authorize

File này **không** cho phép:

- đổi stack đã chốt trong `DECISIONS.md` chỉ vì upstream có feature mới
- thêm auth authority thứ hai
- thêm managed-platform shortcut phá `apps/api` authority
- bật `pgvector` sớm hơn trigger
- bật infra nặng trước khi có operational reason đo được

Rule of thumb:

- `learn from new tech` = yes
- `import every new tech` = no

---

## 11. Decision log for future updates

Khi policy trong file này đổi, PR phải nói rõ:

1. cái gì đổi
2. vì sao policy cũ không còn đủ
3. authority doc nào liên quan
4. verification nào đã chạy
