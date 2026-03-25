# PMTL Infrastructure Baseline (Nền tảng hạ tầng)

File này chốt infra baseline + phase triggers cho PMTL_VN.
Chỉ chứa những gì UNIQUE so với các file owner khác.

> **Security chi tiết**: `design/02-platform-baseline/security-runtime/SECURITY_POLICY.md`
> **Failure matrix**: `design/02-platform-baseline/security-runtime/FAILURE_MODES.md`
> **Launch gate**: `README.md`
> **Decisions tổng**: `DECISIONS.md`
> **Startup order**: `design/02-platform-baseline/api-runtime/STARTUP_DEPENDENCY_ORDER.md`

---

## 6 Core Groups (Tóm tắt)

### 1. Business Layer

| Component | Chức năng | Phase |
|---|---|---|
| `apps/web` (Next.js 16) | Public + member frontend | Phase 1 |
| `apps/api` (NestJS) | Backend authority, auth, API | Phase 1 |
| `apps/admin` (Vite + React) | Admin UI (shadcn-admin) | Phase 1 |
| `apps/worker` | Background execution | Deferred |
| Caddy | Reverse proxy, SSL | Phase 1 |

### 2. Data Layer

| Component | Chức năng | Phase |
|---|---|---|
| Postgres | Source of truth, ACID | Phase 1 |
| Local disk + storage abstraction | Media/file current runtime | Phase 1 |
| Cloudflare R2 | Target media storage | Phase 2+ |
| Valkey | Cache + rate-limit + queue | Deferred |
| Meilisearch | Public search engine | Deferred by default / Search-first launch exception |
| PgBouncer | Connection pooling | Deferred |
| pgvector | Semantic retrieval | **Explicitly excluded** — see `design/02-platform-baseline/optional-scale/PGVECTOR_DECISION.md` |

**Local storage warning**: disk đầy, volume mount sai, restore lệch DB/file đều là failure mode thật. Phải coi là điểm yếu đã biết.
Media local disk chỉ được coi là operational nếu:
- backup artifact naming + retention được chốt trong `design/02-platform-baseline/deploy-ops/BACKUP_RESTORE.md`
- restore drill log ghi được missing/orphan/mismatch rate
- có media consistency check sau restore, không chỉ DB health

### 3. Boundary Validation

- Zod at boundaries (request, params, env, webhook, queue payload)
- Env contracts validate lúc boot
- Ref: `design/02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md` cho pipeline chi tiết
- Ref: `DECISIONS.md` section 6 cho boundary rules

### 4. Observability

| Phase | Stack |
|---|---|
| Phase 1 | Pino structured logs + `/health/*` + `/metrics` + runbook + restore drills |
| Phase 2 | + Prometheus + Grafana + Alertmanager (khi có metric use case rõ) |
| Phase 3 | + OpenTelemetry + Tempo (khi cần trace cross-service) |

**Nguyên tắc**: alert không có người xử lý thì chưa bật. Dashboard không có câu hỏi cụ thể thì chưa làm.

### 5. Async Reliability

**Phase 1**: Sync hoặc fire-and-forget có log intent + log outcome + recovery path rõ. Không cần outbox/queue.
Exception: email delivery dùng inline exponential backoff ở Phase 1 theo `design/02-platform-baseline/security-runtime/EMAIL_PROVIDER_DECISION.md`; chưa cần outbox hay BullMQ chỉ riêng cho email.
**Phase 2+**: Outbox + dispatcher + BullMQ + worker khi side effect đủ quan trọng.

```
Phase 2 flow:
Canonical write → append outbox_events (same tx) → dispatcher → execution queue → worker (idempotent)
```

Ref: `design/04-execution-overlay/cross-module/OUTBOX_EVENT_TAXONOMY.md` cho taxonomy đầy đủ.

### 6. External Services

