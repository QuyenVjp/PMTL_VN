# WEB_APP_ROUTER_FILE_CONTRACT

File này chốt special files, root layout behavior, metadata/image/font rules, và loading/error/not-found contract cho `apps/web`.
Nó tồn tại để lúc scaffold `Next.js App Router` không ai phải đoán:
- file đặc biệt nào bắt buộc phải có
- file nào được là server component, file nào bắt buộc là client
- layout được phép fetch kiểu gì
- image/font/metadata phải đi theo pattern nào

> Architecture baseline: `design/02-platform-baseline/web-runtime/FRONTEND_ARCHITECTURE.md`
> Web rebuild blueprint: `design/04-execution-overlay/web/WEB_REBUILD_BLUEPRINT.md`
> Page routes: `design/04-execution-overlay/web/PAGE_INVENTORY.md`
> Loader contracts: `design/04-execution-overlay/web/PAGE_LOADER_CONTRACTS.md`
> Design language: `design/02-platform-baseline/web-runtime/DESIGN_PRINCIPLES.md`

---

## Required special files

Bootstrap `apps/web` phải có tối thiểu:

```text
src/app/
  layout.tsx
  not-found.tsx
  loading.tsx
  global-error.tsx
```

Ngoài root files, mỗi route group hoặc route segment P0/P1 nên có:
- `loading.tsx` khi route có streamed data hoặc visible wait
- `error.tsx` khi route có meaningful recovery UI riêng
- `not-found.tsx` ở segment detail routes nếu 404 wording cần theo domain

---

## Root layout contract

- Root layout bắt buộc phải định nghĩa:
  - `<html>`
  - `<body>`
- Không tự nhét `<head>`, `<title>`, `<meta>` thủ công vào root layout.
- Metadata đi qua Metadata API của Next.js.
- Root layout là server component.
- Root layout được phép gắn:
  - global fonts
  - global styles
  - top-level providers
  - theme provider wrapper

### Next.js 16 async request API rule

- Trong `apps/web`, các request-time APIs sau phải được dùng bất đồng bộ:
  - `cookies()`
  - `headers()`
  - `draftMode()`
  - `params`
  - `searchParams`
- `layout.tsx`, `page.tsx`, route handlers, OG image generators, icon generators phải code theo contract async này.
- Không dùng pattern sync cũ của Next 15.

Ví dụ direction:
- `params` trong page/layout là `Promise<...>`
- `searchParams` trong page là `Promise<...>`
- khi cần type-safe route props, ưu tiên helper types sinh từ `next typegen`

### Theme wiring

- Root layout phải có:
  - `lang="vi"`
  - `suppressHydrationWarning`
  - `ThemeProvider` với `attribute="class"`
- Theme provider wrapper phải nằm ở component riêng, không nhét trực tiếp logic `next-themes` xuống mọi layout con.

### Layout data discipline

- Layout không được là nơi fetch runtime data nặng theo request nếu có thể chuyển xuống `page.tsx`.
- Nếu layout phải đọc runtime/uncached data:
  - wrap lane đó trong `Suspense`
  - có fallback riêng
- Không để `loading.tsx` bị vô hiệu chỉ vì layout chặn render bằng `cookies()`, `headers()`, hoặc uncached fetch không được bọc.

### Layout re-render caveat

- Layout không re-render theo navigation như page.
- Layout không được dựa vào:
  - `searchParams`
  - `pathname`
  - mutable child route state
  trực tiếp ở server layout.
- Active nav/breadcrumb/state theo pathname phải đi qua client component dùng:
  - `usePathname`
  - hoặc `useSelectedLayoutSegment(s)`

---

## Server/client boundary contract

### Default stance

- `apps/web` là server-first.
- Mặc định file mới là Server Component nếu không có lý do thật để sang client.
- Không thêm `'use client'` tràn lan chỉ vì component có event handler ở một nhánh con; phải đẩy boundary xuống file entry nhỏ nhất có thể.

### `'use client'` rule

- `'use client'` chỉ đặt ở đầu file export entry component cần:
  - state/effects/browser APIs
  - event handlers
  - hooks client-only như `usePathname`, `useSearchParams`
