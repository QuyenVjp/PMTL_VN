# FRONTEND_ARCHITECTURE (Kiến trúc frontend)

File này chốt kiến trúc, library stack, và ranh giới cho `apps/web` và `apps/admin`.
Nếu mâu thuẫn với file khác, ưu tiên file này cho frontend decisions.

> **Skill refs**: `taste-skill`, `soft-skill`, `minimalist-skill`, `pmtl-creative-designer`, `pmtl-ui-behavior`, `pmtl-vercel-precision`
> **Component specs**: `design/02-platform-baseline/web-runtime/COMPONENT_SPECS.md`
> **Design principles**: `design/02-platform-baseline/web-runtime/DESIGN_PRINCIPLES.md`
> **React runtime policy**: `design/02-platform-baseline/web-runtime/REACT_RUNTIME_POLICY.md`
> **Route page contracts**: `design/04-execution-overlay/web/ROUTE_PAGE_CONTRACTS.md`
> **Auth UX**: `design/02-platform-baseline/web-runtime/AUTH_UX_CONTRACT.md`
> **Search UX**: `design/02-platform-baseline/web-runtime/SEARCH_UX_CONTRACT.md`
> **Content rendering**: `design/02-platform-baseline/web-runtime/CONTENT_RENDERING_CONTRACT.md`
> **Token sheet**: `design/04-execution-overlay/web/TOKEN_IMPLEMENTATION_SHEET.md`
> **Preserved UI state matrix**: `design/04-execution-overlay/web/PRESERVED_UI_STATE_MATRIX.md`
> **Component trigger map**: `design/04-execution-overlay/web/COMPONENT_TRIGGER_MAP.md`
> **Motion route inventory**: `design/04-execution-overlay/web/MOTION_ROUTE_INVENTORY.md`
> **Image/media ratio map**: `design/04-execution-overlay/web/IMAGE_MEDIA_RATIO_MAP.md`
> **Web query plan**: `design/04-execution-overlay/web/WEB_QUERY_INVALIDATION_PLAN.md`
> **App Router file contract**: `design/04-execution-overlay/web/WEB_APP_ROUTER_FILE_CONTRACT.md`
> **Web cache contract**: `design/04-execution-overlay/web/WEB_CACHE_REVALIDATION_CONTRACT.md`
> **Zod 4 runtime owner**: `design/02-platform-baseline/api-runtime/ZOD_4_RUNTIME_POLICY.md`

---

## Apps overview

| App | Mô tả | Tech | Build |
|---|---|---|---|
| `apps/web` | Public + member surface | Next.js App Router | SSR/SSG via Next.js 16 |
| `apps/admin` | Management surface (Phụng sự viên) | Vite + React SPA | Static SPA, served by Caddy |

---

## apps/web — Public + Member

### Stack

| Layer | Library | Lý do chọn |
|---|---|---|
| Framework | **Next.js 16 App Router** | Server Components, SEO, streaming |
| UI components | **shadcn/ui** | Composable, accessible, Tailwind-native |
| Primitives | **Radix UI** | Headless accessibility foundation cho dialog, select, tabs, menu, toast, overlays |
| Styling | **Tailwind CSS 4.2** | Utility-first, design token integration, logical utilities, CSS variables |
| Forms | **React Hook Form + Zod** | Performant validation, shared schemas |
| Server state | **TanStack Query v5** | Cache, dedup, optimistic updates cho client components |
| Client state | **Zustand** (minimal) | Chỉ cho UI state (sidebar, modal, theme) |
| Icons | **Lucide React** | Tree-shakable, consistent |
| Date/Calendar | **date-fns** + lunar calendar lib | Lightweight, no Moment |
| Markdown | **react-markdown** + **rehype-sanitize** | Server-side sanitize cho rich text |
| Toast | **Sonner** | Accessible, stacking, auto-dismiss |
| Animation | **Motion v12** (minimal) | Chỉ cho page transitions, overlays, reveal nhẹ; không cho elderly-heavy screens |
| Theme runtime | **next-themes** | class-based dark mode support cho Next.js |

### React runtime contract

- React owner doc cho purity, compiler, effects, refs, custom hooks, va transition semantics la `design/02-platform-baseline/web-runtime/REACT_RUNTIME_POLICY.md`.
- `apps/web` va `apps/admin` di theo `compiler-first mindset`:
  - khong lay `useMemo` / `useCallback` / `memo` lam style baseline cho code moi
  - chi dung manual memo khi profiling hoac referential-stability contract that su can
- Effect discipline cua PMTL:
  - bat dau tu `You Might Not Need an Effect`
  - event logic va synchronization logic phai tach nhau
  - dependency list phai phan anh dung reactive values
- State discipline cua PMTL:
  - uu tien derived state va owner gan nhat
  - khong dung context hoac store nhu shortcut cho state structure te

### Navigation restore and bfcache contract

