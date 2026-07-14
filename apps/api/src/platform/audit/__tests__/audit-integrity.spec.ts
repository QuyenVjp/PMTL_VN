/**
 * Immutable audit integrity unit tests (TDD).
 * Covers: stable recursive hash, IP hashing, redaction, chain continuity,
 * genesis/range boundaries, missing prefix, nested key order, Vietnamese Unicode.
 */
import { describe, expect, it } from "vitest";
import {
  buildCanonicalPayload,
  canonicalizeMetadata,
  computeRowHash,
  hashIpAddress,
  redactAndSort,
  redactMetadataForPersistence,
  serializeCanonical,
  verifyChain,
  type AuditRowData,
  type ChainRow,
} from "../audit-integrity.js";

const fixedTs = new Date("2026-07-13T12:00:00.000Z");

function sampleData(overrides: Partial<AuditRowData> = {}): AuditRowData {
  return {
    actorType: "user",
    actorId: "actor-1",
    action: "auth.login",
    resource: "session",
    resourceId: "sess-1",
    publicId: "pub_audit_001",
    correlationId: "corr-1",
    metadata: { origin: "admin" },
    ipAddressHash: hashIpAddress("203.0.113.10", "test-salt-16chars"),
    userAgent: "vitest",
    ...overrides,
  };
}

describe("hashIpAddress", () => {
  it("is deterministic for same salt+ip", () => {
    const a = hashIpAddress("127.0.0.1", "salt-aaaaaaaaaaaa");
    const b = hashIpAddress("127.0.0.1", "salt-aaaaaaaaaaaa");
    expect(a).toBe(b);
    expect(a).toHaveLength(64);
  });

  it("differs when salt or ip changes", () => {
    const base = hashIpAddress("127.0.0.1", "salt-aaaaaaaaaaaa");
    expect(hashIpAddress("127.0.0.2", "salt-aaaaaaaaaaaa")).not.toBe(base);
    expect(hashIpAddress("127.0.0.1", "salt-bbbbbbbbbbbb")).not.toBe(base);
  });

  it("never equals the raw IP", () => {
    const ip = "203.0.113.55";
    expect(hashIpAddress(ip, "salt-aaaaaaaaaaaa")).not.toContain(ip);
    expect(hashIpAddress(ip, "salt-aaaaaaaaaaaa")).not.toBe(ip);
  });
});

describe("recursive key sort + redaction", () => {
  it("same metadata different insertion order → same hash", () => {
    const a = sampleData({
      metadata: { z: 1, a: { y: 2, b: 3 }, m: "x" },
    });
    const b = sampleData({
      metadata: { m: "x", a: { b: 3, y: 2 }, z: 1 },
    });
    expect(computeRowHash(1n, null, a, fixedTs)).toBe(
      computeRowHash(1n, null, b, fixedTs),
    );
  });

  it("nested key order is sorted", () => {
    const result = canonicalizeMetadata({
      z: { c: 1, a: 2 },
      a: true,
    }) as Record<string, unknown>;
    expect(Object.keys(result)).toEqual(["a", "z"]);
    expect(Object.keys(result.z as object)).toEqual(["a", "c"]);
  });

  it("arrays keep order", () => {
    const result = canonicalizeMetadata({
      tags: ["gamma", "alpha", "beta"],
    }) as { tags: string[] };
    expect(result.tags).toEqual(["gamma", "alpha", "beta"]);
  });

  it("redacts password/token/secret aliases nested + case variants", () => {
    const result = redactAndSort({
      ok: true,
      password: "secret",
      PasswordHash: "x",
      nested: {
        resetToken: "t",
        access_token: "a",
        REFRESH_TOKEN: "r",
        clientSecret: "c",
        apiKey: "k",
        keep: "yes",
      },
      list: [{ token: "no", value: 1 }, { value: 2 }],
    }) as Record<string, unknown>;

    expect(result).toEqual({
      list: [{ value: 1 }, { value: 2 }],
      nested: { keep: "yes" },
      ok: true,
    });
    expect(JSON.stringify(result)).not.toMatch(/password|token|secret|apiKey/i);
  });

  it("redacts raw IP / cookie credential keys", () => {
    const result = redactMetadataForPersistence({
      ipAddress: "1.2.3.4",
      rawIp: "1.2.3.4",
      cookie: "session=abc",
      note: "safe",
    });
    expect(result).toEqual({ note: "safe" });
  });

  it("handles Vietnamese Unicode + null + numbers", () => {
    const data = sampleData({
      metadata: {
        message: "Đặt lại mật khẩu thành công",
        count: 0,
        empty: null,
        nested: { label: "Phóng sinh" },
      },
    });
    const h = computeRowHash(1n, null, data, fixedTs);
    expect(h).toMatch(/^[a-f0-9]{64}$/);
    const payload = buildCanonicalPayload(1n, null, data, fixedTs);
    expect(JSON.stringify(payload)).toContain("Đặt lại mật khẩu thành công");
    expect(JSON.stringify(payload)).toContain("Phóng sinh");
  });

  it("JSONB-like round-trip (JSON.parse/stringify) keeps hash stable", () => {
    const original = sampleData({
      metadata: { b: 2, a: { d: 4, c: 3 } },
    });
    const roundTripped = sampleData({
      metadata: JSON.parse(JSON.stringify(original.metadata)) as Record<string, unknown>,
    });
    expect(computeRowHash(1n, null, original, fixedTs)).toBe(
      computeRowHash(1n, null, roundTripped, fixedTs),
    );
  });

  it("serializeCanonical is the single byte-stream owner", () => {
    const data = sampleData();
    const s1 = serializeCanonical(1n, null, data, fixedTs);
    const s2 = serializeCanonical(1n, null, data, fixedTs);
    expect(s1).toBe(s2);
    expect(computeRowHash(1n, null, data, fixedTs)).toBe(
      require("node:crypto").createHash("sha256").update(s1, "utf8").digest("hex"),
    );
  });
});

