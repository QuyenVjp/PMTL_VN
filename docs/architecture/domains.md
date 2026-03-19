# Domains

## Identity / Auth

- `users` là auth authority duy nhất.
- Payload auth vẫn là nguồn session/cookie/JWT gốc.
- Contract auth ra web vẫn map về `displayName` và `status`.
- Google login được phép tồn tại như provider flow, nhưng vẫn map vào cùng `users` authority.
- Role set chuẩn hiện tại của design là `super-admin`, `admin` (`Phụng sự viên`), `member`.

## Site Config / Globals

- Globals hiện có:
  - `site-settings`
  - `navigation`
  - `homepage`
  - `sidebar-config`
  - `chanting-settings`
- `navigation` hiện vẫn được giữ cho compatibility với FE/BFF cũ.

## Editorial Content

- Editorial collections:
  - `posts`
  - `categories`
  - `tags`
  - `events`
  - `beginnerGuides`
  - `downloads`
  - `hubPages`
  - `media`
- `posts` là aggregate root chính của nội dung public.
- `posts` đã có `publicId`, `postType`, source group, series group, event context, SEO group, search fields hệ thống.

## Comments / Reader Interaction

- `postComments` thay cho `comments` cũ.
- Route compatibility đã có:
  - comment list theo post
  - submit comment
  - report comment
- Sync `commentCount` vẫn đi qua service/hook, không nhét vào route handler.

## Community / Guestbook

- Community collections:
  - `communityPosts`
  - `communityComments`
  - `guestbookEntries`
- `communityPosts` và `communityComments` là UGC domain có moderation foundation.
- `guestbookEntries` là luồng public nhẹ hơn nhưng vẫn có approval workflow.

## Chanting / Practice

- Chanting collections:
  - `chantItems`
  - `chantPlans`
  - `lunarEvents`
  - `lunarEventOverrides`
  - `chantPreferences`
  - `practiceLogs`
- Practice support self-owned collections/read models:
  - `practiceSheets`
  - `ngoiNhaNhoSheets`
  - `personalPracticeCalendarReadModel`
- `chantItems` và `chantPlans` là editorial/public.
- `chantPreferences` và `practiceLogs` là self-owned user state.
- `practiceSheets` và `ngoiNhaNhoSheets` cũng là self-owned user state.
- Merge logic cho lunar override, plan, preference vẫn nằm ở service layer.
- `personalPracticeCalendarReadModel` được phép mang thêm `daily practice advisory` dạng read-model output.

## Vows / Merit

- Self-owned records:
  - `vows`
  - `vowProgressEntries`
  - `lifeReleaseJournal`
- Đây là lớp hỗ trợ `Phát nguyện` và `Phóng sanh`.
- Không trộn các record này vào community feed canonical.

## Wisdom / QA

- Curated retrieval records:
  - `wisdomEntries`
  - `qaEntries`
  - `offlineBundles`
  - `authorityProfiles`
- Mục tiêu là tra cứu đúng nguồn `Bạch thoại Phật pháp`, `Huyền học vấn đáp`, audio/video hỗ trợ đọc học.
- Search phải index hợp nhất module này với `01-content` thành một bề mặt đọc `Kho Trí Huệ`.
- Module này còn giữ `source provenance` để phân biệt:
  - nguồn gốc chính thức
  - official mirror
  - web phụng sự viên / bản dịch cộng đồng

## Sutra

- Sutra collections:
  - `sutras`
  - `sutraVolumes`
  - `sutraChapters`
  - `sutraGlossary`
  - `sutraBookmarks`
  - `sutraReadingProgress`
- Public reading tree dùng `sutras -> sutraVolumes -> sutraChapters`.
- `sutraBookmarks` và `sutraReadingProgress` là self-owned state.

## Push / Delivery

- Push collections:
  - `pushSubscriptions`
  - `pushJobs`
- `pushSubscriptions` là source of truth cho browser subscription state.
- `pushJobs` là control-plane collection cho dispatch orchestration đang được worker xử lý qua Payload Jobs.
- Self-send prevention hiện đi qua `includeUserIds` / `excludeUserIds` trong push job payload.

## Moderation / Audit / Control Plane

- System collections:
  - `requestGuards`
  - `moderationReports`
  - `auditLogs`
- `requestGuards` là audit/control-plane store; production runtime dùng Redis-backed adapter cho request guard và rate-limit coordination khi `REDIS_URL` được cấu hình.
- `moderationReports` là luồng report source-of-truth, sau đó sync summary ngược lên entity.
- `auditLogs` là append-only trail cho admin/system actions.

## CMS Runtime Boundary

- `apps/cms` là Next-native Payload app riêng cho admin + API.
- `apps/web` vẫn là public frontend riêng.
- Compatibility routes nằm ở `apps/cms/src/app/(payload)/api/*`.
- Route helper/adapters mỏng nằm ở `apps/cms/src/routes/*`.

## Search

- Source of truth vẫn là Postgres/Payload document.
- Schema đã chuẩn bị sẵn `contentPlainText` và `normalizedSearchText`.
- Search posts public hiện đi qua compatibility route `/api/posts/search`.
- Search sync sang Meilisearch hiện đi qua Payload Jobs queue-first flow; route `/api/posts/search/reindex` cho phép admin/super-admin enqueue reindex batch.