- `apps/web` phai coi browser `back` / `forward` la fast-restore lane, khong mac dinh la full page load lane.
- Khong dung `unload` listeners trong web app code hoac third-party bootstrap owned by PMTL.
- `beforeunload` chi duoc gan co dieu kien khi thuc su co unsaved work, va phai go ngay sau khi draft duoc giai quyet.
- Browser lifecycle hooks cho restore-sensitive UX phai uu tien:
  - `pageshow`
  - `pagehide`
- `pageshow` voi `event.persisted === true` la signal authority cho:
  - auth-sensitive state refresh
  - analytics pageview restore lane
  - stale content revalidation lane khi route can
- Khong dung `Cache-Control: no-store` tren toan bo HTML response neu muc tieu chi la fresh content; chi dung no-store cho lanes thuc su chua data nhay cam va khong duoc phep restore.
- Web analytics va performance interpretation phai phan biet:
  - normal navigation
  - bfcache restore
- Khi route dung APIs co the chan bfcache nhu open IndexedDB/WebSocket/fetch lifecycle dai, owner component phai co close/reconnect discipline theo `pagehide` / `pageshow`.

### Speculation Rules API stance

- `Speculation Rules API` khong la web baseline mac dinh cho PMTL phase 1.
- Neu bat, no chi duoc coi la `progressive enhancement` cho browser support lane; khong duoc tro thanh correctness dependency.
- `apps/admin` la SPA va khong la target chinh cua `Speculation Rules API`.
- `apps/web` chi duoc xem xet lane nay cho public document navigations co kha nang click cao:
  - homepage -> public hub
  - list -> detail
  - next/related editorial detail
- Khong bat speculation cho:
  - auth routes
  - member routes
  - logout
  - add-to-cart / side-effect style URLs
  - search result URLs de doi nhanh
  - routes co state thay doi nhanh hoac nhay cam theo session
- `prefetch` an toan hon `prerender`; PMTL uu tien `prefetch` truoc, `prerender` chi mo rat hep khi:
  - same-origin
  - GET-safe
  - khong co side effects tren load
  - owner route da co stale-state mitigation ro
- Moi speculation rollout phai co:
  - browser feature detection
  - analytics/measurement split rieng
  - stale-state clearing plan
  - server awareness cho `Sec-Purpose`

### Monorepo + shadcn rules

- PMTL dùng `apps/web` như app workspace và `packages/ui` như shared component workspace.
- Khi dùng shadcn CLI trong monorepo, chạy lệnh từ `apps/web`; CLI sẽ quyết định shared primitive nào nên vào `packages/ui` và app composition nào nên ở `apps/web`.
- Shared primitives như `button`, `input`, `dialog`, `tabs`, `card`, `tooltip` nên sống ở `packages/ui`.
- App-specific composition như hero blocks, login forms, tracker drawers, content cards có business context nên sống ở `apps/web`.
- Không giữ hai bản primitive giống nhau ở cả `apps/web` và `packages/ui`.
- Mỗi workspace phải có `components.json` riêng và phải giữ đồng bộ:
  - `style`
  - `iconLibrary`
  - `tailwind.baseColor`
  - `tailwind.cssVariables`
- Với Tailwind v4, `tailwind.config` trong `components.json` nên để rỗng theo hướng dẫn chính thức của shadcn.
- Mặc định dùng `CSS variables theming`, nghĩa là `tailwind.cssVariables = true`.
- PMTL web lock các quyết định init sau:
  - `style = new-york`
  - `tailwind.baseColor = taupe`
  - `rsc = true`
  - `tsx = true`
  - `tailwind.prefix = ""`
- Không bật `registries` custom ở bootstrap phase; chỉ dùng public/default shadcn install flow cho vòng scaffold đầu.

### shadcn theme contract

- Theme baseline dùng shadcn CSS variable convention:
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
- Khi dùng class như `bg-background`, `text-foreground`, `bg-primary`, `text-primary-foreground`, nghĩa là đang đi qua token system chuẩn của shadcn.
- PMTL giữ light-first, nhưng dark mode vẫn được scaffold ngay từ bootstrap.
- Khi thêm token semantic mới như `warning`, `success`, `info`, cần:
  - khai báo ở `:root`
  - khai báo ở `.dark` nếu dark mode được bật trong phase sau
  - expose bằng `@theme inline`
  - rồi mới dùng dưới dạng utility classes

### Dark mode contract

- `apps/web` hỗ trợ dark mode ngay từ bootstrap bằng `next-themes`.
- Root layout phải:
  - bọc app bằng `ThemeProvider`
  - dùng `attribute="class"`
  - thêm `suppressHydrationWarning` ở thẻ `html`
- `ThemeProvider` nên là wrapper mỏng quanh `next-themes` provider tại `src/components/theme-provider.tsx`.
- shadcn Next.js dark-mode guide là nguồn xác nhận wiring/hydration contract; PMTL chỉ override UX defaults.
Default UX:
- `defaultTheme = "light"`
- `enableSystem = false`
- `disableTransitionOnChange = true`
- Theme toggle được phép có, nhưng không nên đẩy thành CTA lớn trên content-heavy pages.

### Calendar / date-picker contract

