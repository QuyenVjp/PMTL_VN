# AGENTS.override.md

## Scope
- Applies inside `apps/web`.
- Follow the root `AGENTS.md` first, then this file.

## Implementation Pattern
- Keep the app feature-first under `src/features/*`.
- Check nearby feature patterns before adding new logic.
- Prefer Server Components by default; add `use client` only when interaction requires it.
- Use React Query for client-side interactive state only.
- Reuse `@pmtl/shared` and `@pmtl/ui` instead of duplicating helpers or primitives.

## Quality Rules
- Validate user-facing inputs with Zod.
- Log async failures with pino-compatible structured context.
- Preserve Vietnamese diacritics in all user-visible text.
- Preserve existing PMTL visual language; use the local UI/style skills instead of inventing a new design system.

## Verification
- Prefer targeted commands:
  - `pnpm --filter @pmtl/web test`
  - `pnpm --filter @pmtl/web typecheck`
  - `pnpm --filter @pmtl/web lint`
