/**
 * Pure integrity helpers for append-only audit logs.
 * Design: docs/architecture/AUDIT_IMMUTABLE_MIGRATION_DESIGN.md
 * Policy: design/04-execution-overlay/api/AUDIT_POLICY.md
 *
 * Canonicalization owner: THIS FILE.
 * Writer (AuditRepository), verifier script, and unit tests MUST use the same
 * recursive key-sort + redaction path so hashes stay byte-identical.
 */
import { createHash } from "node:crypto";

export interface AuditRowData {
  actorType: string;
  actorId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  publicId: string;
  correlationId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddressHash?: string | null;
  userAgent?: string | null;
}

/**
 * Sensitive key patterns (case-insensitive, camel/snake/upper).
 * Matched against the leaf key name after stripping non-alphanumerics.
 */
const SENSITIVE_KEY_PATTERN =
  /^(password|passwordhash|passwd|pwd|token|resettoken|accesstoken|refreshtoken|secret|clientsecret|apikey|authorization|cookie|setcookie|rawip|ipaddress|creditcard|ssn)$/i;

function normalizeKeyName(key: string): string {
  return key.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERN.test(normalizeKeyName(key));
}

/**
 * Recursive safe projection for audit metadata.
 * - Objects: drop sensitive keys (any case/alias), sort remaining keys.
 * - Arrays: keep order, redact each element.
 * - Primitives: pass through (null/number/string/boolean).
 */
export function redactAndSort(value: unknown): unknown {
  if (value === null || value === undefined) {
    return null;
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactAndSort(item));
  }
  if (typeof value === "object") {
    const input = value as Record<string, unknown>;
    const sortedKeys = Object.keys(input).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    const out: Record<string, unknown> = {};
    for (const key of sortedKeys) {
      if (isSensitiveKey(key)) {
        continue;
      }
      out[key] = redactAndSort(input[key]);
    }
    return out;
  }
  // numbers, strings, booleans
  return value;
}

/**
 * Canonicalize metadata for hashing:
 * 1. Drop non-JSON values via JSON round-trip (Date → ISO string, undefined dropped).
 * 2. Recursive redact + key sort (arrays keep order).
 *
 * Same metadata with different insertion order MUST produce identical output.
 */
export function canonicalizeMetadata(
  metadata: Record<string, unknown> | null | undefined,
): unknown {
  if (metadata === undefined || metadata === null) return null;
  const jsonSafe = JSON.parse(JSON.stringify(metadata)) as unknown;
  return redactAndSort(jsonSafe);
}

/**
 * Canonical payload for row hashing. Top-level field order is fixed by this object literal.
 * Nested metadata is recursively key-sorted + redacted.
 */
export function buildCanonicalPayload(
  sequenceNumber: bigint,
  previousHash: string | null,
  data: AuditRowData,
  createdAt: Date,
): Record<string, unknown> {
  return {
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
    metadata: canonicalizeMetadata(data.metadata ?? null),
    ipAddressHash: data.ipAddressHash ?? null,
    userAgent: data.userAgent ?? null,
  };
}

/**
 * Serialize canonical payload to a stable UTF-8 string.
 * JSON.stringify preserves the fixed top-level order and the recursively sorted nested keys.
 */
export function serializeCanonical(
  sequenceNumber: bigint,
  previousHash: string | null,
  data: AuditRowData,
  createdAt: Date,
): string {
  return JSON.stringify(buildCanonicalPayload(sequenceNumber, previousHash, data, createdAt));
}

export function computeRowHash(
  sequenceNumber: bigint,
  previousHash: string | null,
  data: AuditRowData,
  createdAt: Date,
): string {
  const canonical = serializeCanonical(sequenceNumber, previousHash, data, createdAt);
  return createHash("sha256").update(canonical, "utf8").digest("hex");
}

/**
 * One-way hash of client IP. Never store raw IP alongside this value.
 */