- `calendar` trong PMTL đi theo shadcn `Calendar` trên nền `react-day-picker`.
- Baseline date utils vẫn là `date-fns`; không mở Moment-like stack.
- `date-picker` là composition của:
  - `Popover`
  - `Calendar`
- Chỉ add `calendar` hoặc `date-picker` khi route có nhu cầu thật:
  - `/lich-ca-nhan`
  - date field trong profile/settings
  - advanced filter có date range
- Nếu dùng selected date theo local timezone, phải truyền `timeZone` cho `Calendar`.
- Timezone phải detect ở client bằng `Intl.DateTimeFormat().resolvedOptions().timeZone` trong `useEffect`; không detect ngay lúc render server vì dễ gây hydration mismatch.
- Nếu route cần RTL hoặc locale-specific calendar formatting, phải đi qua `locale` + `dir` contract của `react-day-picker`, không tự vá format rời rạc từng cell.

### Sidebar contract

- Member shell desktop nav dùng shadcn `Sidebar` family làm primitive chuẩn:
  - `SidebarProvider`
  - `Sidebar`
  - `SidebarTrigger`
  - `SidebarContent`
  - `SidebarHeader`
  - `SidebarFooter`
- Root shell nào có sidebar phải bọc bằng `SidebarProvider`.
- `Sidebar` được coi là app-shell primitive, không phải decorative block.
- Desktop member shell nên ưu tiên collapsible behavior kiểu `icon`; mobile nav vẫn là transient open state và phải reset khi navigate away.
- Nếu dùng `variant="inset"`, content area phải đi qua `SidebarInset`.
- Sidebar theming phải dùng token family riêng `--sidebar-*`, không hardcode màu nav trực tiếp trong route components.
- Keyboard shortcut kiểu `cmd/ctrl+b` là optional capability, không coi là baseline UX bắt buộc cho phase scaffold đầu.

### Data table contract

- `data-table` của shadcn không phải một primitive đóng gói sẵn; nó là pattern guide trên `table` + `@tanstack/react-table`.
- `apps/web` không lấy `data-table` làm baseline mặc định cho public/member surfaces.
- Public/member routes ưu tiên:
  - list/card/feed/content blocks
  - table đơn giản nếu chỉ là read-only comparison nhẹ
- Chỉ mở lane `data-table` khi surface thật sự cần:
  - sorting
  - filtering
  - column visibility
  - row selection
  - pagination
- `data-table` vẫn phù hợp hơn với `apps/admin`; nếu `apps/web` có dùng thì phải extract như reusable app component có contract riêng, không “add cho có”.

### Carousel contract

- `carousel` đi theo shadcn component trên nền `embla-carousel-react`.
- `carousel` không là homepage mặc định và không phải primitive baseline của web scaffold.
- Chỉ add khi có justified media/storytelling need rõ ràng như:
  - homepage spotlight có nhiều slides thật
  - media gallery
  - quote/testimonial strip có interaction value rõ
- Nếu chỉ là 1 hero, 1 featured card row, hoặc 1 list ngang đơn giản thì không lôi carousel vào.
- Nếu route có RTL, `Carousel` phải đồng bộ cả `dir` prop lẫn `opts.direction`; nav arrows phải xử lý hướng rõ ràng.
- `plugins` như autoplay là optional; không bật mặc định cho content-heavy hoặc elderly-sensitive surfaces.

### Typography contract

- shadcn `Typography` page chỉ là utility examples; PMTL không coi đó là component authority riêng.
- Typography authority vẫn nằm ở:
  - `DESIGN_PRINCIPLES.md`
  - `CONTENT_RENDERING_CONTRACT.md`
  - token sheet
- Không tạo `Typography` wrapper generic chỉ để bọc toàn bộ content rồi mất kiểm soát block semantics.
- Editorial/content surfaces phải render qua owner block vocabulary; utility classes chỉ là implementation detail.

### Motion usage contract

- Motion for React import baseline là `motion/react`.
- Dùng Motion khi cần lane mà CSS không xử lý sạch hoặc không đủ:
  - gesture (`whileHover`, `whileTap`)
  - enter/exit (`AnimatePresence`)
  - layout transition (`layout`, `layoutId`)
  - scroll-triggered / scroll-linked motion (`whileInView`, `useScroll`)
- Với hiệu ứng rất đơn giản, self-contained, như đổi màu hoặc hover transition nhẹ, ưu tiên CSS trước.
- Motion phải bám declarative state/props model của React; không kéo thêm imperative animation orchestration khi chưa cần.

### Next.js App Router file contract

- `apps/web` phải bám special-file contract ở `design/04-execution-overlay/web/WEB_APP_ROUTER_FILE_CONTRACT.md`.
- Root layout phải:
  - giữ `<html>` + `<body>`
  - không tự viết `<head>` tags
  - gắn providers/fonts/theme theo root contract
