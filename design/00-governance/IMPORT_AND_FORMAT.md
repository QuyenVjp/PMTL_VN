# Import And Format

File này gộp import boundaries với format discipline cho docs thiên về rule.
Mục tiêu là chặn import/ownership drift và bỏ kiểu template aspirational không được enforce.

## Import Boundaries

### Allowed High-Level Directions

- `apps/web` -> `packages/ui`, `packages/shared`, API client/contracts được phép lộ ra
- `apps/admin` -> `packages/ui`, `packages/shared`, API client/contracts được phép lộ ra
- `apps/api` -> `packages/shared`
- `apps/api/src/modules/*` -> `apps/api/src/platform/*` qua contract rõ

### Forbidden High-Level Directions

- `apps/web` -> direct DB access
- `apps/admin` -> business authority logic ngoài `apps/api`
- `packages/shared` -> framework-specific web/api code
- domain module import trực tiếp internals của domain module khác mà không qua contract rõ

### Runtime Role Boundaries

- `edge-delivery` sở hữu proxy, TLS, headers, CDN/WAF stance
- `api-runtime` sở hữu validation pipeline, error envelope setup, startup order, health/metrics hooks
- `data-runtime` sở hữu Prisma, schema migration, backup/restore, storage abstraction
- `security-runtime` sở hữu auth/session, cookies, CORS/CSRF, upload hardening, secret handling
- `optional-scale` sở hữu cache coordination, queues/workers, search projection, pooling, tracing stack

Rule:

- không kéo optional-scale vào phase 1 như dependency ngầm

## Rule-Doc Format Discipline

Không bắt mọi file phải follow một template dài y hệt nhau.
Nhưng file thiên về rule nên ưu tiên có tối thiểu các section sau nếu hợp lý:

1. `Purpose`
2. `Scope`
3. `Authority` hoặc authority links
4. `Phase`
5. `Version basis` nếu rule nhạy với runtime/version state
6. `Must`
7. `Must not`
8. `References`

## Pragmatic Format Rules

- `Must` chỉ chứa bắt buộc thật sự
- `Must not` chỉ chứa cấm đoán thật sự
- nếu file nhạy với version/runtime, phải nói rõ `installed truth`, `design pin`, hay `activation-time pin`
- tránh prose lan man trước khi tới rules
- ví dụ cụ thể nên để cuối file hoặc tách sang references nếu quá dài

## Anti-Pattern

- template nhìn đẹp nhưng không file nào follow
- import boundary chỉ tồn tại trong đầu người review
- doc format dài hơn chính phần rule
