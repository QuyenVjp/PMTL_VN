# ZUSTAND_POLICY

File này chốt ranh giới dùng `Zustand`.
Mục tiêu là để AI không kéo server state hoặc auth authority vào store client.

Authority liên quan:

- [DECISIONS.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/01-repo-constitution/DECISIONS.md)
- [FRONTEND_ARCHITECTURE.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/web-runtime/FRONTEND_ARCHITECTURE.md)
- [REACT_RUNTIME_POLICY.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/web-runtime/REACT_RUNTIME_POLICY.md)

## Allowed uses

- sidebar open/closed state
- theme preference
- modal/drawer local orchestration
- short-lived draft UI state khi form library không phải owner tốt hơn
- client-only preferences có persistence an toàn

## Not allowed

- auth source of truth
- session authority
- persisted auth state suy từ `/auth/me`, cookie presence, hoặc bất kỳ HTTP-only session signal nào
- server state cache thay cho TanStack Query/RSC
- canonical entity records
- permission matrix owner

## Store placement

- feature-local store ở `src/features/<domain>/stores/`
- app-shell store ở `src/lib/stores/` hoặc `src/app/.../stores/` nếu thật sự shell-scoped
- tên store phải bám responsibility thật: `themeStore`, `sidebarStore`, `practiceDraftStore`

## App Router / hydration rules

- không đọc store để quyết định server auth gating
- không suy auth state từ persisted store khi `/auth/me` chưa confirm
- persisted slices phải nhỏ và serializable
- hydration mismatch risk phải được xem trước khi persist theme/layout state

## Persistence stance

Cho phép persist:

- theme
- sidebar collapsed
- low-risk UI preferences

Không persist:

- access token
- refresh token
- raw session object
- server-derived protected data