- `error.tsx` bắt buộc là client component.
- `global-error.tsx` phải tự khai báo `<html>` + `<body>`.
- `loading.tsx` chỉ nên chứa loading UI nhẹ, meaningful, ưu tiên skeleton.
- Root `not-found.tsx` là bắt buộc; segment detail routes được quyền có `not-found.tsx` riêng nếu cần domain CTA khác.
- `cookies()`, `headers()`, `draftMode()`, `params`, `searchParams` phải được dùng theo async contract của Next 16.
- `proxy.ts` là baseline network-boundary file; không scaffold `middleware.ts` như convention chính nữa.

### Form architecture contract

- `apps/web` khóa `React Hook Form + Zod + @hookform/resolvers/zod` cho interactive forms; không dùng `TanStack Form` ở bootstrap phase.
- Resolver authority của repo là `zodResolver`; không dùng `yupResolver` hay mixed-schema resolver làm baseline mới.
- shadcn `Field` family là anatomy mặc định cho form markup:
  - `Field`
  - `FieldLabel`
  - `FieldDescription`
  - `FieldError`
  - `FieldSet`
  - `FieldLegend`
  - `FieldGroup`
- `Input` và `Textarea` dạng đơn giản được bind trực tiếp từ `field`.
- Các control headless hoặc controlled như `Select`, `Switch`, `Checkbox`, `RadioGroup`, `Input OTP`, `Date Picker` phải dùng `Controller`.
- Dynamic array forms phải dùng `useFieldArray`; không tự giữ array row state thủ công khi RHF đã đủ giải quyết.
- RHF đi theo uncontrolled-first model:
  - input native hoặc component có `ref` / `name` / `onChange` / `onBlur` sạch thì đi qua `register`
  - chỉ dùng `Controller` khi control thực sự là controlled hoặc không expose `ref` chuẩn
- `defaultValues` phải đi từ owner projection của route hoặc entity hiện tại; không hardcode bản sao rời rạc trong component tree.
- Khi record owner thay đổi sau fetch hoặc route transition, reset phải đi qua `form.reset(nextValues)` theo owner event; không trộn uncontrolled defaults cũ với patch state thủ công.
- Không mirror toàn bộ form values sang Zustand, URL state, hoặc client store chỉ để "dễ debug".
- `watch()` và `useWatch()` chỉ dùng cho derived UI thật sự cần; không dùng như global reactive bus thay cho proper field ownership.
- Submit handler phải đi qua `handleSubmit`; không bypass validation bằng `onClick` gọi mutation trực tiếp.
- Validation modes:
  - auth / security-sensitive forms: `onSubmit` hoặc `onBlur`
  - profile/settings forms: `onBlur`
  - lightweight search/filter forms: `onChange` chỉ khi feedback tức thời có lợi rõ
  - complex write flows: tránh `onChange` toàn cục nếu tạo nhiễu và làm màn hình nhấp nháy lỗi
- Error mapping contract:
  - field errors render qua `FieldError`
  - form-level/server errors phải đi qua owner banner hoặc summary block, không nhét tùy tiện vào 1 field bất kỳ
  - Vietnamese copy phải giữ đủ dấu, không dùng English fallback nếu API owner đã có copy chuẩn
- Accessibility contract cho form errors:
  - `Field` nhận `data-invalid`
  - control nhận `aria-invalid`
  - lỗi phải có text thật qua `FieldError`
  - không dùng màu sắc làm tín hiệu lỗi duy nhất
- RHF + async mutation contract:
  - pending state của submit do mutation owner giữ
  - form disable/loading chỉ được buộc ở controls có side effect tương ứng
  - thành công từ server là authority cho reset/close modal/navigate, không tự assume success trước response

### Monorepo alias direction

`apps/web/components.json` nên trỏ:
- `components` -> `@/components`
- `hooks` -> `@/hooks`
- `lib` -> `@/lib`
- `utils` -> `@pmtl/ui/lib/utils`
- `ui` -> `@pmtl/ui/components`

`packages/ui/components.json` nên trỏ:
- `components` -> `@pmtl/ui/components`
- `hooks` -> `@pmtl/ui/hooks`
- `lib` -> `@pmtl/ui/lib`
- `utils` -> `@pmtl/ui/lib/utils`
- `ui` -> `@pmtl/ui/components`

### Tailwind v4.2 usage rules

- Ưu tiên theme bằng CSS variables và `@theme`, không hardcode palette rải rác trong component.
- Ưu tiên logical utilities khi layout cần trung tính theo hướng viết hoặc có khả năng cần đa ngôn ngữ:
  - `ps-*`, `pe-*`
  - `scroll-ps-*`, `scroll-pe-*`
  - `inline-*`, `min-inline-*`, `max-inline-*`
  - `block-*`, `min-block-*`, `max-block-*`
- Không ép mọi layout phải dùng logical utilities. Các utility vật lý như `left/right/top/bottom/w/h` vẫn được dùng khi đang mô tả vị trí vật lý rõ ràng.
- Neutral palette mới như `taupe`, `mauve`, `mist`, `olive` phù hợp làm surface/border/muted states; không thay thế palette chủ đạo PMTL.
- `font-feature-settings` có thể dùng có chọn lọc cho typography cao cấp, nhưng không được tạo ra trải nghiệm khó đọc trên màn hình dài.

### Font loading rules

