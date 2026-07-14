# Runbook — Immutable Audit Integrity

Owner: `design/04-execution-overlay/api/AUDIT_POLICY.md`  
Migration: `apps/api/prisma/migrations/20260713210000_immutable_audit_logs`  
Verifier: `apps/api/scripts/verify-audit-chain.mjs`

## What “healthy” looks like

- `audit_logs` has **no** `ip_address` column.
- Columns present: `public_id`, `sequence_number`, `previous_hash`, `row_hash`, `ip_address_hash`, `correlation_id`.
- New rows always have `sequence_number` continuous from 1, non-null `row_hash`, and `ip_address_hash` when request had an IP.
- `UPDATE` / `DELETE` on `audit_logs` raise: `audit_logs is append-only`.
- Admin API list/detail expose `publicId` / `correlationId` / `sequenceNumber` — never internal cuid as public identity, never raw IP.

## Apply migration

```bash
cd apps/api
# Prefer direct URL if using a pooler
export DATABASE_URL="postgresql://..."
pnpm prisma:migrate:deploy
pnpm prisma:generate
```

Expected: migration `20260713210000_immutable_audit_logs` applied once.

Rollback (emergency only — loses append-only protection):

```sql
DROP TRIGGER IF EXISTS audit_logs_no_update ON audit_logs;
DROP TRIGGER IF EXISTS audit_logs_no_delete ON audit_logs;
DROP FUNCTION IF EXISTS forbid_audit_mutation();
-- Do NOT drop integrity columns in production without a data plan.
```

## Verify chain

```bash
cd apps/api
export DATABASE_URL="postgresql://..."
node scripts/verify-audit-chain.mjs
# optional range
node scripts/verify-audit-chain.mjs --from 1 --to 10000
```

### Expected success

```json
{"msg":"verification.PASSED","checked":123,"lastSeq":"123"}
```

Exit code `0`.

### Failure modes

| `reason` | Meaning | Response |
|---|---|---|
| `raw_ip_column_present` | Migration not applied | Apply migrate deploy; re-run verifier |
| `missing_column` | Partial migration | Restore from backup or re-apply migration on clean target |
| `sequence_gap_or_out_of_order` | Missing or reordered rows | Incident: freeze writers, restore audit table from backup, page on-call |
| `previous_hash_mismatch` | Link broken (tamper or bad write path) | Same as above; identify first broken seq |
| `row_hash_mismatch` | Row body mutated after insert | Same; do not “rehash in place” without dual-control approval |

Exit code `1` = integrity failure. Exit code `2` = config/connection.

## Incident response

1. **Stop** non-essential write traffic if chain is broken in production.
2. Capture evidence: verifier JSON, `SELECT min/max(sequence_number), count(*) FROM audit_logs`.
3. Restore `audit_logs` from the latest backup that verifies clean.
4. Diff restored vs current (public_id / sequence_number ranges) for legal hold notes.
5. Root-cause: any code path calling `prisma.auditLog.create/update/delete` outside `AuditRepository` is a bug — fix before reopening writes.
6. Re-run verifier end-to-end; document RTO/RPO in the incident ticket.

## PDPA / retention

- Application role **must not** `DELETE` audit rows (triggers block it).
- PDPA worker only **counts** rows older than 7 years and logs `pdpa.retention.audit_archive_pending`.
- Archive procedure (ops):
  1. Export rows `created_at < now() - interval '7 years'` to cold storage (CSV/Parquet + checksum).
  2. Temporarily drop append-only delete trigger under dual control **or** use a dedicated maintenance role.
  3. Delete archived range in one transaction.
  4. Reinstall trigger.
  5. Re-run verifier on remaining chain (note: genesis may no longer be seq=1 — verifier range should start at `MIN(sequence_number)`).

## IP salt rotation

- Preferred: set `AUDIT_IP_SALT` (min 16 chars) in secrets manager.
- If unset, salt is derived from `CSRF_SECRET` (`sha256(CSRF_SECRET + ":audit-ip-salt")`).
- Rotating salt does **not** rewrite historical hashes; only new rows use the new salt.
- Document rotation time in ops log; do not attempt to re-hash historical IPs (raw IP is never stored).

## Dev / test notes

- `TRUNCATE audit_logs` still works (row triggers do not fire on TRUNCATE) — test DB reset remains valid.
- Unit tests cover hash stability, chain detection, and append sequence planning without DB.
- Integration proof of triggers requires migrated Postgres (prepare-test-db + migrate deploy).
