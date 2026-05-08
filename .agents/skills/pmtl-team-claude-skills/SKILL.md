---
name: pmtl-team-claude-skills
description: PMTL_VN adapter for the paid Team Claude Skills package. Use when evaluating, borrowing, porting, or verifying workflows from D:\downloadALL\brave-download\team-claude-skills for Codex Desktop and PMTL.
---

# PMTL Team Claude Skills Adapter

## Purpose

Convert useful Team Claude Skills material into PMTL-native Codex Desktop workflows without installing the Claude package wholesale or weakening repo guardrails.

## Use When

- The task mentions `team-claude-skills`, ClaudeKit, `/plan`, `/cook`, `/qa-full`, `/docs-project`, `/ckm:*`, or the paid skills package.
- Borrowing workflows, checklists, reference material, agents, or hooks from `D:\downloadALL\brave-download\team-claude-skills`.
- Deciding whether a package skill belongs in global Codex guidance, PMTL docs, or a repo-local PMTL skill.

## Required Inputs

- Source package path.
- Target scope: global Codex, PMTL repo, app-specific PMTL workflow, or one-off reference.
- Canonical PMTL owner skill or docs page.

## Expected Output

- A concrete adoption decision: adopt, adapt, reject, or keep as reference.
- PMTL-native docs or skill updates when the decision changes routing.
- Verification evidence from skill audit or targeted quality gate.

## Execution Approach

1. Read `docs/architecture/team-claude-skills-adoption.md`.
2. Locate the source package item by folder name in `references/adoption-map.md`.
3. Read only that source `SKILL.md` and the minimal referenced files needed.
4. Translate the useful behavior into PMTL language and PMTL source-of-truth order.
5. Prefer updating existing canonical PMTL skills over creating overlapping aliases.
6. Never copy package `settings.json`, install scripts, or hooks without explicit review.

## Quality Criteria

- PMTL canon stays authoritative.
- Borrowed workflows become Codex Desktop compatible.
- Claude slash command names are treated as labels, not PMTL routing.
- Security-sensitive scripts and hooks are reviewed before use.
- No raw installer is run as part of normal PMTL work.
- High-value source skills such as `qa-full`, `docs-project`, `code-review`, `fix`, `docs-seeker`, `agent-browser`, and `mcp-builder` are routed to PMTL owners instead of copied wholesale.

## Verification

- Run `python infra/tools/codex_actions.py skill-audit`.
- For docs-only adoption, inspect `git diff -- docs/architecture .agents/skills AGENTS.md`.
- For code changes caused by adopted ideas, run the relevant `pmtl-verify-quality-gate` scope.

## Edge Cases

- If a package skill duplicates a PMTL skill, update the PMTL skill or reference docs instead of adding a new route.
- If a package script assumes Linux, Claude CLI, or `~/.claude`, treat it as reference only until ported.
- If a package instruction conflicts with PMTL design or app constitutions, PMTL wins.

## References

- `docs/architecture/team-claude-skills-adoption.md`
- `references/adoption-map.md`
- `verification/checklist.md`
- `gotchas.md`
- `changelog.md`
