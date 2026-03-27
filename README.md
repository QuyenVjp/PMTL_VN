# PMTL_VN

> Codebase đạt **9.8/10 sau tối ưu 2026** — ready deploy VPS self-host production.

Monorepo cho nền tảng hoằng pháp PMTL, dùng **Next.js 16 + NestJS 11 + Prisma 7 + Meilisearch + Docker Compose**. Deploy VPS self-host, ngân sách ~100-200k VND/tháng.

## Kiến trúc

```text
apps/
  web/          # Next.js 16 — SSR + RSC, elderly-first UX
  api/          # NestJS 11 — backend authority, 11 domain modules
  admin/        # Vite + React — admin SPA, shadcn/ui
packages/
  shared/       # Zod schemas, types, enums, utils (framework-agnostic)
  ui/           # Shared UI components
  config/       # ESLint, TypeScript, Prettier configs
infra/
  docker/       # compose.dev.yml, compose.prod.yml, env examples
  caddy/        # Reverse proxy config
  scripts/      # Deploy, backup, healthcheck scripts
  tools/        # CLI tools, multi-agent routing
design/         # Source of truth — 7 canonical layers
```

## API Domain Modules (11/11)

| Module | Route prefix | Status |
|--------|-------------|--------|
| identity | `/api/auth` | Implemented |
| content | `/api/content` | Implemented |
| moderation | `/api/moderation` | Implemented |
| community | `/api/community` | Scaffold |
| engagement | `/api/engagement` | Scaffold |
| search | `/api/search` | Scaffold |
| calendar | `/api/calendar` | Scaffold |
| notification | `/api/notifications` | Scaffold |
| contact | `/api/contact` | Scaffold |
| vows-merit | `/api/vows-merit` | Scaffold |
| wisdom-qa | `/api/wisdom-qa` | Scaffold |

Platform modules: health, audit, sessions, rate-limit, feature-flags, metrics, storage — all implemented.

## Quick Start

```bash
# Prerequisites: Node >= 20.18, pnpm >= 10.30.3, Docker

# Install deps
pnpm install

# Dev (Docker — recommended)
just dev-core          # web + postgres + meilisearch + redis
just dev-full          # core + caddy

# Dev (host — fallback)
just host-prepare      # prepare env
just host-full         # web + api + admin on host

# Admin only
just admin-dev         # Vite dev server on :3002
```

## Verification

```bash
just verify-web        # lint + typecheck for web
just verify-cms        # lint + typecheck for api
just verify-all        # full repo verification
just ci                # full CI locally (lint + typecheck + test)
just smoke             # smoke tests
just auth-check        # auth flow test
just search-check      # search sync test
```

## Deploy VPS

```bash
just deploy-vps <sha>  # SSH deploy to production VPS
just backup-vietnix    # Trigger backup to Vietnix/MinIO
```

CI: `.woodpecker.yml` (self-hosted Woodpecker CI, no GitHub Actions billing).
Monorepo cache: hỗ trợ Turborepo remote cache qua `TURBO_TOKEN` + `TURBO_TEAM` + `TURBO_API`.

See `design/02-platform-baseline/vps-runtime/PRODUCTION_CHECKLIST.md` for go-live checklist.

## Tech Stack

| Layer | Tech | Version |
|-------|------|---------|
| Frontend | Next.js | 16.2.1 |
| Backend | NestJS | 11.1.17 |
| Admin | Vite + React | 8.0.2 + 19.2.4 |
| Database | PostgreSQL | 17 |
| ORM | Prisma | 7 |
| Validation | Zod | 4.3.6 |
| Search | Meilisearch | 1.14 |
| Auth | JWT (jose) + Argon2 | — |
| Logging | Pino | — |
| UI | shadcn/ui + Radix | — |
| CI | Woodpecker CI | Self-hosted |
| Reverse Proxy | Caddy | 2.10 |
| CDN | Cloudflare Free | — |

## Constraints

- **VPS self-host only**: No Render, Railway, Fly.io, AWS, GCP.
- **Budget**: ~100-200k VND/tháng (VPS only cost).
- **Domain logic**: 03-domains/ (11 Phật pháp domains) is sacred — never simplify.
- **Elderly UX**: All public UI must be accessible for elderly users.

## Documentation

- `DESIGN_OVERVIEW.md` — bản rút gọn kiến trúc + performance map
- `design/` — canonical source of truth (7 layers)
- `design/README.md` — entry point and reading order
- `design/AI_ENTRYPOINT.md` — AI orientation
- `CLAUDE.md` — Claude Code operating contract
- `AGENTS.md` — subagent role specs
- `TEAM_GUIDE.md` — dev workflow guide
