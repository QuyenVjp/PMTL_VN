# PMTL Web Rebuild Implementation Prompt

Use this prompt as-is for an implementation-capable AI working inside the repo `C:\Users\ADMIN\DEV2\PMTL_VN`.

## Prompt

You are rebuilding `apps/web` in the PMTL_VN monorepo at `C:\Users\ADMIN\DEV2\PMTL_VN`.

Your task is to scaffold a fresh Next.js App Router frontend following PMTL design canon, without carrying over old implementation baggage.

## Non-negotiable context

- The old `apps/web` is deprecated; you are scaffolding a clean `apps/web` from Next.js starter.
- The API authority is NestJS in `apps/api`.
- All design canon lives in `design/` and is the source of truth, not the old codebase.
- The visual system is based on `shadcn/ui` components with Radix UI primitives and Motion v12 for animations.
- This is NOT a design UI sprint; this is implementation-ready vertical slices mapped to real API contracts.
- Preserve elderly-first UX principles, accessibility, and loading/empty/error states.

## Read first (in order)

1. `AGENTS.md`
2. `CLAUDE.md`
3. `design/00-governance/STATUS_AND_PHASE.md`
4. `design/01-repo-constitution/ARCHITECTURE_AT_A_GLANCE.md`
5. `design/02-platform-baseline/web-runtime/FRONTEND_ARCHITECTURE.md`
6. `design/02-platform-baseline/web-runtime/COMPONENT_SPECS.md`
7. `design/02-platform-baseline/web-runtime/DESIGN_PRINCIPLES.md`
8. `design/02-platform-baseline/web-runtime/ELDERLY_UX.md`
9. `design/04-execution-overlay/web/WEB_REBUILD_BLUEPRINT.md`
10. `design/04-execution-overlay/web/PAGE_INVENTORY.md`
11. `design/04-execution-overlay/web/USER_FLOWS.md`
12. `design/04-execution-overlay/web/ROUTE_PAGE_CONTRACTS.md`
13. `design/04-execution-overlay/web/TOKEN_IMPLEMENTATION_SHEET.md`
14. `design/04-execution-overlay/web/WEB_QUERY_INVALIDATION_PLAN.md`
15. `design/04-execution-overlay/web/WEB_APP_ROUTER_FILE_CONTRACT.md`
16. `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md`
17. `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md`

## Current state to respect

- `apps/web` currently exists but is not the authoritative rebuild target; design canon is authoritative.
- `apps/admin` already exists and follows `shadcn-admin` starter patterns; study it for consistency.
- `apps/api` backend is NestJS with real routes defined in `API_ROUTE_INVENTORY.md`; you must wire to real routes, not mock.
- `packages/shared` contains framework-agnostic contracts and DTOs; use them as source of truth for data shapes.
- `packages/ui` may contain shared UI primitives; preserve reusability.
- Meilisearch integration for search is planned but not blocking first vertical slice; fallback to SQL is acceptable.

## Primary objective

Bootstrap a clean, canonical `apps/web` using Next.js App Router + shadcn/ui, and implement the **first vertical slice** as proof of E2E integration:

**First Vertical Slice: Chanting Environment Rules Page**
- Public route: `/niem-kinh/luu-y-moi-truong-va-thoi-gian`
- API contract: `GET /content/chanting/environment-rules`
- Admin slice: `/admin/noi-dung/niem-kinh` tab `Môi trường & Thời gian`
- Scope: read-only environment rules for chanting practice, no auth required for public

This slice proves:
- design → packages/shared DTOs → apps/api routes → apps/web page loader → UI rendering → admin table integration
- query key factories and invalidation rules from canon
- elderly-friendly loading/empty/error states
- shadcn component usage and Tailwind token implementation

## Required implementation rules

### App Router foundation

- Use `Next.js App Router` with proper file structure per `WEB_APP_ROUTER_FILE_CONTRACT.md`
- Keep route groups aligned to PMTL module ownership (identity, content, calendar, engagement, etc.)
- Implement server components first, client boundaries second
- Use proper layout.tsx and page.tsx nesting
- Implement error.tsx and loading.tsx states per slice
- Follow `next.config.ts` with proper build, image, and performance settings

### Design system baseline

- Use `shadcn/ui` CLI to scaffold components on-demand
- Pin all component versions to match monorepo `VERSION_MATRIX.md`
- All colors, typography, spacing, and shadows must map to design tokens in `TOKEN_IMPLEMENTATION_SHEET.md`
- Motion v12 for dialog/sheet transitions and in-view reveals, not gratuitous animations
- Radix UI primitives for accessible interactive elements (dialog, dropdown, select, tabs, toast)
- Tailwind v4 with proper utility coverage for responsive + dark mode

### Query and data flow

