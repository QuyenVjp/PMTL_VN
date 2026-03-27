# VPS Full Stack — Layer Diagram

Visual này map toàn bộ stack PMTL_VN lên mô hình "cylinder tầng" cho VPS self-host.
Đọc từ dưới lên: hạ tầng → runtime → ứng dụng → người dùng.

---

## Full Stack Cylinder — VPS Self-Host

```mermaid
graph TB
  subgraph L13["👤 NGƯỜI DÙNG"]
    U1["Thành viên\n(browser / PWA)"]
    U2["Phụng sự viên\n(admin panel)"]
    U3["Khách\n(public pages)"]
  end

  subgraph L12["🌐 CDN / WAF (Cloudflare Free)"]
    CF["Cloudflare\nDDoS protection · Free SSL · Cache static\nPurge on revalidation"]
  end

  subgraph L11["🔀 REVERSE PROXY (Caddy)"]
    CADDY["Caddy 2\nAuto TLS · HTTP/3 · Routing\npmtl.vn → web:3000\napi.pmtl.vn → api:3002\nadmin.pmtl.vn → admin:3001"]
  end

  subgraph L10["🖥️ FRONTEND (apps/web + apps/admin)"]
    WEB["apps/web — Next.js 16\nSSR + RSC · Tailwind CSS 4\nshadcn/ui · Zustand\nElderly-first UX"]
    ADMIN["apps/admin — Vite + React\nAdmin SPA · Content CRUD\nModeration workspace"]
  end

  subgraph L9["⚙️ BACKEND API (apps/api — NestJS 11)"]
    API_PLATFORM["Platform Modules\naudit · sessions · feature-flags\nrate-limit · storage · health · metrics"]
    API_DOMAIN["Domain Modules (11)\nidentity · content · community · engagement\nmoderation · search · calendar\nnotification · vows-merit · wisdom-qa · contact"]
  end

  subgraph L8["🔍 SEARCH (Meilisearch)"]
    MEILI["Meilisearch v1.12\nSearch-first launch\nSQL fallback khi degraded\nVietnamese full-text"]
  end

  subgraph L7["🗄️ DATABASE (Postgres 16)"]
    PG["Postgres 16\nSource of Truth\nPrisma 7 ORM\ndirectUrl separation"]
  end

  subgraph L6["💾 STORAGE"]
    DISK["Local Disk (Phase 1)\n/data/media\nStorageAdapter abstraction\n→ R2 khi disk > 70%"]
  end

  subgraph L5["🐳 CONTAINERS (Docker Compose)"]
    DC["docker-compose.prod.yml\nNamed volumes · Bridge network\nHealthcheck trên mọi service\nrestart: unless-stopped"]
  end

  subgraph L4["📊 MONITORING & LOGGING"]
    UK["Uptime Kuma\n5-min health check\nTelegram alert"]
    PROM["Prometheus + Grafana\n(Phase 2, RAM > 2GB)"]
    LOKI["Loki + Promtail\nLog aggregation"]
  end

  subgraph L3["💿 BACKUP & RECOVERY"]
    BACKUP["pg_dump cron (2AM daily)\nKeep 7 ngày local\nSync → Backblaze B2 (free 10GB)"]
  end

  subgraph L2["🖥️ VPS (Ubuntu 22.04 LTS)"]
    VPS["BizFly Cloud / Vultr SG / Hetzner\n~80-200k VND/tháng\n1-2 vCPU · 1-2GB RAM · 20-40GB SSD\nUFW firewall · Fail2ban · SSH key only"]
  end

  subgraph L1["🌍 DOMAIN & DNS"]
    DNS["Domain (sẵn)\nCloudflare DNS\nA records → VPS IP\nProxy ON → CDN + free SSL"]
  end

  L13 --> L12
  L12 --> L11
  L11 --> L10
  L10 --> L9
  L9 --> L8
  L9 --> L7
  L9 --> L6
  L10 -.->|"all apps run in"| L5
  L9 -.->|"all apps run in"| L5
  L5 -.->|"runs on"| L2
  L4 -.->|"monitors"| L5
  L3 -.->|"backs up"| L7
  L2 -.->|"DNS points to"| L1
```

---

## Luồng request từ user đến database

```mermaid
sequenceDiagram
  participant U as User Browser
  participant CF as Cloudflare CDN
  participant C as Caddy (VPS :443)
  participant W as apps/web (:3000)
  participant A as apps/api (:3002)
  participant P as Postgres
  participant M as Meilisearch

  U->>CF: HTTPS request pmtl.vn
  CF->>CF: Cache check (static assets)
  CF->>C: Forward (cache miss or dynamic)
  C->>W: Route / → Next.js
  W->>A: API call /api/*
  A->>A: Auth guard + Rate limit + Zod validate
  A->>P: Prisma query (source of truth)
  A->>M: Search query (projection)
  P-->>A: Data
  M-->>A: Search results
  A-->>W: JSON response
  W-->>C: SSR HTML / JSON
  C-->>CF: Response
  CF-->>U: Cached or fresh response
```

---

## Phase gate overlay

```mermaid
graph LR
  subgraph Phase1["Phase 1 — Launch (hiện tại)"]
    P1["✅ Caddy + Docker Compose\n✅ web + api + admin\n✅ Postgres 16\n✅ Meilisearch (Search-first)\n✅ Cloudflare Free CDN\n✅ Uptime Kuma\n✅ pg_dump backup\n✅ Brevo email free"]
  end

  subgraph Phase2["Phase 2 — Scale (khi có trigger)"]
    P2["⏳ Valkey (rate_limit p95 > 100ms)\n⏳ BullMQ + Worker\n⏳ Prometheus + Grafana + Loki\n⏳ PgBouncer (conn > 80%)\n⏳ Cloudflare R2 (disk > 70%)\n⏳ OpenTelemetry"]
  end

  subgraph Excluded["Excluded (không bao giờ trong VPS plan này)"]
    EX["❌ pgvector\n❌ AWS/GCP/Azure\n❌ Render/Railway/Fly.io\n❌ Managed Postgres cloud\n❌ Paid monitoring SaaS"]
  end

  Phase1 -->|"trigger met"| Phase2
```

---

## Chi phí theo từng tầng

| Tầng | Tool | Chi phí |
|---|---|---|
| CDN/WAF | Cloudflare Free | **$0** |
| Reverse Proxy | Caddy (open source) | **$0** |
| SSL Certificate | Let's Encrypt / Cloudflare | **$0** |
| Frontend | Next.js (open source) | **$0** |
| Backend | NestJS (open source) | **$0** |
| Database | Postgres (open source) | **$0** |
| Search | Meilisearch (open source) | **$0** |
| Containers | Docker (open source) | **$0** |
| Monitoring | Uptime Kuma (open source) | **$0** |
| Backup storage | Backblaze B2 / R2 10GB | **$0** |
| Email | Brevo 300/ngày | **$0** |
| CI/CD | GitHub Actions | **$0** |
| **VPS** | BizFly / Vultr / Hetzner | **~100-200k VND/tháng** |
| **Domain** | Sẵn | **$0** |
| **TỔNG** | | **~100-200k VND/tháng** |
