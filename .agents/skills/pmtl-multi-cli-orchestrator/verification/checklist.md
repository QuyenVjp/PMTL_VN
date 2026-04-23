# Verification Checklist

- The task really needs an external worker instead of local reasoning only.
- The task is not trivial enough to stay local with the active PMTL skill stack.
- The chosen worker matches the routing table in `../references/routing-matrix.md`.
- Any routing rule that depends on product capabilities is backed by `../references/official-sources.md`.
- Prompts are compact and path-based, not giant pasted blobs.
- External findings are validated locally before they become repo policy.
- If workers conflict with repo docs, the conflict is resolved by checking official product docs and updating repo docs before changing routing.
- `AGENTS.md`, `docs/architecture/skills-taxonomy.md`, and `docs/agent-cheatsheet.md` are updated when canonical routing changes.
- Wrapper changes get a smoke run for the affected provider.
- `python infra/tools/codex_actions.py skill-audit` has been run and reviewed as an audit report, with no missing-section gap ignored for the touched canonical skill.
