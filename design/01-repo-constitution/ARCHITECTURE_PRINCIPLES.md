# PMTL_VN Architecture Principles

> Ghi chú cho sinh viên:
> File này là `orientation doc (tài liệu định hướng)` để tóm tắt stack truth và nhóm mô-đun ở mức cao.
> Canonical decisions nằm ở [DECISIONS.md](design/01-repo-constitution/DECISIONS.md); implementation truth nằm ở `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md`.
> Ownership boundaries đi theo `design/04-execution-overlay/cross-module/MODULE_INTERACTIONS.md` và từng `NN-domain/MODULE_MAP.md`.
> Các file overview như file này không tự chốt policy mới hay tự nhận quyền owner.

## Mục tiêu của tài liệu này

Tài liệu này dùng để trả lời 3 câu hỏi:

- repo hiện đang chạy theo stack nào
- business logic nên nằm ở tầng nào trong monorepo
- module nào là owner, service nào nên ôm logic

## Stack truth hiện tại

### Web

- `apps/web` là frontend public dùng Next.js App Router.
- Web ưu tiên gọi API contracts từ backend thay vì đụng trực tiếp persistence model.

### API + Admin + Auth

- `apps/api` là runtime host cho REST API, OpenAPI docs, auth, domain modules, search/storage orchestration, và worker bootstrap contracts.
- `apps/admin` là custom management UI riêng, không phải generated admin panel.
- Auth authority duy nhất nằm ở backend `NestJS`.
- Google login được phép nếu vẫn map vào cùng authority này.

### Data & Runtime

- PostgreSQL là `source of truth (nguồn dữ liệu gốc đáng tin cậy nhất)`.
- Deferred execution/search components follow `DECISIONS.md` + `design/01-repo-constitution/PHASE_ACTIVATION_MATRIX.md`; không được suy ra queue/search-first là baseline Phase 1.
- object storage là đích chuẩn cho media/file trong target phase production.
- Caddy là reverse proxy và TLS entrypoint.
- observability baseline là structured logs + `/health/*` + `/metrics`; tracing chỉ là phase-later option.

## Repo truth theo miền dữ liệu

### Editorial content

- `posts`
- `hubPages`
- `beginnerGuides`
- `downloads`
- `sutras`
- `sutraVolumes`
- `sutraChapters`
- `sutraGlossary`
- `media`
- `categories`
- `tags`

### Community / UGC

- `postComments`
- `communityPosts`
- `communityComments`
- `guestbookEntries`

### Self-owned practice state

- `sutraBookmarks`
- `sutraReadingProgress`
- `chantPreferences`
- `practiceLogs`
- `practiceSheets`
- `ngoiNhaNhoSheets`

### Practice support / vows / merit

- `vows`
- `vowProgressEntries`
- `lifeReleaseJournal`

### Calendar / delivery / control plane

- `events`
- `eventAgendaItems`
- `eventSpeakers`
- `eventCtas`
- `lunarEvents`
- `lunarEventOverrides`
- `personalPracticeCalendarReadModel`
- `pushSubscriptions`
- `pushJobs`

## Xem quyết định nền tảng ở đâu

Đọc [DECISIONS.md](design/01-repo-constitution/DECISIONS.md) cho các quyết định sau:

- PostgreSQL là source of truth
- NestJS auth là auth authority duy nhất
- async-first cho non-critical paths
- published-only cache/index
- search là computed read model
- moderation là first-class module
- denormalized field policy

File này không lặp lại 10 quyết định đó để tránh trùng lặp.

## Collection & service mapping

### 01-content

Collection owners:

- `Posts`
- `BeginnerGuides`
- `Downloads`
- `ChantItems`
- `ChantPlans`
- `Sutras`
- `SutraVolumes`
- `SutraChapters`
- `SutraGlossary`

Service responsibilities:

- slug/publicId/source field normalization
- publish eligibility
- DTO mapping
- content-to-search projection source fields

### 02-community

Collection owners:

- `PostComments`
- `CommunityPosts`
- `CommunityComments`
- `GuestbookEntries`

Service responsibilities:

- submit validation orchestration
- anti-spam / request guard coordination
- author snapshot rules
- summary counter updates

### 03-engagement

Collection owners:

- `SutraBookmarks`
- `SutraReadingProgress`
- `ChantPreferences`
- `PracticeLogs`
- `PracticeSheets`
- `NgoiNhaNhoSheets`

Service responsibilities:

- self-owned upsert
- `Ngôi Nhà Nhỏ` counting rules
- practice session state transitions
- compose content refs into usable practice read model

