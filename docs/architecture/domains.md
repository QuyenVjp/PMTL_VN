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
- `pushJobs` là control-plane collection cho dispatch orchestration phase sau.

## Moderation / Audit / Control Plane

- System collections:
  - `requestGuards`
  - `moderationReports`
  - `auditLogs`
- `requestGuards` là DB-backed guard store phase 1.
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
- Search sync sang Meilisearch vẫn là integration concern, không phải public contract.
