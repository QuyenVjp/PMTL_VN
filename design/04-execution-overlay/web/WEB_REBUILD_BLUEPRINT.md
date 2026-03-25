# WEB_REBUILD_BLUEPRINT (Bản thiết kế rebuild `apps/web`)

File này chốt hướng rebuild cho `apps/web` trước khi xóa web cũ.

Nó trả lời 4 câu:

1. `design/` đã đủ để rebuild chưa
2. starter nào được chọn cho web mới
3. `apps/web` mới phải có cấu trúc gì
4. cái gì được phép đẹp, cái gì không được làm quá tay

> File này là `implementation blueprint (bản thiết kế triển khai)`, không thay `frontend-architecture.md`, `PAGE_INVENTORY.md`, hay owner docs module.
> Nếu blueprint này mâu thuẫn với owner docs, owner docs thắng.

---

## 1. Verdict ngắn

`design/` hiện **đủ để bắt đầu rebuild `apps/web`** theo phase có kiểm soát.

Đúng nghĩa là:
- đủ để scaffold lại app shell
- đủ để chốt stack
- đủ để chốt route groups
- đủ để chốt visual/system baseline
- đủ để code theo vertical slice và theo journey

Không có nghĩa là:
- muốn code lan route nào cũng được
- muốn bịa aggregate nào cũng được
- muốn lấy template ngoài về rồi ép ngược `design/`

Nguồn đọc bắt buộc trước khi rebuild:
- [frontend-architecture.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/web-runtime/FRONTEND_ARCHITECTURE.md)
- [PAGE_INVENTORY.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/web/PAGE_INVENTORY.md)
- [USER_FLOWS.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/web/USER_FLOWS.md)
- [COMPONENT_SPECS.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/web-runtime/COMPONENT_SPECS.md)
- [DESIGN_PRINCIPLES.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/web-runtime/DESIGN_PRINCIPLES.md)
- [ROUTE_PAGE_CONTRACTS.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/web/ROUTE_PAGE_CONTRACTS.md)
- [AUTH_UX_CONTRACT.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/web-runtime/AUTH_UX_CONTRACT.md)
- [SEARCH_UX_CONTRACT.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/web-runtime/SEARCH_UX_CONTRACT.md)
- [CONTENT_RENDERING_CONTRACT.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/web-runtime/CONTENT_RENDERING_CONTRACT.md)
- [TOKEN_IMPLEMENTATION_SHEET.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/web/TOKEN_IMPLEMENTATION_SHEET.md)
- [PRESERVED_UI_STATE_MATRIX.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/web/PRESERVED_UI_STATE_MATRIX.md)
- [implementation-mapping.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md)
- [web-query-invalidation-plan.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/web/WEB_QUERY_INVALIDATION_PLAN.md)
- [web-app-router-file-contract.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/web/WEB_APP_ROUTER_FILE_CONTRACT.md)
- [web-cache-revalidation-contract.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/web/WEB_CACHE_REVALIDATION_CONTRACT.md)

---

## 2. Starter chốt cho `apps/web` mới

### Starter decision

Chốt dùng:

1. `create-next-app@latest` để tạo `Next.js App Router shell`
2. `shadcn@latest init` để dựng component system
3. `Radix UI primitives` làm interaction/accessibility foundation
4. `Motion v12` làm animation layer có kiểm soát
5. `React Bits` chỉ dùng chọn lọc cho accent blocks, không làm nền hệ thống

### Vì sao chọn như vậy

`create-next-app@latest`:
- đúng hướng chính thức của Next.js
- sạch, ít opinion thừa
- hợp để dựng lại trong monorepo

`shadcn/ui`:
- đúng với [frontend-architecture.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/web-runtime/FRONTEND_ARCHITECTURE.md)
- đúng với [COMPONENT_SPECS.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/web-runtime/COMPONENT_SPECS.md)
- đẹp, nhanh, maintainable

