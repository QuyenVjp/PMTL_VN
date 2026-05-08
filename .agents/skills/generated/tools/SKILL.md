---
name: tools
description: "Skill for the Tools area of PMTL_VN. 87 symbols across 5 files."
---

# Tools

87 symbols | 5 files | Cohesion: 87%

## When to Use

- Working with code in `infra/`
- Understanding how workspace_slug, provider_runtime_dir, provider_state_path work
- Modifying tools-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `infra/tools/external_agent.py` | workspace_slug, provider_runtime_dir, provider_state_path, command_cwd, load_json_file (+35) |
| `infra/tools/codex_actions.py` | emit_json, normalize_heading, load_skill_categories, classify_section_hits, skill_audit (+18) |
| `infra/tools/openspace_bridge.py` | parse_args, should_use_copilot, build_preflight_prompt, build_postflight_prompt, emit_text (+5) |
| `infra/tools/multi_cli_router.py` | score_task, pick_secondary, apply_speed_bias, provider_rank, route_task (+4) |
| `infra/tools/openspace_exec.py` | parse_args, ensure_paths, ensure_env, run_task, main |

## Entry Points

Start here when exploring this area:

- **`workspace_slug`** (Function) — `infra/tools/external_agent.py:108`
- **`provider_runtime_dir`** (Function) — `infra/tools/external_agent.py:115`
- **`provider_state_path`** (Function) — `infra/tools/external_agent.py:121`
- **`command_cwd`** (Function) — `infra/tools/external_agent.py:172`
- **`load_json_file`** (Function) — `infra/tools/external_agent.py:183`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `workspace_slug` | Function | `infra/tools/external_agent.py` | 108 |
| `provider_runtime_dir` | Function | `infra/tools/external_agent.py` | 115 |
| `provider_state_path` | Function | `infra/tools/external_agent.py` | 121 |
| `command_cwd` | Function | `infra/tools/external_agent.py` | 172 |
| `load_json_file` | Function | `infra/tools/external_agent.py` | 183 |
| `is_stale_session_error` | Function | `infra/tools/external_agent.py` | 290 |
| `load_provider_session` | Function | `infra/tools/external_agent.py` | 397 |
| `store_provider_session` | Function | `infra/tools/external_agent.py` | 401 |
| `run_copilot` | Function | `infra/tools/external_agent.py` | 478 |
| `load_claude_default_model` | Function | `infra/tools/external_agent.py` | 570 |
| `run_claude` | Function | `infra/tools/external_agent.py` | 589 |
| `resolve_gemini_resume_arg` | Function | `infra/tools/external_agent.py` | 710 |
| `store_gemini_session` | Function | `infra/tools/external_agent.py` | 723 |
| `run_gemini` | Function | `infra/tools/external_agent.py` | 727 |
| `strip_ansi` | Function | `infra/tools/external_agent.py` | 808 |
| `run_grok` | Function | `infra/tools/external_agent.py` | 812 |
| `find_grok_executable` | Function | `infra/tools/external_agent.py` | 912 |
| `emit_json` | Function | `infra/tools/codex_actions.py` | 33 |
| `normalize_heading` | Function | `infra/tools/codex_actions.py` | 140 |
| `load_skill_categories` | Function | `infra/tools/codex_actions.py` | 173 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Main → Workspace_slug` | cross_community | 6 |
| `Run_gemini → Workspace_slug` | intra_community | 6 |
| `Run_claude → Workspace_slug` | cross_community | 5 |
| `Run_copilot → Workspace_slug` | intra_community | 5 |
| `Run_grok → Workspace_slug` | intra_community | 5 |
| `Build_parser → Compose_base_args` | cross_community | 5 |
| `Build_parser → Shell_prefix` | cross_community | 4 |
| `Main → Normalize` | cross_community | 4 |
| `Run_gemini → Load_json_file` | intra_community | 4 |
| `Run_gemini → Save_json_file` | cross_community | 4 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Content | 2 calls |

## How to Explore

1. `gitnexus_context({name: "workspace_slug"})` — see callers and callees
2. `gitnexus_query({query: "tools"})` — find related execution flows
3. Read key files listed above for implementation details
