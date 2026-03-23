# API_ROUTE_INVENTORY (Danh mục route API dự kiến)

File này là `inventory (bảng kiểm)` route cho hướng `apps/api`.
Nó không thay thế `contracts.md` và không thay use-case chi tiết.

Mục tiêu:

- giúp nhìn toàn bộ surface API trong 1 file
- chặn việc quên route khi scaffold `NestJS`
- giúp web/admin biết owner module nào cho từng group route

## URL prefix convention

> Routes trong file này **không có** prefix `/api/` — chúng là controller-level paths trong NestJS.
> Khi deploy, global prefix `/api` được thêm tự động → `/content/posts` trở thành `/api/content/posts`.
> Các file `contracts.md` của từng module dùng full path `/api/...` vì mô tả từ góc nhìn consumer.

## Route group principles

- public read routes ưu tiên `GET`
- mutation route phải có auth/policy rõ
- admin-only route không trộn vào public namespace nếu không cần
- `publicId` là public identity ưu tiên
- route `Phase 2+` hoặc `conditional` được phép xuất hiện trong inventory để khóa canon, nhưng không được hiểu là Wave 1 scaffold target mặc định

## Auth scope semantics

| Scope | Meaning |
|---|---|
| `public` | Không cần đăng nhập |
| `browser session` | Yêu cầu transport hợp lệ cho browser auth flow, không dùng như public POST đơn giản |
| `member+` | Member hoặc admin có session hợp lệ |
| `admin+` | Admin hoặc super-admin |
| `editor+` | Narrow API role trong admin surface; UI page có thể mở cho `admin+`, nhưng backend guard chỉ cho editor/admin phù hợp |
| `moderator+` | Narrow API role trong admin surface; UI page có thể mở cho `admin+`, nhưng backend guard chỉ cho moderator/admin phù hợp |
| `internal shared-secret` | Không dùng browser session; route nội bộ có shared secret hoặc signature contract |

`PAGE_INVENTORY.md` là page auth canon. File này được phép chi tiết hơn ở mức backend role scope cho cùng một admin page.

## Response envelope convention

Trừ các route `204`, file/binary, hoặc health/metrics đặc biệt, JSON success response nên đi theo một trong các profile sau:

| Profile | Shape | Dùng cho |
|---|---|---|
| `single` | `{ "data": {...} }` | detail read, self-state read, action trả object |
| `list` | `{ "data": [...], "meta": { "pagination"?: ..., "filters"?: ... } }` | listing, admin tables, inventories |
| `created` | `{ "data": {...}, "meta": { "created": true } }` | `201 Created` cho create route |
| `accepted` | `{ "data": {...}, "meta": { "jobAccepted": true } }` | trigger job/manual process/reindex |
| `empty` | no body | `204 No Content` cho delete/unsubscribe/clear action |
| `manifest` | `{ "data": { "manifest": ..., "version": ... }, "meta"?: {...} }` | offline bundle / download manifest |

Error response dùng canonical error envelope từ `baseline/nest-baseline.md` và `tracking/error-code-registry.md`:

```json
{
  "error": {
    "code": "domain.error_code",
    "message": "Thông điệp an toàn cho client",
    "status": 400,
    "requestId": "req_123"
  }
}
```

## Platform-primitive route rule

Nếu một feature nghe giống managed-platform feature như auth, signed upload, storage lifecycle, webhook callback, realtime fanout, queue ops, hay admin observability:

- vẫn phải define route theo business capability của PMTL trước
- `apps/api` là backend authority; không được coi direct DB shortcut, client-side hack, hay vendor term là route canon
- route name ưu tiên mô tả capability (`/notifications/push/subscribe`, `/internal/revalidate`) hơn là table shape hoặc provider vocabulary
- privileged operations phải ở server-side route có auth/signature contract rõ, không đẩy thẳng credential hoặc privileged action xuống client

## Status-code matrix