`Radix UI`:
- giải quyết interaction primitives khó như dialog, select, tabs, dropdown, toast
- accessibility tốt hơn tự build tay

`Motion v12`:
- đủ cho dialog/sheet enter-exit, hover states, in-view reveal, page transitions nhẹ
- hợp với PMTL nếu dùng như `motion layer (lớp chuyển động)` chứ không biến cả app thành animation demo

`React Bits`:
- chỉ nên dùng ở hero, CTA, spotlight, decorative motion blocks
- không dùng làm nền cho practice flows, forms, tracker, reading pages

### Official reference direction

- Next.js install / App Router: official Next.js docs
- shadcn/ui install for Next.js + monorepo: official shadcn docs
- shadcn/ui forms / Tailwind v4 / React 19 / monorepo docs là reference chính thức khi scaffold
- Radix primitives: official Radix docs

### shadcn usage policy

Mình học từ shadcn theo đúng tinh thần:
- `Open Code (mã mở, copy vào repo mình)`
- `Composition (ghép component tự do)`
- `Distribution (phân phối qua CLI/registry)`
- `Beautiful Defaults (mặc định đẹp)`
- `AI-Ready (thân thiện với AI coding)`

Nhưng khi vào PMTL thì chốt thành rule:
- dùng `shadcn CLI` để add component theo nhu cầu thật
- ưu tiên docs chính thức của `Next.js`, `Monorepo`, `Tailwind v4`, `Forms`, `React 19`
- chỉ dùng `registry` hoặc `MCP` của shadcn như nguồn tham khảo/install helper, không để nó override PMTL design canon
- component nào add vào phải map được về `COMPONENT_SPECS.md` hoặc route/flow thật

### Monorepo policy

PMTL là monorepo nên khi dùng shadcn phải theo logic monorepo của CLI, không cài theo kiểu repo đơn.

Chốt rule:
- `apps/web` là workspace app
- `packages/ui` là workspace component source
- component UI primitives dùng chung phải được add từ `apps/web`, nhưng file nguồn UI nên đi vào `packages/ui`
- app-specific composition như `login-form`, `hero-entry-grid`, `practice-guide-drawer` mới được nằm ở `apps/web`
- không copy cùng một primitive vào cả `apps/web` và `packages/ui`

### `components.json` policy

Mỗi workspace liên quan phải có `components.json` riêng:
- `apps/web/components.json`
- `packages/ui/components.json`

Các quyết định này coi như **khóa cứng cho lần init đầu**:
- `style = new-york`
- `tailwind.baseColor = taupe`
- `tailwind.cssVariables = true`
- `rsc = true`
- `tsx = true`
- `tailwind.prefix = ""` (không dùng prefix)

Hai file này phải giữ đồng bộ các field:
- `style`
- `iconLibrary`
- `tailwind.baseColor`
- `tailwind.cssVariables`

Với Tailwind v4:
- để `tailwind.config` rỗng trong `components.json`
- mặc định `tailwind.cssVariables = true`
- dùng `background/foreground` color convention của shadcn làm naming baseline
- chưa bật `registries` custom ở bootstrap phase; chỉ dùng shadcn public registry / default install flow

Alias direction cần chốt theo monorepo:

`apps/web/components.json`
- `components`: `@/components`
- `hooks`: `@/hooks`
- `lib`: `@/lib`
- `utils`: `@pmtl/ui/lib/utils`
- `ui`: `@pmtl/ui/components`

`packages/ui/components.json`
- `components`: `@pmtl/ui/components`
- `hooks`: `@pmtl/ui/hooks`
- `lib`: `@pmtl/ui/lib`
- `utils`: `@pmtl/ui/lib/utils`
- `ui`: `@pmtl/ui/components`

### Where to run the CLI

Khi add component:
- chạy lệnh trong `apps/web`
- để CLI tự quyết định file nào vào `packages/ui`, file nào ở lại `apps/web`

