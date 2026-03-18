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
- `output-skill`
- `pmtl-ui-style-system`

### Knowledge
- `pmtl-vn-architecture`
- `pmtl-production-baseline`
- `pmtl-fe-implementation`
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
- `pmtl-scaffold-payload-collection`
- `shadcn`

### Runbook
- `pmtl-runbook-docker-dev-recovery`
- `pmtl-runbook-cms-runtime-errors`

## Migration map

These old repo-local skills were intentionally consolidated:

- `pmtl-production-ready` -> `pmtl-production-baseline` + `pmtl-verify-quality-gate` + `pmtl-runbook-cms-runtime-errors`
- `pmtl-fe-craft` -> `pmtl-fe-implementation`
- `pmtl-uiux-specialist` -> `pmtl-ui-behavior`
- `pmtl-creative-designer` + `pmtl-vercel-precision` + `taste-skill` + `soft-skill` + `minimalist-skill` + `redesign-skill` -> `pmtl-ui-style-system`
- `web-design-guidelines` -> `pmtl-review-web-ui`

## Rules

- Do not mix implementation guidance and verification checklists in the same PMTL skill unless the workflow is trivial.
- Prefer executable scripts inside `scripts/` when the same verification or scaffolding logic would otherwise be rewritten.
- Keep `SKILL.md` short and route variant-specific detail into `references/`.
- When changing skill routing, update `AGENTS.md`, this file, and the affected local skill folders in the same task.
