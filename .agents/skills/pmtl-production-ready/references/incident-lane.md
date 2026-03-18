# Incident Lane

Use this lane when the task starts from a failure, regression, or broken runtime behavior.

## Workflow

1. Identify the exact failing route, service, or command.
2. Read `docs/troubleshooting.md` first.
3. Read `docs/runbooks.md` if the issue touches search, monitoring, restore, rollback, or infra operations.
4. Confirm the failure path with logs, health endpoints, and commands before patching code.
5. Fix the root cause, then run the narrowest meaningful verification.

## Good incident questions

- Is this a code bug, env mismatch, or service-health issue?
- Did auth, search, Redis, worker, or proxy behavior change?
- Is the CMS unhealthy and making web pages fail secondarily?
- Do we have a documented runbook already?
