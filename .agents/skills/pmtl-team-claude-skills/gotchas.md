# Gotchas

- The package is built for Claude Code CLI, not Codex Desktop. Slash commands and hook lifecycles do not transfer one-to-one.
- The package docs mention Windows through WSL2, but this host prefers native Windows for normal Codex work.
- `settings.json` is intentionally not adopted because it grants broad shell and web access.
- Marketing and design skills are reference-rich, but PMTL public/admin surfaces still follow PMTL style and domain canon first.
- Some scripts call external APIs or local browser tooling. Verify credentials and runtime assumptions before use.

