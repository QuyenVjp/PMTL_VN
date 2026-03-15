# Auth and Security Defaults

## Auth Source of Truth
Use Payload built-in auth in `apps/cms` as the primary auth system.

Default assumptions:
- web does not become a second auth authority
- auth flows are implemented against CMS auth endpoints or equivalent CMS-backed handlers
- session behavior follows Payload auth's JWT/cookie model
- external auth frameworks are not introduced unless explicitly requested

## Default Roles
- `super-admin`
- `admin`
- `editor`
- `moderator`
- `member`

## Access Principles
- guests can access only public content
- members gain user-level features
- moderators manage moderation scopes
- editors manage content scopes
- admins and super-admins manage broader settings and operations

Use both role-based and object/document-level checks where needed.

## Auth Features to Prefer
Typical phase-1 auth surface:
- register
- login
- logout
- forgot password
- reset password
- current user / me
- role-based access checks
- protected routes in web
- profile fields such as display name, bio, avatar, status, role

## Placement Rules
In CMS:
- user collection auth config in `index.ts`
- field declarations in `fields.ts`
- access logic in `access.ts`
- orchestration hooks in `hooks.ts`
- business logic in `service.ts`

In web:
- auth feature code under `features/auth/*`
- route protection in middleware or the least invasive server-side guard that matches the current repo design

## Security Baseline
- keep secrets in env files or deployment secret stores
- never hardcode `PAYLOAD_SECRET`, DB URLs, or search master keys
- prefer internal-only exposure for Postgres, Redis, and Meilisearch
- keep admin and moderation surfaces behind role checks
- add guardrails to login, forgot password, comments, abuse reports, and search endpoints as those features are implemented

## Infrastructure Discipline
Add Redis, queues, or worker-specific security assumptions only when the runtime actually uses them, and document the network boundary, secrets, and failure mode.
