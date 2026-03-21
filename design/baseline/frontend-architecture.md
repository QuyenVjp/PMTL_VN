# FRONTEND_ARCHITECTURE (Kiến trúc frontend)

File này chốt kiến trúc, library stack, và ranh giới cho `apps/web` và `apps/admin`.
Nếu mâu thuẫn với file khác, ưu tiên file này cho frontend decisions.

> **Skill refs**: `taste-skill`, `soft-skill`, `minimalist-skill`, `pmtl-creative-designer`, `pmtl-ui-behavior`, `pmtl-vercel-precision`
> **Component specs**: `design/ui/COMPONENT_SPECS.md`
> **Design principles**: `design/ui/DESIGN_PRINCIPLES.md`

---

## Apps overview

| App | Mô tả | Tech | Build |
|---|---|---|---|
| `apps/web` | Public + member surface | Next.js App Router | SSR/SSG via Next.js |
| `apps/admin` | Management surface (Phụng sự viên) | Vite + React SPA | Static SPA, served by Caddy |

---

## apps/web — Public + Member

### Stack

| Layer | Library | Lý do chọn |
|---|---|---|
| Framework | **Next.js 16 App Router** | Server Components, SEO, streaming |
| UI components | **shadcn/ui** | Composable, accessible, Tailwind-native |
| Styling | **Tailwind CSS 4** | Utility-first, design token integration |
| Forms | **React Hook Form + Zod** | Performant validation, shared schemas |
| Server state | **TanStack Query v5** | Cache, dedup, optimistic updates cho client components |
| Client state | **Zustand** (minimal) | Chỉ cho UI state (sidebar, modal, theme) |
| Icons | **Lucide React** | Tree-shakable, consistent |
| Date/Calendar | **date-fns** + lunar calendar lib | Lightweight, no Moment |
| Markdown | **react-markdown** + **rehype-sanitize** | Server-side sanitize cho rich text |
| Toast | **Sonner** | Accessible, stacking, auto-dismiss |
| Animation | **Framer Motion** (minimal) | Chỉ cho page transitions, không cho elderly-heavy screens |

### Data fetching strategy

```
Server Component (default)
  → fetch() với cookies() forwarding → apps/api
  → Dùng cho: read-heavy pages, SEO-critical content

Client Component (khi cần interactivity)
  → TanStack Query → /api/proxy/* → apps/api
  → Dùng cho: practice sheets, forms, real-time interactions
```

### Next.js 16 rules cần tận dụng

- Bật `cacheComponents: true` trong `next.config.ts` cho `apps/web`
- Public deterministic reads phải ưu tiên `use cache` + `cacheTag()` thay vì chỉ dựa vào `revalidate` số giây
- Runtime values như `cookies()` và `headers()` phải đọc **ngoài** cached scope rồi truyền vào như argument
- `after()` chỉ dùng cho side effects không-authoritative, nghĩa là **không thuộc request-response contract và chỉ best-effort**, như logging, analytics, soft counters; **không** dùng cho canonical write, auth, audit, rate-limit, cache invalidation mang tính correctness, hay security enforcement
- `use cache: remote` không bật ở phase 1; chỉ xem xét khi default runtime cache không đủ và đã có measured pain / cost justification
- `use cache: private` không dùng làm mặc định; chỉ dùng khi có compliance/runtime requirement thật sự không thể refactor
- Tooling/debugging nên ưu tiên Next.js DevTools + MCP workflow khi team cần inspect App Router behavior thay vì tự phát minh debug flow riêng

Ví dụ sai:
- dùng `after()` để append `audit_logs` cho write-path
- dùng `after()` để revoke session hoặc enforce rate-limit sau response

### Proxy boundary — Bug 8 fix (CRITICAL)

**Nguyên tắc bất biến**: Browser KHÔNG BAO GIỜ gọi `apps/api` trực tiếp.

```
Browser → apps/web (Next.js)
  ├── Server Component → server-side fetch → apps/api (internal network)
  └── Client Component → /api/proxy/* (Next.js Route Handler) → apps/api (internal network)
```

**Tại sao bắt buộc:**
- Rate-limit enforcement tại `apps/api` dựa trên trusted IP từ proxy header
- CSRF token validation yêu cầu cookie context đúng
- CORS chỉ allow `WEB_ORIGIN` và `ADMIN_ORIGIN` — direct browser call sẽ bị block
- Cookie `SameSite=Lax` + `HttpOnly` chỉ hoạt động đúng qua same-origin

**Implementation:**