| Service | Chức năng | Phase |
|---|---|---|
| Brevo SMTP | Email delivery (SMTP-first, Brevo provider) | Phase 1 |
| Web Push (VAPID) | Push notifications — W3C standard, no Firebase SDK | Phase 2+ |
| Cloudflare (free) | DNS + CDN + edge SSL | Phase 1 |
| Cloudflare Web Analytics | Privacy-first web analytics, available on all plans | Optional Phase 1 |
| Cloudflare Image Transform | Bitmap image resize/format optimization at edge; not for SVG resize | Phase 2+ |
| Off-site backup | Snapshot ngoài VPS | Phase 1 |
| Uptime monitor (Uptime Kuma or equivalent) | external uptime checks for web/api/admin/SSL | Required before public production launch |
| Error tracking (Sentry or equivalent) | external error capture and alerting | Recommended Phase 1 |

---

## Current Production Fit

Single VPS baseline:

```
Caddy → apps/web + apps/api + apps/admin
         ↓
       Postgres (source of truth)
       Local disk (media via storage abstraction)
       Pino logs + /health/* + /metrics
```

Cloudflare đứng trước Caddy cho CDN/SSL/edge protection.

## Growth-safe launch profiles

- baseline launch profile: xem `design/02-platform-baseline/edge-delivery/HIGH_TRAFFIC_RESILIENCE.md`
- `Simple launch`: SQL-first search, tối thiểu stack
- `Search-first launch`: bật `Meilisearch` ngay từ đầu nhưng vẫn giữ SQL fallback

Rule:
- PMTL không bắt buộc bật `Meilisearch` từ ngày đầu
- nhưng nếu public search là acquisition surface quan trọng cho SEO/GEO thì được phép bật sớm
- dù bật sớm, `Meilisearch` vẫn là projection, không phải canonical source
- nếu bật `Search-first launch`, search fallback logging/metrics ở `design/02-platform-baseline/deploy-ops/OBSERVABILITY_ARCHITECTURE.md` trở thành requirement ngay trong Phase 1

## DNS and network exposure baseline

- authoritative DNS baseline là `Cloudflare DNS`
- public hostnames canonical:
  - `pmtl.vn`
  - `www.pmtl.vn` nếu còn giữ thì phải redirect về canonical host
  - subdomains public như `api.pmtl.vn`, `admin.pmtl.vn` phải đi qua cùng edge policy
- `DNSSEC` phải được bật ở Cloudflare zone trước launch thật; đây là design requirement nhưng vẫn cần live DNS proof
  - Acceptance baseline: Cloudflare zone dashboard hiển thị `DNSSEC: Active`; DS record đã được add ở registrar và propagate; `dig DS pmtl.vn +short` trả về ít nhất 1 record hợp lệ hoặc tool như DNSViz xác nhận chain hợp lệ
  - Rollback baseline: tắt DNSSEC ở Cloudflare zone -> xóa DS record ở registrar -> chờ TTL expire; procedure này phải được ghi ở `design/02-platform-baseline/deploy-ops/DEPLOY_RUNBOOK.md` trước launch
- TXT/DNS owner split:
  - host reachability records (`A`, `AAAA`, `CNAME`, NS) theo file này
  - email-auth TXT (`SPF`, `DKIM`, `DMARC`) theo `design/02-platform-baseline/security-runtime/EMAIL_PROVIDER_DECISION.md`
- external web-check tools có thể lộ:
  - authoritative name servers
  - public edge IP chain
  - redirect hostnames
  - traceroute path
  design không coi đó là bug nếu khớp canonical exposure đã chốt

### Public exposure rule

- intended public ingress:
  - `80/tcp` chỉ để redirect HTTP -> HTTPS
  - `443/tcp` cho HTTPS qua Caddy/Cloudflare
- non-public services không được internet-reachable:
  - Postgres
  - Valkey
  - Meilisearch origin port
  - Prometheus/Grafana/Alertmanager nội bộ
- SSH nếu dùng trên VPS:
  - không được coi là public application surface
  - phải giới hạn bằng host firewall / provider ACL / VPN hoặc admin allowlist