Ví dụ:
- add `button` -> primitive shared, nên đi vào `packages/ui`
- add block/page fragment như `login-01` -> primitive vào `packages/ui`, composition app-specific vào `apps/web`

### Exact scaffold recipe được khuyến nghị

Từ repo root:

```powershell
pnpm create next-app@latest apps/web --ts --eslint --tailwind --app --src-dir --import-alias "@/*" --use-pnpm
```

Sau đó trong `apps/web`:

```powershell
pnpm dlx shadcn@latest init
```

Nếu shadcn CLI hỏi:
- framework: `Next.js`
- style: `new-york`
- base color: `taupe`
- component path: `src/components`
- utils path: `src/lib/utils.ts`
- css file: `src/app/globals.css`
- use CSS variables: `yes`
- React Server Components: `yes`
- TypeScript components: `yes`
- Tailwind prefix: để trống

Sau scaffold:
- `package.json` scripts dùng:
  - `next dev`
  - `next build`
  - `next start`
- không thêm `--turbopack` vì Next 16 đã dùng Turbopack mặc định
- nếu sau này có custom `webpack` config thật, phải ra quyết định rõ:
  - migrate sang Turbopack
  - hoặc `build --webpack`
  - không để state nửa mùa

### Dark mode policy

- Web mới hỗ trợ dark mode ngay từ bootstrap.
- Dùng `next-themes` với `attribute="class"`.
- Root layout phải có `suppressHydrationWarning` ở thẻ `html`.
- Phải có `ThemeProvider` riêng ở `src/components/theme-provider.tsx`.
- shadcn Next.js dark-mode guide xác nhận đúng wiring này; PMTL chỉ override phần UX defaults.
- Phải có mode toggle, nhưng đặt tiết chế.

Quyết định UX:
- `defaultTheme = "light"`
- `enableSystem = false`
- `disableTransitionOnChange = true`

Lý do:
- PMTL là `light-first`
- tránh system tự lật theme trên reading surfaces
- vẫn cho user quyền đổi theme khi họ thật sự muốn

### Starter không được chọn

Không dùng làm starter gốc:
- template dashboard ngẫu nhiên ngoài GitHub
- block pack nặng animation làm base
- full AI-generated landing starter không có owner docs
- theme marketplace đậm dark SaaS/purple bias

### Component acquisition notes từ shadcn docs

- `calendar` dùng shadcn `Calendar` trên `react-day-picker`; chỉ add khi route có nhu cầu thực như `/lich-ca-nhan` hoặc date-range filter.
- `date-picker` không phải primitive riêng; nó là composition của `Popover + Calendar`.
- `sidebar` là shell primitive thật cho member app, phải có `SidebarProvider` từ layout boundary.
- `data-table` không coi là “bật mặc định”; nó là pattern guide trên `table` + `@tanstack/react-table`, nên chỉ add khi route cần behavior grid thật.
- `carousel` dùng Embla dưới shadcn wrapper; chỉ add khi có nhiều slides thật và justified interaction value, không dùng như default homepage garnish.
- `typography` docs chỉ là utility reference, không phải component authority cho content renderer.

### Motion reference stance

- Motion official docs xác nhận import baseline `motion/react`.
- Motion được phép cho:
  - gesture states
  - enter/exit
  - layout transitions
  - selected scroll-triggered reveals
- Với animation nhỏ, self-contained, CSS vẫn là lựa chọn ưu tiên.

---

## 3. Stack chốt cho web mới