```typescript
// apps/web/src/app/api/proxy/[...path]/route.ts
// Proxy tất cả client-side API calls tới apps/api
// Forward cookies, add X-Forwarded-For, strip sensitive headers
// KHÔNG thêm business logic — chỉ proxy
```

**Rules:**
- `apps/web/src/lib/api-client.ts` là single entry point cho mọi API call
- Server Components dùng `serverFetch()` — internal fetch với cookie forwarding
- Client Components dùng TanStack Query với `clientFetch()` — gọi qua `/api/proxy/*`
- **KHÔNG import `API_INTERNAL_URL` trong client code** — chỉ server-side biết địa chỉ thật
- Env var `API_INTERNAL_URL` (e.g. `http://api:3001`) chỉ có trong server runtime

### State strategy

```
Server state (canonical):
  → TanStack Query cache cho reads
  → Writes vẫn đi qua apps/api authority; web chỉ dùng Server Actions như transport helper hoặc revalidation helper
  → Invalidation sau mutation

Client state (UI only):
  → Zustand stores: themeStore, sidebarStore, practiceFormStore
  → Không giữ business data trong client state
  → Không dùng Redux, MobX, hoặc global store nặng
```

### Server Actions policy

- `apps/api` vẫn là backend authority; Server Actions **không** được giữ business logic chuẩn gốc
- Được phép dùng Server Actions cho:
  - form transport helper ở web server runtime
  - gọi internal `apps/api`
  - trigger `revalidateTag()` / `revalidatePath()`
  - UX glue code không làm thay đổi domain ownership
- Không dùng Server Actions để bypass:
  - auth policy
  - audit append
  - rate-limit
  - validation authority ở `apps/api`

### TanStack Query v5 rules cần tận dụng

- Dùng `queryOptions()` / `infiniteQueryOptions()` để co-locate `queryKey`, `queryFn`, `staleTime`, và type inference
- Dùng `useSuspenseQuery()` / `useSuspenseInfiniteQuery()` chỉ ở các client islands đã có `Suspense` boundary rõ; không ép toàn app sang suspense nếu UX loading chưa được thiết kế
- Dùng `skipToken` cho conditional query kiểu TypeScript-safe; nếu cần `refetch()` thủ công thì giữ `enabled: false`
- List/search/feed phải ưu tiên `useInfiniteQuery()` với cursor contract; không default offset pagination cho community/search nếu route có thể scroll dài
- `queryFn` phải tôn trọng `AbortSignal` để cancellation hoạt động đúng khi route đổi nhanh
- Mutation invalidation phải đi qua query key factory dùng chung; không hardcode query key string rải rác

### Route structure (Next.js App Router)

```
src/app/
├── (public)/           # Không cần auth
│   ├── page.tsx        # Landing / Homepage
│   ├── bai-viet/       # Posts
│   ├── kinh-sach/      # Sutras
│   ├── bai-hoa/        # Wisdom (Bạch thoại)
│   ├── tim-kiem/       # Search
│   └── huong-dan/      # Beginner guides
├── (auth)/             # Auth screens
│   ├── dang-nhap/
│   ├── dang-ky/
│   └── quen-mat-khau/
├── (member)/           # Cần auth — wrapped by auth middleware
│   ├── dashboard/
│   ├── tu-tap/         # Practice
│   ├── lich-ca-nhan/   # Personal calendar
│   ├── phat-nguyen/    # Vows
│   ├── tai-khoan/      # Profile
│   └── ngoai-tuyen/    # Offline
├── api/
│   └── proxy/[...path]/ # API proxy
└── layout.tsx
```

### Request boundary

```typescript
// src/proxy.ts
// 1. Check auth cookie cho (member) routes → redirect /dang-nhap nếu expired
// 2. Add security headers (CSP, X-Content-Type-Options, etc.)
// 3. Locale detection nếu cần
// KHÔNG chứa business logic
```

---

## apps/admin — Management (shadcn-admin pattern)

### Stack

| Layer | Library | Lý do chọn |
|---|---|---|
| Framework | **Vite + React** | SPA, fast build, không cần SSR |
| Router | **TanStack Router** | Type-safe, file-based, preloading |
| UI components | **shadcn/ui** | Shared design language với web |
| Layout | **shadcn/ui Sidebar** | Collapsible sidebar + header + main content |
| Data tables | **TanStack Table** | Sorting, filtering, pagination, column visibility |
| Forms | **React Hook Form + Zod** | Shared validation schemas từ `packages/shared` |
| Server state | **TanStack Query v5** | Cache, mutations, optimistic updates |
| Client state | **Zustand** | Theme, sidebar state, persisted preferences |
| Charts | **Recharts** (via shadcn/ui charts) | Dashboard visualizations |
| Command | **cmdk** | Command palette (⌘K) cho admin navigation |
| Toast | **Sonner** | Consistent với web |

