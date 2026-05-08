# Codex Token Optimization

Date: 2026-05-03

## Goal

Reduce default input tokens while preserving PMTL quality by moving from always-loaded instructions to lazy-loaded repo skills and docs.

## What Changed

- The global Codex profile was archived to `C:\Users\ADMIN\.codex\AGENTS.full.md`.
- The active global profile `C:\Users\ADMIN\.codex\AGENTS.md` is now a thin bootstrap.
- PMTL has a low-token quickstart at `docs/codex-agent-quickstart-lite.md`.

## Operating Model

Use small default context:

1. global thin bootstrap
2. repo `AGENTS.md`
3. PMTL workflow router
4. only the narrow app/skill/doc needed for the current task

Load full/global context only when maintaining Codex profile, subagent policy, global worker routing, or host setup.

## Expected Savings

This does not reduce the current already-heavy chat. It helps new chats.

Expected practical reduction:
- Lower global bootstrap overhead.
- Less repeated policy/context in routine turns.
- Better quality retention because source-of-truth docs are still loaded on demand.

## New Chat Prompt

Use this for PMTL:

```text
cwd C:\Users\ADMIN\DEV2\PMTL_VN. Use the lite PMTL bootstrap: read AGENTS.md, docs/codex-agent-quickstart-lite.md, then route through pmtl-workflow-router. Load only task-specific skills/docs.
```

## Restore Full Global Profile

If the lite profile causes a missing global rule, restore manually:

```powershell
Copy-Item C:\Users\ADMIN\.codex\AGENTS.full.md C:\Users\ADMIN\.codex\AGENTS.md -Force
```

Then open a new Codex chat.

