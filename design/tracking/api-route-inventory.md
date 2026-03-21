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
| `GET` | `/auth/me` | `identity` | member+ |
| `PATCH` | `/auth/profile` | `identity` | member+ |

## Content

| Method | Route | Owner | Auth |
|---|---|---|---|
| `GET` | `/content/posts` | `content` | public |
| `GET` | `/content/posts/:publicIdOrSlug` | `content` | public |
| `POST` | `/content/posts` | `content` | editor+ |
| `PATCH` | `/content/posts/:publicId` | `content` | editor+ |
| `POST` | `/content/posts/:publicId/publish` | `content` | editor+ |
| `GET` | `/content/guides` | `content` | public |
| `GET` | `/content/downloads` | `content` | public |
| `GET` | `/content/sutras` | `content` | public |
| `GET` | `/content/hub-pages/ngoi-nha-nho` | `content` | public |
| `GET` | `/content/little-house/guide-map` | `content` | public |
| `GET` | `/content/little-house/guides` | `content` | public |
| `GET` | `/content/little-house/guides/:slug` | `content` | public |
| `GET` | `/content/little-house/case-variants` | `content` | public |
| `GET` | `/content/little-house/faq` | `content` | public |
| `GET` | `/content/little-house/downloads` | `content` | public |
| `GET` | `/content/hub-pages/kinh-bai-tap` | `content` | public |
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
| `POST` | `/guestbook` | `community` | public or member+, per policy |

## Engagement

| Method | Route | Owner | Auth |
|---|---|---|---|
| `GET` | `/engagement/bookmarks` | `engagement` | member+ |
| `POST` | `/engagement/bookmarks` | `engagement` | member+ |
| `GET` | `/engagement/reading-progress` | `engagement` | member+ |
| `POST` | `/engagement/reading-progress` | `engagement` | member+ |
| `GET` | `/engagement/practice-logs` | `engagement` | member+ |
| `POST` | `/engagement/practice-logs` | `engagement` | member+ |
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
| `GET` | `/moderation/reports` | `moderation` | moderator+ |
| `POST` | `/moderation/reports/:publicId/decision` | `moderation` | moderator+ |

## Search

| Method | Route | Owner | Auth |
|---|---|---|---|
| `GET` | `/search` | `search` | public |
| `GET` | `/search/status` | `search` | admin+ |
| `POST` | `/search/reindex` | `search` | admin+ |
| `GET` | `/admin/search/status` | `search` | admin+ |
| `POST` | `/admin/search/reindex` | `search` | admin+ |
| `POST` | `/admin/search/reindex/:source` | `search` | admin+ |

## Calendar

| Method | Route | Owner | Auth |
|---|---|---|---|
| `GET` | `/calendar/events` | `calendar` | public |
| `GET` | `/calendar/events/:publicId` | `calendar` | public |
| `GET` | `/calendar/events/:publicId/agenda` | `calendar` | public |
| `GET` | `/calendar/personal-practice` | `calendar` | member+ |
| `GET` | `/calendar/advisory/daily` | `calendar` | member+ |
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

## Notification

| Method | Route | Owner | Auth |
|---|---|---|---|
| `POST` | `/notifications/push/subscribe` | `notification` | member+ |
| `POST` | `/notifications/push/unsubscribe` | `notification` | member+ |
| `GET` | `/notifications/push/stats` | `notification` | admin+ |
| `GET` | `/admin/notifications/push/jobs` | `notification` | admin+ |
| `GET` | `/admin/notifications/push/jobs/:publicId` | `notification` | admin+ |
| `POST` | `/admin/notifications/push/jobs` | `notification` | admin+ |
| `POST` | `/admin/notifications/push/jobs/:publicId/process` | `notification` | admin+ |
| `POST` | `/admin/notifications/push/jobs/:publicId/redrive` | `notification` | admin+ |
| `GET` | `/admin/notifications/push/status` | `notification` | admin+ |

## Vows & Merit

| Method | Route | Owner | Auth |
|---|---|---|---|
| `GET` | `/vows` | `vows-merit` | member+ |
| `POST` | `/vows` | `vows-merit` | member+ |
| `POST` | `/vows/:publicId/milestones` | `vows-merit` | member+ |
| `GET` | `/life-release-journal` | `vows-merit` | member+ |
| `POST` | `/life-release-journal` | `vows-merit` | member+ |
| `GET` | `/life-release-journal/:publicId` | `vows-merit` | member+ |
| `PATCH` | `/life-release-journal/:publicId` | `vows-merit` | member+ |
| `POST` | `/admin/vows/assisted-entry/life-release` | `vows-merit` | admin+ |
| `POST` | `/admin/vows/assisted-entry/progress` | `vows-merit` | admin+ |
| `GET` | `/admin/vows/assisted-entry/history` | `vows-merit` | admin+ |

## Wisdom & QA

| Method | Route | Owner | Auth |
|---|---|---|---|
| `GET` | `/wisdom/entries` | `wisdom-qa` | public |
| `GET` | `/wisdom/entries/:publicId` | `wisdom-qa` | public |
| `GET` | `/wisdom/baihua/books` | `wisdom-qa` | public |
| `GET` | `/wisdom/baihua/books/:bookSlug` | `wisdom-qa` | public |
| `GET` | `/wisdom/baihua/books/:bookSlug/chapters/:chapterNumber` | `wisdom-qa` | public |
| `GET` | `/qa/search` | `wisdom-qa` + `search` | public |
| `GET` | `/offline-bundles/:publicId` | `wisdom-qa` | member+ or public, per policy |
| `POST` | `/admin/wisdom/baihua/books/import-source` | `wisdom-qa` | admin+ |
| `PATCH` | `/admin/wisdom/baihua/chapters/:publicId/translation` | `wisdom-qa` | admin+ |
| `POST` | `/admin/wisdom/baihua/chapters/:publicId/publish` | `wisdom-qa` | admin+ |

## Contact

| Method | Route | Owner | Auth |
|---|---|---|---|
| `GET` | `/contact-info` | `contact` | public |
| `GET` | `/volunteers` | `contact` | public |
| `GET` | `/admin/contact-info` | `contact` | super-admin |
| `PATCH` | `/admin/contact-info` | `contact` | super-admin |
| `GET` | `/admin/volunteers` | `contact` | admin+ |
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
| `GET` | `/feature-flags/:key` | `feature-flags` | internal/admin |

## Notes

- Tồn kho route này là `planning inventory`, không có nghĩa mọi route đã được implement.
- Khi thêm route mới, cập nhật file này cùng `contracts.md` của module owner.