export function hashIpAddress(ip: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${ip}`, "utf8").digest("hex");
}

/**
 * Redact metadata for persistence (same recursive projection used for hashing).
 * Returns a plain object safe to store in JSONB.
 */
export function redactMetadataForPersistence(
  metadata: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null {
  const result = canonicalizeMetadata(metadata);
  if (result === null || typeof result !== "object" || Array.isArray(result)) {
    return null;
  }
  return result as Record<string, unknown>;
}

export type ChainRow = {
  sequenceNumber: bigint;
  previousHash: string | null;
  rowHash: string;
  /** Optional full fields for deep recompute verification */
  recompute?: {
    data: AuditRowData;
    createdAt: Date;
  };
};

export type ChainVerifyResult =
  | { valid: true; checked: number }
  | { valid: false; reason: string; brokenAt?: bigint; checked: number };

export type VerifyChainOptions = {
  /**
   * When true (default for full-chain), the first row MUST be sequence 1
   * and previousHash MUST be null (genesis).
   * When false (range mode), supply trustedPreviousHash from seq-1 or a checkpoint.
   */
  requireGenesis?: boolean;
  /** For range verification: expected previousHash of the first row in the range. */
  trustedPreviousHash?: string | null;
};

/**
 * Verify contiguous chain linkage (and optional recomputed hashes).
 *
 * Full-chain (requireGenesis=true, default when fromSeq would be 1):
 * - Empty chain → valid with checked=0 (explicit empty behavior).
 * - First row must be sequence 1 with previousHash null.
 * - Missing entire prefix (start at N>1) FAILS.
 *
 * Range (requireGenesis=false):
 * - Must pass trustedPreviousHash equal to the first row's previousHash
 *   (read from row fromSeq-1 or a trusted checkpoint).
 */
export function verifyChain(
  rows: ChainRow[],
  options: VerifyChainOptions = {},
): ChainVerifyResult {
  const requireGenesis = options.requireGenesis ?? true;

  if (rows.length === 0) {
    // Explicit empty-chain behavior: valid, but operators should treat "0 checked"
    // as "nothing verified" — never as "prefix missing is fine".
    return { valid: true, checked: 0 };
  }

  const first = rows[0];
  if (!first) {
    return { valid: true, checked: 0 };
  }

  if (requireGenesis) {
    if (first.sequenceNumber !== 1n) {
      return {
        valid: false,
        reason: "missing_prefix_or_not_genesis",
        brokenAt: first.sequenceNumber,
        checked: 0,
      };
    }
    if (first.previousHash !== null) {
      return {
        valid: false,
        reason: "genesis_previous_hash_must_be_null",
        brokenAt: first.sequenceNumber,
        checked: 0,
      };
    }
  } else if (options.trustedPreviousHash !== undefined) {
    if (first.previousHash !== options.trustedPreviousHash) {
      return {
        valid: false,
        reason: "range_boundary_previous_hash_mismatch",
        brokenAt: first.sequenceNumber,
        checked: 0,
      };
    }
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row) {
      return {
        valid: false,
        reason: "sequence_gap_or_out_of_order",
        checked: i,
      };
    }
    const expectedSeq = first.sequenceNumber + BigInt(i);

    if (row.sequenceNumber !== expectedSeq) {
      return {
        valid: false,
        reason: "sequence_gap_or_out_of_order",
        brokenAt: row.sequenceNumber,
        checked: i,
      };
    }

    if (i > 0) {
      const prev = rows[i - 1];
      if (!prev || row.previousHash !== prev.rowHash) {
        return {
          valid: false,
          reason: "previous_hash_mismatch",
          brokenAt: row.sequenceNumber,
          checked: i,
        };
      }
    }

    if (row.recompute) {
      const expected = computeRowHash(
        row.sequenceNumber,
        row.previousHash,
        row.recompute.data,
        row.recompute.createdAt,
      );
      if (expected !== row.rowHash) {
        return {
          valid: false,
          reason: "row_hash_mismatch",
          brokenAt: row.sequenceNumber,
          checked: i,
        };
      }
    }
  }

  return { valid: true, checked: rows.length };
}

/** Advisory lock key namespace for pg_advisory_xact_lock(hashtext(...)). */
export const AUDIT_CHAIN_LOCK_KEY = "pmtl.audit_chain";