| Route class | Success | Common errors | Notes |
|---|---|---|---|
| Public/member `GET` detail | `200` | `400`, `401` nếu protected, `403`, `404`, `429`, `500` | profile `single` |
| Public/member `GET` list | `200` | `400`, `401` nếu protected, `403`, `429`, `500` | profile `list` |
| Create canonical record | `201` | `400`, `401`, `403`, `404`, `409`, `429`, `500` | profile `created` |
| Update canonical record | `200` | `400`, `401`, `403`, `404`, `409`, `429`, `500` | profile `single` |
| Action / state transition | `200` hoặc `202` | `400`, `401`, `403`, `404`, `409`, `429`, `500` | `202` nếu chỉ trigger downstream/manual job |
| Delete / unsubscribe | `204` | `400`, `401`, `403`, `404`, `409`, `500` | profile `empty` |
| Health | `200` khi pass | `503` cho readiness/startup fail | route-specific payload owner là `ops/health-contract.md`; response phải `Cache-Control: no-store` |
| Metrics | `200` | `401`, `403`, `500` | không dùng JSON envelope |

## Identity

| Method | Route | Owner | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | `identity` | public |
| `POST` | `/auth/login` | `identity` | public |
| `POST` | `/auth/refresh` | `identity` + `sessions` | browser session |
| `POST` | `/auth/logout` | `identity` + `sessions` | member+ |
| `POST` | `/auth/logout-all` | `identity` + `sessions` | member+ |
| `POST` | `/auth/forgot-password` | `identity` | public |
| `POST` | `/auth/reset-password` | `identity` | public |
| `POST` | `/auth/verify-email` | `identity` | public |
| `POST` | `/auth/resend-verification` | `identity` | public |
| `GET` | `/auth/me` | `identity` | member+ |
| `PATCH` | `/auth/profile` | `identity` | member+ |
| `GET` | `/admin/users` | `identity` | admin+ |
| `GET` | `/admin/users/:publicId` | `identity` | admin+ |
| `PATCH` | `/admin/users/:publicId/profile` | `identity` | admin+ |
| `PATCH` | `/admin/users/:publicId/role` | `identity` | admin+ |
| `POST` | `/admin/users/:publicId/block` | `identity` | admin+ |
| `POST` | `/admin/users/:publicId/unblock` | `identity` | admin+ |
| `GET` | `/admin/users/:publicId/audit-history` | `identity` + `audit` | admin+ |
| `GET` | `/admin/users/:publicId/practice-stats` | `identity` + `engagement` | admin+ |
| `GET` | `/admin/sessions` | `identity` + `sessions` | super-admin |
| `GET` | `/admin/sessions/:sessionId` | `identity` + `sessions` | super-admin |
| `DELETE` | `/admin/sessions/:sessionId` | `identity` + `sessions` | super-admin |
| `POST` | `/admin/sessions/revoke-bulk` | `identity` + `sessions` | super-admin |
| `POST` | `/admin/users/:publicId/sessions/revoke-all` | `identity` + `sessions` | super-admin |

> `GET /auth/me` là auth session bootstrap route; response owner theo `tracking/api-dto-shape-plan.md` row `AuthSessionStateDto`.
> `/auth/refresh` và `/auth/me` phải dùng cùng vocabulary cho session freshness / security flags; không để web tự suy luận auth state từ cookie presence.

## Content

