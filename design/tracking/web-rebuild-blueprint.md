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
- [frontend-architecture.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/frontend-architecture.md)
- [PAGE_INVENTORY.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/ui/PAGE_INVENTORY.md)
- [USER_FLOWS.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/ui/USER_FLOWS.md)
- [COMPONENT_SPECS.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/ui/COMPONENT_SPECS.md)
- [DESIGN_PRINCIPLES.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/ui/DESIGN_PRINCIPLES.md)
- [implementation-mapping.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/implementation-mapping.md)

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
- đúng với [frontend-architecture.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/frontend-architecture.md)
- đúng với [COMPONENT_SPECS.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/ui/COMPONENT_SPECS.md)
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

### Dark mode policy

- Web mới hỗ trợ dark mode ngay từ bootstrap.
- Dùng `next-themes` với `attribute="class"`.
- Root layout phải có `suppressHydrationWarning` ở thẻ `html`.
- Phải có `ThemeProvider` riêng ở `src/components/theme-provider.tsx`.
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
    │   ├── env.ts
    │   ├── logger.ts
    │   ├── query/
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

Web mới phải đi theo `Contemplative Premium (cao cấp, tĩnh, ấm, trang nghiêm)` từ [DESIGN_PRINCIPLES.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/ui/DESIGN_PRINCIPLES.md).

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
