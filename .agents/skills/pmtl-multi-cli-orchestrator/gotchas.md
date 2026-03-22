# Gotchas

- Do not route by brand loyalty. Route by task shape and leverage.
- Gemini is useful for current-doc research, but product-marketing claims still need validation before they become repo rules.
- Gemini wrapper runs should normally stay on the repo-owned sticky session, not `resume-latest`, otherwise automation can accidentally inherit the user's manual Gemini CLI context.
- Claude and Codex both do strong review work. Pick Claude when repo policy and multi-step context dominate, and pick Codex when the task is narrower and should stay scriptable.
- Copilot becomes much more useful when the task touches GitHub workflows or GitHub MCP. Outside that lane it should not be the default.
- Aider is useful for git-aware patch planning, but its native UX is interactive and edit-oriented. In PMTL it should stay opt-in and dry-run by default unless a stronger guardrail is added.
- Local model versions drift. Recheck `--version`, local config, and wrapper smoke results before documenting a model as current.
- External worker runs cost time, quota, and sometimes money. Do not fan out to all four unless comparison itself is the task.
- If two workers disagree, prefer PMTL docs and local verification over model confidence.
