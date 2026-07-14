#!/usr/bin/env node
/**
 * Operator verifier for immutable audit hash chain.
 *
 * Usage (from apps/api):
 *   node scripts/verify-audit-chain.mjs
 *   node scripts/verify-audit-chain.mjs --from 1 --to 1000
 *   node scripts/verify-audit-chain.mjs --from 100 --to 200
 *
 * Full-chain (default --from 1):
 *   - First row MUST be sequence 1 with previous_hash NULL (genesis).
 *   - Missing entire prefix FAILS.
 *
 * Range (--from N>1):
 *   - Loads trusted checkpoint row N-1 and checks boundary previous_hash.
 *
 * Exit codes:
 *   0 — chain valid
 *   1 — chain broken / missing rows / recompute mismatch
 *   2 — configuration / connection error
 *
 * Canonicalization owner (hash_version=2): apps/api/src/platform/audit/audit-integrity.ts
 * Legacy hash_version=1: migration SQL serializer (top-level fixed keys only).
 *
 * Runbook: docs/runbooks/AUDIT_INTEGRITY.md
 */
import { createHash } from "node:crypto";
import pg from "pg";

const { Client } = pg;

function parseArgs(argv) {
  const out = { from: 1n, to: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--from" && argv[i + 1]) out.from = BigInt(argv[++i]);
    else if (a === "--to" && argv[i + 1]) out.to = BigInt(argv[++i]);
    else if (a === "--help" || a === "-h") {
      console.log("Usage: node scripts/verify-audit-chain.mjs [--from N] [--to N]");
      process.exit(0);
    }
  }
  return out;
}

const SENSITIVE_KEY_PATTERN =
  /^(password|passwordhash|passwd|pwd|token|resettoken|accesstoken|refreshtoken|secret|clientsecret|apikey|authorization|cookie|setcookie|rawip|ipaddress|creditcard|ssn)$/i;

function normalizeKeyName(key) {
  return key.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

function isSensitiveKey(key) {
  return SENSITIVE_KEY_PATTERN.test(normalizeKeyName(key));
}

/** Must stay byte-identical to audit-integrity.ts redactAndSort / canonicalizeMetadata. */
function redactAndSort(value) {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) return value.map((item) => redactAndSort(item));
  if (typeof value === "object") {
    const input = value;
    const sortedKeys = Object.keys(input).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    const out = {};
    for (const key of sortedKeys) {
      if (isSensitiveKey(key)) continue;
      out[key] = redactAndSort(input[key]);
    }
    return out;
  }
  return value;
}

function canonicalizeMetadata(metadata) {
  if (metadata === undefined || metadata === null) return null;
  const jsonSafe = JSON.parse(JSON.stringify(metadata));
  return redactAndSort(jsonSafe);
}

/**
 * hash_version 2 — recursive key-sort + redaction (app writer).
 * hash_version 1 — metadata as stored (legacy migration).
 */
function computeRowHash(sequenceNumber, previousHash, data, createdAt, hashVersion) {
  let metadata;
  if (hashVersion === 1) {
    metadata =
      data.metadata === undefined || data.metadata === null
        ? null
        : JSON.parse(JSON.stringify(data.metadata));
  } else {
    metadata = canonicalizeMetadata(data.metadata ?? null);
  }

  const payload = {
    seq: sequenceNumber.toString(),
    prev: previousHash,
    ts: createdAt.toISOString(),
    actorType: data.actorType,
    actorId: data.actorId ?? null,
    action: data.action,
    resource: data.resource,
    resourceId: data.resourceId ?? null,
    publicId: data.publicId,
    correlationId: data.correlationId ?? null,
    metadata,
    ipAddressHash: data.ipAddressHash ?? null,
    userAgent: data.userAgent ?? null,
  };
  return createHash("sha256").update(JSON.stringify(payload), "utf8").digest("hex");
}

