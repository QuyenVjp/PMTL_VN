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
- `gemini --help` exposes `mcp`, `extensions`, `skills`, `hooks`, sandbox modes, policies, JSON output, `--resume`, and `--list-sessions`

## Aider

- Aider GitHub repo: <https://github.com/Aider-AI/aider>
- Aider install docs: <https://aider.chat/docs/install.html>
- Aider usage docs: <https://aider.chat/docs/usage.html>

Local runtime snapshot verified on 2026-03-22:

- `git -C tmp/aider log -1 --date=iso --pretty=format:"%H %ad %s"` -> `bdb4d9ff8ef88c3015a9845119bff37f49c93d7b 2026-03-16 18:21:33 -0700 copy`
- `aider --version` -> `aider 0.86.2`
- `aider --help` exposes `--message`, `--architect`, `--dry-run`, `--yes-always`, `--no-auto-commits`, `--no-dirty-commits`, `--show-repo-map`, `--file`, and `--read`

## PMTL wrapper

- Wrapper entrypoint: `python infra/tools/external_agent.py --provider <claude|codex|copilot|gemini|aider> --prompt "<prompt>"`
- Wrapper behavior must stay aligned with repo docs in `AGENTS.md`, `CLAUDE.md`, and `docs/agent-cheatsheet.md`
- Gemini wrapper keeps a sticky per-workspace session in `tmp/gemini-runtime/session.json` by default and supports `--session-mode auto|fresh|sticky|resume-latest`
- `python infra/tools/codex_actions.py skill-audit` was verified locally on 2026-03-21 and should be treated as an audit report, not a repo-wide pass gate for older skills
