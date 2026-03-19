# AGENTS.override.md

## Scope
- Applies inside `infra`.
- Follow the root `AGENTS.md` first, then this file.

## Infra Boundaries
- `infra/docker`: compose files, env wiring, container topology
- `infra/caddy`: reverse proxy and edge config
- `infra/monitoring`: Prometheus, Grafana, Alertmanager, monitoring assets
- `infra/scripts`: repo-approved operational scripts
- `infra/tools`: helper tooling used by scripts or local workflows

## Change Rules
- Prefer repo wrapper scripts over ad hoc long commands.
- Do not modify secrets, production env contracts, or deployment defaults unless the task requires it.
- Keep infra changes narrowly scoped and document any runtime contract changes.
- Use the Docker and CMS runbook skills when debugging service boot or runtime failures.

## Verification
- Prefer the smallest relevant command:
  - `pnpm dev`
  - `pnpm smoke:test`
  - `pnpm monitoring:test`
  - `pnpm telegram:test`