### 04-moderation

Collection owners:

- `ModerationReports`

Service responsibilities:

- report submit
- duplicate report prevention
- target summary sync
- decision apply

### 05-search

Collection owners:

- không cần collection canonical riêng nếu search chỉ là indexing và query layer

Service responsibilities:

- index document build
- engine query
- fallback read
- batch reindex orchestration
- optional related-content / recommendation retrieval nếu `pgvector` được chốt

### 06-calendar

Collection owners:

- `Events`
- `EventAgendaItems`
- `EventSpeakers`
- `EventCtas`
- `LunarEvents`
- `LunarEventOverrides`
- `PracticeCalendarRules`
- `PersonalPracticeCalendarReadModel`

Service responsibilities:

- lunar resolution
- important practice day tagging
- daily advisory composition
- reminder candidate generation
- organizational event composition (agenda, CTA, speaker roster)

### 07-notification

Collection owners:

- `PushSubscriptions`
- `PushJobs`
- `ReminderSchedules` nếu feature nhắc việc lặp lại đủ lớn

Service responsibilities:

- subscription upsert
- job create
- recipient resolution
- chunk dispatch
- reminder schedule dedupe

### 08-vows-merit

Collection owners:

- `Vows`
- `VowProgressEntries`
- `LifeReleaseJournal`
- `LifeReleaseChecklistSnapshots`

Service responsibilities:

- vow lifecycle
- milestone calculation
- fulfillment checks
- life release journal create/update
- merge with calendar reminder context

### 09-wisdom-qa

Collection owners:

- `WisdomEntries`
- `QaEntries`
- `AuthorityProfiles`
- `OfflineBundles`

Service responsibilities:

- source ingestion metadata
- source provenance enforcement
- tag normalization
- retrieval ranking
- offline bundle build
- bilingual and translation mapping

### 10-contact

Collection owners:

- `ContactInfo` (singleton)
- `Volunteers`

Service responsibilities:

- volunteer CRUD + sort order
- contact info upsert (singleton pattern)
- Zalo link validation (regex match)

## Quy tắc implementation cần giữ nguyên

- Không phá monorepo boundaries:
  - `apps/web`
  - `apps/api`
  - `apps/admin`
  - `apps/worker` **(deferred — chỉ tạo khi outbox/queue đã bật)**
  - `packages/*`
  - `infra/*`
  - `docs/*`
- `apps/web` tiếp tục feature-first.
- `apps/api` nên chia module rõ theo:
  - `controller`
  - `service`
  - `dto` hoặc `contracts`
  - `entity` hoặc `repository`
  - `module`
- `packages/shared` chỉ chứa code framework-agnostic.

## Những gì không nên giữ lại

- giả định `single posts table`
- auth layer thứ hai làm authority riêng
- nhét bookmark, progress, practice logs vào content module
- lấy `Valkey`/Redis-compatible store hoặc Meilisearch làm source of truth cho UI cần correctness cao

## Current scope vs future candidates (Phạm vi hiện tại và các hướng mở rộng sau này)

### Current scope (Phạm vi hiện tại)

- identity với NestJS auth
- editorial content split collections
- public comments + community posts/comments + guestbook
- moderation reports + moderation summary sync
- user-state cho sutra/practice
- **Phase 1**: search SQL/API fallback; **Phase 2+**: search sync sang Meilisearch (chỉ khi SQL performance không đủ)
- push subscriptions + push jobs **(Phase 2+ — cần worker/outbox đã bật)**
- events + lunar events + overrides
- vows, life release journal, wisdom retrieval

### Future candidates

- gated membership content với audience visibility đầy đủ
- recommendation engine
- digest scheduling phong phú hơn
- reputation / leaderboard
- public profile và follow graph sâu hơn

Future candidate chỉ được thêm vào current scope khi có owner module (module sở hữu), contract (hợp đồng dữ liệu/nghiệp vụ), và runtime path rõ ràng.

## Baseline bổ sung phải giữ

- Boundary runtime phải có schema validation rõ cho request, webhook payload, search document và env config. Khi outbox/queue đã bật (Phase 2+), queue payload cũng phải validate.
- Nếu Phase 2+ bật outbox/queue, follow `DECISIONS.md` section 7 + `design/02-platform-baseline/optional-scale/OUTBOX_DISPATCHER_MODEL.md`; Phase 1 không được suy diễn thành queue-first.
- Recommendation/semantic retrieval chỉ thêm khi use case rõ; không ép `pgvector` thành mặc định của search.
