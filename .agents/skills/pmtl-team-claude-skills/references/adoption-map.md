# Team Claude Skills Adoption Map

Source root: `D:\downloadALL\brave-download\team-claude-skills`

## Adopt

| Source | PMTL owner | Notes |
|---|---|---|
| `skills/qa-full` | `pmtl-verify-quality-gate` | Use requirement-source-test matrix and staged QA discipline |
| `skills/docs-project` | `pmtl-skill-governance`, docs workflows | Use PRD/UI/QA traceability templates after PMTL path adaptation |
| `skills/code-review` | `pmtl-review-web-ui`, future backend/security review | Keep adversarial review stages and evidence-first format |
| `skills/fix` | `pmtl-karpathy-coding-discipline` | Keep scout -> diagnose -> fix -> verify hard gate |
| `skills/docs-seeker` | Next.js/current-doc references | Must follow PMTL Next.js source-of-truth order |
| `skills/mcp-builder` | MCP integration skills | Keep workflow-first MCP design guidance |

## Adapt

| Source | PMTL use |
|---|---|
| `skills/design`, `skills/design-system`, `skills/ui-styling` | Visual reference after PMTL UI structure is stable |
| `skills/seo`, `skills/technical-seo-checker`, content and marketing skills | Public web SEO/GEO reference lanes |
| `skills/ai-artist`, `skills/ai-multimodal`, `skills/video`, `skills/slides` | Explicit media creation tasks |
| `skills/backend-development`, `skills/databases`, `skills/security-scan` | Fallback references until PMTL-native backend/security skills are complete |

## Reject Raw Install

| Source | Reason |
|---|---|
| `settings.json` | Broad tool permissions do not fit this host |
| `install-scripts/*` | Bash + Claude global paths; not Codex Desktop safe by default |
| `hooks/*` | Claude lifecycle assumptions need porting |
| `commands/*` | Slash-command routers are Claude-specific |

## Porting Checklist

1. Source skill read.
2. PMTL owner identified.
3. Conflicts with `AGENTS.md`, design docs, or app constitutions resolved in favor of PMTL.
4. Output path adapted to PMTL repo conventions.
5. Verification command selected.