| Layer | Chốt dùng | Ghi chú |
|---|---|---|
| Framework | `Next.js 16 App Router` | server-first |
| Language | `TypeScript` | bắt buộc |
| Styling | `Tailwind CSS 4.2` | CSS-variable theme, logical utilities, neutral palette mới |
| UI system | `shadcn/ui` | nền component |
| Primitives | `Radix UI` | accessibility + interaction |
| Animation | `Motion v12` | motion có kiểm soát, không phô trương |
| Forms | `react-hook-form + zod` | cho interactive forms |
| Server state | `@tanstack/react-query` | chỉ cho client-side interactive state |
| Toast | `sonner` | theo frontend baseline |
| Icons | `lucide-react` | thống nhất |
| Theme runtime | `next-themes` | class-based dark mode support |
| Optional accent | `React Bits` | chỉ cho premium sections |

### Không chốt cho phase bootstrap

- Redux
- global state nặng
- direct browser calls sang `apps/api`
- AI/LLM widgets
- real-time
- Meilisearch-only assumptions

### Form contract

Interactive forms của `apps/web` khóa theo lane sau:
- form engine: `react-hook-form`
- schema validation: `zod`
- resolver: `@hookform/resolvers/zod`
- UI anatomy: shadcn `form`, `field`, `field-label`, `field-description`, `field-error`, `field-set`, `field-legend`, `field-group`

Pattern chuẩn:
- `Input` và `Textarea`: bind trực tiếp từ `field`
- `Select`, `Switch`, `Checkbox`, `RadioGroup`, `Input OTP`, `Date Picker` và control headless khác: đi qua `Controller`
- dynamic rows như email list, vow sub-items, practice items, CTA collections: đi qua `useFieldArray`

Validation mode mặc định theo loại form:
- auth forms: `onSubmit` hoặc `onBlur`
- profile/settings forms: `onBlur`
- search/filter nhẹ: chỉ được `onChange` khi field ít và feedback cần tức thời
- complex write forms: không dùng `onChange` toàn bộ nếu gây nhiễu UX

Accessibility/error contract:
- `Field` phải nhận `data-invalid` khi có lỗi
- form control phải nhận `aria-invalid`
- lỗi phải render ra text thật qua `FieldError`, không chỉ đổi màu viền
- help text và error text phải gắn được với field qua markup/accessibility wiring của shadcn

### Query/cache contract

- `apps/web` phải scaffold query layer theo [web-query-invalidation-plan.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/web/WEB_QUERY_INVALIDATION_PLAN.md).
- Mọi feature query phải đi qua:
  - feature-local query key factory
  - `queryOptions()` hoặc `infiniteQueryOptions()`
  - invalidate helper thay vì hardcode raw arrays trong component
- Query key shape ưu tiên:
  - `['resource', 'list', { ...filters }]`
  - `['resource', 'detail', slugOrId]`
  - `['resource', 'aux', ...]`
- `useSuspenseQuery()` không là mặc định; chỉ dùng cho stable client islands có `Suspense` boundary rõ.
- Lane cần cancellation-sensitive behavior như typeahead, quick filters, search query đổi nhanh phải dùng `useQuery()`, không dùng suspense lane.
- Nếu mutation làm đổi public cached surface, phải đi cả 2 đường:
  - invalidate TanStack Query keys liên quan
  - server-side revalidation owner theo `cache-topology.md`
- RSC/page cache semantics phải bám [web-cache-revalidation-contract.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/web/WEB_CACHE_REVALIDATION_CONTRACT.md):
  - cached reads dùng `'use cache'` + `cacheTag()` + `cacheLife()`
  - tag invalidation mặc định dùng `revalidateTag(tag, 'max')`
  - không dùng single-arg `revalidateTag(tag)` pattern cũ
- `refresh()` chỉ dùng trong Server Actions như router/UI helper
- `updateTag()` chỉ dùng trong Server Actions cho read-your-own-writes
- `'use client'` chỉ mở ở entry boundary cần state/effects/browser APIs
- `'use server'` chỉ dùng cho server actions/helper bridge, không thay domain authority của `apps/api`
- `'use cache'` chỉ cho deterministic server reads; runtime values phải đọc ngoài cached scope rồi truyền vào bằng args serializable
- redirect sau mutation phải tách rõ:
  - `redirect()` chỉ lo navigation
  - invalidation freshness vẫn phải đi qua `updateTag()` hoặc `revalidateTag()`

