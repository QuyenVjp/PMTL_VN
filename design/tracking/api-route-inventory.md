# API_ROUTE_INVENTORY (Danh mục route API dự kiến)

File này là `inventory (bảng kiểm)` route cho hướng `apps/api`.
Nó không thay thế `contracts.md` và không thay use-case chi tiết.

Mục tiêu:

- giúp nhìn toàn bộ surface API trong 1 file
- chặn việc quên route khi scaffold `NestJS`
- giúp web/admin biết owner module nào cho từng group route

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
| `PATCH` | `/content/posts/:id` | `content` | editor+ |
| `POST` | `/content/posts/:id/publish` | `content` | editor+ |
| `GET` | `/content/guides` | `content` | public |
| `GET` | `/content/downloads` | `content` | public |
| `GET` | `/content/sutras` | `content` | public |
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
| `GET` | `/engagement/ngoi-nha-nho-sheets` | `engagement` | member+ |
| `POST` | `/engagement/ngoi-nha-nho-sheets` | `engagement` | member+ |

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

## Calendar

| Method | Route | Owner | Auth |
|---|---|---|---|
| `GET` | `/calendar/events` | `calendar` | public |
| `GET` | `/calendar/events/:publicId` | `calendar` | public |
| `GET` | `/calendar/personal-practice` | `calendar` | member+ |
| `GET` | `/calendar/advisory/daily` | `calendar` | member+ |

## Notification

| Method | Route | Owner | Auth |
|---|---|---|---|
| `POST` | `/notifications/push/subscribe` | `notification` | member+ |
| `POST` | `/notifications/push/unsubscribe` | `notification` | member+ |
| `GET` | `/notifications/push/stats` | `notification` | admin+ |

## Vows & Merit

| Method | Route | Owner | Auth |
|---|---|---|---|
| `GET` | `/vows` | `vows-merit` | member+ |
| `POST` | `/vows` | `vows-merit` | member+ |
| `POST` | `/vows/:publicId/milestones` | `vows-merit` | member+ |
| `GET` | `/life-release-journal` | `vows-merit` | member+ |
| `POST` | `/life-release-journal` | `vows-merit` | member+ |

## Wisdom & QA

| Method | Route | Owner | Auth |
|---|---|---|---|
| `GET` | `/wisdom/entries` | `wisdom-qa` | public |
| `GET` | `/wisdom/entries/:publicId` | `wisdom-qa` | public |
| `GET` | `/qa/search` | `wisdom-qa` + `search` | public |
| `GET` | `/offline-bundles/:publicId` | `wisdom-qa` | member+ or public, per policy |

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
