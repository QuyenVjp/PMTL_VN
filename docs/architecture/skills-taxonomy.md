# Skills Taxonomy

PMTL_VN uses a folder-based skill system. Skills are grouped by operational role so the agent can discover the right level of freedom:

- `governance`: output and style governors that shape agent behavior
- `knowledge`: project-specific architecture, implementation, and baseline rules
- `review`: critique-focused skills that produce findings
- `verification`: skills that run checks and confirm behavior
- `automation`: repeatable command wrappers for smoke and monitoring workflows
- `scaffolding`: skills that generate repo-aligned starter structures
- `runbook`: incident and recovery procedures

## Active local taxonomy

### Governance
- `pmtl-workflow-router`
- `pmtl-skill-governance`
- `pmtl-multi-cli-orchestrator`
- `output-skill`
- `pmtl-ui-style-system`

### Knowledge
- `pmtl-vn-architecture`
- `pmtl-production-baseline`
- `pmtl-fe-implementation`
- `pmtl-admin-ui`
- `pmtl-ui-behavior`
- `vercel-react-best-practices`

### Review
- `pmtl-review-web-ui`

### Verification
- `pmtl-verify-quality-gate`
- `pmtl-verify-auth-flow`
- `pmtl-verify-search-sync`

### Automation
- `pmtl-automation-smoke-suite`

### Scaffolding
- `shadcn`

### Runbook
- `pmtl-runbook-docker-dev-recovery`

## Migration map

These old repo-local skills were intentionally consolidated into the new taxonomy, but some are still preserved as compatibility or design-library entrypoints so older prompts do not break:

- `pmtl-production-ready` -> `pmtl-production-baseline` + `pmtl-verify-quality-gate`
- `pmtl-fe-craft` -> `pmtl-fe-implementation`
- `pmtl-uiux-specialist` -> `pmtl-ui-behavior`
- `pmtl-creative-designer` + `pmtl-vercel-precision` + `taste-skill` + `soft-skill` + `minimalist-skill` + `redesign-skill` -> `pmtl-ui-style-system`
- `web-design-guidelines` -> `pmtl-review-web-ui`

## Compatibility layer

The following local skills are intentionally kept alive even after the taxonomy cleanup:

- `taste-skill`
- `soft-skill`
- `minimalist-skill`
- `redesign-skill`
- `pmtl-production-ready`
- `pmtl-fe-craft`
- `pmtl-uiux-specialist`
- `pmtl-creative-designer`
- `pmtl-vercel-precision`
- `web-design-guidelines`
- deprecated NestJS-predecessor lanes:
  - `pmtl-runbook-cms-runtime-errors`
  - `pmtl-scaffold-payload-collection`

Reason:

- preserve valuable design libraries
- avoid breaking older prompts and workflows
- allow the new taxonomy to act as the primary routing layer without deleting trusted legacy entrypoints

Compatibility skills are opt-in aliases, not the default routing target. Prefer the canonical taxonomy skill unless the user explicitly names the legacy skill or the task needs its preserved design/reference material.

## Current canonical gaps and approved fallback lanes

The PMTL taxonomy is still asymmetric. Frontend/UI is canonized strongly; backend/runtime/security/scaling is not yet fully covered by repo-local PMTL skills.

Until repo-local canonical skills are added, use these fallback lanes on purpose:

| Need | Current canonical PMTL anchor | Approved fallback class |
|---|---|---|
| Backend NestJS implementation | `pmtl-vn-architecture` + `pmtl-production-baseline` | `nestjs-best-practices`, API/database/transaction auditors, and repo design docs |
| API contracts and DTO/error-envelope rigor | `pmtl-vn-architecture` | `ln-643-api-contract-auditor`, `rest-api-designer`, `api-documentation-generator` |
| DB schema/query/transaction discipline | `pmtl-production-baseline` | `database-migration-helper`, `query-optimizer`, `ln-650/651/652-*` auditors |
| Runtime health, observability, scaling, rollback | `pmtl-production-baseline` + PMTL runbooks | `ln-627-observability-auditor`, `infrastructure-monitor`, `docker-compose-production` |
| Security and hardening outside auth/search | `pmtl-production-baseline` + `pmtl-verify-auth-flow` + `pmtl-verify-search-sync` | `security-best-practices`, `api-security-checker`, Trail of Bits review packs |

Do not pretend these fallback classes are equal to missing PMTL-native skills. They are temporary operating lanes, not a completed taxonomy.

Backlog owner for the missing PMTL-native lanes:
- `docs/architecture/pmtl-skill-backlog.md`

## Windows-safe execution defaults

- Prefer git grep -n for exact text search before falling back to the bundled rg.exe on Windows hosts where WindowsApps permissions can fail.
- Use PowerShell Get-ChildItem and Select-String when exact search or file discovery must stay inside the local shell.
- Use mgrep for semantic search instead of stretching exact-match tools beyond their job.
- Keep edits file-local and split large write operations into smaller patches to avoid Windows command/path length failures in agent tooling.
- Prefer stdlib-only Python helpers when a task only needs simple parsing or transformation.

## Rules

- Do not mix implementation guidance and verification checklists in the same PMTL skill unless the workflow is trivial.
- Prefer executable scripts inside `scripts/` when the same verification or scaffolding logic would otherwise be rewritten.
- Prefer repo-level deterministic entrypoints such as `py infra/tools/codex_actions.py ...` or `just <recipe>` when a skill needs runtime-aware execution.
- Keep `SKILL.md` short and route variant-specific detail into `references/`.
- Canonical PMTL skills should aim to include purpose, trigger, execution, verification, and evolution notes, even if compatibility skills stay lighter.
- When changing skill routing, update `AGENTS.md`, this file, and the affected local skill folders in the same task.
- Routing order is `pmtl-workflow-router` -> canonical PMTL taxonomy skill -> Superpowers workflow skill -> global tool skill.
- Repo-local PMTL skills are the canonical source of repo behavior for both Codex and Claude Code when working inside this repository.
- Superpowers is the preferred generic workflow engine, not the source of PMTL repo policy.
- Global platform skills should stay tool-oriented and generic rather than duplicating repo policy.
- External worker routing baseline is currently `Gemini + Copilot` only. Claude, Codex CLI, and Aider stay disabled in PMTL auto-routing until they are explicitly re-enabled.
- Read `docs/agent-operating-model.md` when the task changes Codex role framing, local subagent usage, or external-worker governance.