- Props đi từ server sang client phải serializable.
- Không truyền object class instance, function thường, hoặc server-only values làm props client component.

### `'use server'` rule

- Dùng `'use server'` cho Server Actions/file actions.
- Server Actions là transport/helper lane của web tier, không phải domain authority thay `apps/api`.
- Mọi Server Action phải:
  - validate input
  - check auth/authz ở server side
  - trả về dữ liệu hẹp đúng nhu cầu UI
- Nếu action làm đổi owner data:
  - dùng `updateTag()` cho read-your-own-writes
  - hoặc `revalidateTag(tag, 'max')` cho stale-while-revalidate lane
  - chỉ dùng `refresh()` như router helper khi thật sự cần

### `'use cache'` rule

- `'use cache'` chỉ cho cached deterministic output ở route/component/function scope.
- Không đọc trực tiếp `cookies()`, `headers()`, `searchParams` trong cached scope.
- Runtime values phải đọc ngoài cached scope rồi truyền vào qua args serializable.
- Nếu cached scope có dynamic hole hoặc short-lived cache, owner route phải có `Suspense` strategy rõ ràng.

---

## Error contract

### `error.tsx`

- `error.tsx` phải là client component.
- Dùng `unstable_retry()` làm recovery path mặc định.
- Không leak raw server error detail ra UI production.
- Nếu log error ra service quan sát lỗi, phải log theo `digest`/server correlation thay vì show thẳng internal message cho user.

### `global-error.tsx`

- `global-error.tsx` bắt buộc có:
  - `<html>`
  - `<body>`
- File này thay root layout khi active, nên phải tự import:
  - global styles tối thiểu
  - fonts tối thiểu nếu cần
- Không export `metadata` hay `generateMetadata` trong `global-error.tsx`.
- Nếu cần title riêng cho global error, dùng React `<title>`.

### PMTL UX rule

- `(public)` error UI:
  - giọng điệu bình tĩnh
  - có `Thử lại`
  - có đường quay về surface an toàn
- `(member)` error UI:
  - phân biệt auth-expired với runtime failure
  - không đẩy user ra khỏi flow nếu lỗi chỉ là retryable fetch failure
- không dùng copy kiểu panic/dev-jargon

---

## Loading contract

### `loading.tsx`

- `loading.tsx` mặc định là server component.
- Loading UI phải nhẹ và meaningful:
  - skeleton
  - title placeholder
  - section shell
- Không dùng spinner-only cho content-heavy routes nếu skeleton tốt hơn.

### Placement rule

- P0/P1 routes phải có `loading.tsx` ở các segment chính:
  - homepage
  - posts list/detail
  - grouped content hubs/detail
  - search
  - member dashboard
  - personal calendar
  - offline bundles

### PMTL loading style

- Ưu tiên skeleton pulse, không shimmer.
- Loading shell phải giữ bố cục gần với final page để tránh cảm giác nhảy layout.

### Streaming placement rule

- `loading.tsx` là page-level streaming primitive, không phải giải pháp duy nhất.
- Khi page có nhiều async sections độc lập, ưu tiên thêm sibling `<Suspense>` boundaries trong `page.tsx` hoặc section components.
- Boundary phải bám user-perceived sections, không bọc bừa theo file structure.
- Static shell nên render ngay:
  - heading
  - breadcrumb
  - frame layout
  - key CTA an toàn
- member aggregates, analytics blocks, recommendations, heavy lists là lane nên stream sau nếu chậm.

### Status caveat

- Khi route đã stream rồi, response thường là `200` kể cả khi sau đó render `notFound()`.
- Vì vậy slug existence checks cần diễn ra sớm nếu route cần HTTP 404 thật cho analytics/compliance.

---

## Not-found contract

### `not-found.tsx`

- Root `app/not-found.tsx` là bắt buộc.
- Dùng cho:
  - unmatched URLs toàn app
  - `notFound()` ở route segment

### Segment `not-found.tsx`

- Detail routes như:
  - `/bai-viet/[slug]`
  - `/bach-thoai/[slug]`
  - `/hoi-dap/[slug]`
  - grouped guide detail routes
  nên có wording/domain CTA riêng nếu cần.

