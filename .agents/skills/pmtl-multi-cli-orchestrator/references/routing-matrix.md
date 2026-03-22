# Multi CLI Routing Matrix

Use this matrix to choose the smallest correct external worker set for PMTL work.

## Canonical routing

| Worker | Route To This Worker When | Avoid When | PMTL note |
| --- | --- | --- | --- |
| `gemini` | The task needs current external docs, version drift checks, product capability research, or broad web-grounded comparison. | The task is purely repo-local and no current external facts matter. | Gemini is the first research worker, not the policy owner. |
| `claude` | The task spans multiple files or steps, changes repo policy/docs, or needs a review-first loop where Claude-specific agents and hooks are part of the leverage. | The task is a tiny batch script, one-off grep-style review, or simple boilerplate. | Claude is the strongest worker for high-context "plan then edit" loops. |
| `codex` | The task is narrow enough for one compact prompt, scripted, non-interactive, review-heavy, or needs precise `exec`, `review`, `mcp`, or optional `--search` usage. | The main value comes from GitHub workflow integration or Claude-specific agent workflows. | Codex is the best worker for compact prompts that should return a crisp patch or review. |
| `copilot` | The task is concretely GitHub-centric: PRs, issues, Actions, GitHub MCP tooling, ACP server mode, custom agents, or prompt-file customization. | The task is local-only architecture reasoning with no GitHub leverage. | Copilot is the ecosystem worker, especially around GitHub-adjacent workflows. |
| `aider` | The task explicitly asks for Aider, or wants git-aware patch planning, repo-map behavior, or a dry-run patch proposal lane. | The task needs official-doc research, repo-policy authority, or default low-friction routing. | Aider is opt-in and should stay advisory dry-run by default in PMTL. |

## Default task splits

| Task shape | Primary worker | Optional second worker |
| --- | --- | --- |
| Latest docs, capability comparison, model/version drift | `gemini` | `codex` if a terse second reading is useful |
| PMTL architecture-sensitive review | `claude` | `codex` for a narrower diff review |
| Focused script, wrapper, or CLI automation change | `codex` | `claude` if the change has bigger policy impact |
| GitHub workflow, PR, issue, or MCP/GitHub tool customization | `copilot` | `claude` for repo policy validation |
| Explicit Aider ask or git-aware dry-run patch proposal | `aider` | `claude` for repo policy validation |
| Cross-check a high-risk change before merge | `claude` | `codex` or `gemini`, depending on whether the risk is local logic or external-doc drift |

## Prompt rules

- Name the goal, touched paths, and output shape in the first sentence.
- Reference repo file paths instead of pasting long content.
- Ask one worker one job. Split research, review, and implementation prompts.
- Ask for findings or patch proposals, not long essays.
- If the task touches `AGENTS.md`, skills, architecture docs, or worker config, prefer `claude` over `codex` for the first review pass.

## Wrapper entrypoint

```bash
py infra/tools/external_agent.py --provider claude --prompt "<prompt>" --debug
py infra/tools/external_agent.py --provider codex --prompt "<prompt>" --debug
py infra/tools/external_agent.py --provider copilot --prompt "<prompt>"
py infra/tools/external_agent.py --provider gemini --prompt "<prompt>" --debug
py infra/tools/external_agent.py --provider aider --prompt "<prompt>" --debug
```