- Dùng `next/font` làm baseline; không nhúng external webfont `<link>` như mặc định.
- Ưu tiên variable fonts nếu source phù hợp.
- Font mapping `heading/body/sacred/mono` phải bám `design/02-platform-baseline/web-runtime/DESIGN_PRINCIPLES.md`.
- Root layout là nơi gắn font variables/classnames toàn app; không import font rời rạc từng page rồi drift typography.

### Image/media loading rules

- Dùng `next/image` làm mặc định cho card/hero/content/media surfaces.
- Mọi image phải có `alt` hữu ích.
- Remote images phải được allowlist bằng `images.remotePatterns` trong `next.config.ts`, càng specific càng tốt.
- Không render image mà không khóa ratio bằng:
  - `width` + `height`
  - hoặc `fill` với parent sizing rõ
- Nếu local static import phù hợp, ưu tiên static import để Next tự suy width/height/blur metadata.
- Không dùng `images.domains`; không dùng `next/legacy/image`.
- Không bật `dangerouslyAllowLocalIP` ở baseline.
- Mặc định chấp nhận `qualities = [75]` và redirect cap của Next 16 trừ khi có case đo được.
- Nếu local image dùng query string, phải có `images.localPatterns.search` rõ ràng.

### Metadata rules

- Static pages ổn định dùng `metadata` object.
- Detail pages hoặc routes phụ thuộc data dùng `generateMetadata()`.
- Nếu page và metadata cần cùng data source, dùng shared fetch helper hoặc React `cache()` để tránh duplicate fetch.
- File-based metadata bootstrap nên có:
  - favicon
  - root OG image
  - robots
  - sitemap

### Build/runtime baseline

- `next dev`, `next build`, `next start` không cần thêm `--turbopack` ở Next 16.
- Nếu repo có custom `webpack` config thật, phải quyết định rõ giữ Webpack hay migrate sang Turbopack; không để config ngầm làm build fail bất ngờ.
- Baseline toolchain cho `apps/web`:
  - Node.js `20.9+`
  - TypeScript `5.1+`

### Data fetching strategy

```
Server Component (default)
  → fetch() với cookies() forwarding → apps/api
  → Dùng cho: read-heavy pages, SEO-critical content

Client Component (khi cần interactivity)
  → TanStack Query → /api/proxy/* → apps/api
  → Dùng cho: practice sheets, forms, real-time interactions
```

### Fetch placement rules

- Ưu tiên fetch ở component thực sự cần data; không prop-drill chỉ để “gom fetch về một chỗ”.
- Read-heavy, SEO-critical, stable surfaces ưu tiên Server Components.
- Client fetch chỉ dùng khi cần interactivity dài sống ở client:
  - optimistic state
  - refetch theo user event
  - polling/realtime-like UX
  - form/session-bound client islands
- Trong cùng một server tree, identical `fetch()` requests được memoize; không viết wrapper phức tạp chỉ để né duplicate fetch khi built-in đã đủ.
- Trong cùng một component, tránh `await` tuần tự nếu requests không phụ thuộc nhau; khởi động song song rồi `Promise.all()` hoặc `Promise.allSettled()` theo lane.
- Layout không được ôm uncached/runtime fetch nặng nếu có thể chuyển xuống `page.tsx` hoặc boundary con có `Suspense`.
- Nếu cần stream data sang client qua React `use()`, chỉ dùng cho client island đã có `Suspense` boundary rõ.

### Server/client boundary rules

- `apps/web` mặc định server-first; chỉ mở `'use client'` ở entry nhỏ nhất thật sự cần interactivity.
- Không biến whole route tree thành client chỉ vì:
  - active nav
  - small toggle
  - one form field
- Client Components chỉ nhận props serializable từ Server Components.
- Server Actions dùng `'use server'` như transport/helper layer:
  - validate input
  - kiểm tra auth/authz phía server
  - trả về shape hẹp cho UI
- Business authority vẫn ở `apps/api`; không đặt canonical domain logic vào Server Actions của web tier.
- Cached reads dùng `'use cache'` phải tránh request-time APIs trong cached scope; đọc runtime values bên ngoài rồi truyền vào như arguments.

### Server Action mutation rules

- Server Actions phải được coi là reachable qua direct `POST`, không được giả định “chỉ UI nội bộ mới gọi được”.
- Page-level auth check không tự bảo vệ action bên trong page đó; action phải tự re-check auth/authz.
- Mọi input từ client đều là untrusted:
  - `FormData`
  - `params`
  - `searchParams`
  - headers
  - hidden inputs
- Mutation writes nên delegate vào server-only DAL hoặc typed server helper thay vì để DB logic nằm trực tiếp trong UI file.
- Return value của action phải hẹp và client-safe; không return raw DB row nếu UI không cần.
- Không làm mutation như side-effect trong render path; logout/write/cache invalidation phải đi qua action hoặc handler rõ ràng.
- Nếu action cần redirect sau submit:
  - dùng `redirect()` cho success flow thường
  - dùng `permanentRedirect()` chỉ khi canonical URL của entity đã đổi thật

