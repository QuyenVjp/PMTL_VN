# WEB_CACHE_REVALIDATION_CONTRACT

File này chốt cách `apps/web` dùng `use cache`, `cacheTag`, `cacheLife`, `revalidateTag`, và `refresh`.
Nó tồn tại để web không tự phát minh cache semantics giữa:
- RSC/page cache
- tag-based invalidation
- route/path invalidation
- client query invalidation

> Frontend architecture: `design/02-platform-baseline/web-runtime/FRONTEND_ARCHITECTURE.md`
> Web query canon: `design/04-execution-overlay/web/WEB_QUERY_INVALIDATION_PLAN.md`
> App Router files: `design/04-execution-overlay/web/WEB_APP_ROUTER_FILE_CONTRACT.md`
> Global cache doctrine: `design/02-platform-baseline/data-runtime/CACHE_TOPOLOGY.md`

---

## Baseline

- `apps/web` bật `cacheComponents: true`.
- Cacheable server reads phải ưu tiên:
  - `'use cache'`
  - `cacheTag(...)`
  - `cacheLife(...)`
- Không dùng time-based `revalidate` cũ như baseline mặc định nếu tag/profile semantics diễn đạt rõ hơn.

### `use cache` boundary rule

- Chỉ dùng `'use cache'` cho deterministic server reads hoặc cached component output.
- Không đọc trực tiếp các request-time APIs trong cached scope:
  - `cookies()`
  - `headers()`
  - `searchParams`
  - request-only promises/closures
- Nếu cần runtime values, đọc chúng **ngoài** cached scope rồi truyền vào như arguments serializable.
- Args và return values của cached function phải serializable theo RSC contract.
- Không truyền class instances, `URL`, function thường, hoặc shared promise động vào cached scope.
- Không dùng shared `Map<id, Promise<...>>` để “bắc cầu” uncached data sang cached function; ưu tiên built-in `fetch()` dedupe hoặc tách cached/uncached lane cho rõ.

### Runtime stance

- P0/P1 mặc định dùng `'use cache'`, không bật `'use cache: remote'`.
- `'use cache: remote'` chỉ xem xét khi runtime in-memory cache không đủ và đã có measured pain/cost case.
- `'use cache: private'` không là baseline; chỉ dùng khi có compliance/runtime constraint thật sự không refactor được.
- Nếu dùng short-lived cached hole, phải có `Suspense` boundary rõ ràng và owner route biết mình đang chấp nhận dynamic hole.

---

## `cacheTag` rule

### When to use

Dùng `cacheTag()` bên trong cached function/component khi muốn:
- gắn owner tag cho output cached
- revalidate theo domain event
- tránh invalidate path mù cho nhiều page dùng chung data

### Requirements

- `cacheTag()` chỉ gọi trong scope có `'use cache'`.
- Tag là string, case-sensitive.
- Tag phải ngắn gọn, deterministic, và bám owner vocabulary.
- Không bịa tag từ UI wording.

### PMTL tag shape

Ưu tiên:

```ts
'homepage'
'posts'
`post:${publicId}`
'wisdom-hub'
`wisdom:${publicId}`
'calendar-events'
`event:${publicId}`
'dashboard'
'notifications-preferences'
```

Không ưu tiên:
- tag mơ hồ kiểu `data`, `list`, `content`
- tag gắn theo component thay vì data owner

### Good-to-know rule

- Gắn cùng một tag nhiều lần không tạo thêm effect.
- Một cached output được phép có nhiều tag.

---

## `cacheLife` rule

### When to use

Dùng `cacheLife()` để chốt lifetime cho cached function/component.

### Baseline profiles cho PMTL

- `days`: editorial content, wisdom detail, guide detail
- `hours`: listings, hub pages, media collections
- `minutes`: frequently updated member-facing aggregates khi vẫn cache được
- `max`: legal/static/help/about-like surfaces hiếm đổi

### Explicitness rule

