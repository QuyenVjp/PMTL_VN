# PMTL_VN Architecture Principles

> Ghi chú cho sinh viên:
> File này là "luật chơi chung" của hệ thống.
> Nếu hai file khác nhau mâu thuẫn nhau, hãy ưu tiên file này cùng với `CORE_DECISIONS.md`.

## Mục tiêu của tài liệu này

Tài liệu này mô tả các nguyên tắc kiến trúc đang được áp dụng trong repo hiện tại.
Nó không phải wishlist và cũng không phải bản thiết kế greenfield.
Mọi quyết định ở đây phải bám implementation thật trong `apps/web`, `apps/cms`, `packages/*`, và `infra/*`.

## Stack hiện tại đã chốt

### Web
- `apps/web` là frontend public dùng Next.js App Router.
- Web tiêu thụ compatibility routes từ CMS thay vì dựa trực tiếp vào raw Payload document.

### CMS + Auth
- `apps/cms` là runtime host cho Payload admin UI, REST API, GraphQL, route compatibility, và worker bootstrap.
- Payload auth là auth authority duy nhất.
- Không dùng auth layer thứ hai cho session hoặc đăng nhập ở current scope.

### Data & Runtime
- PostgreSQL là source of truth duy nhất cho dữ liệu ứng dụng.
- Redis chỉ dùng cho cache, queue, rate-limit coordination, và request guard coordination.
- Worker xử lý background jobs cho search sync, push dispatch, email notification, và maintenance jobs.
- Meilisearch là search index, không phải nơi ghi dữ liệu gốc.
- Caddy là reverse proxy / TLS entrypoint.

### Monitoring
- Monitoring là optional theo môi trường.
- Các thành phần có thể bật thêm:
  - PgBouncer
  - Prometheus
  - Grafana
  - Alertmanager
  - Exporters
  - Blackbox

## Repo truth hiện tại

- Content không còn đi theo hướng "single posts table cho mọi loại nội dung".
- Editorial content đang split theo collection phù hợp với implementation:
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
- UGC và discussion nằm ở collection riêng:
  - `postComments`
  - `communityPosts`
  - `communityComments`
  - `guestbookEntries`
- User-state không nằm trong content:
  - `sutraBookmarks`
  - `sutraReadingProgress`
  - `chantPreferences`
  - `practiceLogs`
- Practice support content nằm ở lớp editorial/public:
  - `chantItems`
  - `chantPlans`
  - các PDF/script hỗ trợ niệm đi qua `downloads`, `media`, hoặc `beginnerGuides`
- Moderation report source of truth là `moderationReports`.
- Notification control plane hiện có `pushSubscriptions` và `pushJobs`.

## Nguyên tắc kiến trúc cốt lõi

### 1. PostgreSQL là source of truth duy nhất
- Mọi write-path nghiệp vụ phải đi qua Postgres/Payload.
- Redis và Meilisearch chỉ giữ computed state hoặc delivery state.
- Không đọc Redis hoặc Meilisearch như nguồn dữ liệu chuẩn cho business logic.

### 2. Payload auth là auth authority duy nhất
- Session, cookie, JWT, forgot password, reset password đều đi qua Payload auth.
- Web không tự sở hữu auth database riêng.
- Không thêm auth provider thứ hai nếu không có migration rõ ràng.

### 3. Async-first cho non-critical paths
- Background jobs là mặc định cho:
  - notification
  - search indexing
  - email
  - cleanup / maintenance
- Sync path chỉ giữ phần cần phản hồi ngay cho user hoặc cần transaction boundary rõ ràng.

### 4. Chỉ published content mới được cache hoặc index
- Editorial content đang dùng Payload drafts làm workflow gốc.
- Chỉ document đã publish mới được đẩy sang Meilisearch và các shared cache.
- Draft, pending UGC, hidden content, và user-state không đi vào shared cache/index.

### 5. Search là computed read model
- Meilisearch là read model tối ưu cho full-text search.
- Search source fields vẫn thuộc collection gốc ở Postgres.
- Khi Meilisearch unavailable, hệ thống có thể fallback về query từ Payload cho các flow public quan trọng.

### 6. Visibility phải là dữ liệu tường minh khi feature cần audience scoping
- Không hardcode access visibility vào middleware hoặc UI branches.
- Repo hiện tại chủ yếu đang public hóa editorial content theo publish state.
- Nếu một collection cần `public / members-only / private` trong tương lai, trường đó phải được lưu trên collection sở hữu dữ liệu.

### 7. Moderation là module hạng nhất
- Report flow không phải side note của community.
- `moderationReports` là nguồn dữ liệu gốc cho report/decision.
- Các field như `reportCount`, `lastReportReason`, `isHidden`, `approvalStatus` chỉ là summary hoặc delivery fields trên entity đích.

### 8. Boundary module phải rõ
- `identity` sở hữu user/auth data.
- `content` sở hữu editorial documents, taxonomy, media, và content search fields.
- `content` cũng sở hữu practice support content như `chantItems`, `chantPlans`, script file, ritual guide.
- `community` sở hữu discussion surfaces và guestbook.
- `engagement` sở hữu self-owned user state.
- `calendar` sở hữu event và lunar schedule data.
- `moderation` sở hữu report lifecycle.
- `notification` sở hữu delivery preferences và job control plane.
- `search` sở hữu indexing flow và query contract, không sở hữu canonical business data.

### 9. Denormalized field được phép, nhưng owner phải rõ
- `commentCount`, `reportCount`, `lastReportReason`, `views`, `publishedAt`, `normalizedSearchText` là hợp lệ nếu có owner rõ ràng.
- Summary field chỉ phục vụ read path, không thay thế canonical record của module gốc.

### 10. Thiết kế phải AI-friendly và text-first
- Design artifact phải đủ cụ thể để AI generate code đúng folder, đúng boundary, đúng DTO.
- Không dùng abstraction mơ hồ như `entity_meta`, `universal_table`, `generic_workflow`.
- Mọi file design nên map trực tiếp về collection/service/route đang có trong repo.

## Quy tắc implementation cần giữ nguyên

- Không phá monorepo boundaries:
  - `apps/web`
  - `apps/cms`
  - `packages/*`
  - `infra/*`
  - `docs/*`
- `apps/web` tiếp tục feature-first.
- Payload collections tiếp tục giữ pattern:
  - `index.ts`
  - `fields.ts`
  - `access.ts`
  - `hooks.ts`
  - `service.ts`
- `packages/shared` chỉ chứa code framework-agnostic.

## Những gì không còn đúng và không nên giữ lại

- Không giữ giả định "mọi loại content phải gộp vào một bảng posts".
- Không giữ mô tả về một auth framework thứ hai như session/auth layer chính.
- Không gộp bookmarks, reading progress, practice logs vào content module.
- Không xem wishlist như `recommendations`, `leaderboard`, `permissions matrix` là current scope nếu repo chưa có owner rõ ràng.

## Current scope vs future candidates

### Current scope
- Identity với Payload auth
- Editorial content split collections
- Public comments + community posts/comments + guestbook
- Moderation reports + moderation summary sync
- User-state cho sutra/practice
- Search sync sang Meilisearch + payload fallback
- Push subscriptions + push jobs
- Events + lunar events + overrides

### Future candidates
- Gated membership content với audience visibility đầy đủ
- Recommendation engine
- Digest scheduling phong phú hơn
- Reputation / leaderboard
- Public profile và follow graph sâu hơn

Future candidate chỉ được thêm vào design current scope khi repo có owner, contract, và runtime path rõ ràng.