- `open ports`, `server IP`, `traceroute`, `DNS server`, `DNSSEC` đều là `runtime-evidence-required`; design ở đây chỉ chốt intended exposure để sau này scan có baseline đối chiếu

## Reverse Proxy and Load-Balancer Policy

- Phase 1 canon = `single ingress Caddy` trên một VPS; đây là simplicity baseline, chưa phải HA claim
- Khi scale sang nhiều instance cho `apps/web`, `apps/api`, hoặc `apps/admin`, ingress/load balancer phải giữ các rule sau:
  - upstream health routing chỉ dựa trên `/health/ready`, không dựa vào TCP port open đơn thuần
  - upstream retry chỉ áp dụng cho safe idempotent reads; không retry mù các browser mutation hoặc admin write
  - request body limits, upload buffering, và timeout budget phải được chốt ở proxy layer thay vì để default ngầm
  - websocket/SSE forwarding nếu có phải được khai báo riêng; không giả định reverse proxy default đủ đúng
- PMTL không được tự nhận `high availability` chỉ vì có thêm replica; chỉ được gọi là HA khi ingress, data recovery, và failover contract đã được chốt ở owner docs tương ứng
- request body/time budget phải được chốt ngay từ phase đầu:
  - default read/search routes phải có body/query budget rõ
  - upload routes có budget riêng, không dùng chung defaults của read/search

### Proxy/query/body/timeout budgets

| Budget | Value | Applies to |
|---|---|---|
| full request line + query-string budget | `<= 2048 bytes` | public read/search routes |
| strict read/search body limit | `16 KB` | `GET`/search/read routes |
| default JSON body limit | `256 KB` | đa số API mutation |
| editorial/admin rich-text body limit | `1 MB` | admin/editor save draft/update |
| upload streaming budget | `<= 110 MB` | upload/media routes có contract riêng |
| header read timeout | `5 giây` | mọi request |
| body read timeout | `15 giây` | non-upload routes |
| upstream response header timeout | `30 giây` | read/search routes |
| upstream mutation timeout | `60 giây` | auth/admin/community writes |
| upload timeout | `180 giây` | upload/media routes |
| idle keepalive timeout | `90 giây` | upstream pooled connections |

**Rule**:
- `GET`/search/read routes không được dựa vào request body
- query budget bị vượt phải bị reject trước business logic
- timeout ở proxy không được để implicit default

### Proxy retry and backpressure stance

- chỉ retry tự động cho `GET`, `HEAD`, `OPTIONS`
- không retry mù `POST`, `PATCH`, `PUT`, `DELETE`
- upstream health check interval target: `5 giây`
- upstream health timeout target: `2 giây`
- unhealthy threshold target: `3` lần fail liên tiếp
- healthy threshold target: `2` lần pass liên tiếp
- khi upstream pressure tăng rõ:
  - ưu tiên `429` hoặc `503`
  - không giữ connection treo dài để “cố cứu” request

## Session and Horizontal Scale Rule

- Auth/session authority nằm ở `apps/api` + shared server-side session/refresh store
- Khi `apps/api` scale ngang, sticky session không phải requirement mặc định
- Nếu một flow chỉ chạy đúng khi sticky session bật, đó là dấu hiệu design/runtime bug; phải sửa owner module thay vì biến sticky session thành hidden dependency
- Proxy/LB phải forward cùng resolved client IP chain theo `design/02-platform-baseline/security-runtime/SECURITY_POLICY.md`
- Multi-instance scale chỉ hợp lệ khi:
  - session store vẫn shared và authoritative
  - rate-limit/audit IP resolution không drift giữa instance
  - cache/search/queue sidecars nếu đã bật không trở thành source of truth

## Failover Stance

- Phase 1 single VPS chấp nhận restart/restore oriented recovery, không claim automatic failover
- Database baseline hiện là single primary + restore discipline; read replica hoặc automatic failover chỉ là Phase 2+ concern khi owner docs đã chốt
- Ingress failover, DB failover, search failover, và worker failover phải được nêu tường minh ở owner doc trước khi dùng ngôn ngữ như `high availability`, `self-healing`, hoặc `multi-region`

