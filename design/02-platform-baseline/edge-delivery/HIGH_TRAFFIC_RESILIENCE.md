# HIGH_TRAFFIC_RESILIENCE_PLAN

File này chốt launch profile `growth-safe` cho PMTL_VN.
Mục tiêu không phải biến Phase 1 thành enterprise stack nặng, mà là:

- launch đơn giản nhưng biết rõ điểm yếu
- chịu được tăng traffic, crawl pressure, và bot/abuse tốt hơn
- có đường nâng cấp rõ ràng khi search, DB, hoặc VPS bắt đầu căng

## Core truth

- PMTL Phase 1 vẫn có thể chạy trên `single VPS`.
- `single VPS` không phải high availability.
- `Meilisearch` có thể được bật ngay từ launch **nếu** search là public/core surface của sản phẩm.
- Dù bật Meilisearch từ đầu:
  - `Postgres` vẫn là source of truth
  - `SQL fallback` vẫn phải tồn tại
  - `outbox/BullMQ/worker` chưa thành requirement mặc định

## Threats phải coi là thật

### 1. Crawl storm

Bao gồm:
- Google/Bing crawl tăng nhanh sau khi index nhiều URL
- AI/GEO bots query lặp trên search/content surfaces
- scraper không tôn trọng `robots.txt`

### 2. Abuse / attack traffic

Bao gồm:
- credential stuffing
- spam form / guestbook / search abuse
- query amplification
- oversized payload
- bot scrape làm cạn DB / bandwidth / CPU

### 3. Single-host operational failure

Bao gồm:
- VPS chết
- disk đầy
- Caddy down
- Postgres down
- app boot fail sau deploy

### 4. Search hot path pressure

Bao gồm:
- search trở thành entrypoint chính của PMTL
- wisdom/content multi-type lookup tăng mạnh
- index backlog hoặc rebuild gây stale/fallback kéo dài

## Launch profiles

### Profile A — Simple launch

Dùng khi:
- content volume còn ít
- search chưa phải core acquisition surface
- team muốn tối giản vận hành

Stack:
- Cloudflare
- Caddy
- `apps/web`
- `apps/api`
- `apps/admin`
- Postgres
- local storage abstraction
- SQL-first search

### Profile B — Search-first launch

Dùng khi:
- SEO/GEO + public discovery là core ngay từ đầu
- `Wisdom-QA`, posts, guides phải tìm nhanh sẵn

Stack:
- tất cả của Profile A
- `Meilisearch` active từ launch
- `SQL fallback` giữ nguyên
- direct sync / manual reindex profile, chưa cần outbox/worker mặc định

Điều kiện bắt buộc trước khi dùng Profile B:
- `design/02-platform-baseline/optional-scale/MEILISEARCH_ARCHITECTURE.md` được scaffold đúng
- `GET /search` fallback sang SQL được nếu Meili lỗi
- admin có:
  - health/status surface cho search
  - reindex trigger
  - task/progress visibility tối thiểu

## Mandatory guardrails for growth-safe launch

### Search

- giới hạn query length
- giới hạn số term hợp lệ
- limit kết quả public
- log engine thực tế:
  - `meilisearch`
  - `sql-fallback`
- nếu search pressure tăng:
  - degrade sang SQL fallback
  - giữ public API shape thống nhất
  - không để engine outage làm sập content reading

### Abuse control

- Cloudflare Bot Fight Mode / WAF baseline
- app-layer rate limit cho:
  - auth
  - search
  - guestbook/community submit
  - upload
- crawler/search bot phải có budget riêng, không đi chung hẳn với browser auth flows

### Request payload and route budgets

- mọi route phải có:
  - request body limit
  - timeout budget
  - retry stance rõ
- search/read routes không được chấp nhận query string vô hạn
- upload routes phải tách budget riêng, không dùng chung defaults của read/search

### Recovery

- restore drill phải verify:
  - DB
  - media
  - wisdom/offline surfaces nếu đã public
- search recovery path phải rõ:
  - fallback sang SQL
  - rebuild index từ Postgres

## Supporting technologies by order

### First additions worth doing

1. `Cloudflare WAF + Bot Fight Mode + rate limit rules`
2. `Uptime Kuma` hoặc equivalent external uptime monitor
3. `Sentry` hoặc equivalent error tracking
4. `Google Search Console`
5. `PageSpeed / CWV monitoring`

### Next additions when traffic starts to hurt

1. `Meilisearch` nếu chưa bật
2. `PgBouncer`
3. `Prometheus + Grafana + Alertmanager` hoặc managed equivalent
4. `Turnstile` cho form công khai nếu spam tăng

### Only when pain is measured

1. `Valkey`
2. `BullMQ`
3. `outbox + dispatcher`
4. `apps/worker`
5. read replica / managed DB upgrades
6. object storage migration

## What PMTL must never pretend

- Không gọi `single VPS + backup` là `HA`.
- Không gọi `Meilisearch` là source of truth.
- Không gọi `Cloudflare + rate-limit` là “không thể bị đánh sập”.
- Không gọi launch-ready nếu restore drill chưa pass.

## Notes for AI/codegen

- Nếu user yêu cầu “search nhanh sẵn từ đầu”, dùng `Search-first launch`.
- Nếu user yêu cầu “ít stack nhất có thể”, dùng `Simple launch`.
- Cả hai profile đều phải giữ:
  - Postgres authority
  - SQL fallback contract
  - recovery path rõ
