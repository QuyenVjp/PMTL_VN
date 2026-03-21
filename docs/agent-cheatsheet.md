# Agent Cheatsheet

This repo uses a three-layer model so users and agents do not have to remember every installed skill.

## Priority order

1. Repo-local PMTL skills in `.agents/skills`
2. Superpowers for generic workflow discipline
3. Global Codex or Claude Code skills for tooling only

## Ask by intent, not by exact skill name

You can describe the job in plain language:

- "Brainstorm this feature before coding."
- "Write a plan, then execute it with subagents."
- "Debug this systematically and verify the fix."
- "Review this UI before we ship it."
- "Use the PMTL frontend rules for this screen."

The routing layer should map that intent to the right skill stack.

## Fast map

### Planning and delivery

- Clarify scope before code:
  - `brainstorming`
- Break into explicit tasks:
  - `writing-plans`
- Execute with subagents:
  - `subagent-driven-development`
- Review before accepting:
  - `requesting-code-review`

### PMTL repo policy

- Routing and skill choice:
  - `pmtl-workflow-router`
- Architecture and domain boundaries:
  - `pmtl-vn-architecture`
- Production defaults:
  - `pmtl-production-baseline`
- Frontend implementation:
  - `pmtl-fe-implementation`
- UI behavior:
  - `pmtl-ui-behavior`
- UI style and visual direction:
  - `pmtl-ui-style-system`

### Verification

- General quality gate:
  - `pmtl-verify-quality-gate`
- Auth flows:
  - `pmtl-verify-auth-flow`
- Search sync:
  - `pmtl-verify-search-sync`
- Confirm a fix actually holds:
  - `verification-before-completion`

### Tool skills

- Browser automation:
  - `playwright`, `agent-browser`
- Next.js reference:
  - `next`
- shadcn UI work:
  - `shadcn`
- Auth.js specifics:
  - `auth-js`

## Recommended defaults

- New feature:
  - Use `pmtl-workflow-router`, `pmtl-vn-architecture`, `pmtl-production-baseline`
  - Pair `brainstorming`, `writing-plans`, `subagent-driven-development`
- Frontend task:
  - Use `pmtl-workflow-router`, `pmtl-fe-implementation`, `pmtl-ui-behavior`, `pmtl-ui-style-system`
- Bug fix:
  - Use `pmtl-workflow-router`, `pmtl-production-baseline`, `systematic-debugging`
- Final check:
  - Always end with the appropriate PMTL verification skill

## Rule of thumb

If a skill teaches PMTL-specific repo behavior, it belongs in this repo.

If a skill teaches workflow discipline, keep it in Superpowers.

If a skill teaches a tool or framework that is useful across many repos, keep it global.