### Data security stance

- Server-only modules phải ở server layer và được bảo vệ bằng `server-only` khi phù hợp.
- Không import DB client, secrets, internal API credentials vào code có khả năng vào client bundle.
- `NEXT_PUBLIC_*` là public-by-definition; không nhét config nhạy cảm vào prefix này.
- PMTL ưu tiên Data Access Layer cho read lẫn write lanes để gom:
  - auth
  - authz
  - ownership checks
  - narrow DTO return shape
- Với resource mutations, phải check ownership/permission cụ thể; không dừng ở “đã đăng nhập”.

### Next.js 16 rules cần tận dụng

- Bật `cacheComponents: true` trong `next.config.ts` cho `apps/web`
- Public deterministic reads phải ưu tiên `use cache` + `cacheTag()` thay vì chỉ dựa vào `revalidate` số giây
- Nếu dùng `'use cache'` ở file-level, mọi exported function trong file đó phải là `async`.
- Runtime values như `cookies()` và `headers()` phải đọc **ngoài** cached scope rồi truyền vào như argument
- `after()` chỉ dùng cho side effects không-authoritative, nghĩa là **không thuộc request-response contract và chỉ best-effort**, như logging, analytics, soft counters; **không** dùng cho canonical write, auth, audit, rate-limit, cache invalidation mang tính correctness, hay security enforcement
- `use cache: remote` không bật ở phase 1; chỉ xem xét khi default runtime cache không đủ và đã có measured pain / cost justification
- `use cache: private` không dùng làm mặc định; chỉ dùng khi có compliance/runtime requirement thật sự không thể refactor
- Tooling/debugging nên ưu tiên Next.js DevTools + MCP workflow khi team cần inspect App Router behavior thay vì tự phát minh debug flow riêng
- `revalidateTag()` phải dùng form 2 arguments; mặc định dùng `revalidateTag(tag, 'max')`
- `revalidateTag(tag)` single-arg là legacy/deprecated; không được scaffold mới theo pattern này.
- `updateTag()` chỉ dùng trong Server Actions cho read-your-own-writes
- `refresh()` chỉ là Server Action UI helper, không phải domain invalidation primitive
- semantics chi tiết của `cacheTag`, `cacheLife`, `revalidateTag`, `refresh` phải bám `design/04-execution-overlay/web/WEB_CACHE_REVALIDATION_CONTRACT.md`

### Route Handler rules

- Route Handlers không là business authority thay `apps/api`; ở `apps/web` chúng chủ yếu phục vụ:
  - `/api/proxy/*`
  - metadata/sitemap-like handlers nếu cần
  - web-tier integration edges thật sự cần
- Route Handlers không cache by default; không dựa vào implicit caching assumptions.
- Dưới `cacheComponents`, `GET` Route Handlers vẫn là request-time mặc định; chỉ được coi là prerender/cacheable khi không đụng runtime data hoặc owner config đã khóa rõ semantics.
- Không đặt `'use cache'` trực tiếp trong thân Route Handler; nếu cần cache hóa data read cho `GET`, phải tách helper function riêng có `'use cache'` rồi gọi helper đó.
- Nếu có `GET` Route Handler ở web tier, phải ghi rõ:
  - có cache hay không
  - owner data source là gì
  - vì sao không fetch trực tiếp bằng Server Component
- Không đặt `route.ts` cùng segment level với `page.tsx`.
- File upload/download/proxy edge cases phải đi qua Route Handler contract rõ ràng, không gọi direct internal host từ browser.

### Redirect rules

- `redirect()` là mặc định cho auth redirect, post-submit redirect, và member guard flows.
- Trong Server Actions, `redirect()` trả `303`; đây là lane chuẩn cho submit-success.
- `permanentRedirect()` chỉ dùng khi canonical destination đã đổi bền vững, ví dụ slug/username đổi.
- Conditional incoming-request redirects ở network boundary thuộc `proxy.ts`, không nhét vào component tree.

### Streaming rules

- Streaming là baseline capability của `apps/web`, nhưng phải dùng có chủ đích.
- `loading.tsx` dùng cho page-level streaming khi cả segment cần shell/fallback rõ.
- `<Suspense>` dùng cho granular streaming theo section khi page có static shell meaningful và nhiều async lanes độc lập.
- Mỗi `<Suspense>` boundary là một streaming point và hydration unit; không gộp nhiều vùng chậm vào một boundary nếu chúng không phụ thuộc nhau.
- Layout, nav, static shell phải lên trước; personalized/slow/member aggregates stream vào sau.
- Nếu runtime access nằm trong layout, phải bọc `Suspense` riêng hoặc đẩy xuống page/child section; không để layout chặn cả route.
- Streaming không dùng để che kiến trúc fetch tệ; vẫn phải tối ưu parallel fetch và boundary placement trước.

### Prefetch rules

