# Import Boundaries

File này chốt boundary tư duy để sau này AI không phá kiến trúc qua import chéo và ownership drift.

## Core Rule

Import nên đi theo authority và abstraction, không đi theo tiện tay.

## Allowed High-Level Directions

- `apps/web` -> `packages/ui`, `packages/shared`, API client/contracts được phép lộ ra
- `apps/admin` -> `packages/ui`, `packages/shared`, API client/contracts được phép lộ ra
- `apps/api` -> `packages/shared`
- `apps/api/src/modules/*` -> `apps/api/src/platform/*` qua contract rõ

## Forbidden High-Level Directions

- `apps/web` -> direct DB access
- `apps/admin` -> business authority logic ngoài `apps/api`
- `packages/shared` -> framework-specific web/api code
- domain module import trực tiếp internals của domain module khác mà không qua contract rõ

## Runtime Role Boundaries

### edge-delivery

Chỉ sở hữu proxy, TLS, headers, CDN/WAF stance.

### platform-bootstrap

Sở hữu config, logging, validation pipeline, error envelope setup, session/bootstrap order, health/metrics hooks.

### data-runtime

Sở hữu Prisma, schema migration, backup/restore, storage abstraction.

### security-runtime

Sở hữu auth/session, cookies, CORS/CSRF, upload hardening, secret handling.

### optional-scale

Sở hữu cache coordination, queues/workers, search projection, pooling, tracing stack.

Không được kéo vào phase_1 như dependency ngầm.