- Use TanStack Query (React Query) for server state; already in repo
- Create query key factories in `apps/web/src/lib/query-keys/`
- Implement proper invalidation strategies from `WEB_QUERY_INVALIDATION_PLAN.md`
- Always wire to real `apps/api` routes, never mock data beyond local dev loading states
- Use Zod for runtime validation of API responses at boundaries
- Cache revalidation on mutations per contract in `WEB_CACHE_REVALIDATION_CONTRACT.md`

### Page loading and data fetching

- Implement page-level data loaders using `generateMetadata` and async Server Components where appropriate
- Keep load waterfall shallow; prefetch related queries when canon allows
- Implement proper error boundaries with user-friendly error messages in Vietnamese
- Use elderly-friendly empty states (large text, high contrast, clear CTA)
- Implement skeleton loaders or Suspense boundaries for perceived performance

### Authentication and authorization

- Wire to real identity API routes in `apps/api`
- Respect auth flow from `AUTH_UX_CONTRACT.md`
- Implement session-aware redirects without localStorage auth state leaks
- Use secure cookies via `next-auth` patterns (already in repo)
- No fake auth; integration with real session backend required

### State management

- TanStack Query for server state (required)
- Zustand for minimal UI state only if canon allows (sidebar collapse, theme toggle)
- Never use Zustand as server cache or auth source of truth
- No context API overuse; keep React Context for read-mostly theme/language/auth-status providers only

### Component structure

- One feature = one folder: `apps/web/src/app/(group)/feature-name/`
- Each feature owns: `components/`, `hooks/`, `queries.ts`, `mutations.ts`, `types.ts`, `layout.tsx`, `page.tsx`
- Shared components go to `apps/web/src/components/` organized by type (ui, data-table, form, etc.)
- Respect component ownership per `COMPONENT_SPECS.md`

### Elderly-first UX

- Minimum font size 16px for body text (browser default)
- High contrast text/background (WCAG AA minimum)
- Generous spacing and touch targets (48px minimum for mobile)
- Clear visual hierarchy with appropriate heading sizes
- No tiny icons without labels
- Loading states should be clear (spinners + text)
- Error messages should be specific and actionable
- Preserve scroll position when navigating back (history.state)

## Concrete routes to implement (Phase 1)

### 1. Public landing / entry points (no auth required)

- `/` — landing page with hero, Five Treasures intro, daily practice preview
- `/niem-kinh/luu-y-moi-truong-va-thoi-gian` — environment rules for chanting (first vertical slice)
- `/ngoai-tuyen` — external wisdom entry point (if Meilisearch ready) or placeholder

### 2. Auth flow entry

- `/dang-ki` — registration page
- `/dang-nhap` — login page
- `/quen-mat-khau` — password reset flow
- Protected auth redirects per `AUTH_UX_CONTRACT.md`

### 3. Member dashboard (auth-required)

- `/dashboard` — main member dashboard (aggregate of stats, upcoming events, practice log)
- `/luyen-tap/hom-nay` — today's daily practice guide
- `/luyen-tap/nhat-ky` — practice log tracker
- `/lo-kinh-niem` — sutra/chanting library and player
- `/nam-chi-nam` — personal vow tracker
- `/lich` — personal calendar view
- `/noi-cua-toi` — "little house" personal practice space

### 4. Community (auth-required)

- `/cong-dong` — community feed (limited if notification/queue not ready)
- `/tim-kiem` — search (Meilisearch + SQL fallback)

### 5. Admin (role-gated)

- `/admin` — admin dashboard (kept minimal)
- `/admin/noi-dung/niem-kinh` — content admin (focus on environment rules tab only)
- Other admin features deferred to phase 2+

## Do not implement in phase 1

- Real-time sync, offline-first, or delta synchronization
- Complex analytics or metrics dashboard
- Video streaming or media player beyond basic HTML5 video
- Notification push delivery or BullMQ queue processing
- Advanced search beyond SQL + Meilisearch fallback
- Multi-language or translation automation
- Social features beyond community read
- Payment integration or subscription tiers

## Backend implementation guidance

This is **web rebuild only**; you should assume backend routes from `API_ROUTE_INVENTORY.md` are already implemented or planned.

If you discover a route is missing:
- Document it in a blockers note
- Do not invent the route in the frontend as mock data
- Coordinate with backend implementer or escalate

## Frontend implementation guidance

### Project structure