| Method | Route | Owner | Auth |
|---|---|---|---|
| `GET` | `/content/posts` | `content` | public |
| `GET` | `/content/posts/:publicIdOrSlug` | `content` | public |
| `POST` | `/content/posts` | `content` | editor+ |
| `PATCH` | `/content/posts/:publicId` | `content` | editor+ |
| `POST` | `/content/posts/:publicId/publish` | `content` | editor+ |
| `GET` | `/content/beginner-guides` | `content` | public |
| `GET` | `/content/beginner-guides/:slug` | `content` | public |
| `GET` | `/content/guides` | `content` | public |
| `GET` | `/content/downloads` | `content` | public |
| `GET` | `/content/sutras` | `content` | public |
| `GET` | `/content/hub-pages/ngoi-nha-nho` | `content` | public |
| `GET` | `/content/little-house/groups/:groupKey` | `content` | public |
| `GET` | `/content/little-house/guide-map` | `content` | public |
| `GET` | `/content/little-house/guides` | `content` | public |
| `GET` | `/content/little-house/guides/:slug` | `content` | public |
| `GET` | `/content/little-house/case-variants` | `content` | public |
| `GET` | `/content/little-house/faq` | `content` | public |
| `GET` | `/content/little-house/downloads` | `content` | public |
| `GET` | `/content/hub-pages/kinh-bai-tap` | `content` | public |
| `GET` | `/content/daily-practice/groups/:groupKey` | `content` | public |
| `GET` | `/content/daily-practice/guide-map` | `content` | public |
| `GET` | `/content/daily-practice/guides` | `content` | public |
| `GET` | `/content/daily-practice/guides/:slug` | `content` | public |
| `GET` | `/content/daily-practice/scenario-presets` | `content` | public |
| `GET` | `/content/daily-practice/faq` | `content` | public |
| `GET` | `/content/daily-practice/downloads` | `content` | public |
| `GET` | `/content/hub-pages/phong-sanh` | `content` | public |
| `GET` | `/content/life-release/guide-map` | `content` | public |
| `GET` | `/content/life-release/guides` | `content` | public |
| `GET` | `/content/life-release/guides/:slug` | `content` | public |
| `GET` | `/content/life-release/ritual-variants` | `content` | public |
| `GET` | `/content/life-release/faq` | `content` | public |
| `GET` | `/content/life-release/downloads` | `content` | public |
| `GET` | `/content/hub-pages/thu-vien-phap-mon` | `content` | public |
| `GET` | `/content/media-library/collections` | `content` | public |
| `GET` | `/content/media-library/collections/:slug` | `content` | public |
| `GET` | `/content/media-library/featured` | `content` | public |
| `GET` | `/content/media-library/tags` | `content` | public |
| `GET` | `/admin/content/little-house/overview` | `content` | editor+ |
| `POST` | `/admin/content/little-house/guides` | `content` | editor+ |
| `PATCH` | `/admin/content/little-house/guides/:publicId` | `content` | editor+ |
| `POST` | `/admin/content/little-house/case-variants` | `content` | editor+ |
| `PATCH` | `/admin/content/little-house/case-variants/:publicId` | `content` | editor+ |
| `POST` | `/admin/content/little-house/faq` | `content` | editor+ |
| `PATCH` | `/admin/content/little-house/faq/:publicId` | `content` | editor+ |
| `POST` | `/admin/content/little-house/publish` | `content` | editor+ |
| `GET` | `/admin/content/daily-practice/overview` | `content` | editor+ |
| `POST` | `/admin/content/daily-practice/guides` | `content` | editor+ |
| `PATCH` | `/admin/content/daily-practice/guides/:publicId` | `content` | editor+ |
| `POST` | `/admin/content/daily-practice/scenario-presets` | `content` | editor+ |
| `PATCH` | `/admin/content/daily-practice/scenario-presets/:publicId` | `content` | editor+ |
| `POST` | `/admin/content/daily-practice/faq` | `content` | editor+ |
| `PATCH` | `/admin/content/daily-practice/faq/:publicId` | `content` | editor+ |
| `POST` | `/admin/content/daily-practice/publish` | `content` | editor+ |
| `GET` | `/admin/content/life-release/overview` | `content` | editor+ |
| `POST` | `/admin/content/life-release/guides` | `content` | editor+ |
| `PATCH` | `/admin/content/life-release/guides/:publicId` | `content` | editor+ |
| `POST` | `/admin/content/life-release/ritual-variants` | `content` | editor+ |
| `PATCH` | `/admin/content/life-release/ritual-variants/:publicId` | `content` | editor+ |
| `POST` | `/admin/content/life-release/faq` | `content` | editor+ |
| `PATCH` | `/admin/content/life-release/faq/:publicId` | `content` | editor+ |
| `POST` | `/admin/content/life-release/publish` | `content` | editor+ |
| `GET` | `/admin/content/media-library/overview` | `content` | editor+ |
| `POST` | `/admin/content/media-library/collections` | `content` | editor+ |
| `PATCH` | `/admin/content/media-library/collections/:publicId` | `content` | editor+ |
| `POST` | `/admin/content/media-library/collections/:publicId/items` | `content` | editor+ |
| `PATCH` | `/admin/content/media-library/collections/:publicId/items/:itemPublicId` | `content` | editor+ |
| `POST` | `/admin/content/media-library/featured` | `content` | editor+ |
| `POST` | `/admin/content/media-library/publish` | `content` | editor+ |
| `POST` | `/content/media/upload` | `content` + `storage` | member+ or editor+, per policy |
| `DELETE` | `/content/media/:publicId` | `content` + `storage` | owner/admin |