- Mọi cached function/component quan trọng nên gọi `cacheLife()` rõ ràng.
- Không dựa quá nhiều vào `default` profile nếu route là owner surface quan trọng.

### Short-lived cache warning

- Cache profile quá ngắn có thể tạo dynamic hole và ảnh hưởng prerendering.
- Không dùng short-lived cache trong outer cached scope nếu chưa chủ động thiết kế `Suspense` boundary.

### Speculation freshness warning

- Neu route duoc dua vao `Speculation Rules` prefetch/prerender lane, owner route phai coi do la them mot tang stale-state risk.
- Khong dua cac route co server-rendered state bien doi nhanh vao speculation lane neu chua co refresh/clear strategy ro.
- Cac surfaces nhu:
  - auth state dependent pages
  - cart-like/member aggregate pages
  - admin/control-plane pages
  khong duoc dua vao speculation cache lane.
- Khi user action lam invalid toan bo predicted state nhu logout, signin-state change, add-to-cart-like mutation, language/theme state swap can SSR owner, can xem xet tra `Clear-Site-Data` voi:
  - `prefetchCache`
  - `prerenderCache`
  tren same-site response owner phu hop.
- Khong duoc coi speculation cache la data-freshness primitive; no chi la navigation hint.

### PMTL default stance

- P0/P1 web không dùng profile kiểu `seconds` làm mặc định cho public pages.
- Public content ưu tiên ổn định + tag-based invalidation hơn “gần realtime”.

---

## `revalidateTag` rule

### Where allowed

- Server Actions
- Route Handlers

Không dùng trong:
- Client Components
- `proxy.ts`

### Signature rule

- Dùng form 2 arguments.
- Mặc định:

```ts
revalidateTag(tag, 'max')
```

- Không dùng single-argument form cũ.

### Semantics rule

`revalidateTag(tag, 'max')`:
- mark tag là stale
- lần visit kế tiếp sẽ dùng stale-while-revalidate
- không ép toàn hệ thống re-fetch ngay lập tức

Đây là lựa chọn mặc định cho:
- bài viết
- wisdom entries
- grouped guides
- homepage sections
- public/support content nói chung

### Speculation interaction rule

- `revalidateTag()` va `updateTag()` khong xoa duoc browser speculation caches.
- Neu owner route vua dua vao server invalidation vua dua vao speculation hints, phai danh gia them nhu cau `Clear-Site-Data: prefetchCache` hoac `prerenderCache`.
- PMTL mac dinh tranh ket hop speculation voi lanes can read-your-own-writes manh.

### Immediate expire exception

`revalidateTag(tag, { expire: 0 })` chỉ xem xét cho:
- webhook
- third-party callback
- route handler cần expire ngay theo contract ngoài hệ thống

Không lấy `{ expire: 0 }` làm mặc định cho write flow nội bộ.

---

## `updateTag` rule

### Where allowed

- Chỉ dùng trong Server Actions.

Không dùng trong:
- Route Handlers
- Client Components
- `proxy.ts`

### When to use

Dùng `updateTag(tag)` cho `read-your-own-writes`:
- user vừa submit action
- request kế tiếp phải thấy data mới ngay
- không muốn stale-while-revalidate

### PMTL default stance

`updateTag()` phù hợp cho:
- member settings update qua Server Action bridge
- form flow cần redirect sang detail/list và user phải thấy dữ liệu mới ngay
- small self-service writes ở web tier

`updateTag()` không là mặc định cho:
- publish pipeline
- webhook callback
- admin ops broad invalidation
- third-party triggered cache invalidation

Những lane đó mặc định dùng `revalidateTag(tag, 'max')` hoặc route-level owner invalidation khác.

### `updateTag` + `refresh` pairing rule

- `updateTag()` là primitive correctness cho read-your-own-writes.
- `refresh()` chỉ thêm khi cùng flow đó cần router redraw hoặc shell count/state phải cập nhật ngay.
- Không thay `updateTag()` bằng `refresh()` đơn lẻ nếu owner data phải tươi ngay ở request kế tiếp.