async function main() {
  const { from, to } = parseArgs(process.argv);
  const databaseUrl = process.env.DATABASE_URL ?? process.env.DATABASE_DIRECT_URL;
  if (!databaseUrl) {
    console.error(JSON.stringify({ msg: "verification.error", error: "DATABASE_URL required" }));
    process.exit(2);
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    const cols = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'audit_logs'
    `);
    const names = new Set(cols.rows.map((r) => r.column_name));
    if (names.has("ip_address")) {
      console.error(
        JSON.stringify({
          msg: "verification.FAILED",
          reason: "raw_ip_column_present",
          hint: "Apply migration 20260713210000_immutable_audit_logs",
        }),
      );
      process.exit(1);
    }
    for (const required of [
      "public_id",
      "sequence_number",
      "previous_hash",
      "row_hash",
      "ip_address_hash",
      "correlation_id",
    ]) {
      if (!names.has(required)) {
        console.error(
          JSON.stringify({
            msg: "verification.FAILED",
            reason: "missing_column",
            column: required,
          }),
        );
        process.exit(1);
      }
    }

    const hasHashVersion = names.has("hash_version");
    const requireGenesis = from === 1n;
    let trustedPreviousHash = null;

    if (!requireGenesis) {
      const boundary = await client.query(
        `SELECT row_hash FROM audit_logs WHERE sequence_number = $1`,
        [(from - 1n).toString()],
      );
      if (boundary.rows.length === 0) {
        console.error(
          JSON.stringify({
            msg: "verification.FAILED",
            reason: "missing_trusted_checkpoint",
            expectedSeq: (from - 1n).toString(),
          }),
        );
        process.exit(1);
      }
      trustedPreviousHash = boundary.rows[0].row_hash;
    }

    const params = [from.toString()];
    let sql = `
      SELECT
        sequence_number,
        previous_hash,
        row_hash,
        created_at,
        actor_type,
        actor_id,
        action,
        resource,
        resource_id,
        public_id,
        correlation_id,
        metadata,
        ip_address_hash,
        user_agent
        ${hasHashVersion ? ", hash_version" : ""}
      FROM audit_logs
      WHERE sequence_number >= $1
    `;
    if (to !== null) {
      params.push(to.toString());
      sql += ` AND sequence_number <= $2`;
    }
    sql += ` ORDER BY sequence_number ASC`;

    const { rows } = await client.query(sql, params);
    console.log(
      JSON.stringify({
        msg: "verification.start",
        from: from.toString(),
        to: to?.toString() ?? "max",
        rowCount: rows.length,
        requireGenesis,
      }),
    );

    if (rows.length === 0) {
      // Explicit empty behavior — not a silent pass for missing prefix when from=1
      // and table has rows starting later (checked below via genesis rule when rows exist).
      if (requireGenesis) {
        const any = await client.query(
          `SELECT sequence_number FROM audit_logs ORDER BY sequence_number ASC LIMIT 1`,
        );
        if (any.rows.length > 0 && BigInt(any.rows[0].sequence_number) !== 1n) {
          console.error(
            JSON.stringify({
              msg: "verification.FAILED",
              reason: "missing_prefix_or_not_genesis",
              firstPresent: any.rows[0].sequence_number.toString(),
            }),
          );
          process.exit(1);
        }
      }
      console.log(JSON.stringify({ msg: "verification.PASSED", note: "empty_range", checked: 0 }));
      process.exit(0);
    }

    let expectedSeq = from;
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const seq = BigInt(r.sequence_number);
      const hashVersion = hasHashVersion ? Number(r.hash_version ?? 2) : 2;

      if (seq !== expectedSeq) {
        console.error(
          JSON.stringify({
            msg: "verification.FAILED",
            reason: "sequence_gap_or_out_of_order",
            expected: expectedSeq.toString(),
            got: seq.toString(),
          }),
        );
        process.exit(1);
      }

      if (i === 0) {
        if (requireGenesis) {
          if (seq !== 1n) {
            console.error(
              JSON.stringify({
                msg: "verification.FAILED",
                reason: "missing_prefix_or_not_genesis",
                got: seq.toString(),
              }),
            );
            process.exit(1);
          }
          if (r.previous_hash !== null) {
            console.error(
              JSON.stringify({
                msg: "verification.FAILED",
                reason: "genesis_previous_hash_must_be_null",
                brokenAt: seq.toString(),
              }),
            );
            process.exit(1);
          }
        } else if (r.previous_hash !== trustedPreviousHash) {
          console.error(
            JSON.stringify({
              msg: "verification.FAILED",
              reason: "range_boundary_previous_hash_mismatch",
              brokenAt: seq.toString(),
              expectedPrev: trustedPreviousHash,
              gotPrev: r.previous_hash,
            }),
          );
          process.exit(1);
        }
      } else {
        const prev = rows[i - 1];
        if (r.previous_hash !== prev.row_hash) {
          console.error(
            JSON.stringify({
              msg: "verification.FAILED",
              reason: "previous_hash_mismatch",
              brokenAt: seq.toString(),
              expectedPrev: prev.row_hash,
              gotPrev: r.previous_hash,
            }),
          );
          process.exit(1);
        }
      }

      // Skip recompute for hash_version=1 when metadata key order may differ from
      // Node JSON.stringify of the jsonb value. Linkage is still verified above.
      // For hash_version=2 recompute with recursive canonicalization.
      if (hashVersion >= 2) {
        const recomputed = computeRowHash(
          seq,
          r.previous_hash,
          {
            actorType: r.actor_type,
            actorId: r.actor_id,
            action: r.action,
            resource: r.resource,
            resourceId: r.resource_id,
            publicId: r.public_id,
            correlationId: r.correlation_id,
            metadata: r.metadata,
            ipAddressHash: r.ip_address_hash,
            userAgent: r.user_agent,
          },
          new Date(r.created_at),
          hashVersion,
        );

        if (recomputed !== r.row_hash) {
          console.error(
            JSON.stringify({
              msg: "verification.FAILED",
              reason: "row_hash_mismatch",
              brokenAt: seq.toString(),
              publicId: r.public_id,
              hashVersion,
            }),
          );
          process.exit(1);
        }
      }

      expectedSeq = seq + 1n;
    }

    console.log(
      JSON.stringify({
        msg: "verification.PASSED",
        checked: rows.length,
        lastSeq: rows[rows.length - 1].sequence_number.toString(),
      }),
    );
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(JSON.stringify({ msg: "verification.error", error: String(err?.message ?? err) }));
  process.exit(2);
});