> `POST /content/media/upload` là signed upload/register primitive; response owner theo `tracking/api-dto-shape-plan.md` row `SignedUploadResponseDto`.
> route upload không được expose provider-specific shape trực tiếp; client chỉ nhận contract đủ để upload và finalize theo policy PMTL.

## Community

| Method | Route | Owner | Auth |
|---|---|---|---|
| `GET` | `/community/posts` | `community` | public |
| `GET` | `/community/posts/:publicId` | `community` | public |
| `POST` | `/community/posts` | `community` | member+ |
| `GET` | `/community/posts/:publicId/comments` | `community` | public |
| `POST` | `/community/posts/:publicId/comments` | `community` | member+ |
| `POST` | `/community/comments/:publicId/report` | `moderation` | member+ |
| `GET` | `/guestbook` | `community` | public |
| `POST` | `/guestbook` | `community` | public |

## Engagement

| Method | Route | Owner | Auth |
|---|---|---|---|
| `GET` | `/engagement/bookmarks` | `engagement` | member+ |
| `POST` | `/engagement/bookmarks` | `engagement` | member+ |
| `GET` | `/engagement/reading-progress` | `engagement` | member+ |
| `POST` | `/engagement/reading-progress` | `engagement` | member+ |
| `GET` | `/engagement/practice-logs` | `engagement` | member+ |
| `POST` | `/engagement/practice-logs` | `engagement` | member+ |
| `GET` | `/engagement/practice-logs/self` | `engagement` | member+ |
| `PUT` | `/engagement/practice-logs/self` | `engagement` | member+ |

> `PUT /engagement/practice-logs/self` là canonical self-save path cho member practice flow.
> `POST /engagement/practice-logs` chỉ giữ lại nếu module owner chốt rõ append/manual-entry semantics riêng; không dùng hai route cho cùng một UX mutation mà không phân biệt nghiệp vụ.
| `GET` | `/engagement/practice-sheets` | `engagement` | member+ |
| `POST` | `/engagement/practice-sheets` | `engagement` | member+ |
| `GET` | `/engagement/practice-sheets/:publicId` | `engagement` | member+ |
| `PATCH` | `/engagement/practice-sheets/:publicId` | `engagement` | member+ |
| `POST` | `/engagement/practice-sheets/:publicId/complete` | `engagement` | member+ |
| `GET` | `/engagement/ngoi-nha-nho-sheets` | `engagement` | member+ |
| `POST` | `/engagement/ngoi-nha-nho-sheets` | `engagement` | member+ |
| `GET` | `/engagement/ngoi-nha-nho-sheets/:publicId` | `engagement` | member+ |
| `PATCH` | `/engagement/ngoi-nha-nho-sheets/:publicId` | `engagement` | member+ |
| `POST` | `/engagement/ngoi-nha-nho-sheets/:publicId/entries` | `engagement` | member+ |
| `POST` | `/engagement/ngoi-nha-nho-sheets/:publicId/complete` | `engagement` | member+ |
| `POST` | `/engagement/ngoi-nha-nho-sheets/:publicId/mark-self-stored` | `engagement` | member+ |
| `POST` | `/engagement/ngoi-nha-nho-sheets/:publicId/mark-offered` | `engagement` | member+ |

## Moderation