### `global-not-found.tsx`

- Chưa bật ở bootstrap phase.
- Chỉ xem xét nếu sau này web dùng nhiều root layouts hoặc cần 404 tách hẳn khỏi tree hiện tại.

### PMTL UX rule

- 404 phải:
  - nói rõ không tìm thấy nội dung
  - có CTA quay về hub owner đúng
  - không chỉ ném user về homepage trong mọi trường hợp

---

## Metadata contract

### General rule

- Dùng `metadata` object cho static pages ổn định.
- Dùng `generateMetadata()` cho detail pages hoặc pages phụ thuộc data.
- Chỉ server components mới được export `metadata` hoặc `generateMetadata`.

### Page/data dedupe rule

- Nếu page và `generateMetadata()` dùng cùng data source:
  - dùng React `cache()` hoặc shared fetch helper để tránh duplicate fetch

### Route classes

- hub/listing pages:
  - có static metadata baseline
  - có canonical title/description theo owner route
- detail pages:
  - dùng `generateMetadata()`
  - derive title/description từ DTO owner

### Async route props rule

- `generateMetadata()` của detail pages phải tôn trọng async `params`.
- Nếu `generateMetadata()` và page cùng đọc một source, dùng shared fetch helper hoặc React `cache()` để dedupe.
- OG image generators có `params` async ở Next 16; nếu dùng `generateImageMetadata`, `id` cũng phải được xử lý theo contract async mới.

### File-based metadata

Bootstrap nên có:
- root favicon
- root static `opengraph-image`
- `robots`
- `sitemap`

Route-specific `opengraph-image` chỉ thêm ở surfaces cần share mạnh:
- bài viết detail
- wisdom detail
- event detail

### Streaming metadata rule

- Chấp nhận streaming metadata cho dynamic pages.
- Không tối ưu ngược theo bot bằng hack tay; để Next.js xử lý crawler behavior mặc định.

---

## Route handler contract

### Baseline stance

- `apps/web` chỉ dùng Route Handlers cho web-tier concerns, không biến chúng thành backend authority thay `apps/api`.
- P0 mặc định là:
  - `/api/proxy/[...path]/route.ts`
  - metadata/sitemap handlers khi thật sự cần
- Không dựng business endpoints mới ở web tier nếu `apps/api` đã là owner.

### Placement rule

- Không đặt `route.ts` ở cùng segment level với `page.tsx`.
- Route Handlers chỉ sống ở nơi có lý do boundary rõ ràng:
  - proxy/BFF edge
  - generated metadata file
  - file/webhook edge thực sự thuộc web tier

### Caching rule

- Route Handlers không cached by default.
- Nếu một `GET` handler của web tier được cache hoặc prerender, file đó phải ghi rõ owner semantics; không để implicit.
- Không dùng Route Handler như đường tắt cho data mà Server Component fetch trực tiếp được tốt hơn.

### `/api/proxy/*` rule

- Browser-facing API calls từ client islands đi qua `/api/proxy/*`.
- Proxy handler chỉ:
  - forward request
  - forward cookies/credentials cần thiết
  - preserve/forward safe headers theo contract
  - map response/status/body hợp lệ
- Proxy handler không:
  - thêm business logic
  - tự quyết auth policy thay `apps/api`
  - tự bịa cache semantics

### Public endpoint rule

- Mọi Route Handler ở `apps/web` là public HTTP surface.
- Nếu handler làm hơn việc proxy thuần, phải:
  - sanitize input
  - avoid leaking sensitive errors
  - auth/authz nếu endpoint không public
  - review content-type/headers rõ ràng

### Content-type rule

- Route Handlers ở web tier có thể trả:
  - JSON
  - XML
  - text
  - files
  - stream
- Chỉ dùng khi content type đó thật sự thuộc web-facing concern như `rss.xml`, `llms.txt`, `manifest`, generated feed/file edge.
- Không vì Route Handler trả được nhiều content type mà kéo domain endpoints khỏi `apps/api`.

### Upload/download edge rule