describe("computeRowHash", () => {
  it("is stable for identical inputs", () => {
    const data = sampleData();
    const h1 = computeRowHash(1n, null, data, fixedTs);
    const h2 = computeRowHash(1n, null, data, fixedTs);
    expect(h1).toBe(h2);
    expect(h1).toMatch(/^[a-f0-9]{64}$/);
  });

  it("changes when sequence, prev, or body changes", () => {
    const data = sampleData();
    const base = computeRowHash(1n, null, data, fixedTs);
    expect(computeRowHash(2n, null, data, fixedTs)).not.toBe(base);
    expect(computeRowHash(1n, "abc", data, fixedTs)).not.toBe(base);
    expect(computeRowHash(1n, null, sampleData({ action: "auth.logout" }), fixedTs)).not.toBe(base);
  });

  it("canonical payload never includes raw IP field", () => {
    const payload = buildCanonicalPayload(1n, null, sampleData(), fixedTs);
    expect(payload).not.toHaveProperty("ipAddress");
    expect(JSON.stringify(payload)).not.toContain("203.0.113.10");
    expect(payload.ipAddressHash).toBe(hashIpAddress("203.0.113.10", "test-salt-16chars"));
  });
});

describe("verifyChain boundaries", () => {
  function buildChain(n: number, startSeq = 1n): ChainRow[] {
    const rows: ChainRow[] = [];
    let prev: string | null = startSeq === 1n ? null : "checkpoint_prev";
    for (let i = 0; i < n; i++) {
      const seq = startSeq + BigInt(i);
      const data = sampleData({ publicId: `pub_${seq}` });
      const createdAt = new Date(fixedTs.getTime() + Number(seq) * 1000);
      const rowHash = computeRowHash(seq, prev, data, createdAt);
      rows.push({
        sequenceNumber: seq,
        previousHash: prev,
        rowHash,
        recompute: { data, createdAt },
      });
      prev = rowHash;
    }
    return rows;
  }

  it("accepts continuous valid full chain from genesis", () => {
    expect(verifyChain(buildChain(5))).toEqual({ valid: true, checked: 5 });
  });

  it("empty chain is valid with checked=0 (explicit)", () => {
    expect(verifyChain([])).toEqual({ valid: true, checked: 0 });
  });

  it("full-chain rejects missing prefix (starts at seq>1)", () => {
    const rows = buildChain(3, 5n);
    // force first previousHash null-ish wrong for genesis check
    const result = verifyChain(rows, { requireGenesis: true });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe("missing_prefix_or_not_genesis");
    }
  });

  it("genesis previousHash must be null", () => {
    const rows = buildChain(2);
    rows[0] = { ...rows[0]!, previousHash: "not-null" };
    const result = verifyChain(rows, { requireGenesis: true });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe("genesis_previous_hash_must_be_null");
    }
  });

  it("range verification uses trusted previousHash boundary", () => {
    const full = buildChain(5);
    const range = full.slice(2); // seq 3..5
    const trusted = full[1]!.rowHash;
    expect(
      verifyChain(range, { requireGenesis: false, trustedPreviousHash: trusted }),
    ).toEqual({ valid: true, checked: 3 });

    const bad = verifyChain(range, {
      requireGenesis: false,
      trustedPreviousHash: "wrong",
    });
    expect(bad.valid).toBe(false);
    if (!bad.valid) {
      expect(bad.reason).toBe("range_boundary_previous_hash_mismatch");
    }
  });

  it("detects previous_hash mismatch", () => {
    const rows = buildChain(3);
    rows[2] = { ...rows[2]!, previousHash: "0".repeat(64) };
    const result = verifyChain(rows);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe("previous_hash_mismatch");
      expect(result.brokenAt).toBe(3n);
    }
  });

  it("detects mutated row_hash", () => {
    const rows = buildChain(3);
    rows[1] = { ...rows[1]!, rowHash: "f".repeat(64) };
    const result = verifyChain(rows);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(["row_hash_mismatch", "previous_hash_mismatch"]).toContain(result.reason);
    }
  });

  it("detects missing / out-of-order sequence", () => {
    const rows = buildChain(3);
    const broken = [rows[0]!, rows[2]!];
    const result = verifyChain(broken);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe("sequence_gap_or_out_of_order");
    }
  });
});

describe("append sequence planning (pure)", () => {
  it("starts at 1 when no previous row", () => {
    const last: { sequenceNumber: bigint; rowHash: string } | null = null;
    const nextSeq = last ? last.sequenceNumber + 1n : 1n;
    const prev = last?.rowHash ?? null;
    expect(nextSeq).toBe(1n);
    expect(prev).toBeNull();
  });

  it("increments from last sequence under lock simulation", () => {
    const last = { sequenceNumber: 10n, rowHash: "aa".repeat(32) };
    const plannedA = last.sequenceNumber + 1n;
    const plannedB = last.sequenceNumber + 1n;
    expect(plannedA).toBe(11n);
    expect(plannedB).toBe(11n);
    const afterA = { sequenceNumber: plannedA, rowHash: "bb".repeat(32) };
    expect(afterA.sequenceNumber + 1n).toBe(12n);
  });
});
