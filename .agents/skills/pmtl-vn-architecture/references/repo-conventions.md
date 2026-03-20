# Repo Conventions

## Purpose
These conventions keep PMTL_VN easy for a solo developer and AI assistants to extend without creating architectural drift.

## Layering
- `apps/web`: user-facing application code only
- `apps/api`: NestJS backend authority, domain modules, platform modules, OpenAPI
- `apps/admin`: custom management UI only
- `packages/shared`: framework-agnostic domain code only
- `infra/*`: deployment and runtime configuration only
- `docs/*`: architecture and contract references

## Web Conventions
Use feature-first organization.

Preferred shape:
- `src/app`: routing, pages, layouts, route handlers when appropriate
- `src/features/<feature>`: feature-specific api, components, hooks, utils, types
- `src/components/ui`: low-level reusable UI
- `src/components/common`: cross-feature components
- `src/lib`: cross-feature web concerns such as api clients, env parsing, logging, shared web utilities

Do not create broad top-level buckets that hide domain boundaries.

## API Conventions
Use explicit module ownership under `apps/api/src`.

Preferred shape:
- `src/common`: cross-cutting technical building blocks such as config, logging, validation, errors, auth helpers, HTTP helpers
- `src/platform`: control-plane and runtime modules such as sessions, audit, feature flags, rate limit, storage, health, metrics
- `src/modules/<domain>`: domain controllers, services, schemas, mappers, repositories, policy helpers
- `src/prisma` or `prisma`: schema and migrations

Per domain module, prefer:
- `<domain>.module.ts`
- `<domain>.controller.ts`
- `<domain>.service.ts`
- `<domain>.schemas.ts`
- `<domain>.mapper.ts`
- `<domain>.repository.ts` when query complexity justifies separation
- `<domain>.policy.ts` when authz or business policy needs a dedicated helper

Admin concerns belong in `apps/admin`, not `apps/api`.

## Shared Package Conventions
Allowed:
- types
- enums
- constants
- zod schemas
- validators
- mappers
- pure utility functions

Not allowed:
- Next.js imports
- Payload imports
- direct database code
- process-specific runtime glue

## Naming and Placement
- Place code in the narrowest correct domain first, then generalize later if duplication appears
- Prefer explicit names such as `comment.service.ts`, `search.service.ts`, `buildCommentCreateData`
- Keep function names intention-revealing
- Avoid generic filenames like `helpers.ts` when the module has a real domain name

## Documentation Rules
Update docs when behavior changes:
- contracts → `docs/api/contracts.md`
- domain ownership or boundaries → `docs/architecture/domains.md`
- repo rules or placement → `docs/architecture/conventions.md`
- runtime/deploy → `docs/architecture/deployment.md` or `README.md`

## AI-Friendly Practices
- Explain architectural file placement when making meaningful changes
- Prefer smaller modules with explicit names
- Keep hooks thin and services testable
- Avoid unnecessary abstraction layers
