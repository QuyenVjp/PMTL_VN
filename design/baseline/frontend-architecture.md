# FRONTEND_ARCHITECTURE (Kiến trúc frontend)

File này chốt phần còn thiếu cho `apps/web` và `apps/admin`.
Audit đúng ở điểm này: trước đó frontend chỉ được nhắc rải rác.

## Apps

- `apps/web`: public product surface
- `apps/admin`: management surface

## Web baseline

- `Next.js App Router`
- Server Components by default
- client component chỉ dùng khi có interactive state thật
- request boundary của web nằm ở `src/proxy.ts`

## Admin baseline

- custom admin UI riêng
- không dùng generated CMS panel làm management authority
- admin gọi `apps/api`, không bypass API contracts

## Data fetching strategy

- server data fetch cho read-heavy route
- client state fetch cho interaction-heavy surface
- typed client từ `packages/api-client` hoặc shared contract layer

## State strategy

- server state ưu tiên nằm ở server/data layer
- client state cục bộ chỉ dành cho interaction/UI state
- không dựng global store to nặng khi chưa có measured pain

## UI package rule

- `packages/ui` chỉ giữ reusable primitives
- domain UI sống trong từng app/feature

## Caching rule

- public published read có thể cache theo policy từ backend/web
- user-private state không dùng shared public cache làm source of truth

## Accessibility and elderly UX

- ưu tiên chữ rõ, spacing rộng, contrast đủ
- flow quan trọng phải ít bước
- lỗi phải nói dễ hiểu, không dùng jargon thuần kỹ thuật

## Notes

- frontend không giữ business authority
- frontend không tự bịa contract ngoài `apps/api`
