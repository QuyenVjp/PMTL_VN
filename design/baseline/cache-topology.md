# CACHE_TOPOLOGY — Cache Strategy & Invalidation Rules

File này chốt toàn bộ caching strategy từ Phase 1 đến Phase 2+.
Không có doc này, cache invalidation bị implement tùy hứng và gây stale data bugs.

> **Valkey**: `baseline/valkey-architecture.md` (Phase 2+)
> **Frontend**: `baseline/frontend-architecture.md` — TanStack Query + ISR
> **Infra**: `baseline/infra.md` — Cloudflare CDN layer

---

## Cache layers (4 layers)

```
Layer 1: Cloudflare Edge Cache (CDN)
  → Static assets, public pages (ISR)
  → TTL: configured via Cache-Control headers

Layer 2: Next.js ISR / Route Handler cache
  → Server-side rendered pages with revalidation
  → TTL: per-page configuration

Layer 3: TanStack Query (browser)
  → Client-side data cache for authenticated flows
  → TTL: per-query staleTime configuration

Layer 4: Valkey (Phase 2+)
  → Server-side computed data cache
  → TTL: per-key policy
```

---

## Layer 1: Cloudflare Edge Cache

### What Cloudflare caches

| Resource | Cache | TTL | Invalidation |
|---|---|---|---|
| Static JS/CSS/fonts | Yes | 1 year (immutable) | Content hash in filename |
| Public images (approved) | Yes | 7 days | Purge via Cloudflare API |
| Public page HTML (ISR) | Yes | Follows `s-maxage` | On-demand revalidation |
| API responses | No | 0 (by default) | N/A |
| Auth routes | No | 0 | N/A |

### Cache-Control headers — required implementation

Set in Caddy config and/or Next.js `next.config.ts`:

```
# Static assets (CSS/JS with content hash)
Cache-Control: public, max-age=31536000, immutable

# Public page HTML (SSR/ISR)
Cache-Control: public, s-maxage=300, stale-while-revalidate=600

# Public media files (approved images)
Cache-Control: public, max-age=604800, stale-while-revalidate=86400

# API responses (never cache at CDN)
Cache-Control: private, no-store

# Auth routes (never cache)
Cache-Control: no-store, no-cache
```

### Cloudflare Page Rules / Cache Rules

```
# API — never cache
pmtl.vn/api/* → Cache Level: Bypass

# Static assets — cache everything
pmtl.vn/_next/static/* → Cache Level: Cache Everything, Edge TTL: 1 year

# Public content — respect origin Cache-Control
pmtl.vn/bai-viet/* → Cache Level: Standard
pmtl.vn/tu-tap/* → Cache Level: Standard
```

### On-demand Cloudflare purge (post-publish)

When editor publishes content → trigger Cloudflare cache purge:
```typescript
// apps/api/src/platform/cache/cloudflare-purge.service.ts
async purgeByUrls(urls: string[]): Promise<void> {
  // POST https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache
  // { "files": urls }
}
```

Env vars:
- `CLOUDFLARE_ZONE_ID` — Cloudflare zone ID for pmtl.vn
- `CLOUDFLARE_API_TOKEN` — scoped token with Cache Purge permission

**Phase 1 fallback** (no Cloudflare API token): Call `revalidatePath()` in Next.js only.
**Phase 2**: Add Cloudflare purge as inline sync call after publish.

---

## Layer 2: Next.js ISR / Route Handler Cache

### Next.js 16 Cache Components rule

- `apps/web` bật `cacheComponents: true`
- Public deterministic route segments ưu tiên `use cache`
- Cached loaders phải gắn `cacheTag()` ở đúng aggregate/tag boundary
- `revalidateTag()` là cơ chế chính cho invalidation theo domain event; `revalidatePath()` chỉ dùng khi route-specific và không có tag phù hợp
- Không đưa `cookies()` / `headers()` trực tiếp vào cached scope; đọc ngoài rồi truyền vào argument
- `after()` chỉ dùng cho post-response side effects không-authoritative

### ISR strategy per page type

| Page | Revalidation | Strategy |
|---|---|---|
| `/` (homepage) | `revalidate: 300` (5 min) | ISR — content changes infrequently |
| `/bai-viet` (post list) | `revalidate: 60` | ISR — moderate update frequency |
| `/bai-viet/[slug]` | `revalidate: 600` | ISR + on-demand revalidation on publish |
| `/tu-tap/*` (practice guides) | `revalidate: 3600` | ISR — rarely changes |
| `/lich` (calendar) | `revalidate: 3600` | ISR — changes on event publish |
| Member pages (`/dashboard`, etc.) | No ISR | Dynamic, auth-required |
| Admin pages | No ISR | SPA, no Next.js caching |

### On-demand revalidation (Next.js)

```typescript
// apps/web/src/app/api/revalidate/route.ts
// Called by apps/api after content publish
// Protected by REVALIDATE_SECRET
export async function POST(req: Request) {
  const { path, tag, secret } = await req.json();
  if (secret !== process.env.REVALIDATE_SECRET) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (tag) revalidateTag(tag);
  if (path) revalidatePath(path);
  return Response.json({ revalidated: true });
}
```

**Tags strategy**:
- `posts` — all post-related pages
- `post:{publicId}` — specific post page
- `guides` — all guide pages
- `calendar-events` — calendar pages
- `homepage` — homepage only

### Invalidation chain per event