| Method | Route | Owner | Auth |
|---|---|---|---|
| `POST` | `/moderation/reports` | `moderation` | member+ |
| `GET` | `/moderation/reports` | `moderation` | admin+ |
| `POST` | `/moderation/reports/:publicId/decision` | `moderation` | admin+ |
| `GET` | `/admin/moderation/comments` | `moderation` | moderator+ |
| `GET` | `/admin/moderation/comments/:publicId` | `moderation` | moderator+ |
| `POST` | `/admin/moderation/comments/:publicId/hide` | `moderation` | moderator+ |
| `POST` | `/admin/moderation/comments/:publicId/restore` | `moderation` | moderator+ |

## Search

| Method | Route | Owner | Auth |
|---|---|---|---|
| `GET` | `/search` | `search` | public |
| `GET` | `/search/status` | `search` | admin+ |
| `POST` | `/search/reindex` | `search` | admin+ |
| `GET` | `/admin/search/status` | `search` | admin+ |
| `GET` | `/admin/search/operational-status` | `search` | admin+ |
| `GET` | `/admin/search/performance` | `search` | admin+ |
| `GET` | `/admin/search/indexing-jobs` | `search` | admin+ |
| `GET` | `/admin/search/indexing-jobs/:publicId` | `search` | admin+ |
| `GET` | `/admin/search/fallback-events` | `search` | admin+ |
| `POST` | `/admin/search/reindex` | `search` | admin+ |
| `POST` | `/admin/search/reindex/:source` | `search` | admin+ |
| `GET` | `/admin/search/index-settings` | `search` | admin+ |
| `PUT` | `/admin/search/index-settings` | `search` | super-admin |
| `DELETE` | `/admin/search/documents/:docId` | `search` | admin+ |

## Calendar

| Method | Route | Owner | Auth |
|---|---|---|---|
| `GET` | `/calendar/events` | `calendar` | public |
| `GET` | `/calendar/events/:publicId` | `calendar` | public |
| `GET` | `/calendar/events/:publicId/agenda` | `calendar` | public |
| `GET` | `/calendar/personal-practice` | `calendar` | member+ |
| `GET` | `/calendar/advisory/daily` | `calendar` | member+ |
| `GET` | `/admin/calendar/lunar-overrides` | `calendar` | admin+ |
| `GET` | `/admin/calendar/lunar-overrides/:publicId` | `calendar` | admin+ |
| `POST` | `/admin/calendar/lunar-overrides` | `calendar` | admin+ |
| `PATCH` | `/admin/calendar/lunar-overrides/:publicId` | `calendar` | admin+ |
| `DELETE` | `/admin/calendar/lunar-overrides/:publicId` | `calendar` | admin+ |
| `GET` | `/admin/calendar/status` | `calendar` | admin+ |
| `POST` | `/admin/calendar/advisory/preview` | `calendar` | admin+ |
| `GET` | `/admin/calendar/personal-practice/inspect` | `calendar` | admin+ |
| `POST` | `/admin/calendar/personal-practice/refresh` | `calendar` | admin+ |
| `POST` | `/admin/calendar/events` | `calendar` | admin+ |
| `PATCH` | `/admin/calendar/events/:publicId` | `calendar` | admin+ |
| `POST` | `/admin/calendar/events/:publicId/agenda-items` | `calendar` | admin+ |
| `PATCH` | `/admin/calendar/events/:publicId/agenda-items/:agendaItemPublicId` | `calendar` | admin+ |
| `POST` | `/admin/calendar/events/:publicId/agenda-items/reorder` | `calendar` | admin+ |
| `POST` | `/admin/calendar/events/:publicId/speakers` | `calendar` | admin+ |
| `PATCH` | `/admin/calendar/events/:publicId/speakers/:speakerPublicId` | `calendar` | admin+ |
| `POST` | `/admin/calendar/events/:publicId/ctas` | `calendar` | admin+ |
| `PATCH` | `/admin/calendar/events/:publicId/ctas/:ctaPublicId` | `calendar` | admin+ |
| `POST` | `/admin/calendar/events/:publicId/reschedule` | `calendar` | admin+ |
| `POST` | `/admin/calendar/events/:publicId/cancel` | `calendar` | admin+ |
| `POST` | `/admin/calendar/events/:publicId/publish` | `calendar` | admin+ |