### Architecture pattern (dựa trên shadcn-admin)

```
src/
├── routes/                # TanStack Router — file-based routing
│   ├── _authenticated/    # Auth-protected layout
│   │   ├── dashboard/
│   │   ├── noi-dung/      # Content management
│   │   ├── cong-dong/     # Community management
│   │   ├── kiem-duyet/    # Moderation queue
│   │   ├── nguoi-dung/    # User management
│   │   └── he-thong/      # System (feature flags, audit logs)
│   └── auth/              # Admin login
├── components/
│   ├── layout/            # Sidebar, Header, Main, SearchMenu
│   ├── data-table/        # Composable DataTable (TanStack Table wrapper)
│   └── ui/                # shadcn/ui components
├── features/              # Feature-sliced modules
│   ├── content/
│   ├── moderation/
│   ├── users/
│   └── system/
├── lib/
│   ├── api-client.ts      # Typed API client → apps/api
│   └── auth.ts            # Admin session management
└── stores/
    └── sidebar.ts         # Zustand store
```

### Admin layout

```
┌────────────────────────────────────────────────────────────┐
│ [≡] PMTL Admin                              [⌘K] [Avatar] │
├──────────┬─────────────────────────────────────────────────┤
│ Sidebar  │ Main Content Area                               │
│          │                                                  │
│ Dashboard│ ┌─ Breadcrumb ───────────────────────────┐      │
│ Nội dung │ │ Nội dung > Bài viết                    │      │
│ Cộng đồng│ └────────────────────────────────────────┘      │
│ Kiểm duyệt│                                               │
│ Người dùng│ ┌─ Content ────────────────────────────┐      │
│ Hệ thống │ │ DataTable / Forms / Detail views       │      │
│          │ │                                         │      │
│ [Collapse]│ └────────────────────────────────────────┘      │
└──────────┴─────────────────────────────────────────────────┘
```

### Admin data fetching

- Admin SPA dùng cookie auth cùng security baseline với web
- Session authority vẫn nằm ở `apps/api`; `apps/admin` chỉ forward credentials tới REST endpoints
- Nếu cần refresh flow, refresh token vẫn ở `HttpOnly` cookie và rotation do `apps/api` quản lý
- **Admin KHÔNG bypass API contracts** — mọi action đều qua REST endpoints
- Admin routes phải có guard riêng (idle timeout 30 phút, max session 12 giờ)
- Admin query layer cũng phải dùng `queryOptions()` / `mutationOptions()` để gom query key và tránh drift giữa table view / detail view / edit view
- Admin lists có khả năng dài (`users`, `reports`, `community posts`, `search ops`) nên ưu tiên cursor-capable contract ngay từ đầu, kể cả UI tạm render kiểu paginated table

### Command palette (⌘K)

```
Features:
- Tìm nhanh bài viết, người dùng, báo cáo
- Navigation shortcuts: "Đi tới kiểm duyệt", "Xem audit logs"
- Actions: "Tạo bài viết mới", "Xem reports pending"
- Keyboard-driven admin experience
```

---

## Shared packages

### `packages/shared`

Chỉ chứa framework-agnostic code:

```
packages/shared/src/
├── schemas/           # Zod schemas dùng chung (validation)
│   ├── auth.schema.ts
│   ├── content.schema.ts
│   └── search-document.schema.ts
├── contracts/         # Interface definitions cho cross-module communication
│   ├── wisdom-query.interface.ts
│   └── content-query.interface.ts
├── types/             # TypeScript types inferred từ Zod schemas
├── constants/         # Shared constants (roles, statuses, limits)
└── utils/             # Pure utility functions
```

**Rules:**
- Không import từ `apps/*` — chỉ apps import từ packages
- Không import runtime framework (NestJS, React, Next.js)
- Zod schemas là single source of truth cho validation — cả frontend và backend dùng chung

### `packages/ui` (optional phase 1)

Nếu cần shared UI primitives giữa web và admin:
- Chỉ chứa base shadcn/ui components đã customize
- Domain-specific UI sống trong từng app
- Không bắt buộc phase 1 — có thể copy components

---

## UI packages rule