| Event | Next.js | Cloudflare | TanStack Query | Valkey Phase 2+ |
|---|---|---|---|---|
| `content.post.published` | `revalidateTag('posts')`, `revalidateTag('post:{publicId}')`, `revalidateTag('homepage')` khi có featured slot | purge post detail URL + affected list URLs nếu public | không broadcast sang browser; client tự thấy data mới khi refetch | `del cache:content:post:{publicId}` + related list keys |
| `content.post.unpublished` | same tags as publish | purge public post/detail/list URLs | invalidate public search/list queries nếu user đang ở client island | delete same keys |
| `calendar.event.published` | `revalidateTag('calendar-events')`, path detail nếu có slug | purge public calendar URLs | invalidate advisory/calendar queries ở member surfaces | delete advisory/date keys |
| `feature.flag.updated` | không revalidate public ISR mặc định | none | invalidate `['feature-flags']` ở web/admin | delete `cache:feature-flags` |
| `search.reindex.completed` | none | none | invalidate client search status/admin ops queries | purge `cache:search:*` nếu active |

**Rule**: invalidation chain phải chạy từ canonical event taxonomy trong `tracking/outbox-event-taxonomy.md`; không tự nghĩ thêm event string ở từng layer cache.

---

## Layer 3: TanStack Query (browser cache)

### Query option discipline

- Mọi query phải đi qua query key factory + `queryOptions()` / `infiniteQueryOptions()`
- Conditional query dùng `skipToken` nếu không cần `refetch()` thủ công
- Feed/search/list dài dùng `useInfiniteQuery()` với cursor contract khi UX là infinite scroll / load-more
- Suspense mode chỉ bật ở component có fallback UI được thiết kế rõ

### staleTime policy per query type

| Query | staleTime | gcTime | Note |
|---|---|---|---|
| Public content (posts, guides) | 5 min | 30 min | Rarely mutates, OK stale |
| User profile | 2 min | 10 min | User can change it |
| Practice logs | 30 sec | 5 min | Frequently mutated |
| Notifications | 1 min | 5 min | Should be fresh |
| Search results | 30 sec | 2 min | User expects fresh |
| Feature flags | 10 min | 60 min | Rarely changes |
| Calendar advisory | 5 min | 30 min | Daily updates |

### Query invalidation rules

After mutation, invalidate related queries:

| Mutation | Invalidate queries |
|---|---|
| `POST /practice-logs` | `['practice-logs']`, `['dashboard-stats']` |
| `POST /community/posts` | `['community-posts']` |
| `POST /vows` | `['vows']`, `['dashboard-stats']` |
| `PATCH /engagement/ngoi-nha-nho-sheets/:id` | `['ngoi-nha-nho-sheets']`, `['ngoi-nha-nho-sheets', id]` |
| `POST /notifications/push/subscribe` | `['push-subscription-status']` |

### Optimistic updates (allowed for)

| Mutation | Optimistic update |
|---|---|
| `POST /engagement/bookmarks` | Add bookmark to list immediately |
| `PATCH /engagement/ngoi-nha-nho-sheets/:id/entries` | Add entry to sheet immediately |
| `POST /community/posts/:id/comments` | Add comment optimistically |

---

## Layer 4: Valkey cache (Phase 2+)

> Full Valkey design: `baseline/valkey-architecture.md`

### What goes in Valkey cache

| Cache key pattern | TTL | Invalidated when |
|---|---|---|
| `cache:content:post:{publicId}` | 10 min | Post updated/published/unpublished |
| `cache:content:guides:list` | 5 min | Any guide published |
| `cache:calendar:advisory:{date}` | 24 hours | Lunar override applied |
| `cache:search:top-queries` | 1 hour | Manual flush or time-based |
| `cache:feature-flags` | 5 min | Flag updated |

### Cache invalidation via outbox

When content is published → `content.post.published` outbox event → dispatcher → worker clears Valkey key:
```typescript
// apps/worker/src/handlers/cache-invalidation.handler.ts
async handle(event: OutboxEvent) {
  const cacheKey = `cache:content:post:${event.aggregateId}`;
  await valkeyService.del(cacheKey);
  // Also trigger Next.js revalidation via webhook
}
```

### Cache stampede protection

Use `SET NX PX {ttl}` pattern — only first request populates cache, others wait:
```typescript
const lock = await valkey.set(`lock:${key}`, '1', 'NX', 'PX', 500);
if (lock) {
  const data = await fetchFromDB();
  await valkey.setex(key, TTL_SECONDS, JSON.stringify(data));
}
```

---

## Cache poisoning prevention

| Risk | Mitigation |
|---|---|
| Admin-only content in public cache | Route handler checks auth before ISR, never ISR admin routes |
| Unpublished content in CDN | CDN only caches public routes; API validates status filter |
| Stale user-specific data at CDN | All user-specific routes return `Cache-Control: private, no-store` |
| XSS via cached HTML | CSP headers set; `rehype-sanitize` on server before cache |

---

## Env vars

| Env | Owner | Required | Purpose |
|---|---|---|---|
| `CLOUDFLARE_ZONE_ID` | infra | Phase 2 | Cloudflare zone for cache purge |
| `CLOUDFLARE_API_TOKEN` | infra | Phase 2 | Scoped cache purge token |
| `REVALIDATE_SECRET` | web | yes | Shared secret for on-demand revalidation |
| `NEXT_REVALIDATE_URL` | api | yes | Web app revalidation webhook URL |

---

## Implementation proof criteria

| Check | Proof |
|---|---|
| Static assets immutable | Response headers include `immutable` for `_next/static/` |
| ISR working | Post update → page revalidates within configured TTL |
| On-demand revalidation | Publish post → web page updates within 5 seconds |
| Auth routes not cached | Login/dashboard response has `Cache-Control: no-store` |
| Cloudflare bypass on API | `/api/*` requests show `CF-Cache-Status: BYPASS` |
| TanStack Query invalidation | Practice log submit → dashboard stats refresh automatically |