> Admin calendar surface không dừng ở event CRUD. Canon E2E cho lunar/advisory gồm 4 lane:
> `lunar-overrides lifecycle`, `status`, `advisory preview`, `personal-practice inspect`, và `refresh`.

## Notification

| Method | Route | Owner | Auth |
|---|---|---|---|
| `GET` | `/notifications/preferences` | `notification` | member+ |
| `PATCH` | `/notifications/preferences` | `notification` | member+ |
| `GET` | `/notifications/reminders/practice` | `notification` | member+ |
| `PATCH` | `/notifications/reminders/practice` | `notification` | member+ |
| `GET` | `/notifications/reminders/events` | `notification` | member+ |
| `PATCH` | `/notifications/reminders/events` | `notification` | member+ |
| `POST` | `/notifications/push/subscribe` | `notification` | member+ |
| `POST` | `/notifications/push/unsubscribe` | `notification` | member+ |
| `GET` | `/notifications/push/stats` | `notification` | admin+ |
| `GET` | `/admin/notifications/push/jobs` | `notification` | admin+ |
| `GET` | `/admin/notifications/push/jobs/:publicId` | `notification` | admin+ |
| `POST` | `/admin/notifications/push/jobs` | `notification` | admin+ |
| `POST` | `/admin/notifications/push/jobs/:publicId/process` | `notification` | admin+ |
| `POST` | `/admin/notifications/push/jobs/:publicId/redrive` | `notification` | admin+ |
| `GET` | `/admin/notifications/push/status` | `notification` | admin+ |
| `GET` | `/admin/notifications/push/subscription-stats` | `notification` | admin+ |

## Vows & Merit

| Method | Route | Owner | Auth |
|---|---|---|---|
| `GET` | `/vows` | `vows-merit` | member+ |
| `POST` | `/vows` | `vows-merit` | member+ |
| `GET` | `/vows/:publicId` | `vows-merit` | member+ |
| `POST` | `/vows/:publicId/milestones` | `vows-merit` | member+ |
| `GET` | `/life-release-journal` | `vows-merit` | member+ |
| `POST` | `/life-release-journal` | `vows-merit` | member+ |
| `GET` | `/life-release-journal/:publicId` | `vows-merit` | member+ |
| `PATCH` | `/life-release-journal/:publicId` | `vows-merit` | member+ |
| `POST` | `/life-release-journal/:publicId/correct` | `vows-merit` | member+ |
| `POST` | `/life-release-journal/:publicId/void` | `vows-merit` | member+ |
| `POST` | `/admin/vows/assisted-entry/life-release` | `vows-merit` | admin+ |
| `POST` | `/admin/vows/assisted-entry/progress` | `vows-merit` | admin+ |
| `GET` | `/admin/vows/assisted-entry/history` | `vows-merit` | admin+ |
| `GET` | `/admin/vows/assisted-entry/members/search` | `vows-merit` + `identity` | admin+ |
| `GET` | `/admin/vows/assisted-entry/members/:memberPublicId/vows` | `vows-merit` | admin+ |

## Wisdom & QA