### App Router file contract

- Special files và root layout conventions của web phải scaffold theo [web-app-router-file-contract.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/web/WEB_APP_ROUTER_FILE_CONTRACT.md).
- Root `app/layout.tsx` phải:
  - giữ `<html>` + `<body>`
  - không tự viết `<head>` thủ công
  - gắn fonts/providers/theme theo contract
- `error.tsx` phải là client component.
- `global-error.tsx` phải tự mang `<html>` + `<body>`.
- `loading.tsx` phải ưu tiên skeleton meaningful, không spinner-only cho content-heavy routes.
- `not-found.tsx` là bắt buộc ở root; segment detail routes được phép có bản riêng nếu cần CTA owner-aware.
- `next/image` là default cho image surfaces; remote sources phải được allowlist bằng `images.remotePatterns`.
- `next/font` là default cho font loading; không dùng external font `<link>` như baseline.
- `metadata` object / `generateMetadata()` là đường duy nhất cho head metadata; detail pages ưu tiên `generateMetadata()`.
- `cookies()`, `headers()`, `params`, `searchParams` phải được xử lý theo async contract của Next 16; không code theo sync pattern cũ.
- network boundary file dùng `proxy.ts`, không scaffold `middleware.ts` như baseline mới.
- boundary chi tiết của `'use client'`, `'use server'`, `'use cache'` phải bám [web-app-router-file-contract.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/web/WEB_APP_ROUTER_FILE_CONTRACT.md) và [web-cache-revalidation-contract.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/web/WEB_CACHE_REVALIDATION_CONTRACT.md).
- Route Handlers ở web tier chỉ dành cho proxy/BFF edge, metadata edge, và file/web concerns thật sự cần; không dựng business API song song với `apps/api`.
- streaming/prefetch/environment/forms semantics phải bám owner canon, không tự invent local pattern trong lúc scaffold.
- lazy loading chỉ là optimization cho client widgets/libs; không dùng `ssr: false` như baseline escape hatch.

---

## 4. Cấu trúc `apps/web` mới

```text
apps/web/
├── AGENTS.override.md
├── package.json
├── next.config.ts
├── components.json
├── tsconfig.json
├── public/
└── src/
    ├── app/
    │   ├── (public)/
    │   ├── (auth)/
    │   ├── (member)/
    │   ├── api/
    │   │   └── proxy/[...path]/
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── loading.tsx
    │   └── not-found.tsx
    ├── features/
    │   ├── home/
    │   ├── content/
    │   ├── daily-practice/
    │   ├── little-house/
    │   ├── wisdom/
    │   ├── search/
    │   ├── auth/
    │   └── member-shell/
    ├── components/
    │   ├── ui/
    │   ├── layout/
    │   ├── cards/
    │   ├── navigation/
    │   └── feedback/
    ├── lib/
    │   ├── api-client.ts
    │   ├── cache/
    │   │   ├── profiles.ts
    │   │   └── tags.ts
    │   ├── env.ts
    │   ├── logger.ts
    │   ├── query/
    │   ├── server/
    │   │   └── env.ts
    │   └── utils.ts
    └── styles/
        └── tokens.css
packages/
└── ui/
    ├── components.json
    └── src/
        ├── components/
        ├── hooks/
        ├── lib/
        └── styles/
```

### Deployment assumption

- `apps/web` scaffold theo target:
  - Node.js server
  - hoặc Docker container chạy `next start`
- Không scaffold theo `static export` baseline vì PMTL web cần:
  - `proxy.ts`
  - Server Actions
  - streaming
  - Cache Components

### Route groups chốt

`(public)`:
- `/`
- `/bai-viet`
- `/bai-viet/[slug]`
- `/ngoi-nha-nho/*`
- `/kinh-bai-tap/*`
- `/kinh-van-tu-tu/*`
- `/bach-thoai/*`
- `/hoi-dap/*`
- `/tim-kiem`