## Supporting tech order

Thứ tự bổ trợ hợp lý cho dự án:

1. Cloudflare protection + rules thật
2. external uptime monitor
3. external error tracking
4. `Meilisearch` nếu chọn `Search-first launch`
5. `PgBouncer`
6. Prometheus/Grafana/Alertmanager hoặc managed equivalent
7. `Valkey`
8. `BullMQ` + `outbox` + `apps/worker`

---

## Request Flows (Unique — chỉ ở đây)

### Homepage Load
```
User → Caddy → apps/web → server-side fetch → apps/api → Postgres → render
```

### Search Query
```
User → apps/web → /api/proxy/search → apps/api
  Phase 1: Postgres SQL/tsvector query
  Phase 2+: Meilisearch (fallback SQL nếu down)
→ Unified SearchDocumentDto → render results
```

### Editor Publish Post
```
Editor → apps/admin → POST /api/content/posts/:publicId/publish → apps/api
  → Prisma $transaction: update status + audit log
  Phase 1: sync revalidate
  Phase 2+: outbox → dispatcher → reindex + notify + revalidate
→ Success response
```

### Slow Request Diagnosis
```
1. Pino logs (requestId, route, duration)
2. /health/* endpoints
3. Disk/RAM/DB status
4. Phase 2+: Prometheus → Grafana dashboards
5. Phase 3+: OpenTelemetry traces
```

---

## Production Minimum Commands

```bash
# Health
curl https://api.pmtl.vn/health/live
curl https://api.pmtl.vn/health/ready
curl https://api.pmtl.vn/health/startup

# Logs (Docker Compose)
docker compose logs -f api --tail 100
docker compose logs -f web --tail 100

# Backup
./scripts/backup-db.sh        # pg_dump → compressed → off-site
./scripts/verify-backup.sh     # Check backup exists + integrity

# Media consistency
./scripts/check-media-consistency.sh <manifest_or_sample_source>

# Restore
./scripts/restore-db.sh <backup_file>    # Restore to isolated env
./scripts/verify-restore.sh              # Boot app + smoke test
```

**Phase 1 note**: off-site destination và retention policy không được để implicit; phải được ghi trong `design/02-platform-baseline/deploy-ops/BACKUP_RESTORE.md`.

---

## Phase Triggers (Khi nào bật component optional)

| Component | Trigger condition | Ref |
|---|---|---|
| Valkey | Cache miss rate > threshold HOẶC rate-limit Postgres table too slow | `DECISIONS.md` section 3 |
| BullMQ + Worker | Side effect làm request chậm > 2s HOẶC retry manual không chấp nhận được | `design/04-execution-overlay/cross-module/OUTBOX_EVENT_TAXONOMY.md` |
| Outbox | Business event failure cost > complexity cost | `design/04-execution-overlay/cross-module/OUTBOX_EVENT_TAXONOMY.md` |
| Meilisearch | Search là core feature + SQL performance không đủ | `design/03-domains/search/REFERENCES/UNIFIED_INDEX_MAPPING.md` |
| PgBouncer | Connection exhaustion measured | `design/02-platform-baseline/security-runtime/FAILURE_MODES.md` |
| Prometheus stack | Có metric + alert use case cụ thể | N/A |
| pgvector | **Explicitly excluded** — not deferred. Trigger conditions required before reconsideration. | `design/02-platform-baseline/optional-scale/PGVECTOR_DECISION.md` |

---

## Dependency Hygiene

- Package mới phải có lý do tồn tại
- Audit dependency định kỳ + CVE review
- Ref: `DECISIONS.md` section 14 cho library choices đã chốt

---

## TL;DR

**Phase 1**: Postgres + NestJS + Caddy + local storage abstraction + Pino logs + security baseline + backup/restore = hệ sống được.

Mọi thứ khác chỉ bật khi có pain thật. `operational simplicity > technical elegance`.