- Giữ mặc định prefetch của `next/link` cho phần lớn link P0/P1.
- Chỉ custom prefetch khi có lý do rõ về resource cost hoặc UX intent.
- Có thể tắt prefetch cho link giá trị thấp như footer/legal/deep rarely-used routes.
- Hover/manual prefetch chỉ dùng cho high-intent navigation như CTA card, dashboard shortcut, hoặc route nặng cần warm trước.
- Không đặt side-effects trong layout/page render path vì prefetch có thể kích hoạt chúng trước visit thật.
- Khi custom `Link` behavior, team phải tự chịu cache invalidation, accessibility, và maintenance complexity; đây không là baseline.

### BFF / proxy stance

- `apps/web` có thể đóng vai `Backend for Frontend`, nhưng chỉ ở lớp web-facing boundary:
  - proxy route
  - metadata/file/content-type endpoints thật sự cần
  - server helper for web UX
- Điều này không làm `apps/web` thành backend authority.
- `apps/api` vẫn là owner cho:
  - business logic
  - auth policy
  - domain validation authority
  - write correctness
- Public endpoints ở web tier phải được coi là public HTTP surface và audit như public surface thật.

### Environment variable rules

- `.env*` của Next phải nằm ở project root của `apps/web`, không nằm trong `src/`.
- Server-only env đọc trực tiếp ở server lanes:
  - Server Components
  - Route Handlers
  - Server Actions
  - server-only modules
- Chỉ biến có prefix `NEXT_PUBLIC_` mới được coi là client-visible.
- `NEXT_PUBLIC_*` bị inline tại build time; không dùng chúng cho runtime-varying secrets/config cần đổi theo environment sau build.
- Nếu client cần runtime config thật, cung cấp qua server/API/bootstrap contract riêng; không lạm dụng `NEXT_PUBLIC_*`.
- Nếu cần load env ngoài Next runtime như test setup hoặc ORM/tooling config, dùng `@next/env`.

### Forms with Server Actions

- PMTL vẫn khóa form stack UI là `react-hook-form + zod`, nhưng Server Actions được phép làm submit transport khi flow phù hợp.
- Khi dùng `<form action={serverAction}>`:
  - action luôn nhận `FormData`
  - action phải tự auth/authz lại
  - parse/validate `FormData` về schema typed trước khi mutate
- Không vì dùng Server Action form mà bỏ RHF/Zod client-side UX contract.
- Form success flow phải chốt rõ:
  - inline success
  - redirect
  - `updateTag()` / `revalidateTag()`
  - có cần `refresh()` hay không

### Preserving UI state rules

- Với `cacheComponents: true`, `apps/web` mặc định hưởng preserved UI state across navigations.
- Không coi mọi preserved state là đúng UX; phải phân loại:
  - `keep`: filters panel, draft inputs, expanded sidebars, long-lived user setup state
  - `reset`: dropdowns, transient popovers, ephemeral dialogs, one-shot success/error banners
- Search/filter/member-shell surfaces được phép tận dụng preserved form/input/scroll state như baseline UX tốt.
- Các state gắn với current user phải reset khi user identity đổi; không để draft/user-local state của user A lộ sang user B.
- Logout hard reset ưu tiên full reload semantics nếu cần xóa sạch client-side state.
- Nếu một interaction phải reset khi page bị hide bởi Activity:
  - cleanup trong `useLayoutEffect`
  - hoặc derive state từ URL/search params khi phù hợp
- Không dùng preserved UI state để né việc thiết kế canonical URL/filter state cho search/member routes.

### Lazy loading rules

- Server Components đã được code-split tự nhiên theo route; lazy loading chủ yếu áp dụng cho Client Components và external libraries.
- Chỉ lazy-load khi có lý do bundle/interaction rõ:
  - modal/drawer hiếm mở
  - rich editor
  - media/player utilities
  - fuzzy search lib
  - admin-ish heavy widgets nếu sau này vào web
- Không lạm dụng `dynamic()` cho component nhỏ, thường trực, hoặc above-the-fold.
- `ssr: false` chỉ là ngoại lệ cho browser-only component; không dùng như escape hatch mặc định.
- Dynamic import từ Server Component không cho full client code-splitting semantics như nhiều người tưởng; nếu cần thật, đẩy boundary vào Client Component đúng chỗ.

### Production / self-host stance

- PMTL `apps/web` target deployment là Node.js server hoặc Docker container, không phải static export baseline.
- Lý do:
  - dùng App Router server features
  - dùng `proxy.ts`
  - dùng Server Actions
  - dùng Cache Components / streaming / route handlers
- Reverse proxy ở phía trước Next.js là mặc định kiến trúc khi self-host.
- Khi chạy nhiều instances:
  - phải có build identity ổn định
  - phải có strategy cho shared cache nếu cần consistency cross-instance
  - phải có `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` đồng nhất giữa instances
- Không assume preserved Activity state sẽ sống qua hard reload hoặc version-skew reload; state quan trọng phải có URL/local persistence strategy riêng nếu thật sự cần.

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