```
apps/web/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── (public)/     # Layout group for public routes
│   │   │   └── niem-kinh/
│   │   │       └── luu-y-moi-truong-va-thoi-gian/
│   │   │           ├── page.tsx
│   │   │           ├── layout.tsx
│   │   │           ├── loading.tsx
│   │   │           └── error.tsx
│   │   ├── (auth)/       # Auth pages layout group
│   │   │   ├── dang-nhap/
│   │   │   ├── dang-ki/
│   │   │   └── quen-mat-khau/
│   │   ├── (app)/        # Protected member routes layout group
│   │   │   ├── dashboard/
│   │   │   ├── luyen-tap/
│   │   │   ├── nam-chi-nam/
│   │   │   ├── lich/
│   │   │   └── lo-kinh-niem/
│   │   ├── admin/        # Admin routes
│   │   ├── api/          # API route handlers if needed
│   │   ├── layout.tsx    # Root layout
│   │   └── error.tsx     # Global error boundary
│   ├── components/       # Shared components
│   │   ├── ui/          # shadcn + Radix primitives
│   │   ├── data-table/  # TanStack Table wrappers
│   │   ├── form/        # Form compounds
│   │   ├── layout/      # Navigation, sidebar, header
│   │   └── ...
│   ├── lib/
│   │   ├── api.ts       # API client helper
│   │   ├── query-keys/  # React Query key factories
│   │   ├── utils.ts     # General utilities
│   │   └── validators.ts # Zod schemas for API validation
│   ├── hooks/           # Custom React hooks (TanStack Query integration)
│   └── types/           # Frontend-local TypeScript types
├── public/              # Static assets
├── next.config.ts       # Next.js configuration
├── tailwind.config.ts   # Tailwind CSS + token overrides
├── tsconfig.json        # TypeScript config
└── package.json
```

### Key files to create first

1. **`apps/web/next.config.ts`** — Next.js configuration with image optimization, redirects, rewrite rules for API routing
2. **`apps/web/tailwind.config.ts`** — Tailwind v4 config matching `TOKEN_IMPLEMENTATION_SHEET.md`
3. **`apps/web/src/lib/api.ts`** — Shared API client using `fetch` (or `axios` if already in repo)
4. **`apps/web/src/lib/query-keys/index.ts`** — React Query key factory functions
5. **`apps/web/src/app/layout.tsx`** — Root layout with providers (TanStack Query, theme, auth)
6. **`apps/web/src/app/(public)/niem-kinh/luu-y-moi-truong-va-thoi-gian/page.tsx`** — First vertical slice

### shadcn initialization

```bash
cd apps/web
pnpm add -D shadcn-cli
npx shadcn-cli@latest init -d  # Initialize for Next.js monorepo
npx shadcn-cli@latest add button card badge  # Core UI components for first slice
npx shadcn-cli@latest add skeleton  # For loading states
```

### Code style and conventions

- TypeScript strict mode enabled
- Functional components with hooks
- Destructuring props where reasonable
- Vietnamese for user-facing strings; English for code comments and internal naming
- Keep component files under 300 lines; split larger features
- Props interfaces in same file or local types.ts
- Server Components by default; Client Components only where interactivity needed
- No barrel exports (`index.ts` re-exports) for side-effect clarity

## Do not do these things

- Do not copy the old `apps/web` code into the new one
- Do not invent new shadcn components beyond what canon specifies
- Do not implement features outside the current safe scaffold window in `IMPLEMENTATION_MAPPING.md`
- Do not use context API or Zustand as primary state management for server data
- Do not hardcode API URLs; use environment variables
- Do not leave console.logs or commented-out code in production commits
- Do not wire to mock APIs unless explicitly approved for loading states
- Do not implement features older design docs mention but newer docs exclude

## Verification required before claiming success

Run these checks after implementation:

- `pnpm --filter @pmtl/web typecheck` — full TypeScript check
- `pnpm --filter @pmtl/web build` — Next.js build success
- `pnpm --filter @pmtl/web lint` — ESLint passes with strict rules
- Visual inspection: public page `/niem-kinh/luu-y-moi-truong-va-thoi-gian` loads and renders without errors
- API integration: page loads data from real `GET /content/chanting/environment-rules` endpoint
- Accessibility: page passes axe-core or similar WCAG checks
- Elderly-friendly: font sizes, contrast, spacing all meet canon spec
- Admin slice: `/admin/noi-dung/niem-kinh` environment rules tab displays and allows basic CRUD (if admin wiring complete)

## Required final output

When done, report:

1. Which routes are now scaffolded and functional
2. Which vertical slice (environment rules) is complete end-to-end
3. Which API integrations are wired to real `apps/api` endpoints
4. Which styling/token implementations are applied
5. Which elderly-friendly UX features are in place
6. Which verification commands were run successfully
7. Any remaining blockers or dependencies on backend completion
8. Recommendations for next vertical slices after this phase

## Quality bar

If the page still looks like a design mockup without real data binding, you failed.
If your build fails or TypeScript has errors, you failed.
If you wire to mock data instead of real API, you failed.
If you ignore `WEB_REBUILD_BLUEPRINT.md` or `ELDERLY_UX.md`, you failed.
If admin slice is not wired to real `apps/admin` patterns, you failed.

Deliver a clean, canonical, production-ready web rebuild, not a pretty prototype.
