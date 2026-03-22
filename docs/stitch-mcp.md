# Stitch MCP for PMTL

This note exists so a fresh agent session can quickly discover that PMTL has Stitch MCP available and know which project to use.

## What is configured

- Workspace MCP file: `C:\Users\ADMIN\DEV2\PMTL_VN\.mcp.json`
- MCP server name: `stitch`
- Transport pattern: `npx -y mcp-remote https://stitch.googleapis.com/mcp`
- Required environment variable: `STITCH_MCP_API_KEY`

The API key must come from the environment. Do not hardcode it into repo files.

## When to use Stitch MCP

Use Stitch MCP when the user asks to:

- generate wireframes
- create UI screens from text
- explore or edit a Stitch design project
- build a multi-screen flow with consistent navigation
- use `stitch-design`, `stitch-wireframe-generator`, `design-md`, or `stitch-loop`

Prefer repo-local PMTL skills first for implementation and review. Prefer Stitch skills when the task is design generation rather than code implementation.

## Preferred project

- Preferred PMTL Stitch project: `PMTL_VN_DEV`
- Preferred project id: `8141337621129516599`
- Older duplicate project id: `4954059763928985932`

Use the newer project first unless the user explicitly wants the older one.

## Known-good capability check

If the session exposes Stitch tools, verify by checking that the server supports operations such as:

- `list_projects`
- `create_project`
- `generate_screen_from_text`
- `edit_screens`
- `list_screens`
- `get_screen`

If the session does not expose Stitch tools, do not assume Stitch is broken. First check:

1. `STITCH_MCP_API_KEY` is present in the environment before the session starts.
2. The agent session was restarted after changing `.mcp.json` or env vars.
3. The workspace MCP loader actually mounted the `stitch` server.

## Fallback check

If native tool exposure is missing but you need to validate connectivity, use a raw MCP check through `mcp-remote` and confirm that `list_projects` returns the PMTL project.

Example command shape:

```powershell
npx -y mcp-remote https://stitch.googleapis.com/mcp --header "X-Goog-Api-Key: $env:STITCH_MCP_API_KEY"
```

That check confirms endpoint reachability and auth, even if the current coding agent failed to surface Stitch as a first-class tool.

## Skill routing

For Stitch work, read these in this order as needed:

1. `C:\Users\ADMIN\.agents\skills\stitch-design\SKILL.md`
2. `C:\Users\ADMIN\.agents\skills\stitch-wireframe-generator\SKILL.md`
3. `C:\Users\ADMIN\.agents\skills\design-md\SKILL.md`
4. `C:\Users\ADMIN\.agents\skills\stitch-loop\SKILL.md`

## Working rule

For PMTL, treat Stitch as a design-generation tool, not the source of truth for product architecture. The repo architecture and product boundaries still come from `AGENTS.md`, `design/`, and PMTL docs.
