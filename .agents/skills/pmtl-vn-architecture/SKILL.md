---
name: pmtl-vn-architecture
description: architecture and implementation guide for the pmtl_vn stack using next.js 16, payload, postgres, meilisearch, caddy, docker compose, and payload auth. use when creating, extending, reviewing, refactoring, or deploying this monorepo; when adding auth, roles, access control, search, docker/caddy setup, or domain features; and when chatgpt must preserve the repo's ai-friendly conventions, boundaries, and file placement rules.
---

# PMTL_VN Architecture

## Overview
Use this skill to keep work aligned with the real PMTL_VN architecture. It is for building new features, reviewing/refactoring code, evolving auth and access control, wiring search, and maintaining Docker/Caddy deployment without breaking monorepo boundaries or file conventions.

The current stack assumptions are:
- `apps/web` is Next.js 16 App Router
- `apps/cms` is a separate Payload runtime server
- Payload auth is the source of truth for auth
- PostgreSQL is the primary database
- Meilisearch powers search
- Caddy terminates SSL and reverse proxies services
- Docker Compose is the operational boundary
- Redis, workers, and queues are allowed when production runtime, abuse protection, or async processing requires them

## Core Rules
Follow these rules on every task:
- Preserve the monorepo split: `apps/web`, `apps/cms`, `packages/*`, `infra/*`, `docs/*`
- Keep web feature-first
- Keep Payload collections thin: schema in collection files, business logic in services
- Keep `packages/shared` framework-agnostic: types, enums, zod schemas, constants, validators, mappers, pure utils only
- Do not move business logic into Payload collection config or Next route/page files
- Introduce Redis, BullMQ, workers, and monitoring only when there is a concrete production or operational need, and document the runtime contract
- Prefer clear, maintainable code over clever abstractions
- Update docs and env examples when architecture, contracts, or runtime requirements change

## Repo Shape
Assume this structure unless the user explicitly changes it:
- `apps/web`: Next.js 16 frontend
- `apps/cms`: Payload runtime server
- `packages/ui`: optional shared UI
- `packages/shared`: pure shared domain code
- `packages/config`: shared eslint/typescript/prettier config
- `infra/docker`: compose files and env examples
- `infra/caddy`: Caddyfile and related files
- `infra/scripts`: deploy and backup scripts
- `docs/architecture`: decisions, domains, conventions, deployment
- `docs/api`: contracts

Consult `references/repo-conventions.md` for placement and layering rules.

## Task Routing
### When working on web
Use `apps/web` and keep code feature-first.
Typical placement:
- pages/routes/layouts/loading/error/meta in `src/app`
- feature code in `src/features/<domain>`
- cross-feature web helpers in `src/lib`
- shared visual primitives in `src/components`

For auth in web:
- prefer `features/auth/*`
- add route protection in middleware or the least invasive server-side guard that fits the existing setup
- treat CMS as the auth authority

### When working on cms
Use `apps/cms` and keep collection files small and explicit.
Per collection/domain, prefer:
- `index.ts`: collection declaration
- `fields.ts`: field definitions
- `access.ts`: access control only
- `hooks.ts`: orchestration hooks only
- `service.ts`: business logic

Shared CMS code goes into:
- `src/fields`
- `src/blocks`
- `src/access`
- `src/hooks`
- `src/services`
- `src/integrations`
- `src/admin`

### When working on shared domain code
Use `packages/shared` only for framework-agnostic code:
- `constants`
- `enums`
- `schemas`
- `types`
- `validators`
- `mappers`
- pure `utils`

Do not import Next.js internals, Payload internals, or runtime-only server utilities here.

### When working on infra or deployment
Use:
- `infra/docker` for compose files and env examples
- `infra/caddy` for reverse proxy and SSL config
- `infra/scripts` for deployment and DB backup scripts
- GitHub Actions for build/push/deploy automation

Prefer the production model:
- build images locally or in CI
- push to registry
- VPS only pulls and runs containers

