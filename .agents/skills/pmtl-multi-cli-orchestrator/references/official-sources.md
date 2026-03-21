# Official Sources

Update this file when routing rules depend on a new external capability.

## Anthropic Claude Code

- Claude Code sub-agents: <https://docs.anthropic.com/en/docs/claude-code/sub-agents>
- Claude Code settings: <https://docs.anthropic.com/en/docs/claude-code/settings>
- Claude Code MCP: <https://docs.anthropic.com/en/docs/claude-code/mcp>
- Claude Code hooks: <https://docs.anthropic.com/en/docs/claude-code/hooks>

## OpenAI Codex

- Introducing Codex: <https://openai.com/index/introducing-codex/>
- Codex product page: <https://openai.com/codex/>
- Codex CLI getting started: <https://developers.openai.com/codex/cli>
- OpenAI Codex repo: <https://github.com/openai/codex>

Local runtime snapshot verified on 2026-03-21:

- `codex --version` -> `codex-cli 0.116.0`
- `codex --help` exposes `exec`, `review`, `mcp`, `mcp-server`, `app-server`, `resume`, `fork`, `cloud`, and `--search`
- `C:\Users\ADMIN\.codex\config.toml` currently pins `model = "gpt-5.4"`

## GitHub Copilot CLI

- Copilot CLI docs hub: <https://docs.github.com/copilot/how-tos/copilot-cli>
- About GitHub Copilot CLI: <https://docs.github.com/copilot/concepts/agents/about-copilot-cli>
- Copilot CLI custom agents: <https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/create-custom-agents-for-cli>
- Copilot CLI prompt files: <https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/create-prompt-files-for-cli>

Local runtime snapshot verified on 2026-03-21:

- `copilot --version` -> `GitHub Copilot CLI 1.0.10`
- `copilot --help` exposes custom `--agent`, GitHub MCP configuration flags, ACP mode, prompt mode, and permission controls

## Gemini CLI

- Gemini CLI repo: <https://github.com/google-gemini/gemini-cli>

Local runtime snapshot verified on 2026-03-21:

- `gemini --version` -> `0.34.0`
- `gemini --help` exposes `mcp`, `extensions`, `skills`, `hooks`, sandbox modes, policies, and JSON output

## PMTL wrapper

- Wrapper entrypoint: `py infra/tools/external_agent.py --provider <claude|codex|copilot|gemini> --prompt "<prompt>"`
- Wrapper behavior must stay aligned with repo docs in `AGENTS.md`, `CLAUDE.md`, and `docs/agent-cheatsheet.md`
- `py infra/tools/codex_actions.py skill-audit` was verified locally on 2026-03-21 and should be treated as an audit report, not a repo-wide pass gate for older skills