- File upload, file download, stream response, và non-JSON edges nếu cần ở web tier phải đi qua Route Handler contract rõ ràng.
- Không để browser gọi internal host trực tiếp chỉ vì edge case tiện tay hơn.

---

## Redirect contract

### `redirect()`

- Dùng cho:
  - auth guard redirect
  - post-submit success redirect
  - member shell guard flows
  - runtime navigation từ Server Component / Server Action / Route Handler
- Trong Server Action, coi `redirect()` là success-post-submit primitive chuẩn.

### `permanentRedirect()`

- Chỉ dùng khi canonical URL đã đổi thật:
  - slug đổi
  - username/profile path đổi
  - route mapping vĩnh viễn đổi
- Không dùng `permanentRedirect()` cho temporary auth flow hoặc UX step redirect.

### `proxy.ts` redirect rule

- Redirect dựa trên incoming request condition ở network boundary nên đi qua `proxy.ts`.
- Không đẩy logic redirect request-bound như auth-expired redirect sang client hacks hoặc page render side-effects.

---

## Prefetch contract

### Default stance

- Giữ automatic prefetch của `next/link` làm baseline.
- Automatic prefetch chỉ coi là behavior production; không đánh giá UX prefetch theo dev mode.

### Allowlist / denylist thinking

- Cho phép prefetch mặc định với:
  - primary nav
  - common sibling routes
  - high-probability next-step routes
- Có thể tắt prefetch với:
  - footer links
  - legal/help rarely used routes
  - routes nặng nhưng conversion thấp

### Custom prefetch rule

- Manual hoặc hover prefetch chỉ dùng cho high-intent surfaces.
- Nếu custom prefetch strategy bằng wrapper `Link` hoặc `useRouter().prefetch()`, team phải chịu trách nhiệm:
  - accessibility
  - cache invalidation correctness
  - avoiding wasteful downloads

### Side-effect purity rule

- Page/layout render path phải pure đủ để prefetch không kích side-effect.
- Analytics, tracking, write-ish logic không được chạy trực tiếp trong render path chỉ vì route có thể bị prefetch trước visit thật.

---

## Preserved UI state contract

### Baseline stance

- Với `cacheComponents: true`, route state/DOM state có thể được preserve qua navigation theo Activity model.
- `apps/web` phải coi đây là default runtime behavior, không phải edge case.

### Keep vs reset rule

- Preserve mặc định là đúng cho:
  - search inputs
  - filter panels
  - long draft forms
  - scroll position
  - expanded navigation groups
- Preserve mặc định là sai cho:
  - dropdown menus
  - transient popovers
  - one-shot success banners
  - dialogs cần init/focus mỗi lần mở

### Reset strategy

- State transient cần reset khi page/section bị hide nên dùng:
  - `useLayoutEffect` cleanup
  - callback ref cleanup cho form reset/style disable
  - URL/search-param derived state nếu interaction cần canonical open/close semantics
- Khi user identity đổi, user-scoped local state phải reset hoặc component phải key theo `userId`.

### Testing implication

- Hidden Activity content vẫn còn trong DOM nhưng `display: none`.
- E2E/test selectors phải visibility-aware; không dựa vào selector mù có thể match hidden content.

---

## Lazy loading contract

### Baseline stance

- Lazy loading chỉ áp dụng cho Client Components và imported libraries.
- Server Components không cần “lazy loading” theo kiểu client bundle tối ưu; route/code splitting đã là baseline.

### Good fits

- modal/drawer mở theo intent
- player/editor/search libraries nặng
- rarely used client widgets
- browser-only integrations

### Bad fits

- above-the-fold primary UI
- tiny leaf components
- component đang phải render ngay trong first paint

### `ssr: false` rule

- `ssr: false` chỉ dùng cho browser-only client component thật sự.
- Không dùng `ssr: false` như lối thoát khi component có bug hydration hoặc boundary đặt sai.

---

## Data security contract

### Server-only modules

- Module chứa DB access, secrets, internal service credentials, owner authorization logic phải ở server-only lane.
- Khi module có nguy cơ bị import nhầm vào client boundary, ưu tiên đánh dấu `server-only`.

### Server Actions