**Trusted proxy notes**:
- `apps/web` proxy route không được tự bịa chuỗi `X-Forwarded-For`; chỉ forward thông tin request hiện có theo contract đã trust
- canonical client IP phải được resolve ở `apps/api` sau Caddy/proxy trust configuration
- nếu có Cloudflare trước Caddy, trusted proxy chain phải được chốt ở infra/Caddy, không phải ở client fetch helper
- `apps/web` proxy route không phải security authority cho IP; kể cả khi forward header, `apps/api` chỉ tin giá trị đó nếu upstream Caddy/trusted proxy chain đã được cấu hình đúng

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
- `apps/web` query key family và invalidation canon phải bám `design/04-execution-overlay/web/WEB_QUERY_INVALIDATION_PLAN.md`
- Query key ưu tiên array + object-tail pattern để filter/options ổn định và dễ mở rộng; không trải primitives theo thứ tự khó nhớ
- Nếu mutation làm đổi public cached surface, ngoài client invalidation còn phải đi qua `revalidateTag()` / `revalidatePath()` owner theo `design/02-platform-baseline/data-runtime/CACHE_TOPOLOGY.md`
- Không dùng `useSuspenseQuery()` cho lane cần cancellation-sensitive behavior như typeahead/filter đổi nhanh

### TanStack Query important defaults cần explicit hóa

- query mặc định coi cache là `stale`
- stale query có thể refetch khi:
  - mount lại
  - window refocus
  - network reconnect
- inactive query mặc định bị garbage collect sau `5 phút`
- query lỗi mặc định retry `3 lần` với exponential backoff
- structural sharing mặc định được giữ nguyên; không tắt bừa nếu chưa có profiling/evidence

Rules:

- PMTL không được dựa vào các default trên theo kiểu “để thư viện tự lo”.
- mọi query family quan trọng phải có owner `staleTime`/`gcTime` rõ.
- retry mặc định không phù hợp cho mutation semantic hoặc auth-sensitive lane thì phải override rõ.

### SSR / hydration / prefetch stance

- RSC aggregate là bootstrap authority của page; TanStack Query chỉ hydrate/hold cache cho client-interactive islands.
- server prefetch + hydration chỉ dùng khi nó giảm waterfall rõ ràng hoặc giúp island có cache nóng ngay sau first paint.
- không hydrate toàn bộ page data sang client chỉ vì có thể.
- `Prefetching & Router Integration` hợp lệ cho:
  - high-intent next step
  - route transition mượt hơn
  - infinite/search/list route có UX need rõ
- prefetch phải bám owner route semantics của Next.js; không tạo request storm chỉ vì hover/prefetch local pattern.

### Optimistic update stance

- phân biệt rõ:
  - optimistic UI: render tạm từ mutation variables
  - optimistic cache: sửa cache qua `onMutate`
- ưu tiên optimistic UI cho lane đơn giản như heart, bookmark, local add-item.
- optimistic cache chỉ dùng khi:
  - query scope bị ảnh hưởng đã biết rõ
  - rollback path đã thiết kế
  - mutation response hoặc invalidation path đủ để reconcile

### Motion v12 rules

- Chỉ animate cái giúp tăng clarity hoặc polish:
  - dialog/sheet open-close
  - section reveal trên homepage hoặc public hub
  - card hover elevation nhẹ
  - route-level transition rất tiết chế
- Không dùng motion dày cho:
  - practice sheets
  - long-form reading
  - elderly-heavy screens
  - form nhập liệu dài
- Ưu tiên `LazyMotion` khi animation spread đủ rộng để đáng giảm bundle.

### Route structure (Next.js App Router)

```
src/app/
├── (public)/           # Không cần auth
│   ├── page.tsx        # Landing / Homepage
│   ├── bai-viet/       # Posts
│   ├── kinh-sach/      # Sutras
│   ├── bach-thoai/     # Wisdom (Bạch thoại Phật pháp)
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
- Admin mutations làm đổi feature flag hoặc publish status phải invalidate query cache ngay trong client và trigger server-side revalidation path nếu public surface bị ảnh hưởng

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

- Ref đầy đủ: `design/02-platform-baseline/web-runtime/COMPONENT_SPECS.md` và `design/02-platform-baseline/web-runtime/DESIGN_PRINCIPLES.md`
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
- URL slugs tiếng Việt: `/bai-viet`, `/niem-kinh`, `/phat-nguyen`, `/bach-thoai`
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
- `robots.txt`: canonical disallow list xem `design/02-platform-baseline/web-runtime/seo-geo/STRATEGY.md` — không maintain list riêng ở đây để tránh drift
- Core Web Vitals targets: LCP < 2.5s, CLS < 0.1, INP < 200ms
- Mobile-first indexing: responsive design, no separate mobile site
- HTTPS enforced (Caddy + Cloudflare)
- Canonical URLs trên mọi page
- CSP headers, bao gồm nonce generation cho inline script hợp lệ, bám `design/02-platform-baseline/edge-delivery/WAF_ANTIBOT_STRATEGY.md`; `middleware.ts` là owner cho per-request nonce generation khi scaffold `apps/web`

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
- Ref: `design/03-domains/wisdom-qa/REFERENCES/OFFLINE-BUNDLE-DELTA-SYNC.MD` cho delta sync protocol

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
