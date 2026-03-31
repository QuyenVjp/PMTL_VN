# PMTL_VN

Monorepo cho nền tảng hoằng pháp Pháp Môn Tâm Linh Việt Nam.

**Stack:** Next.js 16 + NestJS 11 + Prisma 7 + Meilisearch + Docker Compose.
**Deploy target:** VPS self-host (~100-200k VND/tháng).

> **Status:** Pre-launch. Backend API đã có đủ 11 domain modules với routes + service logic thật. Admin SPA hoạt động. Web frontend đang rebuild. Chưa có production deployment.

## Kiến trúc

```text
apps/
  web/          # Next.js 16 — SSR + RSC (đang rebuild)
  api/          # NestJS 11 — backend authority
  admin/        # Vite + React 19 — admin SPA, shadcn/ui
packages/
  shared/       # Zod schemas, types, enums, utils (framework-agnostic)
  ui/           # Shared UI components
  config/       # ESLint, TypeScript, Prettier configs
infra/
  docker/       # compose.dev.yml, compose.prod.yml, env examples
  caddy/        # Reverse proxy config
  scripts/      # Deploy, backup, healthcheck scripts (bash + PowerShell)
  tools/        # CLI tools, multi-agent routing (Python)
design/         # Source of truth — 7 canonical layers
```

## API Domain Modules

| Module | Route prefix | Status | Key surfaces |
|--------|-------------|--------|--------------|
| identity | `/api/auth` | Implemented | login, register, refresh, logout, profile, password reset |
| content | `/api/content` | Implemented | posts CRUD, guides, downloads, chant items, media library |
| community | `/api/community` | Implemented | posts, comments, hearts, reports, guestbook |
| engagement | `/api/engagement` | Implemented | reactions, bookmarks, gongke, repentance, little house, practice profile |
| search | `/api/search` | Implemented | Meilisearch global search, reindex |
| calendar | `/api/calendar` | Implemented | events, agenda items, reschedule, cancel, advisory |
| notification | `/api/notifications` | Implemented | preferences, push subscribe/unsubscribe, push jobs |
| contact | `/api/contact` | Implemented | contact form, public info, volunteer directory |
| vows-merit | `/api/vows-merit` | Implemented | vows, milestones, merit transfer, life release journal, altar |
| wisdom-qa | `/api/wisdom-qa` | Implemented | Q&A, authority profiles, rule packs |
| moderation | `/api/moderation` | Implemented | reports, decisions, comment moderation |

Platform modules: health, audit, sessions, rate-limit, feature-flags, metrics, storage, webhook — all implemented.

## What's NOT done yet

- **Web frontend:** Đang rebuild theo `design/`. Nhiều page chưa kết nối API mới.
- **Production deployment:** Chưa deploy lần nào. Xem [Production Checklist](design/02-platform-baseline/vps-runtime/PRODUCTION_CHECKLIST.md).
- **E2E tests:** Chưa có. Unit test coverage thấp.
- **Advanced infra:** Valkey cache, BullMQ workers, OTEL tracing — planned, chưa activate.
- **Offline bundles:** Design xong, chưa implement.

## Quick Start

```bash
# Prerequisites: Node >= 20.18, pnpm >= 10, Docker

pnpm install

# Dev (Docker — recommended)
just dev-core          # web + postgres + meilisearch + redis
just dev-full          # core + caddy

# Dev (host — fallback)
just host-prepare
just host-full         # web + api + admin on host

# Admin only
just admin-dev         # Vite dev server on :3002
```

## Verification

```bash
just verify-web        # lint + typecheck for web
just verify-cms        # lint + typecheck for api
just verify-all        # full repo verification
just smoke             # smoke tests
just auth-check        # auth flow test
just search-check      # search sync test
```

## Scripts & Tooling

Repo scripts dùng 3 ngôn ngữ tùy context:

| Language | Usage | Lý do |
|----------|-------|-------|
| Bash | Docker, deploy, backup, CI | Chạy trên Linux VPS production |
| PowerShell | Windows dev host preparation | Dev machine chính là Windows |
| Python | CLI tools, multi-agent routing | Cross-platform, agent SDK integration |

Entry point chính là `justfile` — tất cả dev commands đi qua `just`.

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

## Design docs

- `design/` — canonical source of truth (7 layers). Xem `design/README.md` cho reading order.
- `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md` — ánh xạ design → code thật.
- `CLAUDE.md` — Claude Code operating contract.
- `AGENTS.md` — subagent role specs.

## Constraints

- **VPS self-host only**: Không dùng Render, Railway, Fly.io, AWS, GCP.
- **Budget**: ~100-200k VND/tháng (VPS only cost).
- **Domain logic**: `design/03-domains/` (11 Phật pháp domains) là source of truth.
- **Elderly accessibility**: Public UI cần accessible cho người lớn tuổi — đang address trong web rebuild.

## License

All rights reserved. Xem [LICENSE](LICENSE).
