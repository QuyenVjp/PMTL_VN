# Agent Runtime Repair And Drift Sweep

You are working in `C:\Users\ADMIN\DEV2\PMTL_VN`.

Goal:
- repair the external worker and MCP runtime drift that is currently blocking practical agent use
- keep fixes narrow to repo runtime/docs files
- leave unrelated admin/app worktree changes untouched

Current confirmed issues:
- the external-worker practical entrypoint on this host must use `python`, not `py`
- Gemini wrapper currently fails with a vague JSON parsing error instead of reporting interactive auth/login state clearly
- some runtime prompts and repo docs still point operators to `py infra/tools/...`
- workspace `.mcp.json` currently lacks `gitnexus`
- some worktrees may not have `.gitnexus/meta.json`, so GitNexus context is missing even if repo docs expect it
- GitNexus CLI refresh can be blocked by npm/network issues; if blocked, report that specifically instead of pretending the index was refreshed
- OpenSpace/Codex host drift can push MCP or agent execution toward the wrong provider lane; prefer an explicit Gemini model default for repo-local OpenSpace MCP

Rules:
- follow `C:\Users\ADMIN\DEV2\PMTL_VN\AGENTS.md`
- for infra/runtime files, follow `C:\Users\ADMIN\DEV2\PMTL_VN\infra\AGENTS.override.md`
- do not revert unrelated user changes in the worktree
- prefer `python` commands in user-facing docs/prompts for this repo unless a file explicitly documents another host
- if GitNexus refresh is blocked by npm registry/DNS, keep the repo-side config fix and report the environment block clearly

Expected workflow:
1. Inspect `infra/tools/external_agent.py`, `.mcp.json`, `infra/tools/codex_actions.py`, and the repo docs that teach external-worker usage.
2. Fix the Gemini wrapper so auth/login failures are surfaced as clear runtime messages instead of `No JSON object found`.
3. Add the `gitnexus` MCP server to workspace `.mcp.json` using the official `npx -y gitnexus@latest mcp` pattern.
4. Make OpenSpace MCP default to an explicit Gemini model in repo config so host auto-detection does not drift into the wrong provider.
5. Update repo-local docs, hooks, prompt templates, and skills so operator-facing examples use `python infra/tools/...` instead of `py ...`.
6. Add or update this prompt file so the practical command is real and repo-backed.
7. Run the smallest relevant checks:
   - `python infra/tools/codex_actions.py mcp-smoke`
   - `python infra/tools/external_agent.py --provider gemini --prompt "<small health check>" --interaction-mode chat --session-mode fresh --debug`
   - if available, `npx gitnexus status` or `npx gitnexus analyze`
8. Summarize:
   - files changed
   - what was fixed in wrapper/config/docs
   - what is still blocked by environment/auth/network
   - the exact practical command to rerun now

Preferred rerun command:

```powershell
$prompt = Get-Content "docs/prompts/agent-runtime-repair-and-drift-sweep.md" -Raw
python infra/tools/external_agent.py --provider gemini --prompt $prompt --interaction-mode repo --session-mode fresh
```
