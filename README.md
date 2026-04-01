# PMTL_VN — Buddhist Dharma Platform

Digital platform for PMTL Việt Nam (Pháp Môn Tâm Linh Việt Nam) — Buddhist teachings, community engagement, personal practice tracking, and wisdom Q&A hosted on personal VPS.

**Status:** Pre-launch (Phase 1). Backend fully modularized (11 domains). Admin frontend operational. Web frontend rebuild in progress.

**Tech Stack:** Next.js 16 + NestJS 11 + Prisma 7 + Postgres 17 + Meilisearch + Docker Compose + Caddy.

**Deployment:** Self-hosted VPS (~100–200k VND/month).

---

## 🎯 What This Project Is

PMTL_VN is a **design-first rebuild** of a Buddhist practice platform. The project prioritizes:

- **Backend authority**: NestJS owns all write paths, auth, and business logic
- **Data integrity**: Postgres as single source of truth
- **Accessibility**: Built for elderly and mobile-limited users (Vietnamese diaspora)
- **Offline-first design**: Support for offline reading bundles (planned Phase 1)
- **Audit & recovery**: Full audit trails and backup/restore discipline from launch

**Canonical design authority**: Read `design/` folder (7 governance layers). See `design/README.md` for reading order.

---

## 📊 Architecture

### System Context

```
┌─────────────────┐
│   Cloudflare    │ ← WAF, CDN, edge
└────────┬────────┘
         │
    ┌────▼─────────┐
    │  Caddy 2.10   │ ← TLS termination, routing
    └────┬─────────┘
         │
    ┌────┴──────────────┬──────────────────┬──────────────┐
    │                  │                  │              │
 ┌──▼──┐          ┌──▼──┐            ┌──▼───┐       ┌──▼─┐
 │Web  │          │API  │            │Admin │       │SSR │
 │Next │          │Nest │            │SPA   │       │RSC │
 │16   │          │11   │            │React │       │    │
 └─────┘          └──┬──┘            └──────┘       └────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
    ┌───▼───┐    ┌──▼─┐      ┌──▼──┐
    │Postgres │   │Meili│     │Disk │
    │17       │   │1.14 │     │Media│
    └─────────┘   └─────┘     └─────┘
```

### Repository Structure

```
apps/
  web/              # Next.js 16 SSR + React Server Components (rebuild in progress)
  api/              # NestJS 11 backend authority (11 domain modules, fully implemented)
  admin/            # Vite 8 + React 19 SPA (operational, Tailwind 4 + shadcn)

packages/
  shared/           # Zod schemas, TypeScript types, enums, utilities (framework-agnostic)
  ui/               # Shared shadcn/ui + Radix components
  config/           # ESLint, TypeScript, Prettier, Vitest configs

infra/
  docker/           # compose.dev.yml, compose.prod.yml, .env templates
  caddy/            # Reverse proxy config (TLS, routing rules)
  scripts/          # Bash (deploy, backup, restore), PowerShell (Windows dev), Python (CLI tools)
  tools/            # Multi-agent router, code generation, sync utilities

design/             # Source of truth (7 governance layers)
  00-governance/    # Precedence, phase semantics, folder canon, status vocabulary
  01-repo-constitution/ # Repo direction, ownership boundaries, architecture principles
  02-platform-baseline/ # Runtime policy, security, data contracts, version pins
  03-domains/       # 11 Buddhist domain decisions, contracts, use cases
  04-execution-overlay/ # Implementation status matrix, readiness mapping, blockers
  05-references/    # Design research, examples, external docs
  06-prompts/       # AI reading guides, builder prompts

docs/               # Runbooks, API contracts, DX onboarding, architecture modules
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 20.18.0 (install from [nodejs.org](https://nodejs.org))
- **pnpm** ≥ 10.30.3 (install via `npm install -g pnpm`)
- **Docker** + **Docker Compose** (for local dev database, Redis, Meilisearch)

### Installation

```bash
# Clone and install dependencies
git clone <repo-url>
cd PMTL_VN
pnpm install
```

### Local Development

**Option 1: Docker-based (Recommended)**

```bash
# Start core stack (web + api + postgres + meilisearch + redis)
just dev-core

# Or full stack with Caddy reverse proxy
just dev-full