- Server Actions phải được coi là reachable qua direct `POST`.
- Mỗi action phải tự:
  - validate input
  - authenticate
  - authorize
  - constrain return value
- Page-level guard không thay cho action-level guard.

### DAL rule

- Read/write logic nhạy cảm ưu tiên đi qua Data Access Layer hoặc server helper layer riêng.
- `use server` file/action giữ mỏng:
  - parse input
  - gọi DAL/helper
  - revalidate/update/redirect theo flow
- Không để raw DB result trôi thẳng từ action ra client nếu UI không cần.

---

## Image contract

### Base rule

- Web dùng `next/image` làm mặc định cho image render, không dùng `<img>` bừa cho content/card/image surfaces.
- Mọi image phải có `alt` text hữu ích.

### Local images

- Asset tĩnh đặt ở `public/` khi phù hợp.
- Local static import được ưu tiên nếu image là stable asset vì Next có thể tự suy:
  - `width`
  - `height`
  - `blurDataURL`

### Remote images

- Remote image phải khai báo `images.remotePatterns` trong `next.config.ts`.
- Pattern phải specific tối đa, không allow host quá rộng.
- Với remote image phải cung cấp:
  - `width` + `height`
  - hoặc `fill`
  - optional `blurDataURL` nếu có strategy phù hợp

### Next.js 16 image security/runtime rules

- Không dùng `images.domains`; dùng `images.remotePatterns`.
- Không dùng `next/legacy/image`; dùng `next/image`.
- Nếu local image dùng query string, phải khai báo `images.localPatterns.search` rõ ràng.
- Không bật `images.dangerouslyAllowLocalIP` ở baseline; chỉ xem xét cho private-network case thật sự.
- Mặc định coi `images.maximumRedirects = 3`; không nới nếu chưa có case thật.
- Mặc định coi `images.qualities = [75]`; không phát sinh nhiều mức quality nếu chưa có nhu cầu thật.
- Mặc định tận dụng cache TTL mới của Next 16; không kéo xuống thấp chỉ vì thói quen cũ.

### CLS rule

- Không render image mà không khóa ratio.
- Mọi card/media image phải có ratio contract rõ:
  - card thumbnail
  - hero image
  - cover image
  - gallery item

### Placeholder rule

- `blur` chỉ dùng khi:
  - local static import
  - hoặc remote image có blur data thật
- Không fake blur pipeline ở bootstrap phase nếu chưa có nguồn metadata ổn định.

---

## Font contract

### Base rule

- Web dùng `next/font`, không nhúng webfont bằng external `<link>`.
- Font phải được self-host qua `next/font/google` hoặc `next/font/local`.

### PMTL mapping

- heading/body/sacred/mono mapping phải bám `design/02-platform-baseline/web-runtime/DESIGN_PRINCIPLES.md`.
- Ưu tiên variable fonts khi có thể.
- Root layout là nơi gắn font variables/classnames toàn app.

### Local vs Google

- Dùng `next/font/google` cho baseline fonts nếu đủ chất lượng và hỗ trợ tốt.
- Dùng `next/font/local` khi:
  - PMTL cần font custom
  - sacred surface cần local asset riêng
  - cần weight/style matrix không muốn phụ thuộc provider set

### Scope rule

- Font phải expose theo CSS variable hoặc app-wide class strategy ổn định.
- Không import font rời rạc mỗi page rồi tạo typography drift.

---

## Scaffold file contract

Ngay sau scaffold, `apps/web` phải có plan cho các file sau:

```text
src/app/layout.tsx
src/app/not-found.tsx
src/app/loading.tsx
src/app/global-error.tsx
src/components/theme-provider.tsx
src/components/providers.tsx
src/lib/fonts.ts
src/app/opengraph-image.jpg
src/app/favicon.ico
```

P0/P1 route groups nên bổ sung:

```text
src/app/(public)/loading.tsx
src/app/(auth)/loading.tsx
src/app/(member)/loading.tsx
src/app/(member)/error.tsx
```

---

## Completion bar

`apps/web` chưa được coi là scaffold-ready nếu chưa khóa:
- root layout/provider/file conventions
- loading/error/not-found policy
- metadata strategy
- image contract
- font contract
- async request API usage rule
