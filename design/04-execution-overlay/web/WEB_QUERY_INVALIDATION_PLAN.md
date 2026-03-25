# WEB_QUERY_INVALIDATION_PLAN

File này chốt query key family, query option pattern, suspense rule, và mutation invalidation rule cho `apps/web`.
Nó tồn tại để web scaffold không phải tự bịa query keys, tự hardcode invalidate, hay lẫn giữa `TanStack Query` và `Next.js revalidation`.

> Architecture baseline: `design/02-platform-baseline/web-runtime/FRONTEND_ARCHITECTURE.md`
> Page loaders: `design/04-execution-overlay/web/PAGE_LOADER_CONTRACTS.md`
> API canon: `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md`
> DTO canon: `design/04-execution-overlay/api/API_DTO_SHAPE_PLAN.md`
> Cache doctrine: `design/02-platform-baseline/data-runtime/CACHE_TOPOLOGY.md`

---

## Rules

- Query key phải là `array` ở top level.
- Query key phải chỉ chứa values serializable bằng `JSON.stringify`.
- Nếu `queryFn` phụ thuộc vào biến nào làm đổi data, biến đó phải nằm trong `queryKey`.
- Không hardcode string query key rải rác trong component.
- Mọi feature query phải đi qua query key factory + `queryOptions()` hoặc `infiniteQueryOptions()`.
- `apps/web` chỉ dùng `TanStack Query` cho client-interactive server state.
- Public/member page bootstrap bằng `RSC` không được thay bằng client query chỉ vì tiện tay.

---

## Query key doctrine

### Canon shape

Ưu tiên shape:

```ts
['resource']
['resource', publicIdOrSlug]
['resource', { ...filters }]
['resource', publicIdOrSlug, { ...options }]
```

Không ưu tiên shape:

```ts
['resource', status, page]
['resource', page, status]
```

Lý do:
- object tail dễ đọc hơn
- deterministic hashing của TanStack Query giúp object key order không tạo key khác
- giảm drift khi thêm filter mới

### Key family rule

Mỗi feature có 3 nhóm chính:
- `list`
- `detail`
- `aux`

Ví dụ:

```ts
['posts', 'list', { tag, page, sort }]
['posts', 'detail', slug]
['posts', 'aux', 'related', slug]
```

### Include dependency variables

Nếu query dùng:
- `slug`
- `publicId`
- `page`
- `filters`
- `preview`
- `viewerScope`

thì key phải include đúng biến đó.

Không được:
- queryFn dùng `slug` nhưng key chỉ là `['posts', 'detail']`
- queryFn dùng `filters` nhưng key không reflect filters

---

## Factory pattern

### Required pattern

Mỗi feature phải có query key factory riêng ở `src/features/*/queries.ts`.

Ví dụ shape:

```ts
export const postKeys = {
  all: ['posts'] as const,
  list: (filters: PostListFilters) => ['posts', 'list', filters] as const,
  detail: (slug: string) => ['posts', 'detail', slug] as const,
  related: (slug: string) => ['posts', 'aux', 'related', slug] as const,
}
```

### `queryOptions()` rule

Co-locate:
- `queryKey`
- `queryFn`
- `staleTime`
- select-safe defaults

Ví dụ shape:

```ts
export function postDetailQueryOptions(slug: string) {
  return queryOptions({
    queryKey: postKeys.detail(slug),
    queryFn: () => fetchPostDetail(slug),
    staleTime: 30_000,
  })
}
```

### `infiniteQueryOptions()` rule

Dùng cho:
- scroll dài
- feed/search/listing có cursor canon

Không dùng offset list thường chỉ để nhìn “ngầu hơn”.

---

## Web key families

### Public content

```ts
['homepage']
['posts', 'list', filters]
['posts', 'detail', slug]
['little-house', 'group', groupKey]
['little-house', 'guide', slug]
['daily-practice', 'group', groupKey]
['daily-practice', 'guide', slug]
['self-cultivation', 'group', groupKey]
['self-cultivation', 'guide', slug]
['life-release', 'guide', slug]
['media-library', 'collections', filters]
['media-library', 'collection', slug]
```

### Wisdom/search

```ts
['search', normalizedQuery, filters]
['wisdom', 'hub', entryType, filters]
['wisdom', 'detail', slug]
['offline-bundles', 'list', filters]
```

### Member

```ts
['auth', 'session']
['dashboard']
['calendar', 'personal']
['notifications', 'preferences']
['practice-sheet', 'context', contextKey]
['practice-log', 'history', filters]
['vows', 'list', filters]
['vows', 'detail', publicId]
```