- `packages/ui` chỉ giữ reusable primitives (Button, Input, Dialog, etc.)
- Domain UI sống trong từng app/feature
- Admin-specific components (DataTable, ModerationActions) sống trong `apps/admin`
- Web-specific components (PracticeSheet, ChantPlayer) sống trong `apps/web`

---

## Caching rule

- Public published reads: ISR hoặc `revalidate` tag từ Next.js
- User-private state: không cache ở CDN/shared cache
- Admin data: TanStack Query cache với short stale time (30s)
- Static assets (images, audio): CDN-cacheable với content hash

---

## Accessibility and elderly UX

- Ref đầy đủ: `design/ui/COMPONENT_SPECS.md` và `design/ui/DESIGN_PRINCIPLES.md`
- Min touch target: 44×44px (48px preferred)
- Min body font: 16px (17px+ cho practice screens)
- Contrast: WCAG AA minimum (4.5:1 text, 3:1 UI)
- Focus ring: visible, không `outline: none`
- Loading: skeleton pulse (không shimmer — elderly-friendly)
- Error messages: tiếng Việt dễ hiểu, không jargon kỹ thuật
- Practice screens: near-paper interface, minimal animation

---

## SEO strategy (Vietnam-focused)

> **Skills**: `seo-content-writer`, `on-page-seo-auditor`, `technical-seo-checker`, `meta-tags-optimizer`, `schema-markup-generator`, `geo-content-optimizer`

### Target audience

- **Chỉ người Việt Nam** — không cần i18n, không cần multi-language
- Tìm kiếm bằng tiếng Việt trên Google Vietnam (google.com.vn)
- Social sharing: Zalo, Facebook Vietnam
- AI citation: cần tối ưu cho ChatGPT, Perplexity, Google AI Overviews

### Server-rendered pages (Next.js)

- Mọi public page phải server-rendered cho SEO
- `<html lang="vi">` trên toàn bộ app
- URL slugs tiếng Việt: `/bai-viet`, `/niem-kinh`, `/phat-nguyen`, `/bai-hoa`
- `generateMetadata()` per page: title, description, og:image, canonical URL

### Meta tags (skill: `meta-tags-optimizer`)