## Auth Strategy
Use Payload built-in auth as the default source of truth.

Required assumptions:
- auth lives in `apps/cms`
- web calls CMS for auth operations
- session strategy is Payload auth using JWT/cookie mechanisms
- do not add Auth.js, Better Auth, or a second auth authority unless the user explicitly asks for it

Typical auth scope:
- register
- login
- logout
- forgot password
- reset password
- current user / session
- role-based access
- protected routes
- user profile basics

Default roles:
- `super-admin`
- `admin`
- `editor`
- `moderator`
- `member`

Consult `references/auth-and-security.md` for role, access, and security guidance.

## Search Strategy
Meilisearch is the default search engine.
Use it for:
- global search
- type-filtered search
- normalized Vietnamese search patterns
- future related-content or discovery features

Keep search concerns separated:
- indexing/sync logic in CMS services/integrations
- search UI and query composition in web features
- shared search DTOs or schemas in `packages/shared`

Do not expose Meilisearch publicly unless explicitly intended. Prefer internal network access behind web/cms services.

## Phase Model
### Phase 1
Supported and preferred:
- Next.js 16 web
- Payload CMS runtime server
- PostgreSQL
- Meilisearch
- Caddy
- Docker Compose dev/prod
- Payload auth
- docs/conventions/contracts maintenance

### Operational Expansion
Add when the production runtime benefits clearly justify the added complexity:
- Redis
- worker service
- BullMQ or jobs/queue infrastructure
- monitoring dashboards
- alerting
- log aggregation
- backup automation beyond simple scripts

## Security Baseline
Always preserve these defaults:
- least privilege access control
- guest access only to public content
- protect admin/moderation areas by role
- keep secrets in env, not code
- keep Postgres and Redis internal-only unless explicitly exposed
- keep Meilisearch internal-only unless explicitly exposed
- use Caddy for TLS termination and reverse proxy
- add limits and guardrails to sensitive routes when implementing auth, comments, abuse reporting, or search

Consult `references/auth-and-security.md` before changing auth, access, or public/private service boundaries.

## Documentation Duties
When you change behavior or architecture, update docs as part of the same task when appropriate:
- `README.md` for run/build/deploy changes
- `docs/architecture/conventions.md` for file-placement or coding rules
- `docs/architecture/domains.md` for domain responsibilities
- `docs/architecture/deployment.md` for infra/runtime changes
- `docs/api/contracts.md` for request/response or auth contract changes
- `.env.example` or env example files for runtime configuration changes

## Recommended Working Style
When given a task:
1. Read the architecture docs the repo points to first.
2. Identify the domain and the correct layer.
3. Place new code in the narrowest correct location.
4. Keep collection hooks thin and move business logic to services.
5. Keep feature code grouped by domain in web.
6. Preserve type safety without over-engineering.
7. Explain file placement and architectural choices briefly when useful.
8. Do not introduce broad refactors unless they are required.

## Common Good Decisions
- Put auth UI and fetch helpers under `apps/web/src/features/auth`
- Put ownership/moderation logic in CMS services, not only access callbacks
- Put DTO validation in `packages/shared/src/schemas`
- Put search indexing in `apps/cms/src/integrations/meilisearch` or a domain service
- Put deploy and backup logic under `infra/scripts`
- Put Docker/Caddy changes under `infra/*` and document them

## Common Bad Decisions
- Mixing framework internals into `packages/shared`
- Putting all CMS logic inside a single collection file
- Adding Redis without a concrete runtime use case or deployment plan
- Adding a second auth system without a clear reason
- Building production images directly on the VPS by default
- Exposing internal services publicly without an explicit need

## References
- For repo layout and file placement, read `references/repo-conventions.md`
- For auth, access, and security defaults, read `references/auth-and-security.md`
- For Docker, Caddy, deployment, and service boundaries, read `references/deploy-and-ops.md`
