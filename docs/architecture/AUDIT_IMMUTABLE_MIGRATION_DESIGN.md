# Immutable Audit Migration Design

Ngày: 2026-07-13  
Owner: `design/04-execution-overlay/api/AUDIT_POLICY.md`  
Task: Plans.md Phase 2.1–2.5

## Goal

Turn `audit_logs` into an append-only, hash-chained, privacy-safe trail:

- No raw IP in new rows
- Monotonic `sequence_number`
- `previous_hash` + `row_hash` SHA-256 chain
- `correlation_id` for request/job linking
- Stable external `public_id` (not internal cuid)
- DB-level block of UPDATE/DELETE
- Legacy rows preserved and backfilled safely

## Non-goals (this phase)

- Moving the physical table out of `public` into `audit.logs` only (Prisma model stays on `public.audit_logs`). We DO create `audit` schema + view, REVOKE UPDATE/DELETE/TRUNCATE from PUBLIC, and block TRUNCATE via trigger — full dedicated `audit_writer` role grant remains ops-owned.
- Changing business call-site action names.

## Current state

| Field | Today |
|---|---|
| Storage | `public.audit_logs` via Prisma `AuditLog` |
| IP | raw `ip_address` |
| Integrity | none |
| Public identity | admin API maps internal `id` → `publicId` |
| Mutability | normal table privileges |

## Target schema (additive)

New columns on `audit_logs`:

| Column | Type | Notes |
|---|---|---|
| `public_id` | TEXT UNIQUE NOT NULL | `nanoid(21)`; backfill for legacy |
| `correlation_id` | TEXT NULL | request/job correlation |
| `sequence_number` | BIGINT UNIQUE NOT NULL | monotonic from 1 |
| `previous_hash` | VARCHAR(64) NULL | null only for genesis (seq=1) |
| `row_hash` | VARCHAR(64) NOT NULL | SHA-256 hex |
| `ip_address_hash` | VARCHAR(64) NULL | SHA-256(salt:ip) |
| `ip_address` | TEXT NULL | **stop writing**; null after backfill hash |

Indexes:

- `audit_logs_public_id_key` UNIQUE
- `audit_logs_sequence_number_key` UNIQUE
- `audit_logs_correlation_id_idx` (partial WHERE NOT NULL)

## Canonical serialization for row_hash

**Single owner:** `apps/api/src/platform/audit/audit-integrity.ts`  
Writer, verifier script, and unit tests share the same recursive path.

```ts
{
  seq: string,          // decimal string of sequence_number
  prev: string | null,  // previous row_hash
  ts: string,           // createdAt ISO-8601 UTC
  actorType: string,
  actorId: string | null,
  action: string,
  resource: string,
  resourceId: string | null,
  publicId: string,
  correlationId: string | null,
  metadata: unknown | null,  // recursively key-sorted + redacted
  ipAddressHash: string | null,
  userAgent: string | null,
}
```

Hash: `sha256(utf8(JSON.stringify(payload))).hex`.

`metadata` pipeline (hash_version = 2):
1. `JSON.parse(JSON.stringify(metadata))` — drop non-JSON values
2. Recursive redact of sensitive keys (password/token/secret/apiKey/cookie/raw IP aliases, any case)
3. Recursive object key sort; **arrays keep order**

`hash_version` column:
- `1` — legacy rows backfilled by migration SQL (`json_build_object`); verifier checks linkage only
- `2` — app writer + full recompute verification

Legacy `public_id` backfill uses `gen_random_bytes` base64url — **never** `public_id = id`.  
Raw IP is hashed into `ip_address_hash` **before** the column is dropped.  
Triggers block UPDATE, DELETE, and TRUNCATE.

## IP hashing

```
ip_address_hash = sha256(`${AUDIT_IP_SALT}:${ip}`)
```

- Salt from ConfigService `auditIpSalt`
- Source: `AUDIT_IP_SALT` env if set (min 16), else derived `sha256(CSRF_SECRET + ":audit-ip-salt")` so no new required env and no committed static fallback string
- Raw IP never stored in new writes; never returned by admin detail API

## Concurrency strategy

Append must be serialized for chain continuity:

1. Open transaction (or use caller tx for `appendInTransaction`)
2. `SELECT pg_advisory_xact_lock(hashtext('pmtl.audit_chain'))`
3. Read last row: `ORDER BY sequence_number DESC LIMIT 1` (FOR SHARE not needed under advisory lock)
4. `nextSeq = last.seq + 1` or `1`
5. Compute `row_hash`
6. INSERT
7. Commit → lock released

Same lock key for standalone and in-transaction append so concurrent writers cannot fork the chain.

If insert fails unique on `sequence_number`, transaction rolls back and caller retries once.

## Append-only enforcement

SQL trigger on `audit_logs`:

```sql
CREATE OR REPLACE FUNCTION forbid_audit_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is append-only: % not allowed', TG_OP;
END;
$$;

CREATE TRIGGER audit_logs_no_update
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION forbid_audit_mutation();

CREATE TRIGGER audit_logs_no_delete
  BEFORE DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION forbid_audit_mutation();
```

Rollback procedure: drop triggers, then drop new columns (documented; not automatic).

## Legacy backfill (same migration, one transaction where possible)

1. Add nullable columns first
2. For each existing row ordered by `created_at ASC, id ASC`:
   - assign `sequence_number = row_number()`
   - assign `public_id = nanoid-like` via `encode(gen_random_bytes(16), 'hex')` or app backfill
   - if `ip_address` present → compute hash into `ip_address_hash`, set `ip_address = NULL`
   - compute chain hashes with canonical payload (metadata as stored)
3. Set NOT NULL on `public_id`, `sequence_number`, `row_hash`
4. Install triggers last so backfill UPDATEs can run

Postgres-only backfill of hash chain uses `plpgsql` loop so deploy doesn't need app online.

## Application changes

| Component | Change |
|---|---|
| Prisma `AuditLog` model | new fields |
| `buildAuditLogInput` | hash IP → `ipAddressHash`; drop raw `ipAddress` from create input |
| `AuditRepository.create*` | advisory lock + sequence + hashes + publicId |
| `AuditService` | pass correlationId from context; keep append/appendInTransaction API |
| `AuditContext` decorator | keep raw IP only in memory for hashing |
| Admin list/detail | expose `publicId`, `correlationId`, `sequenceNumber`; never raw IP |
| Verifier | `scripts/verify-audit-chain.ts` + service method |

## Compatibility

- Existing call sites of `audit.append` / `appendInTransaction` unchanged signatures except optional correlation
- Resource IDs remain as callers pass them (public IDs preferred; calendar cleanup is task 2.4)
- Retention constant stays policy-owned; not deleted by this migration

## Downtime / risk

- Migration takes exclusive lock briefly for trigger install and backfill; for large tables prefer batched backfill (script) then NOT NULL
- Expected row count currently small → single-migration backfill OK
- If chain verify fails post-deploy: do not auto-rewrite; page on-call and restore from backup

## Test plan

1. Unit: `computeRowHash` stable; `hashIpAddress` one-way; raw IP absent in create payload
2. Integration-style with mocked Prisma transaction + advisory lock sequence: chain continuous across N appends
3. Concurrent append simulation: two sequential locked appends never share sequence
4. Verifier detects: missing seq, wrong previous_hash, mutated row_hash, out-of-order
5. Trigger: update/delete raise (when DB available); unit documents expected SQL error code
6. Write path rollback: if audit insert fails, business tx fails (`appendInTransaction`)

## Operator runbook

See `docs/runbooks/AUDIT_INTEGRITY.md` (task 2.5).
