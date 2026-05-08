# Team Claude Skills Adoption For Codex Desktop

Date: 2026-05-03
Source package: `D:\downloadALL\brave-download\team-claude-skills`

## Summary

The package is useful, but it is a Claude Code CLI package, not a Codex Desktop package. Treat it as a paid reference library and workflow source. Do not install it wholesale into PMTL or global Codex directories.

Observed inventory:

| Area | Count | Notes |
|---|---:|---|
| Skills | 174 | Mostly `SKILL.md` based workflows plus references and scripts |
| Commands | 142 | Claude slash-command routers and subcommands |
| Agents | 3 | `qa-engineer`, `docs-engineer`, `chatbot-builder` |
| Hooks | 2 | QA/docs context injection scripts |
| Install scripts | 6 | Bash installers for Claude global folders |
| Total files | 2,076 | About 39 MB |

## Adoption Rule

Use this package through PMTL-native routing:

1. PMTL canon wins: `AGENTS.md`, `design/`, app constitutions, and `.agents/skills/pmtl-*`.
2. Use the package as reference material for workflow ideas, checklists, and domain libraries.
3. Convert useful behavior into PMTL skills or docs before it becomes canonical.
4. Do not copy `settings.json`, install scripts, or raw hooks without review.
5. Do not let Claude slash command names become PMTL routing authority.

## High-Value Imports

### Adopt Into PMTL

| Package item | PMTL target | What to keep |
|---|---|---|
| `qa-full` | `pmtl-verify-quality-gate` | Requirement-source-test matrix before adding tests; no blind test runs |
| `docs-project` | PMTL docs workflows | PRD, UI specs, QA traceability shape, but output must follow PMTL docs structure |
| `code-review` | `pmtl-review-web-ui`, future backend/security review skills | Adversarial review stages and evidence-first findings |
| `fix` | `pmtl-karpathy-coding-discipline` | Scout -> diagnose -> fix -> verify discipline |
| `docs-seeker` | Next.js/library docs lanes | Current-doc lookup pattern, but use repo source-of-truth order |
| `agent-browser` | Browser verification lane | Context-efficient browser snapshots and long-session pattern |
| `mcp-builder` | MCP integration skill | Workflow-oriented MCP tool design principles |

### Adapt As Reference

| Package item | PMTL use |
|---|---|
| `design`, `design-system`, `ui-styling` | Reference for visual systems after PMTL UI structure is stable |
| `seo`, `technical-seo-checker`, `content-*` | Public web SEO/GEO research references, not canonical PMTL content policy |
| `ai-artist`, `ai-multimodal`, `video`, `slides` | Media generation references when explicit media assets are requested |
| `backend-development`, `databases`, `security-scan` | Temporary reference lanes until PMTL-native backend/security skills are complete |

### Reject For Raw Install

| Package item | Reason |
|---|---|
| `settings.json` | Allows `Bash(*)`, `WebFetch(*)`, and `WebSearch(*)`; too broad for this host |
| `install-all.sh` and role installers | Bash + Claude global paths; not Codex Desktop safe on this Windows setup |
| Raw hooks | Claude lifecycle assumptions; must be ported deliberately before use |
| Raw command tree | Claude slash command routing does not map directly to Codex Desktop |

## Codex Desktop Conversion Pattern

When borrowing from the package:

1. Read the source `SKILL.md` and only the references needed for the current task.
2. Extract the operational rule, checklist, script idea, or template.
3. Re-anchor it to PMTL source-of-truth files.
4. Add it to a PMTL skill or docs page with a verification checklist.
5. Run `python infra/tools/codex_actions.py skill-audit`.

## Global Use

For other repos, use the global Codex skill `team-claude-skills-codex` as a gate. It says to treat the package as a reference library and avoid raw install unless a repo explicitly opts in.

## PMTL Verification Expectations

After applying package-derived ideas:

- Update `AGENTS.md`, `docs/architecture/skills-taxonomy.md`, and affected skills together when routing changes.
- Keep Vietnamese UI/API text with proper dấu.
- Run the strongest relevant PMTL quality gate.
- For skill changes, run `python infra/tools/codex_actions.py skill-audit`.

