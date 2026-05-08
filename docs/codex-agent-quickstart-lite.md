# Codex Agent Quickstart Lite

Use this file to start PMTL work with low token overhead.

## Minimal Start

Read in this order:

1. `AGENTS.md`
2. `.agents/skills/pmtl-workflow-router/SKILL.md`
3. The one app constitution for the touched area:
   - `apps/admin/AGENTS.override.md`
   - `apps/api/AGENTS.override.md`
   - `apps/web/AGENTS.override.md` when present

Do not preload broad docs, all skills, all agents, or external worker notes.
When previous PMTL decisions may matter, call `nmem_recap(level=1, topic="<task>")` before broad source exploration.

## Task Routing

| Task | Load next |
|---|---|
| Feature or architecture | `.agents/skills/pmtl-vn-architecture/SKILL.md` |
| Non-trivial code edit | `.agents/skills/pmtl-karpathy-coding-discipline/SKILL.md` |
| Admin UI | `.agents/skills/pmtl-admin-ui/SKILL.md` |
| Public web UI | `.agents/skills/pmtl-fe-implementation/SKILL.md` |
| UI behavior/a11y | `.agents/skills/pmtl-ui-behavior/SKILL.md` |
| Visual direction | `.agents/skills/pmtl-ui-style-system/SKILL.md` |
| Runtime/logging/validation | `.agents/skills/pmtl-production-baseline/SKILL.md` |
| Skill/routing evolution | `.agents/skills/pmtl-skill-governance/SKILL.md` |
| Team Claude package adoption | `.agents/skills/pmtl-team-claude-skills/SKILL.md` |
| Verification | `.agents/skills/pmtl-verify-quality-gate/SKILL.md` |
| Durable project context | `neural-memory` recap/remember tools |

## Verification

- Skill/routing/docs changes: `py infra/tools/codex_actions.py skill-audit` plus `git diff --check`.
- GitNexus stale-index warnings: run `C:\Users\ADMIN\.codex\tools\gitnexus\node_modules\.bin\gitnexus.cmd analyze --embeddings` from the repo root.
- TypeScript/runtime changes: run the narrow package typecheck/test first; use `pnpm typecheck` when broad impact is plausible.
- Browser/UI changes: verify rendered behavior with the browser lane when a UI is affected.

## Token Discipline

- Ask for file paths instead of pasting large docs into chat.
- Read only the files needed for the current task.
- Use context-mode or summaries for large command output.
- Start a new chat after large audits, design reviews, or context-heavy package inspections.
