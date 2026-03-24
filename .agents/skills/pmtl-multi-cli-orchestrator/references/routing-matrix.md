# Multi CLI Routing Matrix

Use this matrix to choose the smallest correct external worker set for PMTL work.

## Canonical routing

| Worker | Route To This Worker When | Avoid When | PMTL note |
| --- | --- | --- | --- |
| `gemini` | The task needs current external docs, version drift checks, product capability research, or broad web-grounded comparison. | The task is purely repo-local and no current external facts matter. | Gemini is the first research worker, not the policy owner. |
| `copilot` | The task is concretely GitHub-centric: PRs, issues, Actions, GitHub MCP tooling, ACP server mode, custom agents, or prompt-file customization. | The task is local-only architecture reasoning with no GitHub leverage. | Copilot is the ecosystem worker, especially around GitHub-adjacent workflows. |

## Default task splits

| Task shape | Primary worker | Optional second worker |
| --- | --- | --- |
| Latest docs, capability comparison, model/version drift | `gemini` | `copilot` if a mainstream implementation reading is useful |
| PMTL architecture-sensitive review with external help still needed | `gemini` | `copilot` for implementation sanity |
| Focused wrapper or CLI automation change | `copilot` | `gemini` if external-doc drift also matters |
| GitHub workflow, PR, issue, or MCP/GitHub tool customization | `copilot` | `gemini` for external capability cross-check |
| Cross-check a high-risk change before merge | `gemini` | `copilot` |

## Prompt rules

- Name the goal, touched paths, and output shape in the first sentence.
- Reference repo file paths instead of pasting long content.
- Ask one worker one job. Split research, review, and implementation prompts.
- Ask for findings or patch proposals, not long essays.
- If the task touches `AGENTS.md`, skills, architecture docs, or worker config, prefer `gemini` first for external product drift and `copilot` second only for implementation sanity.

## Wrapper entrypoint

```bash
py infra/tools/external_agent.py --provider copilot --prompt "<prompt>"
py infra/tools/external_agent.py --provider gemini --prompt "<prompt>" --debug
```

Gemini wrapper note:

- Default behavior is a sticky per-workspace session stored in `tmp/gemini-runtime/session.json`.
- Use `--session-mode fresh` when the task should ignore prior wrapper context.
- Use `--session-mode resume-latest` only when you intentionally want the wrapper to attach to Gemini CLI's latest project session.
