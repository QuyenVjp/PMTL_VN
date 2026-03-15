# Domains

## Identity / Auth

- `users` là auth authority duy nhất.
- Payload auth vẫn là nguồn session/cookie/JWT gốc.
- Contract auth ra web vẫn map về `displayName` và `status`.

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
- `chantItems` và `chantPlans` là editorial/public.
- `chantPreferences` và `practiceLogs` là self-owned user state.
- Merge logic cho lunar override, plan, preference vẫn nằm ở service layer.

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
- `pushJobs` là control-plane collection cho dispatch orchestration đang được worker xử lý qua Redis + BullMQ.
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
- Search sync sang Meilisearch hiện đi qua queue-first flow; route `/api/posts/search/reindex` cho phép editor/admin enqueue reindex batch.
