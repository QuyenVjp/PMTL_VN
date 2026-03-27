# C4 System Context — PMTL_VN

> **Authority**: overview/orientation only. Owner docs (DECISIONS.md, ARCHITECTURE_AT_A_GLANCE.md) thắng nếu có xung đột.
> **Last updated**: 2026-03-27

---

## Level 1 — System Context

```mermaid
C4Context
  title PMTL_VN — System Context (Phase 1)

  Person(member, "Thành viên", "Người tu tập: đọc kinh, ghi công phu,\nphóng sanh, phát nguyện, xem lịch âm")
  Person(guest, "Khách", "Xem nội dung công khai, tìm kiếm,\nkhông cần đăng nhập")
  Person(admin, "Phụng sự viên / Admin", "Quản lý nội dung, kiểm duyệt cộng đồng,\nvận hành hệ thống")

  System_Boundary(pmtl_boundary, "PMTL_VN Platform") {
    System(pmtl, "PMTL_VN", "Nền tảng Phật pháp Việt Nam:\nnội dung giáo lý, tu tập cá nhân,\ncộng đồng, lịch âm, tủ sách Bạch Thoại")
  }

  System_Ext(cloudflare, "Cloudflare", "WAF + CDN + DDoS protection")
  System_Ext(email, "Email Provider\n(SMTP/transactional)", "Xác thực email, password reset,\nthông báo hệ thống")
  System_Ext(r2, "Cloudflare R2\n(Phase 2)", "Object storage scale-out khi local disk > 70%")

  Rel(guest, pmtl, "Đọc bài viết, tìm kiếm lời dạy", "HTTPS")
  Rel(member, pmtl, "Đăng nhập, tu tập, nguyện lực,\nphóng sanh, đọc kinh, xem lịch", "HTTPS")
  Rel(admin, pmtl, "Quản lý nội dung + kiểm duyệt", "HTTPS/admin panel")
  Rel(pmtl, cloudflare, "WAF/CDN layer", "")
  Rel(pmtl, email, "Gửi email", "SMTP/API")
  Rel(pmtl, r2, "Phase 2: media upload", "S3-compat API")
```

---

## Level 2 — Container View (Phase 1 baseline)

```mermaid
graph TB
  subgraph Edge
    CF["Cloudflare<br/>WAF + CDN"]
    Caddy["Caddy<br/>Reverse Proxy<br/>TLS termination"]
  end

  subgraph Frontend
    Web["apps/web<br/>Next.js 16<br/>SSR + RSC + Tailwind CSS 4<br/>shadcn/ui, Zustand"]
    Admin["apps/admin<br/>Vite + React<br/>Admin SPA — content CRUD,<br/>moderation, ops workspace"]
  end

  subgraph Backend["Backend (apps/api — NestJS 11)"]
    API_Core["Platform Modules<br/>auth · sessions · audit<br/>feature-flags · rate-limit<br/>storage · health · metrics"]
    API_Domain["Domain Modules (11)<br/>identity · content · community<br/>engagement · moderation · search<br/>calendar · notification<br/>vows-merit · wisdom-qa · contact"]
  end

  subgraph DataLayer["Data Layer"]
    PG[("Postgres 16<br/>Source of Truth")]
    Meili["Meilisearch<br/>Search projection<br/>SQL fallback khi degraded"]
    LocalDisk["Local Disk<br/>Phase 1 media storage<br/>(StorageAdapter abstraction)"]
  end

  CF --> Caddy
  Caddy -->|"/ web"| Web
  Caddy -->|"/api"| API_Core
  Caddy -->|"/admin"| Admin
  Web -->|"REST/JSON"| API_Core
  Admin -->|"REST/JSON"| API_Core
  API_Core <--> API_Domain
  API_Domain -->|"Prisma 7"| PG
  API_Domain -->|"Meilisearch SDK"| Meili
  API_Core -->|"StorageAdapter"| LocalDisk
```

---

## Level 3 — Key Component: apps/api module structure

```mermaid
graph LR
  subgraph api["apps/api/src/"]
    subgraph platform["platform/"]
      sessions["sessions"]
      audit["audit"]
      ff["feature-flags"]
      rl["rate-limit"]
      storage["storage"]
      health["health"]
      metrics["metrics"]
    end
    subgraph modules["modules/ (domain)"]
      identity["identity"]
      content["content"]
      community["community"]
      engagement["engagement"]
      moderation["moderation"]
      search["search"]
      calendar["calendar"]
      notification["notification"]
      vows["vows-merit"]
      wisdom["wisdom-qa"]
      contact["contact"]
    end
  end
  modules --> platform
```

---

## Phase gate quick reference

| Component | Phase 1 status | Trigger to activate |
|---|---|---|
| `apps/web + apps/api + apps/admin` | **launch target** | N/A |
| `Postgres + Caddy` | **launch target** | N/A |
| `Meilisearch` | **launch active** (Search-first) | SQL fallback là contingency |
| `audit_logs + feature_flags + rate_limit` | **required before launch** | — |
| `Valkey` | planned | rate_limit_records p95 > 100ms sustained 15m |
| `BullMQ + apps/worker` | planned | request > 2s OR retry unacceptable |
| `outbox_events` | planned | side effect failure cost > complexity |
| `PgBouncer` | planned | db_connection_count > 80% max |
| `Prometheus/Grafana` | planned | team shared visibility need |
| `OpenTelemetry` | planned | cross-service latency diagnosis |
| `Cloudflare R2` | planned | local disk > 70% OR restore drift > 5% |
| `pgvector` | **explicit exclusion** | See PGVECTOR_DECISION.md |

> Full owner: `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md`
