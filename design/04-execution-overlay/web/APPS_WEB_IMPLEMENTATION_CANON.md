# APPS_WEB_IMPLEMENTATION_CANON

File này chốt `implementation canon` cho `apps/web`.
Mục tiêu: khi AI scaffold `Next.js 16 App Router`, nó biết phải đặt file ở đâu, cache/action contract nào là đúng, và pattern nào bị cấm.

> Frontend owner: `design/02-platform-baseline/web-runtime/FRONTEND_ARCHITECTURE.md`
> App Router owner: `design/04-execution-overlay/web/WEB_APP_ROUTER_FILE_CONTRACT.md`
> Cache owner: `design/04-execution-overlay/web/WEB_CACHE_REVALIDATION_CONTRACT.md`
> Query owner: `design/04-execution-overlay/web/WEB_QUERY_INVALIDATION_PLAN.md`
> Route/page owner: `design/04-execution-overlay/web/PAGE_INVENTORY.md`

---

## Root shape

```txt
apps/web/
  src/
    app/
    components/
    features/
    lib/
    hooks/
```

Rules:

- `apps/web` là Next.js 16 App Router shell.
- route/page/layout/loading/error files sống ở `src/app/`.
- feature code sống ở `src/features/<domain>/`.
- shared web helpers sống ở `src/lib/`.

## `src/app/` canon

### Must exist from first scaffold

```txt
src/app/layout.tsx
src/app/not-found.tsx
src/app/global-error.tsx
src/app/(public)/
src/app/(member)/
```

### Special files

- `layout.tsx` giữ `<html>` + `<body>`
- `error.tsx` là client component
- `global-error.tsx` phải tự có `<html>` + `<body>`
- `loading.tsx` ưu tiên skeleton thật
- `proxy.ts` là network-boundary file baseline; không scaffold `middleware.ts` như mental model cũ

## Server/client boundary canon

- server-first mặc định
- chỉ mở `'use client'` ở entry nhỏ nhất cần interactivity
- client components chỉ nhận props serializable
- business/domain authority không sống trong client component

## Cache canon

### Must-exist helper paths

```txt
src/lib/cache/tags.ts
src/lib/cache/profiles.ts
src/lib/cache/revalidation.ts
```

Rules:

- `cacheComponents: true`
- cached reads ưu tiên:
  - `'use cache'`
  - `cacheTag(...)`
  - `cacheLife(...)`
- nếu dùng `'use cache'` file-level thì mọi export function phải là `async`
- `cookies()`, `headers()`, `searchParams` phải đọc ngoài cached scope
- `revalidateTag(tag, 'max')` là default stale-while-revalidate path
- `updateTag()` chỉ dùng trong Server Actions
- không dùng single-arg `revalidateTag(tag)`

## Server Actions canon

Expected path:

```txt
src/lib/actions/
src/features/<domain>/actions/
```

Rules:

- `'use server'` chỉ cho transport/helper lane của web tier
- input phải validate ở server side
- action phải tự re-check auth/authz nếu route cần
- writes authoritative vẫn đi qua `apps/api`
- action return shape phải hẹp, UI-safe

## Route Handler canon

Expected path:

```txt
src/app/api/proxy/[...path]/route.ts
```

và các metadata/web-tier handlers thật sự cần.

Rules:

- Route Handlers không là business API authority thay `apps/api`
- `GET` Route Handlers request-time mặc định
- nếu cần cache, phải extract cached helper riêng; không đặt `'use cache'` trực tiếp trong handler body

## Query canon

Expected paths:

```txt
src/features/<domain>/queries.ts
src/features/<domain>/mutations.ts
src/features/<domain>/query-keys.ts
```

Rules:

- dùng `queryOptions()` / `infiniteQueryOptions()` / `mutationOptions()`
- query key factory owner theo feature
- invalidate qua helper owner, không hardcode raw arrays khắp component tree
- optimistic UI ưu tiên hơn optimistic cache khi lane đơn giản

## Form canon

Expected paths:

```txt
src/features/<domain>/forms/
src/features/<domain>/schemas/
```

Rules:

- form stack: RHF + Zod + `zodResolver`
- uncontrolled-first
- `Controller` chỉ cho controlled/headless controls
- `defaultValues` lấy từ owner projection
- source data đổi thì đồng bộ bằng `reset(nextValues)`

## Metadata canon

Expected owner helpers:

```txt
src/lib/metadata/
```

Rules:

- static pages dùng `metadata`
- dynamic/detail pages dùng `generateMetadata()`
- shared fetch helper hoặc React `cache()` để tránh duplicate fetch giữa page và metadata
- dynamic metadata stream là hợp lệ; không tự hack bot-specific branches nếu không cần

## Naming canon

- route groups: `(public)`, `(member)` rõ nghĩa
- feature folder: domain-first
- cache tag vocabulary phải sống tập trung
- action names phải mô tả intent thật như `updateProfileAction`, không dùng `submitFormAction` chung chung

## Must-not-do list

- whole route tree thành client chỉ vì một toggle
- `cookies()`/`headers()` trong cached scope
- `updateTag()` ngoài Server Actions
- single-arg `revalidateTag()`
- route handler thành backend song song với `apps/api`
- query key raw arrays copy-paste khắp nơi
- form state mirror hết sang Zustand
