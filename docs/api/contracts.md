# API Contracts

## Runtime note

- `apps/cms` hiện host Payload theo hướng Next-native.
- Payload REST gốc vẫn còn qua catch-all `/api/[...slug]`.
- Web/BFF phase đầu nên ưu tiên gọi compatibility routes dưới đây thay vì ăn raw Payload document.
- Admin UI của CMS nằm tại `/admin`.

## Internal revalidation contract

- `POST /api/revalidate`
- Chỉ dành cho webhook nội bộ từ `apps/cms` sang `apps/web`
- Header bắt buộc: `Authorization: Bearer <REVALIDATE_SECRET>`

```ts
type RevalidationWebhookPayload = {
  source: "payload";
  entityType: "collection" | "global";
  slug:
    | "posts"
    | "categories"
    | "tags"
    | "events"
    | "hubPages"
    | "communityPosts"
    | "beginnerGuides"
    | "downloads"
    | "sutras"
    | "homepage"
    | "navigation"
    | "site-settings"
    | "sidebar-config"
    | "chanting-settings";
  operation: "create" | "update" | "delete";
  document?: {
    id?: string | number;
    publicId?: string | null;
    slug?: string | null;
  };
};
```

Ghi chú:
- `INTERNAL_WEBHOOK_URL` nên trỏ từ CMS sang web nội bộ, ví dụ `http://web:3000/api/revalidate` trong Docker.
- `REVALIDATE_SECRET` phải giống nhau ở cả `apps/cms` và `apps/web`.
- Route này sẽ map `Payload` slugs sang cache tags và paths thực tế của frontend rồi gọi `revalidateTag` / `revalidatePath`.

## Auth contracts

```ts
type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  bio: string;
  role: "super-admin" | "admin" | "member";
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
- `admin` trong business/UI có thể hiển thị là `Phụng sự viên`.
- Google login là provider flow hợp lệ nếu được map vào cùng Payload auth authority.

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
- `GET /api/comments/latest?limit=<n>`
- `POST /api/comments/:publicId/like`
- `POST /api/comments/:publicId/report`

Ghi chú:
- Web BFF đã bỏ compatibility layer `blog-comments/*`; frontend nên dùng trực tiếp nhóm route `posts/:id/comments` và `comments/:id/*`.
- `GET /api/comments/latest` trả về top-level comment mới nhất đã được duyệt, có kèm slug/title bài viết để render widget sidebar.

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
- `GET /api/practice-sheets`
- `POST /api/practice-sheets`
- `GET /api/ngoi-nha-nho/sheets`
- `POST /api/ngoi-nha-nho/sheets`

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

type PracticeSheetDTO = {
  id: string | null;
  sheetType: "daily_practice" | "event_preparation" | "vow_support";
  practiceDate: string | null;
  status: "draft" | "in_progress" | "completed" | "archived";
  completionPercent: number;
  items: Array<{
    label: string;
    targetCount: number | null;
    currentCount: number;
    isCompleted: boolean;
  }>;
};

type NgoiNhaNhoSheetDTO = {
  id: string | null;
  sheetType: "standard" | "self_store" | "custom";
  status: "draft" | "in_progress" | "completed" | "self_stored" | "offered";
  practiceDate: string | null;
  currentGreatCompassionCount: number;
  currentHeartSutraCount: number;
  currentRebirthMantraCount: number;
  currentSevenBuddhasCount: number;
};
```

Ghi chú:
- Hai route này dựa trên Payload auth session hiện tại.
- `POST /api/chanting/practice-log` dùng semantics upsert theo `user + practiceDate + plan`.
- `POST /api/practice-sheets` và `POST /api/ngoi-nha-nho/sheets` nên hỗ trợ idempotent/offline sync qua `clientEventId`.

## Personal practice calendar route

- `GET /api/practice-calendar`

```ts
type PracticeCalendarDayDTO = {
  date: string;
  lunarLabel: string | null;
  dayTags: Array<"ngay_via" | "trai_gioi" | "ngay_phong_sanh_goi_y" | "golden_hour">;
  recommendedItems: string[];
  recommendedWindows: Array<{ start: string; end: string; label?: string }>;
  vowHooks: string[];
  lifeReleaseHooks: string[];
  advisoryCards: Array<{
    title: string;
    body: string;
    tone?: "info" | "practice" | "warning";
  }>;
  sourceRefs: Array<{
    label: string;
    url: string;
    provenance:
      | "official_origin"
      | "official_mirror"
      | "community_volunteer_site"
      | "community_translation";
  }>;
  notesVi: string | null;
  notesEn: string | null;
};
```

## Push routes

- `POST /api/push/subscribe`
- `POST /api/push/unsubscribe`
- `GET /api/push/stats`

## Moderation routes

- `GET /api/moderation/reports`
- `POST /api/moderation/reports/:publicId/decision`

Ghi chú:
- Hai route này yêu cầu role `admin` trở lên.
- `decision` hiện hỗ trợ `approved | rejected | flagged | hidden`.

## Queue / worker notes

- `POST /api/posts/search/reindex` yêu cầu role `admin` trở lên và enqueue search sync batch cho posts.
- `GET /api/search/status` trả health của Meilisearch, queue counts và số document hiện có trong index posts.
- `GET /api/push/stats` trả tổng subscription active/inactive và số push job đang chờ/lỗi.
- Community submit/report, guestbook submit, post comment submit hiện vừa append audit log vừa enqueue notification cho admin/super-admin theo policy.
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
