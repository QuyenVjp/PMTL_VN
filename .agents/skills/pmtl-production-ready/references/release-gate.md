# Release Gate

Use this lane before calling a production-sensitive task “done”.

## Minimum gate

- targeted tests for touched areas
- typecheck for the affected package or monorepo
- lint for the affected package or monorepo
- smoke verification when contracts or key runtime flows changed

## Use the right tools

- `pmtl-verify-quality-gate`
- `pmtl-automation-smoke-suite`
- `pmtl-verify-auth-flow`
- `pmtl-verify-search-sync`

## Common “not done yet” signs

- code changed but docs/skills/rules did not
- only happy path was checked
- no confirmation of auth/search/monitoring after runtime changes
- no evidence of actual verification command output