### Aux keys

Aux key chỉ được tạo khi:
- aux data thật sự đến từ route riêng
- aux data không nằm trong primary aggregate DTO

Không được tạo aux key cho section đã nằm sẵn trong page aggregate.

---

## Suspense rule

`useSuspenseQuery()` chỉ dùng khi:
- client island đã có `Suspense` boundary rõ
- UX loading đã được thiết kế
- query không phụ thuộc `enabled`
- query không cần `placeholderData`
- query không cần cancellation-sensitive behavior

Không dùng `useSuspenseQuery()` cho:
- typeahead search
- route đổi nhanh cần cancellation
- form-driven filters thay đổi liên tục
- bất kỳ lane nào đang dựa vào cancellation để tránh stale UI

Lý do quan trọng:
- `useSuspenseQuery()` không hỗ trợ cancellation

Mặc định:
- `useQuery()` cho interactive/filter/search-sensitive lanes
- `useSuspenseQuery()` chỉ cho stable client islands đáng dùng suspense

---

## Mutation invalidation doctrine

### Base rule

Khi mutation success:
- invalidate query liên quan
- nếu nhiều key bị ảnh hưởng, dùng `Promise.all`
- nếu mutation callback trả Promise, giữ async chain để mutation không coi là complete quá sớm

### Minimum invalidation patterns

- create:
  - invalidate list
  - invalidate related aggregate nếu membership/summary đổi
- update:
  - invalidate detail
  - invalidate list nếu list card projection đổi
- delete:
  - invalidate list
  - remove/invalidate detail
- publish/unpublish:
  - invalidate list + detail + affected public/member aggregate
  - trigger server-side revalidation nếu surface có RSC/ISR cache

### Web-specific examples

- login success:
  - invalidate `['auth', 'session']`
  - invalidate `['dashboard']` nếu bootstrap ngay sau login
- logout success:
  - clear/invalidate member-scoped keys:
    - `['auth', 'session']`
    - `['dashboard']`
    - `['calendar', 'personal']`
    - `['notifications', 'preferences']`
    - `['vows']`
- practice log save:
  - invalidate `['dashboard']`
  - invalidate `['calendar', 'personal']`
  - invalidate related `['practice-log', 'history', filters]`
- vow progress save:
  - invalidate `['vows', 'detail', publicId]`
  - invalidate `['vows', 'list', filters]`
  - invalidate `['dashboard']` nếu summary affected
- notification preference update:
  - invalidate `['notifications', 'preferences']`
- offline bundle download/delete:
  - invalidate `['offline-bundles', 'list', filters]`

---

## Revalidation boundary

TanStack Query invalidation và `Next.js` revalidation không thay nhau.

### TanStack Query invalidate

Dùng khi:
- client island đang cầm server state
- need refetch trên client cache
- member/admin interactive surface cần cập nhật ngay

### `revalidateTag()` / `revalidatePath()`

Dùng khi:
- mutation làm đổi RSC/ISR/public cached surface
- cache owner ở server/web layer

### Rule phối hợp

Nếu mutation đổi public surface:
- invalidate client query keys liên quan
- đồng thời đi qua server-side revalidation owner theo `cache-topology.md`

Không được:
- chỉ invalidate client query rồi tưởng public RSC đã tươi
- chỉ revalidate tag/path rồi bỏ quên client cache đang mở

---

## Page aggregate rule

- Primary aggregate payload sở hữu root key của route:
  - `['dashboard']`
  - `['notifications', 'preferences']`
  - `['search', normalizedQuery, filters]`
- Nếu section đã nằm trong primary DTO:
  - không tạo child query key riêng chỉ để cấp data cho component con
- Chỉ tách query khi:
  - route owner thật sự tách aux route
  - UX cần non-blocking load lane riêng

---

## Scaffold requirement

Khi scaffold `apps/web`, tối thiểu phải có:

```text
src/
  lib/
    query/
      client.ts
      keys.ts
      invalidate.ts
  features/*/queries.ts
  features/*/mutations.ts
```

Rules:
- `keys.ts` chỉ giữ shared primitives/pattern helpers, không thay feature-local keys
- feature keys sống gần feature
- mutation success path không hardcode raw arrays trong component

---

## Completion bar

`apps/web` chưa được coi là scaffold-ready nếu thiếu:
- web query key family canon
- mutation invalidation canon
- feature-local `queries.ts` / `mutations.ts` plan
- boundary rõ giữa client invalidation và server revalidation
