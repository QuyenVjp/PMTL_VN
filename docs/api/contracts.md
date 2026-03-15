# API Contracts

## Runtime note

- `apps/cms` hiện host Payload theo hướng Next-native.
- Payload REST gốc vẫn còn qua catch-all `/api/[...slug]`.
- Web/BFF phase đầu nên ưu tiên gọi compatibility routes dưới đây thay vì ăn raw Payload document.
- Admin UI của CMS nằm tại `/admin`.

## Auth contracts

```ts
type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  bio: string;
  role: "super-admin" | "admin" | "editor" | "moderator" | "member";
  status: "active" | "pending" | "suspended";
  avatarId: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

type AuthSession = {
  token: string;
  exp: number | null;
  user: AuthUser;
};
```

Auth endpoints:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`
- `PATCH /api/auth/profile`

Ghi chú:
- `users` nội bộ dùng `fullName` và `isBlocked`, nhưng contract ra web vẫn map về `displayName` và `status`.
- `resetToken`/`resetUrl` chỉ dùng cho local/dev khi `PAYLOAD_AUTH_DISABLE_EMAIL=true`.

## Globals compatibility routes

- `GET /api/site-settings`
- `GET /api/homepage`
- `GET /api/sidebar`
- `GET /api/chanting-settings`

## Public content compatibility routes

### Posts

- `GET /api/posts`
- `GET /api/posts/:slugOrPublicId`
- `GET /api/posts/search?q=<query>&limit=<n>`
- `POST /api/posts/search/reindex`
- `GET /api/search/status`
- `POST /api/posts/:publicId/view`
- `GET /api/posts/:publicId/comments`
- `POST /api/posts/:publicId/comments/submit`
- `POST /api/comments/:publicId/report`

```ts
type PostSummary = {
  id: string | null;
  sourceRef: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string | null;
  topic: string | number | null;
  tags: Array<string | number>;
  images: Array<string | number>;
  viewCount: number;
};

type PostDetail = PostSummary & {
  sourceUrl: string | null;
  content: unknown;
  contentPlainText: string;
  normalizedSearchText: string;
};

type PostSearchResult = {
  totalHits: number;
  engine: "meilisearch" | "payload-fallback";
  hits: Array<{
    id: string;
    type: "post";
    title: string;
    slug: string;
    excerpt: string;
    sourceRef: string;
    publishedAt: string | null;
    topic: string;
    tags: string[];
    viewCount: number;
    thumbnail: {
      url?: string | null;
      alternativeText?: string | null;
    } | null;
  }>;
};

type PostCommentDTO = {
  id: string | null;
  post: string | null;
  parent: string | null;
  content: string;
  authorName: string;
  authorAvatar: string;
  badge: string;
  isOfficialReply: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};
```

### Events

- `GET /api/events`
- `GET /api/events/:publicId`

```ts
type EventDTO = {
  id: string | null;
  title: string;
  slug: string;
  description: string;
  date: string | null;
  location: string;
  type: string;
  eventStatus: string;
};
```

### Guides / Downloads / Hub / Sutra / Chanting

- `GET /api/guides`
- `GET /api/guides/:publicId`
- `GET /api/downloads`
- `GET /api/downloads/:publicId`
- `GET /api/hub-pages`
- `GET /api/hub-pages/:slugOrPublicId`
- `GET /api/sutras`
- `GET /api/sutras/:publicId`
- `GET /api/sutras/:sutraPublicId/chapters/:chapterPublicId`
- `GET /api/chant-items`
- `GET /api/chant-items/:publicId`
- `GET /api/chant-plans`
- `GET /api/chant-plans/:publicId`

```ts
type GuideDTO = {
  id: string | null;
  title: string;
  description: string;
  iconName: string;
};

type DownloadDTO = {
  id: string | null;
  title: string;
  description: string;
  externalURL: string;
  fileType: string;
};

type HubPageDTO = {
  id: string | null;
  title: string;
  slug: string;
  description: string;
};

type SutraDTO = {
  id: string | null;
  title: string;
  slug: string;
  description: string;
  shortExcerpt: string;
};

