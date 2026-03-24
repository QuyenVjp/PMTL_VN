# Gotchas

- Do not route by brand loyalty. Route by task shape and leverage.
- Gemini is useful for current-doc research, but product-marketing claims still need validation before they become repo rules.
- Gemini wrapper runs should normally stay on the repo-owned sticky session, not `resume-latest`, otherwise automation can accidentally inherit the user's manual Gemini CLI context.
- Copilot becomes much more useful when the task touches GitHub workflows or GitHub MCP. Outside that lane it should not be the default.
- PMTL external baseline is currently only Gemini + Copilot. Do not silently bring Claude, Codex CLI, or Aider back into auto-routing until repo governance explicitly re-enables them.
- Local model versions drift. Recheck `--version`, local config, and wrapper smoke results before documenting a model as current.
- External worker runs cost time, quota, and sometimes money. Do not fan out to both workers unless comparison itself is the task.
- If two workers disagree, prefer PMTL docs and local verification over model confidence.
