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
| Framework | **Next.js 15 App Router** | Server Components, SEO, streaming |
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
  → Server Actions hoặc mutations qua proxy cho writes
  → Invalidation sau mutation

Client state (UI only):
  → Zustand stores: themeStore, sidebarStore, practiceFormStore
  → Không giữ business data trong client state
  → Không dùng Redux, MobX, hoặc global store nặng
```

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

### Middleware

```typescript
// src/middleware.ts
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

- Admin SPA gọi `apps/api` qua **bearer token** (không dùng cookie auth)
- Token lưu trong memory (Zustand), refresh qua `/api/auth/admin/refresh`
- Hoặc: admin dùng cookie auth giống web nhưng với `ADMIN_ORIGIN` CORS — quyết định cuối nằm ở implementation
- **Admin KHÔNG bypass API contracts** — mọi action đều qua REST endpoints
- Admin routes phải có guard riêng (idle timeout 30 phút, max session 12 giờ)

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

## Performance budget (Phase 1)

| Metric | Target |
|---|---|
| LCP (Largest Contentful Paint) | < 2.5s |
| FID (First Input Delay) | < 100ms |
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
- Ref: `DECISIONS.md` section 13 cho library choices rationale