type ChantItemDTO = {
  id: string | null;
  title: string;
  slug: string;
  kind: string;
};

type ChantPlanDTO = {
  id: string | null;
  title: string;
  slug: string;
  planType: string;
};
```

## Community / UGC routes

- `GET /api/community/posts`
- `GET /api/community/posts/:publicId`
- `POST /api/community/posts/submit`
- `GET /api/community/posts/:publicId/comments`
- `POST /api/community/posts/:publicId/comments`
- `POST /api/community/posts/:publicId/report`
- `GET /api/guestbook`
- `POST /api/guestbook/submit`
- `POST /api/community/comments/:publicId/report`

```ts
type CommunityPostDTO = {
  id: string | null;
  title: string;
  content: string;
  slug: string;
  type: string;
  authorName: string;
  likes: number;
  views: number;
  commentsCount: number;
  createdAt: string | null;
  updatedAt: string | null;
};

type CommunityCommentDTO = {
  id: string | null;
  content: string;
  authorName: string;
  likes: number;
  parent: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type GuestbookEntryDTO = {
  id: string | null;
  authorName: string;
  message: string;
  country: string;
  avatar: string;
  badge: string;
  adminReply: string;
  createdAt: string | null;
  updatedAt: string | null;
};
```

Ghi chú:
- Public/community routes không expose `spamScore`, `submittedByIpHash`, `reportCount`, `lastReportReason`.
- Report endpoint hiện tạo `moderationReports` và sync summary cơ bản lên entity mục tiêu.

## User-state chanting routes

- `GET /api/chanting/preferences`
- `POST /api/chanting/preferences`
- `GET /api/chanting/practice-log`
- `POST /api/chanting/practice-log`

```ts
type ChantPreferenceDTO = {
  id: string | null;
  plan: string | number | null;
  enabledOptionalItems: Array<{ chantItem: string | number | null }>;
  targetsByItem: Array<{ chantItem: string | number | null; target: number }>;
  intentionsByItem: Array<{ chantItem: string | number | null; intention: string }>;
};

type PracticeLogDTO = {
  id: string | null;
  plan: string | number | null;
  practiceDate: string | null;
  itemStates: unknown[];
  sessionConfig: {
    durationMinutes?: number | null;
    notes?: string | null;
  } | null;
  startedAt: string | null;
  completedAt: string | null;
  isCompleted: boolean;
};
```

Ghi chú:
- Hai route này dựa trên Payload auth session hiện tại.
- `POST /api/chanting/practice-log` dùng semantics upsert theo `user + practiceDate + plan`.

## Push routes

- `POST /api/push/subscribe`
- `POST /api/push/unsubscribe`
- `GET /api/push/stats`

## Moderation routes

- `GET /api/moderation/reports`
- `POST /api/moderation/reports/:publicId/decision`

Ghi chú:
- Hai route này yêu cầu role `moderator` trở lên.
- `decision` hiện hỗ trợ `approved | rejected | flagged | hidden`.

## Queue / worker notes

- `POST /api/posts/search/reindex` yêu cầu role `editor` trở lên và enqueue search sync batch cho posts.
- `GET /api/search/status` trả health của Meilisearch, queue counts và số document hiện có trong index posts.
- `GET /api/push/stats` trả tổng subscription active/inactive và số push job đang chờ/lỗi.
- Community submit/report, guestbook submit, post comment submit hiện vừa append audit log vừa enqueue notification cho moderator/admin.
- Self-send prevention hiện được áp dụng ở notification job bằng `excludeUserIds`.

## Error shape

```ts
type ApiError = {
  message: string;
  code?: string;
};

type ApiErrorResponse = {
  error: ApiError;
};
```

## Contract rules

- Web không dựa vào raw Payload document nếu chưa map.
- Compatibility routes phải che field moderation/system nhạy cảm khỏi frontend public.
- `publicId` là identity chính cho public/API/report/audit; `slug` chỉ phục vụ SEO.
- Search và BFF có thể tiếp tục map từ compatibility DTO sang shape UI cũ trong phase đầu.
- Payload REST gốc vẫn hữu ích cho admin/integration, nhưng không phải public contract mặc định cho web.