`(auth)`:
- `/dang-nhap`
- `/dang-ky`
- `/quen-mat-khau`
- `/xac-nhan-email`

`(member)`:
- `/dashboard`
- `/tu-tap/bai-tap`
- `/tu-tap/nha-nho`
- `/lich-ca-nhan`
- `/phat-nguyen`
- `/ngoai-tuyen`
- `/tai-khoan`

### Boundary rules

- route files chỉ làm page/layout/loading/error composition
- feature logic ở `src/features/*`
- shared visual primitives ở `src/components/*`
- `apps/api` vẫn là authority cho auth và business writes
- browser không gọi `apps/api` trực tiếp
- primitive dùng lại nhiều nơi ưu tiên đi vào `packages/ui`
- app-specific composite component ưu tiên nằm ở `apps/web`

---

## 5. Visual direction chốt

### Design language

Web mới phải đi theo `Contemplative Premium (cao cấp, tĩnh, ấm, trang nghiêm)` từ [DESIGN_PRINCIPLES.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/web-runtime/DESIGN_PRINCIPLES.md).

Không được rơi vào:
- dark SaaS dashboard look
- generic AI landing page look
- fintech gradients
- purple neon
- glassmorphism lạm dụng
- motion phô trương

### Nền visual đúng

- nền sáng ấm
- serif headings có chủ đích
- body sans rõ, dễ đọc
- card sạch, bo vừa phải
- whitespace rộng
- accent vàng ấm, không chói
- neutral support palette từ Tailwind như `taupe`, `mauve`, `mist`, `olive` chỉ dùng để làm nền phụ, border dịu, surface muted, không thay palette PMTL

### Component foundation

Seed component set nên add sớm bằng shadcn:
- `button`
- `card`
- `input`
- `textarea`
- `label`
- `select`
- `checkbox`
- `radio-group`
- `tabs`
- `accordion`
- `dialog`
- `sheet`
- `dropdown-menu`
- `navigation-menu`
- `tooltip`
- `separator`
- `scroll-area`
- `badge`
- `avatar`
- `skeleton`
- `breadcrumb`
- `form`
- `sonner`
- `command`
- `drawer`

### Component acquisition order

Khi scaffold lại `apps/web`, ưu tiên add component theo đúng taxonomy của shadcn:

1. `Form & Input`
   - `form`, `field`, `button`, `input`, `textarea`, `checkbox`, `radio-group`, `select`, `switch`, `label`
2. `Layout & Navigation`
   - `accordion`, `breadcrumb`, `navigation-menu`, `sidebar`, `tabs`, `separator`, `scroll-area`
3. `Overlays & Dialogs`
   - `dialog`, `alert-dialog`, `sheet`, `drawer`, `popover`, `tooltip`, `dropdown-menu`, `command`
4. `Feedback & Status`
   - `alert`, `sonner`, `progress`, `spinner`, `skeleton`, `badge`, `empty`
5. `Display & Media`
   - `avatar`, `card`, `table`, `carousel`, `aspect-ratio`, `typography`

Không add ngay từ đầu:
- `data-table`
- `chart`
- `resizable`
- `menubar`
- `context-menu`
- `pagination`

trừ khi route/flow thật của PMTL đã cần chúng.

### Tailwind usage policy

- Ưu tiên `CSS variables + theme tokens` để giữ visual system nhất quán.
- Theme strategy mặc định là shadcn CSS variables, không dùng utility-only theming làm nền hệ thống.
- Naming baseline:
  - `background`
  - `foreground`
  - `card`
  - `card-foreground`
  - `popover`
  - `popover-foreground`
  - `primary`
  - `primary-foreground`
  - `secondary`
  - `secondary-foreground`
  - `muted`
  - `muted-foreground`
  - `accent`
  - `accent-foreground`
  - `destructive`
  - `destructive-foreground`
  - `border`
  - `input`
  - `ring`
