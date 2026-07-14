-- Immutable audit trail: public identity, hash chain, IP hashing, append-only triggers.
-- Design: docs/architecture/AUDIT_IMMUTABLE_MIGRATION_DESIGN.md
-- Policy: design/04-execution-overlay/api/AUDIT_POLICY.md
--
-- Canonicalization owner for NEW rows: apps/api/src/platform/audit/audit-integrity.ts
-- Legacy rows use hash_version = 1 (migration SQL serializer).
-- New app writes use hash_version = 2 (recursive key-sort + redaction).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Additive columns (nullable first so existing rows can be backfilled)
ALTER TABLE "audit_logs"
  ADD COLUMN IF NOT EXISTS "public_id" TEXT,
  ADD COLUMN IF NOT EXISTS "correlation_id" TEXT,
  ADD COLUMN IF NOT EXISTS "sequence_number" BIGINT,
  ADD COLUMN IF NOT EXISTS "previous_hash" VARCHAR(64),
  ADD COLUMN IF NOT EXISTS "row_hash" VARCHAR(64),
  ADD COLUMN IF NOT EXISTS "ip_address_hash" VARCHAR(64),
  ADD COLUMN IF NOT EXISTS "hash_version" INTEGER NOT NULL DEFAULT 2;

-- 2. Privacy: hash legacy raw IPs BEFORE dropping the column.
--    Salt is environment-provided via current_setting when available; otherwise
--    we store a deterministic one-way digest so raw IP is never retained.
--    Policy: design AUDIT_POLICY — never keep raw IP after migration.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'ip_address'
  ) THEN
    UPDATE "audit_logs"
    SET "ip_address_hash" = encode(
      digest(
        coalesce(current_setting('app.audit_ip_salt', true), 'legacy-migration-salt')
          || ':' || "ip_address",
        'sha256'
      ),
      'hex'
    )
    WHERE "ip_address" IS NOT NULL
      AND ("ip_address_hash" IS NULL OR "ip_address_hash" = '');

    ALTER TABLE "audit_logs" DROP COLUMN "ip_address";
  END IF;
END $$;

-- 3. Backfill public_id (external random id, NOT internal cuid) + sequence_number
WITH ordered AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (ORDER BY "created_at" ASC, "id" ASC) AS seq
  FROM "audit_logs"
)
UPDATE "audit_logs" AS a
SET
  -- nanoid-compatible: 21 chars from base64url-ish alphabet via gen_random_bytes
  "public_id" = COALESCE(
    a."public_id",
    rtrim(translate(encode(gen_random_bytes(16), 'base64'), '+/', '-_'), '=')
  ),
  "sequence_number" = COALESCE(a."sequence_number", o.seq),
  "hash_version" = COALESCE(a."hash_version", 1)
FROM ordered AS o
WHERE a."id" = o."id";

-- Ensure any row still missing public_id gets one (empty table path is fine)
UPDATE "audit_logs"
SET "public_id" = rtrim(translate(encode(gen_random_bytes(16), 'base64'), '+/', '-_'), '=')
WHERE "public_id" IS NULL;

-- 4. Backfill hash chain for legacy rows (hash_version = 1)
--    Uses a fixed top-level key order matching buildCanonicalPayload.
--    Nested metadata is NOT re-sorted here (legacy fidelity); verifier must
--    accept hash_version=1 with the same SQL-equivalent serialization.
DO $$
DECLARE
  r RECORD;
  prev_hash TEXT := NULL;
  payload TEXT;
  new_hash TEXT;