# View logs
just dev-logs

# Stop services
just dev-stop
```

**Option 2: Host-based (Windows dev fallback)**

```bash
# Prepare Windows dev environment
just host-prepare

# Start web + api + admin on host (no Docker)
just host-full

# Or admin only on Vite dev server (:3002)
just admin-dev
```

---

## ✅ Verification & Testing

```bash
# Lint and type-check web app
just verify-web

# Lint and type-check API
just verify-cms

# Full repo verification (all apps)
just verify-all

# Smoke tests (happy-path flows)
just smoke

# Auth flow test (login, refresh, logout)
just auth-check

# Search sync test (Meilisearch ↔ Postgres)
just search-check
```

---

## 📦 API Modules (Phase 1)

| Module            | Prefix               | Status         | Key Features                                                  |
| ----------------- | -------------------- | -------------- | ------------------------------------------------------------- |
| **identity**      | `/api/auth`          | ✅ Implemented | JWT auth, profile, password reset, session management         |
| **content**       | `/api/content`       | ✅ Implemented | posts, guides, downloads, chant library, media                |
| **community**     | `/api/community`     | ✅ Implemented | posts, comments, hearts, reports, guestbook                   |
| **engagement**    | `/api/engagement`    | ✅ Implemented | reactions, bookmarks, merit practices, practice profiles      |
| **search**        | `/api/search`        | ✅ Implemented | full-text search, reindex, Postgres fallback                  |
| **calendar**      | `/api/calendar`      | ✅ Implemented | events, lunar agenda, reschedule, advisory                    |
| **notifications** | `/api/notifications` | ✅ Implemented | preferences, push subscriptions, push jobs                    |
| **contact**       | `/api/contact`       | ✅ Implemented | contact form, volunteer directory, public info                |
| **vows-merit**    | `/api/vows-merit`    | ✅ Implemented | vows, milestones, merit transfer, altar, life release journal |
| **wisdom-qa**     | `/api/wisdom-qa`     | ✅ Implemented | Q&A, authority profiles, teaching rule packs                  |
| **moderation**    | `/api/moderation`    | ✅ Implemented | reports, decisions, comment filtering                         |

**Platform modules** (all implemented): health, audit, sessions, rate-limit, feature-flags, metrics, storage abstraction, webhooks.

---

## 🛠 Tech Stack & Versions

### Core

| Component      | Version   | Purpose                    |
| -------------- | --------- | -------------------------- |
| **Node.js**    | ≥ 20.18.0 | Runtime                    |
| **pnpm**       | ≥ 10.30.3 | Package manager (monorepo) |
| **TypeScript** | 5.9.2     | Type safety                |

### Frontend

| Component                 | Version |
| ------------------------- | ------- |
| **Next.js**               | 16.2.1  |
| **React**                 | 19.2.4  |
| **Tailwind CSS**          | 4.2.2   |
| **shadcn/ui** + **Radix** | Latest  |
| **TanStack Query**        | 5.95.2  |
| **React Hook Form**       | 7.72.0  |

### Admin

| Component           | Version |
| ------------------- | ------- |
| **Vite**            | 8.0.2   |
| **React**           | 19.2.4  |
| **TanStack Router** | 1.168.3 |
| **TanStack Table**  | 8.21.3  |

### Backend

| Component           | Version |
| ------------------- | ------- |
| **NestJS**          | 11.1.17 |
| **@nestjs/config**  | 4.0.3   |
| **@nestjs/swagger** | 11.2.6  |
| **Prisma**          | 7       |
| **Zod**             | 4.3.6   |

### Data & Search

| Component       | Version               |
| --------------- | --------------------- |
| **PostgreSQL**  | 17                    |
| **Prisma ORM**  | 7                     |
| **Meilisearch** | 1.14                  |
| **Redis**       | (included in compose) |

### Infrastructure

| Component          | Version     |
| ------------------ | ----------- |
| **Docker**         | Latest      |
| **Caddy**          | 2.10        |
| **Pino** (logging) | —           |
| **Woodpecker CI**  | Self-hosted |

---

## 📋 Current Status

### Implemented ✅

- Full NestJS backend (11 domain modules + platform layer)
- Admin SPA (Vite + React, Tailwind, shadcn)
- Database schema & migrations (Prisma)
- Auth system (JWT + session management)
- Search integration (Meilisearch + Postgres fallback)
- Audit trails & feature flags
- Rate limiting & storage abstraction
- Health checks & metrics endpoints
- Docker Compose dev/prod configs

### In Progress 🔨

- Web frontend rebuild (Next.js 16, SSR + RSC)
- Offline bundle design (Phase 1 scope)
- E2E test suite (Playwright)
- Production deployment guide

### Deferred (Phase 2+) 📅

- Valkey (Redis-compatible cache)
- BullMQ (async job queue)
- PgBouncer (connection pooling)
- Prometheus/Grafana/Alertmanager (monitoring)
- OpenTelemetry (distributed tracing)
- Cloudflare R2 (object storage at scale)

### Explicitly Excluded ❌

- **pgvector** (AI embedding storage) — Not part of Phase 1 scope

See `design/01-repo-constitution/DECISIONS.md` for full decision log and `design/01-repo-constitution/PHASE_ACTIVATION_MATRIX.md` for activation triggers.

---

## 🔐 Key Constraints

| Constraint                     | Impact                                                                             |
| ------------------------------ | ---------------------------------------------------------------------------------- |
| **Self-hosted VPS only**       | No cloud platform lock-in (Render, Railway, Fly.io, AWS, GCP)                      |
| **~100–200k VND/month budget** | Lean infrastructure, local storage, efficient indexing                             |
| **Buddhist domain ownership**  | Business logic anchored in `design/03-domains/` (11 domains), not framework choice |
| **Elderly accessibility**      | UI/UX optimized for aging users — large text, clear nav, offline support           |
| **Vietnamese text integrity**  | All Vietnamese UI/API text must preserve diacritical marks (dấu)                   |

---

## 📚 Documentation

### Architecture & Design

- **`design/README.md`** — Start here. 7-layer governance model with reading order
- **`design/01-repo-constitution/ARCHITECTURE_AT_A_GLANCE.md`** — 1-minute visual overview
- **`design/01-repo-constitution/DECISIONS.md`** — Canonical decision log (Phase 1 baseline, deferred tech, constraints)
- **`CLAUDE.md`** — Claude Code operating contract (repo conventions, non-negotiables)
- **`AGENTS.md`** — Subagent role specifications & governance layer routing

### Implementation & Runtime

- **`design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md`** — Which design → which code
- **`design/02-platform-baseline/dependency-version/VERSION_MATRIX.md`** — Exact version pins & official doc links
- **`docs/runbooks.md`** — Operational guides (deploy, backup, restore, monitoring)
- **`docs/DX_ONBOARDING.md`** — Developer experience setup & troubleshooting

### Domain Guidance

- **`design/03-domains/`** — 11 Buddhist practice domains (use cases, contracts, API maps)
- **`docs/api/`** — API contract reference

---

## 🤝 Contributing

Before starting work:

1. Read `CLAUDE.md` for repo conventions
2. Read `AGENTS.md` for skill routing
3. Check `design/` for canonical direction (do not retrofit legacy docs)
4. If modifying architecture/rules, update the source docs first

**Non-negotiables:**

- All user input validated with Zod
- All errors logged with structured Pino context
- Vietnamese text fully marked with diacritical marks
- Business logic kept in services/modules, not page files
- Design is source of truth; implementation follows design, not the reverse

---

## 📞 Contact & Support

- **Repo issues**: Check `docs/troubleshooting.md` and existing GitHub issues
- **Architecture questions**: See `design/README.md` → `00-governance/` reading order
- **Running into problems?**: Check `docs/runbooks.md` or `docs/DX_ONBOARDING.md`

---

## 📄 License

All rights reserved. See [LICENSE](LICENSE).

---

## 🔗 Quick Links

| Link                                                         | Purpose                            |
| ------------------------------------------------------------ | ---------------------------------- |
| `design/`                                                    | Canonical design docs (start here) |
| `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md` | Current implementation status      |
| `CLAUDE.md`                                                  | Dev operating contract             |
| `AGENTS.md`                                                  | Subagent specs & governance        |
| `docs/runbooks.md`                                           | Operational guides                 |
| `docs/DX_ONBOARDING.md`                                      | Dev environment setup              |
