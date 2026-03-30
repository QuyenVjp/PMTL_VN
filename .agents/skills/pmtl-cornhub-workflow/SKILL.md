---
name: pmtl-cornhub-workflow
description: CornHub-first workflow for PMTL_VN. Use for any non-trivial bugfix, refactor, feature, shared-component change, DTO/service change, dirty-worktree task, or multi-agent lane where the agent should use CornMCP before broad file reading. Enforces corn_code_search, corn_code_context, corn_code_impact, corn_detect_changes, knowledge capture, and Corn quality/session tools when available.
---

# PMTL CornHub Workflow

## Purpose

Make CornHub the default intelligence layer for PMTL before broad file reads or speculative edits.

Use this skill to reduce token burn, find the right symbol faster, understand blast radius before editing, and preserve bugfix knowledge for future sessions.

## Use When

- Any non-trivial bugfix, refactor, or feature in `C:\Users\ADMIN\DEV2\PMTL_VN`
- Shared logic, DTO, hook, service, query, or reused component changes
- Dirty worktree or multi-agent tasks
- Tasks where the agent would otherwise grep or read multiple files to guess context

## Do Not Use As Primary Lane

- Tiny copy edits or one-line local CSS tweaks with obvious ownership
- Purely conversational turns with no repo work
- Tasks blocked because CornHub is offline and direct repo inspection is clearly faster

## Required Inputs

- project scope or target path
- likely symbol, feature name, route, or visible symptom
- whether the worktree is dirty or other agents may be active

## Mandatory Workflow

For any non-trivial bugfix, refactor, or feature in this repo:

1. Start with CornMCP.
2. Use `corn_code_search` to find the exact symbol or feature entry point.
3. Use `corn_code_context` before editing.
4. Use `corn_code_impact` before modifying shared logic, DTOs, hooks, services, or reused components.
5. Use `corn_detect_changes` if the worktree is dirty.
6. After implementation and verification, store the key fix pattern with `corn_knowledge_store`.
7. End with a quality report or explicit statement why Corn quality tools were skipped.

For larger tasks, also use:

- `corn_session_start` before execution
- `corn_session_end` after summary/decision capture

## Execution Pattern

### Phase 0 — Session and Drift

- Use `corn_session_start` for substantial work.
- Use `corn_changes` or `corn_detect_changes` when branch state may be stale or shared.
- Use `corn_memory_search` or `corn_knowledge_search` if the bug/feature likely has prior history.

### Phase 1 — Locate Exact Entry

- Start with `corn_code_search`.
- Search by feature name, route name, component name, DTO name, API path, or visible UI label.
- Prefer symbol-level results over full-file reads.

### Phase 2 — Understand Before Editing

- Use `corn_code_context` on the chosen symbol before editing.
- Read callers, callees, imports, hierarchy, and file location.
- Only then inspect the minimum local source needed.

### Phase 3 — Blast Radius

- Use `corn_code_impact` before changing:
  - shared utilities
  - DTOs and response shapes
  - hooks and query factories
  - services and auth logic
  - reused components
- If impact is broad, tighten the plan and verification before patching.

### Phase 4 — Implement and Verify

- Patch the smallest correct scope.
- Run the strongest targeted checks for the touched area.
- If CornHub quality tools are available, end with `corn_quality_report`.
- If skipped, state why in the final answer.

### Phase 5 — Preserve Learning

- Save reusable outcomes with `corn_knowledge_store`.
- Save session-specific conclusions with `corn_memory_store` when likely useful later in the same repo.
- End substantial work with `corn_session_end`.

## Tool Selection Cheat Sheet

- `corn_code_search`: first entry point for discovery
- `corn_code_context`: mandatory before editing non-trivial code
- `corn_code_impact`: mandatory before shared/risky edits
- `corn_detect_changes`: use when worktree is dirty
- `corn_changes`: use when other agents may have changed the repo recently
- `corn_code_read`: use only after search/context narrowed the target
- `corn_memory_search`: prior session recall
- `corn_knowledge_search`: prior reusable fix patterns
- `corn_knowledge_store`: persist the fix pattern after verification
- `corn_plan_quality`: score a plan before bigger implementation
- `corn_quality_report`: close with a scored quality summary
- `corn_session_start` / `corn_session_end`: track substantial tasks

## PMTL-Specific Rules

- In PMTL, CornHub is the first repo-intelligence lane, not a replacement for owner docs.
- `design/`, `AGENTS.md`, and app constitutions still win when policy or architecture is in question.
- Use CornHub to narrow and validate, then read the minimum canon and source files needed.
- Do not skip targeted runtime or browser verification just because CornHub context looks convincing.

## Fallback Rule

If CornHub is unavailable, stale, or returns insufficient results:

- say so briefly
- fall back to direct repo inspection
- continue the task without pretending CornHub answered it

## Knowledge Capture Format

When storing a reusable fix pattern with `corn_knowledge_store`, prefer compact entries with:

- symptom
- root cause
- exact owner path or symbol
- verified fix pattern
- key verification command

Example shape:

- Symptom: admin media preview broken
- Root cause: absolute asset URL bypassed proxy-safe path handling
- Owner: `apps/admin/src/features/media-library/index.tsx`
- Fix: use `mediaPath(url)` for preview/thumbnail sources
- Verify: `pnpm typecheck:admin`

## Completion Standard

Do not claim a non-trivial PMTL code task complete unless:

- CornHub discovery/context steps were used, or you explicitly state why they were skipped
- the strongest relevant targeted checks were run, or the gap is stated plainly
- the reusable fix pattern was stored when the task produced a generalizable lesson
