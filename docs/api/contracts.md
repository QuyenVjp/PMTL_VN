# API Contracts

File này là `high-level contract map (bản đồ hợp đồng API cấp cao)` cho hướng `apps/api`.
Canonical source cho domain behavior vẫn là `design/*`.

## Runtime note

- `apps/api` là HTTP authority cho web/admin/internal automation.
- `apps/web` và `apps/admin` nên ưu tiên dùng typed API client hoặc OpenAPI-generated client.
- Không dùng raw persistence model làm public contract.

## Error envelope

```ts
type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    status: number;
    requestId: string;
    details?: Record<string, unknown>;
  };
};
```

## Auth contracts

Core routes:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/logout-all`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /auth/me`
- `PATCH /auth/profile`

Example types:

```ts
type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  role: "super-admin" | "admin" | "editor" | "moderator" | "member";
  status: "active" | "pending" | "suspended";
  avatarUrl: string | null;
};

type AuthSessionView = {
  user: AuthUser;
  sessionId: string;
  expiresAt: string;
};
```

Notes:

- browser flow dùng secure `HttpOnly` cookies theo policy ở `design/baseline/security.md`
- `admin` trong UI có thể hiện là `Phụng sự viên`

## Content contracts

Core route groups:

- `GET /content/posts`
- `GET /content/posts/:publicIdOrSlug`
- `POST /content/posts`
- `PATCH /content/posts/:id`
- `POST /content/posts/:id/publish`
- `POST /content/media/upload`

Public list/detail DTO phải là mapped view model, không lộ internal moderation/system fields.

## Community contracts

Core route groups:

- `GET /community/posts`
- `GET /community/posts/:publicId`
- `POST /community/posts`
- `GET /community/posts/:publicId/comments`
- `POST /community/posts/:publicId/comments`
- `POST /community/comments/:publicId/report`
- `GET /guestbook`
- `POST /guestbook`

## Engagement contracts

Core route groups:

- `GET /engagement/bookmarks`
- `POST /engagement/bookmarks`
- `GET /engagement/reading-progress`
- `POST /engagement/reading-progress`
- `GET /engagement/practice-logs`
- `POST /engagement/practice-logs`
- `GET /engagement/practice-sheets`
- `POST /engagement/practice-sheets`
- `GET /engagement/ngoi-nha-nho-sheets`
- `POST /engagement/ngoi-nha-nho-sheets`

## Moderation contracts

Core route groups:

- `GET /moderation/reports`
- `POST /moderation/reports`
- `POST /moderation/reports/:publicId/decision`

## Search contracts

Phase 1:

- `GET /search?q=<query>&type=<optional>`
- `GET /search/status`

Phase 2 when enabled:

- `POST /search/reindex`
- `GET /search/index-status`

## Calendar contracts

Core route groups:

- `GET /calendar/events`
- `GET /calendar/events/:publicId`
- `GET /calendar/personal-practice`
- `GET /calendar/advisory/daily`

## Notification contracts

Core route groups:

- `POST /notifications/push/subscribe`
- `POST /notifications/push/unsubscribe`
- `GET /notifications/push/stats`

## Vows & Merit contracts

Core route groups:

- `GET /vows`
- `POST /vows`
- `POST /vows/:publicId/milestones`
- `GET /life-release-journal`
- `POST /life-release-journal`

## Wisdom & QA contracts

Core route groups:

- `GET /wisdom/entries`
- `GET /wisdom/entries/:publicId`
- `GET /qa/search`
- `GET /offline-bundles/:publicId`

## Contract rules

- `publicId` là public identifier ưu tiên
- `slug` phục vụ readability và SEO
- mọi request/query/body/params phải được validate bằng `Zod`
- web/admin không được phụ thuộc vào raw DB shape
- OpenAPI nên là machine-readable contract layer cho Codex và generated clients