| Method | Route | Owner | Auth |
|---|---|---|---|
| `GET` | `/wisdom/entries` | `wisdom-qa` | public |
| `GET` | `/wisdom/entries/:publicId` | `wisdom-qa` | public |
| `GET` | `/wisdom/baihua/books` | `wisdom-qa` | public |
| `GET` | `/wisdom/baihua/books/:bookSlug` | `wisdom-qa` | public |
| `GET` | `/wisdom/baihua/books/:bookSlug/chapters/:chapterNumber` | `wisdom-qa` | public |
| `GET` | `/qa/search` | `wisdom-qa` + `search` | public |
| `GET` | `/offline-bundles` | `wisdom-qa` | member+ |
| `GET` | `/offline-bundles/:publicId` | `wisdom-qa` | member+ |
| `GET` | `/offline-bundles/:publicId/status` | `wisdom-qa` | member+ |
| `GET` | `/offline-bundles/:publicId/delta` | `wisdom-qa` | member+ |
| `POST` | `/offline-bundles/:publicId/check-updates` | `wisdom-qa` | member+ |
| `GET` | `/admin/wisdom/entries` | `wisdom-qa` | admin+ |
| `GET` | `/admin/wisdom/entries/:publicId` | `wisdom-qa` | admin+ |
| `GET` | `/admin/wisdom/authority-profiles` | `wisdom-qa` | admin+ |
| `GET` | `/admin/wisdom/authority-profiles/:publicId` | `wisdom-qa` | admin+ |
| `POST` | `/admin/wisdom/entries` | `wisdom-qa` | admin+ |
| `PATCH` | `/admin/wisdom/entries/:publicId` | `wisdom-qa` | admin+ |
| `POST` | `/admin/wisdom/entries/duplicate-check` | `wisdom-qa` | admin+ |
| `POST` | `/admin/wisdom/entries/slug-preview` | `wisdom-qa` | admin+ |
| `POST` | `/admin/wisdom/authority-profiles` | `wisdom-qa` | admin+ |
| `PATCH` | `/admin/wisdom/authority-profiles/:publicId` | `wisdom-qa` | admin+ |
| `POST` | `/admin/wisdom/entries/:publicId/publish` | `wisdom-qa` | admin+ |
| `POST` | `/admin/wisdom/entries/ingestion-jobs` | `wisdom-qa` | admin+ |
| `GET` | `/admin/wisdom/offline-bundles` | `wisdom-qa` | admin+ |
| `POST` | `/admin/wisdom/offline-bundles/rebuild` | `wisdom-qa` | admin+ |
| `GET` | `/admin/wisdom/import-jobs` | `wisdom-qa` | admin+ |
| `GET` | `/admin/wisdom/import-jobs/:publicId` | `wisdom-qa` | admin+ |
| `POST` | `/admin/wisdom/import-jobs/:publicId/retry` | `wisdom-qa` | admin+ |
| `GET` | `/admin/wisdom/baihua/books` | `wisdom-qa` | admin+ |
| `GET` | `/admin/wisdom/baihua/chapters/:publicId` | `wisdom-qa` | admin+ |
| `POST` | `/admin/wisdom/baihua/books/import-source` | `wisdom-qa` | admin+ |
| `PATCH` | `/admin/wisdom/baihua/chapters/:publicId/translation` | `wisdom-qa` | admin+ |
| `POST` | `/admin/wisdom/baihua/chapters/:publicId/publish` | `wisdom-qa` | admin+ |

> `authority-profiles` hiện là admin-first surface.
> Chưa mở public route canon trong `PAGE_INVENTORY` thì không tự thêm `/wisdom/authority-profiles*` public read routes.
> `GET /offline-bundles` là page aggregate route, không chỉ là generic list; response owner phải giữ `syncSummary` và `pendingDeltaBadge` theo `tracking/api-dto-shape-plan.md`.
> `GET /calendar/personal-practice` là month aggregate route; query `month` là required và response không được drift thành flat event list.

## Contact

| Method | Route | Owner | Auth |
|---|---|---|---|
| `GET` | `/contact-info` | `contact` | public |
| `GET` | `/volunteers` | `contact` | public |
| `GET` | `/admin/contact-info` | `contact` | super-admin |
| `PATCH` | `/admin/contact-info` | `contact` | super-admin |
| `GET` | `/admin/volunteers` | `contact` | admin+ |
| `GET` | `/admin/volunteers/:publicId` | `contact` | admin+ |
| `POST` | `/admin/volunteers` | `contact` | admin+ |
| `PATCH` | `/admin/volunteers/:publicId` | `contact` | admin+ |
| `DELETE` | `/admin/volunteers/:publicId` | `contact` | admin+ |
| `PATCH` | `/admin/volunteers/sort` | `contact` | admin+ |

## Platform / Control Plane