```typescript
// Mỗi public page phải có:
export async function generateMetadata({ params }): Promise<Metadata> {
  return {
    title: `${post.title} | Pháp Môn Tâm Linh`,
    description: post.excerpt,  // 150-160 chars, tiếng Việt
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      locale: 'vi_VN',
      siteName: 'Pháp Môn Tâm Linh',
      images: [{ url: post.thumbnailUrl || '/og-default.jpg' }],
    },
    alternates: {
      canonical: `https://pmtl.vn/bai-viet/${post.slug}`,
    },
  };
}
```

### Schema markup / Structured data (skill: `schema-markup-generator`)

JSON-LD cho từng loại content:

| Content type | Schema.org type | Fields |
|---|---|---|
| Bài viết | `Article` | headline, datePublished, author, description, image |
| Hướng dẫn | `HowTo` | name, step[].text, totalTime |
| Bạch thoại Q&A | `FAQPage` | question, acceptedAnswer |
| Kinh sách | `Book` | name, author, description |
| Sự kiện lịch | `Event` | name, startDate, description |
| Trang chủ | `Organization` | name, url, logo, description |
| Breadcrumb | `BreadcrumbList` | itemListElement per route depth |

```typescript
// Ví dụ: Article JSON-LD
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Hướng dẫn niệm kinh cho người mới",
  "datePublished": "2026-03-20",
  "author": { "@type": "Organization", "name": "Pháp Môn Tâm Linh" },
  "publisher": { "@type": "Organization", "name": "Pháp Môn Tâm Linh" },
  "inLanguage": "vi",
  "description": "..."
}
</script>
```

### Technical SEO (skill: `technical-seo-checker`)

- `sitemap.xml` auto-generated từ published content (Next.js `sitemap.ts`)
- `robots.txt`: allow public, disallow `/dashboard`, `/tu-tap`, `/tai-khoan`, `/admin`
- Core Web Vitals targets: LCP < 2.5s, CLS < 0.1, INP < 200ms
- Mobile-first indexing: responsive design, no separate mobile site
- HTTPS enforced (Caddy + Cloudflare)
- Canonical URLs trên mọi page

### GEO — AI citation optimization (skill: `geo-content-optimizer`)

Tối ưu content để được AI (ChatGPT, Perplexity, Google AI Overviews) trích dẫn:

- **Quotable statements**: Mỗi bài viết có 2-3 câu tóm tắt rõ ràng, dễ trích
- **Structured Q&A**: Bạch thoại / Q&A format tự nhiên phù hợp AI extraction
- **Source attribution rõ ràng**: "Theo Pháp Sư Tịnh Không" — AI cần nguồn để cite
- **Expert authority (E-E-A-T)**: Nội dung từ nguồn uy tín, có provenance rõ
- **FAQ sections**: Cuối bài viết có FAQ → tăng khả năng xuất hiện trong AI answers

### On-page SEO (skill: `on-page-seo-auditor`)

- H1 unique per page, H2-H3 hierarchy rõ ràng
- Image alt text tiếng Việt mô tả nội dung
- Internal linking giữa bài viết liên quan
- Content length: bài viết chính ≥ 800 từ
- Keyword placement tự nhiên trong title, H1, first paragraph

### Social sharing (Vietnam-specific)

- Open Graph optimized cho Facebook Vietnam + Zalo
- `og:locale` = `vi_VN`
- OG image: 1200×630px, có tiêu đề tiếng Việt trên hình
- Phase 1: static fallback OG image per content type
- Phase 2+: dynamic OG images via `@vercel/og`

---

## Language policy (Chỉ tiếng Việt)

- **Dự án chỉ dành cho người Việt Nam** — không cần i18n framework
- UI text: hardcoded tiếng Việt
- URL slugs: tiếng Việt (`/bai-viet`, `/niem-kinh`, `/phat-nguyen`)
- Date format: `DD/MM/YYYY` + âm lịch display
- Nội dung Phật pháp: tiếng Việt + tiếng Hoa gốc (bilingual content ở tầng data, không phải UI i18n)
- **Không cần**: `next-intl`, `next-i18next`, hreflang, locale routing, language switcher

---

## PWA / Offline strategy

### Phase 1 — Minimal offline

- Service worker cho asset caching (CSS, JS, fonts)
- Offline banner khi mất mạng (`OfflineBanner` component)
- Wisdom-QA offline bundles: download → IndexedDB → read offline
- Ref: `10-wisdom-qa/offline-bundle-delta-sync.md` cho delta sync protocol

### Phase 2+ — Full PWA

- `next-pwa` hoặc custom service worker
- Cache-first cho public content pages đã visited
- Background sync cho practice logs (ghi offline → sync khi có mạng)
- App install prompt cho mobile users
- Push notifications qua service worker

### Offline data storage

```
IndexedDB (via idb library):
  - wisdom_entries: downloaded bundles
  - practice_drafts: unsaved practice logs
  - user_preferences: cached settings

NOT offline:
  - Auth state (phải online để verify)
  - Upload (phải online)
  - Community actions (phải online)
```

---

## Caching strategy (canonical)

| Layer | What | TTL | Invalidation |
|---|---|---|---|
| **CDN (Cloudflare)** | Static assets (JS, CSS, images, fonts) | Long (1 year with hash) | Content hash change |
| **CDN (Cloudflare)** | Public pages (ISR) | Short (60s–5min) | Revalidate on publish |
| **Next.js** | Server Component data | `revalidate` tag | On-demand revalidation after write |
| **TanStack Query** | Client-side server state | `staleTime: 30s` (default) | `invalidateQueries` after mutation |
| **Browser** | Service worker cache | Cache-first for assets | Service worker update |
| **NOT cached** | User-private state | Never | Always fresh from API |
| **NOT cached** | Admin data | TanStack Query only (30s stale) | Invalidate after action |

**Rules:**
- Public published content: cacheable
- User-private state: never shared cache
- Admin actions: optimistic update + invalidate
- Upload responses: no-cache
- Auth endpoints: no-cache, no-store

---

## Performance budget (Phase 1)

| Metric | Target |
|---|---|
| LCP (Largest Contentful Paint) | < 2.5s |
| INP (Interaction to Next Paint) | < 200ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| JS bundle (web initial) | < 150KB gzipped |
| JS bundle (admin initial) | < 200KB gzipped |

---

## Notes for AI/codegen

- Frontend không giữ business authority — mọi write đi qua `apps/api`
- Frontend không tự bịa contract ngoài `apps/api`
- Browser không bao giờ biết `API_INTERNAL_URL` — chỉ gọi qua proxy hoặc server actions
- Admin SPA không bypass API contracts — admin actions = REST calls giống web
- Zod schemas trong `packages/shared` là shared validation — cả FE và BE dùng
- Ref: `DECISIONS.md` section 14 cho library choices rationale
