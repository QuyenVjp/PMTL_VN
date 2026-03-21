# PMTL Workflow Routing Map

## Routing order

1. `pmtl-workflow-router`
2. Canonical PMTL repo skill
3. Superpowers workflow skill
4. Global generic tool skill
5. Verification skill

## Canonical PMTL routing

- Architecture, domain placement, cross-app boundaries:
  - `pmtl-vn-architecture`
- Production defaults, logging, validation, runtime policy:
  - `pmtl-production-baseline`
- Frontend implementation in `apps/web`:
  - `pmtl-fe-implementation`
- UI interaction, accessibility, form behavior, state feedback:
  - `pmtl-ui-behavior`
- Visual direction and style vocabulary:
  - `pmtl-ui-style-system`
- UI review:
  - `pmtl-review-web-ui`
- Skill creation, audit, consolidation:
  - `pmtl-skill-governance`
- Search verification:
  - `pmtl-verify-search-sync`
- Auth verification:
  - `pmtl-verify-auth-flow`
- General quality gate:
  - `pmtl-verify-quality-gate`
- Docker recovery and incidents:
  - `pmtl-runbook-docker-dev-recovery`

## Superpowers pairing

- Clarify spec before code:
  - `brainstorming`
- Break approved work into explicit tasks:
  - `writing-plans`
- Execute plan in batches:
  - `executing-plans`
- Use subagents with review loops:
  - `subagent-driven-development`
- True red/green TDD:
  - `test-driven-development`
- Debugging by root cause:
  - `systematic-debugging`
- Review before accepting work:
  - `requesting-code-review`
- Verify fix before closing:
  - `verification-before-completion`

## Global tool skill examples

- Browser automation or UI inspection:
  - `playwright`, `agent-browser`
- Next.js framework-specific reference:
  - `next`, `nextjs-app-router-fundamentals`
- Component library workflows:
  - `shadcn`
- Auth.js implementation specifics:
  - `auth-js`

## Default stacks by task

- New feature:
  - `pmtl-workflow-router` + `pmtl-vn-architecture` + `pmtl-production-baseline`
  - Then pair `brainstorming` -> `writing-plans` -> `subagent-driven-development`
  - Finish with `pmtl-verify-quality-gate`
- Frontend UI change:
  - `pmtl-workflow-router` + `pmtl-fe-implementation` + `pmtl-ui-behavior` + `pmtl-ui-style-system`
  - Pair `brainstorming` or `requesting-code-review` when needed
  - Finish with `pmtl-verify-quality-gate`
- Bug fix:
  - `pmtl-workflow-router` + `pmtl-production-baseline`
  - Pair `systematic-debugging`
  - Finish with `verification-before-completion` + `pmtl-verify-quality-gate`
- Auth task:
  - `pmtl-workflow-router` + `pmtl-vn-architecture` + `pmtl-production-baseline`
  - Pair `test-driven-development` when changing logic
  - Finish with `pmtl-verify-auth-flow`
- Search task:
  - `pmtl-workflow-router` + `pmtl-vn-architecture`
  - Finish with `pmtl-verify-search-sync`
- Skill or workflow cleanup:
  - `pmtl-workflow-router` + `pmtl-skill-governance`

