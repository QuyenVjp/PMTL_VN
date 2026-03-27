# REPO_STRUCTURE (Quy tắc cấu trúc repo)

File này là canonical owner cho `folder/file placement`.
Nó thay path legacy cũ trong `design/02-platform-baseline/dependency-version/REPO_STRUCTURE.md`.

Authority liên quan:

- [DECISIONS.md](../01-repo-constitution/DECISIONS.md)
- [NEST_REQUEST_PIPELINE.md](../02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md)
- [IMPLEMENTATION_MAPPING.md](../04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md)

## Monorepo baseline

```txt
apps/
  web/
  api/
  admin/
  worker/           # optional phase 2+

packages/
  shared/
  ui/
  api-client/
  config/

infra/
docs/
design/
```

## Ownership by top-level folder

- `apps/web`: public frontend, consume API contracts, không giữ business authority
- `apps/api`: NestJS backend authority, auth, domain modules, platform modules, OpenAPI, canonical write-path
- `apps/admin`: management UI riêng, chỉ gọi API, không giữ business logic
- `apps/worker`: optional phase 2+, chỉ bật khi async workload đủ đáng tách khỏi request path
- `packages/shared`: framework-agnostic contracts, schemas, types, mappers, validators
- `packages/ui`: shared UI primitives cho web/admin khi thật sự có reuse
- `packages/api-client`: generated hoặc hand-curated client từ OpenAPI/contracts theo [API_CLIENT_POLICY.md](../04-execution-overlay/api/API_CLIENT_POLICY.md)
- `packages/config`: shared lint/typescript/prettier/tooling config
- `infra`: Docker, Caddy, deploy, backup, scripts vận hành
- `docs`: runbooks, commands, learning notes, agent docs
- `design`: target architecture, baseline rules, module contracts, phase gates

## Placement guardrails

- `apps/web/src/app` chỉ giữ route, layout, metadata, page composition
- `apps/web/src/features/<domain>` giữ UI domain, API adapter, hook, mapper, local state
- `apps/api/src/platform/*` giữ control-plane/runtime modules như sessions, audit, flags, rate-limit, storage, health, metrics
- `apps/api/src/modules/*` giữ domain modules
- controller không giữ business logic; business authority nằm ở service/module layer
- `packages/shared` không chứa NestJS imports, Next.js imports, Prisma client trực tiếp, hay browser-only APIs
- `packages/ui` chỉ giữ base primitives có reuse thật; route-aware composition ở app layer
- `apps/admin` không bypass API contract
- `apps/worker` khi bật không được nhân bản business authority sang worker