BEGIN
  FOR r IN
    SELECT
      "id",
      "sequence_number",
      "created_at",
      "actor_type",
      "actor_id",
      "action",
      "resource",
      "resource_id",
      "public_id",
      "correlation_id",
      "metadata",
      "ip_address_hash",
      "user_agent",
      "row_hash",
      "hash_version"
    FROM "audit_logs"
    ORDER BY "sequence_number" ASC
  LOOP
    IF r.row_hash IS NOT NULL THEN
      prev_hash := r.row_hash;
      CONTINUE;
    END IF;

    -- hash_version 1: fixed top-level keys; metadata as stored JSON text
    payload := json_build_object(
      'seq', r.sequence_number::text,
      'prev', prev_hash,
      'ts', to_char(r.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
      'actorType', r.actor_type,
      'actorId', r.actor_id,
      'action', r.action,
      'resource', r.resource,
      'resourceId', r.resource_id,
      'publicId', r.public_id,
      'correlationId', r.correlation_id,
      'metadata', r.metadata,
      'ipAddressHash', r.ip_address_hash,
      'userAgent', r.user_agent
    )::text;

    new_hash := encode(digest(payload, 'sha256'), 'hex');

    UPDATE "audit_logs"
    SET
      "previous_hash" = prev_hash,
      "row_hash" = new_hash,
      "hash_version" = 1
    WHERE "id" = r.id;

    prev_hash := new_hash;
  END LOOP;
END $$;

-- 5. NOT NULL constraints
ALTER TABLE "audit_logs" ALTER COLUMN "public_id" SET NOT NULL;
ALTER TABLE "audit_logs" ALTER COLUMN "sequence_number" SET NOT NULL;
ALTER TABLE "audit_logs" ALTER COLUMN "row_hash" SET NOT NULL;

-- 6. Uniques + indexes
CREATE UNIQUE INDEX IF NOT EXISTS "audit_logs_public_id_key" ON "audit_logs"("public_id");
CREATE UNIQUE INDEX IF NOT EXISTS "audit_logs_sequence_number_key" ON "audit_logs"("sequence_number");
CREATE INDEX IF NOT EXISTS "audit_logs_correlation_id_idx" ON "audit_logs"("correlation_id");
CREATE INDEX IF NOT EXISTS "audit_logs_hash_version_idx" ON "audit_logs"("hash_version");

-- 7. Append-only enforcement: UPDATE, DELETE, and TRUNCATE blocked
CREATE OR REPLACE FUNCTION forbid_audit_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is append-only: % not allowed', TG_OP
    USING ERRCODE = 'integrity_constraint_violation';
END;
$$;

DROP TRIGGER IF EXISTS audit_logs_no_update ON "audit_logs";
CREATE TRIGGER audit_logs_no_update
  BEFORE UPDATE ON "audit_logs"
  FOR EACH ROW
  EXECUTE FUNCTION forbid_audit_mutation();

DROP TRIGGER IF EXISTS audit_logs_no_delete ON "audit_logs";
CREATE TRIGGER audit_logs_no_delete
  BEFORE DELETE ON "audit_logs"
  FOR EACH ROW
  EXECUTE FUNCTION forbid_audit_mutation();

-- TRUNCATE is not blocked by row-level triggers; use statement-level event trigger
-- or REVOKE. We also install a TRUNCATE trigger when supported.
DROP TRIGGER IF EXISTS audit_logs_no_truncate ON "audit_logs";
CREATE TRIGGER audit_logs_no_truncate
  BEFORE TRUNCATE ON "audit_logs"
  FOR EACH STATEMENT
  EXECUTE FUNCTION forbid_audit_mutation();

-- 8. Separate schema + privileges (AUDIT_POLICY requirement)
--    Table remains public.audit_logs for Prisma compatibility this phase, but we
--    create audit schema markers and revoke broad write from PUBLIC.
CREATE SCHEMA IF NOT EXISTS audit;

-- View projection into audit schema for isolation consumers
CREATE OR REPLACE VIEW audit.logs AS
  SELECT * FROM public.audit_logs;

-- Revoke mutation privileges from PUBLIC; app role keeps INSERT via table owner.
-- Ops must grant INSERT-only to a dedicated audit_writer role when provisioned.
REVOKE UPDATE, DELETE, TRUNCATE ON public.audit_logs FROM PUBLIC;
GRANT SELECT, INSERT ON public.audit_logs TO PUBLIC;

COMMENT ON COLUMN public.audit_logs.hash_version IS
  '1 = legacy migration serializer; 2 = app recursive key-sort + redaction (audit-integrity.ts)';
COMMENT ON COLUMN public.audit_logs.public_id IS
  'External random identity (nanoid-compatible). Never equal to internal cuid id.';
COMMENT ON COLUMN public.audit_logs.ip_address_hash IS
  'SHA-256(salt:ip). Raw IP is never stored after migration.';
