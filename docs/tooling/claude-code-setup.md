# Claude Code Setup For PMTL_VN

This repo already has a PMTL-specific Claude Code layer:

- root guide: [`CLAUDE.md`](/C:/Users/ADMIN/DEV2/PMTL_VN/CLAUDE.md)
- project settings: [`.claude/settings.json`](/C:/Users/ADMIN/DEV2/PMTL_VN/.claude/settings.json)
- role briefs: [`.claude/agents/README.md`](/C:/Users/ADMIN/DEV2/PMTL_VN/.claude/agents/README.md)
- repo slash command: [`.claude/commands/multi-cli-router.md`](/C:/Users/ADMIN/DEV2/PMTL_VN/.claude/commands/multi-cli-router.md)
- safety/verification hooks: [`.claude/hooks`](/C:/Users/ADMIN/DEV2/PMTL_VN/.claude/hooks)

The goal is not to replace those with random marketplace presets. The goal is:

1. install Claude Code officially
2. keep Anthropic references local
3. let PMTL repo rules stay authoritative
4. add marketplace skills only as a supplement

## 1. Install Or Update Claude Code

Anthropic's current official Windows install method is:

```powershell
irm https://claude.ai/install.ps1 | iex
```

`npm install -g @anthropic-ai/claude-code` still exists, but the upstream README now marks npm install as deprecated.

On this machine, Claude Code is already present. To verify:

```powershell
claude --version
```

## 2. Bootstrap This Repo

Run:

```powershell
pnpm claude:setup
```

Or directly:

```powershell
powershell -ExecutionPolicy Bypass -File .\infra\scripts\bootstrap-claude-code.ps1
```

What the bootstrap does:

- verifies `claude`, `git`, `node`, `pnpm`
- clones official Anthropic references into `tmp/reference/anthropic`
- keeps PMTL repo-local Claude files intact
- prints the exact interactive `/plugin` commands to run next

Optional flags:

```powershell
powershell -ExecutionPolicy Bypass -File .\infra\scripts\bootstrap-claude-code.ps1 -InstallOfficial
powershell -ExecutionPolicy Bypass -File .\infra\scripts\bootstrap-claude-code.ps1 -UpdateRefs
powershell -ExecutionPolicy Bypass -File .\infra\scripts\bootstrap-claude-code.ps1 -IncludeCommunity
```

## 3. Doctor Check

Run:

```powershell
pnpm claude:doctor
```

This checks:

- Claude Code binary
- repo-local `CLAUDE.md`
- `.claude/settings.json`
- hooks, agents, slash command
- cloned official reference repos

## 4. Official Anthropic References

These are synced locally under [`tmp/reference/anthropic`](/C:/Users/ADMIN/DEV2/PMTL_VN/tmp/reference/anthropic):

- [`claude-code`](/C:/Users/ADMIN/DEV2/PMTL_VN/tmp/reference/anthropic/claude-code)
- [`skills`](/C:/Users/ADMIN/DEV2/PMTL_VN/tmp/reference/anthropic/skills)
- [`claude-code-action`](/C:/Users/ADMIN/DEV2/PMTL_VN/tmp/reference/anthropic/claude-code-action)
- [`claude-quickstarts`](/C:/Users/ADMIN/DEV2/PMTL_VN/tmp/reference/anthropic/claude-quickstarts)

Use them as upstream references only. Do not copy them blindly over PMTL docs or PMTL workflow files.

## 5. Marketplace Skills

Inside a Claude Code session at repo root:

```text
/plugin marketplace add anthropics/skills
/plugin install document-skills@anthropic-agent-skills
/plugin install example-skills@anthropic-agent-skills
```

Why this order:

- Anthropic marketplace first
- PMTL repo-local `.claude/` and `.agents/skills` remain the primary repo authority
- marketplace skills are optional helpers, not PMTL policy

## 6. Optional Community Repos

The following can be cloned with `-IncludeCommunity`, but they are not part of the PMTL baseline:

- `hesreallyhim/awesome-claude-code`
- `ykdojo/claude-code-tips`
- `shanraisshan/claude-code-best-practice`

Treat them as idea libraries. Do not overwrite PMTL repo policy with them.

## 7. GitHub Action

For PR review or automation, use Anthropic's official action as the reference:

- local reference: [`tmp/reference/anthropic/claude-code-action`](/C:/Users/ADMIN/DEV2/PMTL_VN/tmp/reference/anthropic/claude-code-action)
- upstream docs: [`docs/setup.md`](/C:/Users/ADMIN/DEV2/PMTL_VN/tmp/reference/anthropic/claude-code-action/docs/setup.md)

Fastest path:

1. open `claude` in this repo
2. run `/install-github-app`
3. follow the setup flow for repo admin + secrets

Do not enable a repo workflow until the app install and auth method are decided.

## 8. Recommended Day-One Workflow

At repo root:

```powershell
claude
```

Then in-session:

```text
/plugin marketplace add anthropics/skills
/plugin install document-skills@anthropic-agent-skills
/plugin install example-skills@anthropic-agent-skills
```

And for PMTL work:

- read `AGENTS.md`
- read `CLAUDE.md`
- use PMTL role briefs from `.claude/agents/README.md`
- use `/multi-cli-router <task>` only for compare/advisory external lanes

## 9. What Is Already Configured In This Repo

This repo already gives Claude Code:

- repo-specific operating guide
- project tool permissions
- edit/verify safety hooks
- reusable PMTL role briefs
- repo slash command for external worker routing

That means the missing piece was not "more prompt hacks". The missing piece was an official-first bootstrap and a clear boundary between:

- Anthropic official tooling
- PMTL repo-local policy
- optional community extras