- Ưu tiên logical utilities của Tailwind khi layout cần trung tính theo hướng viết:
  - `ps-*`, `pe-*`
  - `scroll-ps-*`, `scroll-pe-*`
  - `inline-*`, `min-inline-*`, `max-inline-*`
  - `block-*`, `min-block-*`, `max-block-*`
- Chỉ dùng `left/right/w/h` khi đang diễn đạt layout vật lý thật sự; còn layout semantic nên ưu tiên logical utilities.
- Không lạm dụng custom CSS nếu utility và token đã đủ diễn đạt.
- Khi thêm semantic color mới như `warning`, `success`, `info`, phải:
  - thêm token ở `:root`
  - thêm token ở dark variant nếu sau này bật dark mode
  - expose qua `@theme inline`
  - chỉ sau đó mới dùng utility kiểu `bg-warning`, `text-warning-foreground`

### React Bits usage policy

`Motion v12` được dùng cho:
- dialog/sheet open-close
- dropdown/popup fade-slide rất nhẹ
- homepage hero reveal
- section in-view reveal
- card hover elevation nhẹ

Không dùng `Motion` cho:
- tracker đang nhập dữ liệu
- practice sheet dài
- reader kinh sách
- elderly-heavy screens cần ổn định cao

`React Bits` được dùng cho:
- homepage hero accent
- featured entry cards animation nhẹ
- CTA endcap
- spotlight sections

Không dùng `React Bits` cho:
- reading pages
- sutra text
- practice sheet
- tracker
- auth forms
- elderly-heavy interaction screens

---

## 6. Wave plan cho rebuild web

### Wave 0 — shell

Mục tiêu:
- app boot được
- layout base có
- global tokens có
- nav/footer shell có
- `/`, `/dang-nhap`, `/dashboard` có placeholder skeleton đúng style

### Wave 1 — public content foundation

Ưu tiên:
- homepage `/`
- `/kinh-bai-tap`
- `/kinh-bai-tap/luu-y/thoi-gian-va-dia-diem`
- `/ngoi-nha-nho`
- `/tim-kiem`

Lý do:
- khớp content-first direction
- khớp first slice environment rules
- ít auth complexity hơn

### Wave 2 — auth + member shell

Ưu tiên:
- `/dang-nhap`
- `/dang-ky`
- `/dashboard`
- `/lich-ca-nhan`
- shared member layout

### Wave 3 — practice flows

Ưu tiên:
- `/tu-tap/bai-tap`
- `/tu-tap/nha-nho`
- companion guide drawer patterns

### Wave 4 — deeper public library

Ưu tiên:
- `Bạch thoại`
- `Hỏi đáp`
- `Kinh sách`
- offline bridge surfaces

---

## 7. Điều không được phép trong rebuild

- không lấy template ngoài rồi map business sau
- không hardcode content canon vào component nếu design đã có owner docs
- không nhét business logic vào `page.tsx`
- không biến whole app thành demo animation
- không gọi thẳng `apps/api` từ browser
- không dùng client components tràn lan
- không tạo design system mới đè lên PMTL design principles

---

## 8. Chốt cuối

`apps/web` mới phải là:
- `Next.js latest shell (vỏ app Next.js mới nhất)`
- `shadcn/ui foundation (nền giao diện shadcn/ui)`
- `Radix accessibility primitives (nền tương tác dễ truy cập của Radix)`
- `PMTL design language (ngôn ngữ thiết kế PMTL)`
- `server-first architecture (kiến trúc ưu tiên xử lý phía server)`

Nó **không** được là:
- template đẹp nhưng vô hồn
- dashboard SaaS đổi màu
- landing page agency không map được route thật
- app quá nhiều hiệu ứng làm hỏng cảm giác tu tập