| Method | Route | Owner | Auth |
|---|---|---|---|
| `GET` | `/health/live` | `health` | internal/public per deploy policy |
| `GET` | `/health/ready` | `health` | internal/public per deploy policy |
| `GET` | `/health/startup` | `health` | internal/public per deploy policy |
| `GET` | `/metrics` | `metrics` | internal only |
| `GET` | `/admin/feature-flags` | `feature-flags` | super-admin |
| `GET` | `/admin/feature-flags/:key` | `feature-flags` | super-admin |
| `GET` | `/feature-flags/:key` | `feature-flags` | internal/admin |
| `PATCH` | `/admin/feature-flags/:key` | `feature-flags` | super-admin |
| `GET` | `/admin/audit-logs` | `audit` | admin+ |
| `GET` | `/admin/audit-logs/:publicIdOrId` | `audit` | admin+ |
| `GET` | `/admin/system/health-extended` | `health` + `platform` | admin+ |
| `POST` | `/internal/revalidate` | `platform/cache` | internal shared-secret |

> `GET /admin/system/health-extended` là admin operational aggregate; response owner theo `tracking/api-dto-shape-plan.md` row `AdminSystemHealthExtendedDto`.

## Platform / Control Plane — Phase 2+ conditional routes

Các route dưới đây chỉ canon hóa contract cho phase sau.
Không được scaffold sớm nếu `apps-api-scaffold-order.md` chưa cho phép.

| Method | Route | Owner | Auth |
|---|---|---|---|
| `GET` | `/admin/outbox/dead-events` | `platform/outbox` | admin+ |
| `POST` | `/admin/outbox/dead-events/:eventId/redrive` | `platform/outbox` | admin+ |
| `DELETE` | `/admin/outbox/dead-events/:eventId` | `platform/outbox` | super-admin |
| `GET` | `/admin/queue/dead-letter` | `platform/queue` | admin+ |
| `POST` | `/admin/queue/dead-letter/:jobId/redrive` | `platform/queue` | admin+ |
| `POST` | `/admin/queue/dead-letter/:jobId/discard` | `platform/queue` | super-admin |

## Notes

- Route inventory này là consumer-facing surface, không phải nơi lặp lại toàn bộ validation schema.
- Admin/reference-data routes có thể scaffold nhanh hơn từ contract registry hoặc resource template.
- Khi page route và API route khác ngôn ngữ (`/admin/noi-dung/*` vs `/admin/content/*`), page route vẫn theo `PAGE_INVENTORY.md`, còn controller grouping ở đây là API canon cho scaffold `apps/api`.
- Các route sau bắt buộc hand-authored service logic, không được coi là generated CRUD:
  - `/auth/*`
  - `/moderation/reports/*`
  - `/search/reindex*`
  - `/internal/revalidate`
  - publish/unpublish flows
  - storage/media lifecycle routes

- Tồn kho route này là `planning inventory`, không có nghĩa mọi route đã được implement.
- Khi thêm route mới, cập nhật file này cùng `contracts.md` của module owner.
- webhook/internal callback routes như `/internal/revalidate` phải có schema + shared-secret/signature contract rõ ở doc owner tương ứng; không được thêm ngầm trong code
- `/auth/refresh` là route bắt buộc có rate-limit, transaction-safe rotation, và replay handling theo `01-identity/use-cases/manage-auth-session.md`; không được scaffold như route auth public đơn giản
- `/auth/refresh` exact limit tham chiếu `tracking/coding-readiness.md` Phần 5 + `baseline/security.md`
- `/internal/revalidate` phải đi với `Cache-Control`/revalidation contract rõ và replay/shared-secret handling; không coi là route nội bộ “tự hiểu”
- `/admin/system/health-extended` response contract owner là `ops/health-contract.md`, không tự bịa shape ở controller khi scaffold
- signed upload URL generation, upload finalization, webhook callback intake, queue redrive, và admin status routes là `platform primitives`; luôn hand-authored, không generated CRUD
- route search/admin queue/outbox thuộc `Phase 2+` chỉ được bật khi trigger trong các doc owner tương ứng đã được đáp ứng
- `/offline-bundles/:publicId/delta` là canonical delta sync route; không drift sang `/offline/bundles/*` nếu chưa có migration decision rõ
