# API Contracts

## Auth user shape

```ts
type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  bio: string;
  role: 'super-admin' | 'admin' | 'editor' | 'moderator' | 'member';
  status: 'active' | 'pending' | 'suspended';
  avatarId: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};
```

## Auth session shape

```ts
type AuthSession = {
  token: string;
  exp: number | null;
  user: AuthUser;
};
```

## Auth endpoints between web and cms

Ghi chú runtime:
- `apps/cms` hiện host Payload theo hướng Next-native.
- Compatibility route cho web vẫn giữ tại `/api/auth/*`.
- Admin UI của CMS được phục vụ tại `/admin`.

`POST /api/auth/register`

```ts
type RegisterInput = {
  email: string;
  password: string;
  displayName: string;
};

type RegisterResponse = {
  session: AuthSession;
};
```

`POST /api/auth/login`

```ts
type LoginInput = {
  email: string;
  password: string;
};

type LoginResponse = {
  session: AuthSession;
};
```

`POST /api/auth/logout`

```ts
type LogoutResponse = {
  success: true;
};
```

`POST /api/auth/forgot-password`

```ts
type ForgotPasswordInput = {
  email: string;
};

type ForgotPasswordResponse = {
  message: string;
  resetToken?: string;
  resetUrl?: string;
};
```

Ghi chú:
- `resetToken` và `resetUrl` chỉ nên dùng cho local/dev hoặc flow debug khi `PAYLOAD_AUTH_DISABLE_EMAIL=true`.
- Production nên để CMS gửi email thật và không dựa vào token trả trực tiếp về web UI.

`POST /api/auth/reset-password`

```ts
type ResetPasswordInput = {
  token: string;
  password: string;
};

type ResetPasswordResponse = {
  session: AuthSession;
};
```

`GET /api/auth/me`

```ts
type MeResponse = {
  session: AuthSession;
};
```

`PATCH /api/auth/profile`

```ts
type UpdateProfileInput = {
  displayName: string;
  bio: string;
};

type UpdateProfileResponse = {
  user: AuthUser;
};
```

## Auth error shape

```ts
type AuthError = {
  code:
    | 'AUTH_INVALID_CREDENTIALS'
    | 'AUTH_FORBIDDEN'
    | 'AUTH_UNAUTHENTICATED'
    | 'AUTH_USER_INACTIVE'
    | 'AUTH_TOKEN_REQUIRED'
    | 'AUTH_RESET_TOKEN_INVALID'
    | 'AUTH_EMAIL_IN_USE'
    | 'AUTH_UNKNOWN';
  message: string;
};

type AuthErrorResponse = {
  error: AuthError;
};
```

## Post summary

```ts
type PostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string | null;
  categories: string[];
};

## Post detail

```ts
type PostDetail = PostSummary & {
  content: {
    root: {
      children: any[]; // Lexical JSON structure
    };
  };
  author?: {
    id: string;
    displayName: string;
  };
  featuredImage?: {
    id: string;
    url: string;
  };
};
```
```

## Comment create input

```ts
type CommentCreateInput = {
  postId: string;
  authorName: string;
  authorEmail: string;
  content: string;
};
```

## Search result item

```ts
type SearchResultItem = {
  id: string;
  type: 'post' | 'event';
  title: string;
  slug: string;
  excerpt: string;
  url: string;
};
```

## Quy tắc contract

- Web luôn map Payload document sang shape domain riêng.
- Web auth gọi CMS auth endpoint, không tự trở thành auth authority thứ hai.
- Web tiếp tục gọi `apps/cms` qua cùng API path sau migrate sang Next-native Payload.
- Session/user shape phải ổn định giữa `apps/cms`, `apps/web`, và `packages/shared`.
- Search result shape phải ổn định giữa web và Meilisearch indexer.
- Không expose field nội bộ moderation sang frontend public.
- Với `Posts` khi bật drafts/versions: public read chỉ lấy bản published; để tương thích dữ liệu cũ, CMS vẫn cho phép đọc docs chưa có `_status` (legacy trước khi bật drafts).