### Mutation redirect rule

- Nếu Server Action submit xong rồi redirect sang route khác:
  - `updateTag()` dùng cho lane user phải thấy dữ liệu mới ngay trên destination
  - `revalidateTag(tag, 'max')` dùng cho lane chấp nhận stale-while-revalidate
  - `redirect()` là navigation primitive, không thay cache invalidation
- Không assume redirect tự làm data fresh nếu chưa có invalidation primitive đúng.

---

## `refresh` rule

### Where allowed

- Chỉ dùng trong Server Actions.

Không dùng trong:
- Route Handlers
- Client Components
- proxy/network boundary code

### When to use

Dùng `refresh()` khi cần refresh client router sau Server Action.

Phù hợp cho:
- form submit server-action flow
- member settings update qua server action bridge
- UX cần router refresh ngay sau action

### PMTL caution

- `refresh()` không thay thế:
  - `revalidateTag`
  - TanStack Query invalidation
  - backend authority mutation contract
- Chỉ dùng như UI/router refresh helper.

---

## Relationship matrix

### `cacheTag`

- gắn nhãn cho cached output
- không tự invalidate gì cả

### `cacheLife`

- chốt lifetime của cached output
- không tự revalidate gì cả

### `revalidateTag`

- stale/revalidate tag-based server cache
- dùng cho owner data shared across multiple paths

### `updateTag`

- expire tag ngay trong Server Action
- ưu tiên cho read-your-own-writes
- request kế tiếp phải chờ data mới, không dùng stale response

### `refresh`

- refresh client router sau Server Action
- không phải domain invalidation primitive

### TanStack Query invalidation

- refresh client-side server state islands
- không thay cho server cache revalidation

---

## PMTL decision matrix

### Public content publish/update

Sau canonical write thành công:
- invalidate client keys nếu có client island đang mở
- `revalidateTag(tag, 'max')` cho owner tags liên quan

Mặc định không dùng `refresh()` cho lane này.

### Member interactive update

Nếu flow đi qua Server Action bridge và cần user thấy kết quả ngay trong same shell:
- có thể dùng `refresh()`
- nhưng vẫn phải invalidate client query keys nếu client islands đang giữ state riêng

Nếu flow là read-your-own-writes rõ ràng:
- ưu tiên `updateTag()` cho owner tags trước
- chỉ thêm `refresh()` khi UX/router cần redraw cùng request flow

### Shared aggregate updates

Nếu cùng một data surface feed nhiều route:
- ưu tiên `cacheTag` + `revalidateTag`
- không chỉ `revalidatePath` từng route bằng tay

---

## Scaffold requirement

Khi scaffold `apps/web`, tối thiểu phải có:

```text
src/lib/cache/tags.ts
src/lib/cache/profiles.ts
```

Rules:
- `tags.ts` giữ tag vocabulary dùng chung
- `profiles.ts` giữ cache profile mapping của app nếu cần helper layer
- không rải string tag thẳng trong nhiều feature files nếu tag đó là shared owner concept

---

## `use cache` troubleshooting guardrails

- Nếu build treo hoặc timeout ở cached route/function, nghi đầu tiên:
  - runtime promise lọt vào cached scope
  - `cookies()`/`headers()`/`searchParams` bị kéo vào closure
  - short-lived nested cache chưa có explicit outer `cacheLife()`
- Cached function nên có `cacheLife()` explicit ở owner surfaces quan trọng để behavior đọc vào là hiểu, không phải lần theo nested cache.

---

## Completion bar

`apps/web` chưa được coi là cache-ready nếu:
- chưa bật `cacheComponents: true`
- chưa có tag vocabulary
- chưa có rule rõ giữa `revalidateTag` và client invalidation
- còn dùng single-arg `revalidateTag(tag)` pattern cũ
