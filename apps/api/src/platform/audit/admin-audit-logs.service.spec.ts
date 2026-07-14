/**
 * AdminAuditLogsService unit tests (Plans 4.6).
 *
 * The service owns where-building, projection/DTO mapping, and recursive
 * metadata redaction. The controller only validates and delegates, so these
 * tests pin the query construction + projection contract against a mocked
 * repository (no Prisma).
 */
import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundError } from "../../common/errors/app-error.js";
import { AdminAuditLogsService } from "./admin-audit-logs.service.js";
import { AuditRepository } from "./audit.repository.js";

describe("AdminAuditLogsService", () => {
  let service: AdminAuditLogsService;
  let repoMock: {
    findManyForAdmin: ReturnType<typeof vi.fn>;
    findByPublicId: ReturnType<typeof vi.fn>;
  };

  const listRow = {
    publicId: "audit_pub_1",
    actorId: "actor_pub_1",
    actorType: "admin" as const,
    action: "user.update",
    resource: "user",
    resourceId: "user_pub_9",
    correlationId: "req_1",
    sequenceNumber: 42n,
    createdAt: new Date("2026-02-01T00:00:00.000Z"),
  };

  beforeEach(async () => {
    repoMock = {
      findManyForAdmin: vi.fn().mockResolvedValue({ logs: [listRow], total: 1 }),
      findByPublicId: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminAuditLogsService,
        { provide: AuditRepository, useValue: repoMock },
      ],
    }).compile();

    service = module.get<AdminAuditLogsService>(AdminAuditLogsService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ─── list: where construction ───────────────────────────────────────────────

  describe("list() where-building", () => {
    it("passes only provided filters into the repository where clause", async () => {
      await service.list({
        action: "user.update",
        actorId: "actor_pub_1",
        limit: 20,
        offset: 0,
      });

      const arg = repoMock.findManyForAdmin.mock.calls[0][0];
      expect(arg.where).toEqual({ action: "user.update", actorId: "actor_pub_1" });
      expect(arg.skip).toBe(0);
      expect(arg.take).toBe(20);
    });

    it("builds a createdAt range only when a date bound is present", async () => {
      const from = new Date("2026-01-01T00:00:00.000Z");
      const to = new Date("2026-02-01T00:00:00.000Z");
      await service.list({ dateFrom: from, dateTo: to, limit: 20, offset: 0 });

      const arg = repoMock.findManyForAdmin.mock.calls[0][0];
      expect(arg.where.createdAt).toEqual({ gte: from, lte: to });
    });

    it("omits createdAt entirely when no date bound is present", async () => {
      await service.list({ limit: 20, offset: 0 });
      const arg = repoMock.findManyForAdmin.mock.calls[0][0];
      expect(arg.where).not.toHaveProperty("createdAt");
    });
  });

  // ─── list: projection ─────────────────────────────────────────────────────────

  describe("list() projection", () => {
    it("maps rows to the public DTO with honest field names and stringified sequence", async () => {
      const result = await service.list({ limit: 20, offset: 0 });

      // Phase 4.2 batch 3a: list returns canary { items, pagination } (no meta wrap).
      expect(result.items).toEqual([
        {
          publicId: "audit_pub_1",
          actorId: "actor_pub_1",
          actorType: "admin",
          action: "user.update",
          resourceType: "user",
          resourceId: "user_pub_9",
          correlationId: "req_1",
          sequenceNumber: "42",
          occurredAt: listRow.createdAt,
        },
      ]);
      expect(result.pagination).toEqual({
        total: 1,
        limit: 20,
        offset: 0,
        hasMore: false,
      });
    });

    it("computes hasMore when more rows remain beyond the page", async () => {
      repoMock.findManyForAdmin.mockResolvedValue({ logs: [listRow], total: 50 });
      const result = await service.list({ limit: 20, offset: 0 });
      expect(result.pagination.hasMore).toBe(true);
    });
  });

  // ─── detail ──────────────────────────────────────────────────────────────────

  describe("detail()", () => {
    it("throws NotFound when the log does not exist", async () => {
      repoMock.findByPublicId.mockResolvedValue(null);
      await expect(service.detail("missing")).rejects.toThrow(NotFoundError);
    });

    it("recursively redacts sensitive metadata and never leaks the raw ip hash value", async () => {
      repoMock.findByPublicId.mockResolvedValue({
        ...listRow,
        metadata: { password: "secret", nested: { token: "abc", keep: "ok" } },
        ipAddressHash: "a".repeat(64),
        userAgent: "vitest",
      });

      const result = await service.detail("audit_pub_1");

      // sensitive keys are OMITTED (not masked) at every depth — dropping the
      // key is stronger than replacing its value; safe non-sensitive keys survive.
      expect(result.data.metadata).not.toBeNull();
      const meta = result.data.metadata as Record<string, unknown>;
      expect(meta).not.toHaveProperty("password");
      const nested = meta.nested as Record<string, unknown>;
      expect(nested).not.toHaveProperty("token");
      expect(nested.keep).toBe("ok");
      // ip hash is surfaced only as a boolean flag, never the value
      expect(result.data).not.toHaveProperty("ipAddressHash");
      expect(result.data.hasIpHash).toBe(true);
      expect(result.data.sequenceNumber).toBe("42");
    });
  });
});
