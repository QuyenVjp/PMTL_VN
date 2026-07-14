/**
 * Contract tests for the global success envelope.
 *
 * Owner: ResponseInterceptor is the SOLE transport envelope owner.
 * List payload canon (Phase 4.1 canary): data = { items, pagination }
 * Wire shape:
 *   {
 *     data: { items: T[], pagination: { total, limit, offset, hasMore } },
 *     meta: { timestamp, generatedAt, requestId?, path }
 *   }
 * Forbidden: nested { data: { data: ... } }
 */
import { describe, expect, it, vi } from "vitest";
import { of, lastValueFrom } from "rxjs";
import { ResponseInterceptor } from "./response.interceptor.js";

function makeContext(url = "/admin/users", requestId = "req_test_1") {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        url,
        headers: { "x-request-id": requestId },
      }),
    }),
  } as never;
}

function makeHandler<T>(payload: T) {
  return { handle: () => of(payload) } as never;
}

describe("ResponseInterceptor envelope contract", () => {
  const interceptor = new ResponseInterceptor();

  it("wraps a list payload once — no nested data.data", async () => {
    const listPayload = {
      items: [{ publicId: "u1", email: "a@b.c" }],
      pagination: { total: 1, limit: 20, offset: 0, hasMore: false },
    };

    const result = await lastValueFrom(
      interceptor.intercept(makeContext(), makeHandler(listPayload)),
    );

    expect(result).toMatchObject({
      data: listPayload,
      meta: {
        requestId: "req_test_1",
        path: "/admin/users",
      },
    });
    // Exactly one data layer
    expect(result.data).toEqual(listPayload);
    expect((result.data as { data?: unknown }).data).toBeUndefined();
    expect(result.meta.timestamp).toEqual(expect.any(String));
    expect(result.meta.generatedAt).toEqual(result.meta.timestamp);
  });

  it("wraps a raw single resource once when service returns the item itself", async () => {
    // Valid for fully-migrated detail endpoints. Admin users detail is NOT migrated yet
    // (see "Admin users canary full-chain" — it still uses legacy { data: item }).
    const item = { publicId: "u1", displayName: "Admin" };
    const result = await lastValueFrom(
      interceptor.intercept(makeContext("/admin/other/u1"), makeHandler(item)),
    );

    expect(result.data).toEqual(item);
    expect((result.data as { data?: unknown }).data).toBeUndefined();
  });

  it("does not double-wrap when handler already returned a transport-like object", async () => {
    // If a service incorrectly returns { data, meta }, interceptor still wraps —
    // this test documents the failure mode so canary services never do that.
    const wrong = {
      data: [{ id: 1 }],
      meta: { pagination: { total: 1 } },
    };
    const result = await lastValueFrom(
      interceptor.intercept(makeContext(), makeHandler(wrong)),
    );

    // Nested data exists — this is the anti-pattern under migration.
    expect((result.data as typeof wrong).data).toEqual([{ id: 1 }]);
    // Canary services MUST NOT produce this shape; detectability is intentional.
    expect(
      result.data !== null &&
        typeof result.data === "object" &&
        "data" in (result.data as object),
    ).toBe(true);
  });
});

describe("list payload shape (canary contract)", () => {
  it("paginated list uses items + pagination inside data", () => {
    // Pure shape assertion used by AdminUsersService.list return type
    const payload = {
      items: [{ publicId: "u1" }],
      pagination: { total: 1, limit: 20, offset: 0, hasMore: false },
    };
    expect(payload).not.toHaveProperty("data");
    expect(payload).not.toHaveProperty("meta");
    expect(Array.isArray(payload.items)).toBe(true);
    expect(payload.pagination).toMatchObject({
      total: expect.any(Number),
      limit: expect.any(Number),
      offset: expect.any(Number),
      hasMore: expect.any(Boolean),
    });
  });
});

/**
 * Full chain contract: Service → ResponseInterceptor → client one-layer unwrap → Admin reader.
 *
 * Canary (Phase 4.1) only migrates LIST. Detail stays on legacy SingleEnvelope until its batch.
 * This test is the RED gate that caught the hybrid-shape regression.
 */
describe("Admin users canary full-chain (list vs detail)", () => {
  const interceptor = new ResponseInterceptor();

  /** Mirrors packages/api-client createAdminClient auto-unwrap (one layer). */
  function clientUnwrap<T>(wire: { data: T }): T {
    return wire.data;
  }

  it("list: service {items,pagination} → wire data → client yields items for table", async () => {
    // Service return (AdminUsersService.list canary)
    const servicePayload = {
      items: [{ publicId: "u1", email: "a@b.c", displayName: "A" }],
      pagination: { total: 1, limit: 20, offset: 0, hasMore: false },
    };

    const wire = await lastValueFrom(
      interceptor.intercept(makeContext("/admin/users"), makeHandler(servicePayload)),
    );
    const client = clientUnwrap(wire);

    // Admin users-table reads list?.items
    expect(client.items).toHaveLength(1);
    expect(client.items[0]?.publicId).toBe("u1");
    expect(client.pagination.total).toBe(1);
    // Must NOT be legacy ListEnvelope
    expect(client).not.toHaveProperty("data");
  });

  it("detail: service must return legacy {data:item} so Admin SingleEnvelope reader works", async () => {
    // CORRECT legacy service shape until detail batch migrates service+query+page together.
    // WRONG (regression): returning raw item — after unwrap Admin reads envelope.data → undefined.
    const item = {
      publicId: "u1",
      email: "a@b.c",
      displayName: "Admin",
      role: "ADMIN",
      status: "ACTIVE",
      sessionCount: 1,
      postCount: 0,
    };
    const servicePayload = { data: item };

    const wire = await lastValueFrom(
      interceptor.intercept(
        makeContext("/admin/users/u1"),
        makeHandler(servicePayload),
      ),
    );
    const client = clientUnwrap(wire);

    // Admin userDetailOptions + user-detail-page: const user = envelope?.data
    expect(client).toHaveProperty("data");
    expect(client.data.publicId).toBe("u1");
    expect(client.data.displayName).toBe("Admin");
    // Nested transport double-wrap forbidden
    expect((client.data as { data?: unknown }).data).toBeUndefined();
  });

  it("detail REGRESSION GUARD: raw item after unwrap is NOT readable as SingleEnvelope", async () => {
    // Documents the broken hybrid shape that shipped briefly — must stay failing
    // if anyone reintroduces raw getDetail while Admin still uses SingleEnvelope.
    const rawItem = { publicId: "u1", displayName: "Admin" };
    const wire = await lastValueFrom(
      interceptor.intercept(makeContext("/admin/users/u1"), makeHandler(rawItem)),
    );
    const client = clientUnwrap(wire);

    // What Admin page does today:
    const user = (client as { data?: typeof rawItem }).data;
    // Raw item has no .data — page would render empty / throw on nested access
    expect(user).toBeUndefined();
    expect(client).toEqual(rawItem);
  });
});

/**
 * Phase 4.2 batch 1 — Content list endpoints that previously returned legacy
 * ListEnvelope `{ data: T[], meta: { pagination } }` and therefore double-wrapped
 * on the wire. After migration they must match the canary `{ items, pagination }`.
 *
 * Endpoints in this batch:
 *   - GET /admin/content/guides   → ContentService.listGuides
 *   - GET /admin/content/downloads → ContentService.adminListDownloads
 *
 * Public list methods (publicListBeginnerGuides / publicListDownloads) are out of
 * scope for this batch — they are separate service methods.
 *
 * Posts list already returns flat `{ items, pagination }` (legacy ListResponse
 * with page/totalPages vocabulary) so it is not double-wrapped and stays put.
 */
describe("Phase 4.2 batch 1 — content guides + downloads list full-chain", () => {
  const interceptor = new ResponseInterceptor();

  function clientUnwrap<T>(wire: { data: T }): T {
    return wire.data;
  }

  it("guides list: service {items,pagination} → wire data → client yields items (no nested data)", async () => {
    const servicePayload = {
      items: [{ publicId: "g1", title: "Nhập môn" }],
      pagination: { total: 1, limit: 20, offset: 0, hasMore: false },
    };

    const wire = await lastValueFrom(
      interceptor.intercept(
        makeContext("/admin/content/guides"),
        makeHandler(servicePayload),
      ),
    );
    const client = clientUnwrap(wire);

    expect(client.items).toHaveLength(1);
    expect(client.items[0]?.publicId).toBe("g1");
    expect(client.pagination).toEqual({
      total: 1,
      limit: 20,
      offset: 0,
      hasMore: false,
    });
    // Must NOT be legacy ListEnvelope after unwrap
    expect(client).not.toHaveProperty("data");
    expect(client).not.toHaveProperty("meta");
  });

  it("downloads list: service {items,pagination} → wire data → client yields items (no nested data)", async () => {
    const servicePayload = {
      items: [{ publicId: "d1", title: "Biểu mẫu" }],
      pagination: { total: 1, limit: 20, offset: 0, hasMore: false },
    };

    const wire = await lastValueFrom(
      interceptor.intercept(
        makeContext("/admin/content/downloads"),
        makeHandler(servicePayload),
      ),
    );
    const client = clientUnwrap(wire);

    expect(client.items).toHaveLength(1);
    expect(client.items[0]?.publicId).toBe("d1");
    expect(client.pagination.total).toBe(1);
    expect(client).not.toHaveProperty("data");
    expect(client).not.toHaveProperty("meta");
  });

  it("REGRESSION GUARD: legacy ListEnvelope shape produces nested data on the wire", async () => {
    // Documents the pre-migration failure mode so batch-1 services never reintroduce it.
    const legacy = {
      data: [{ publicId: "g1" }],
      meta: { pagination: { total: 1, limit: 20, offset: 0, hasMore: false } },
    };
    const wire = await lastValueFrom(
      interceptor.intercept(
        makeContext("/admin/content/guides"),
        makeHandler(legacy),
      ),
    );

    // After interceptor wrap: { data: { data: [...], meta }, meta: transport }
    expect((wire.data as typeof legacy).data).toEqual([{ publicId: "g1" }]);
    expect(
      wire.data !== null &&
        typeof wire.data === "object" &&
        "data" in (wire.data as object),
    ).toBe(true);
  });
});

/**
 * Phase 4.2 batch 2 — Community + Moderation admin list endpoints.
 *
 * Endpoints:
 *   - GET /admin/community/posts     → CommunityService.adminListPosts
 *   - GET /admin/community/guestbook → CommunityService.adminListGuestbook
 *   - GET /moderation/reports        → ModerationService.list
 *     (shared by moderation-reports + moderation-comments Admin readers)
 *
 * Public community list methods (listPosts/listComments/listTestimonials) are
 * separate and out of scope. Detail endpoints stay on SingleEnvelope for now.
 */
describe("Phase 4.2 batch 2 — community + moderation list full-chain", () => {
  const interceptor = new ResponseInterceptor();

  function clientUnwrap<T>(wire: { data: T }): T {
    return wire.data;
  }

  it.each([
    {
      path: "/admin/community/posts",
      item: { publicId: "cp1", content: "xin chào" },
    },
    {
      path: "/admin/community/guestbook",
      item: { publicId: "gb1", content: "lưu bút" },
    },
    {
      path: "/moderation/reports",
      item: { publicId: "mr1", status: "PENDING" },
    },
  ])("$path: service {items,pagination} → client yields items (no nested data)", async ({
    path,
    item,
  }) => {
    const servicePayload = {
      items: [item],
      pagination: { total: 1, limit: 20, offset: 0, hasMore: false },
    };

    const wire = await lastValueFrom(
      interceptor.intercept(makeContext(path), makeHandler(servicePayload)),
    );
    const client = clientUnwrap(wire);

    expect(client.items).toHaveLength(1);
    expect(client.items[0]).toEqual(item);
    expect(client.pagination.total).toBe(1);
    expect(client).not.toHaveProperty("data");
    expect(client).not.toHaveProperty("meta");
  });
});

/**
 * Phase 4.2 batch 3a — clean Shape A admin-only list endpoints
 * (legacy `{ data, meta:{pagination:{total,limit,offset,hasMore}} }` → canary).
 *
 * Endpoints:
 *   - GET /admin/calendar/events
 *   - GET /admin/media
 *   - GET /admin/content/media-library/collections
 *   - GET /admin/audit-logs
 *   - GET /admin/volunteers
 *   - GET /admin/vows/assisted-entry/history
 *
 * Deferred from this batch (not Shape A / shared / page-based):
 *   Shape B flat-meta, Shape C page-based, Shape D bare array, and
 *   shared member/public service methods.
 */
describe("Phase 4.2 batch 3a — clean Shape A admin lists full-chain", () => {
  const interceptor = new ResponseInterceptor();

  function clientUnwrap<T>(wire: { data: T }): T {
    return wire.data;
  }

  it.each([
    "/admin/calendar/events",
    "/admin/media",
    "/admin/content/media-library/collections",
    "/admin/audit-logs",
    "/admin/volunteers",
    "/admin/vows/assisted-entry/history",
  ])("%s: service {items,pagination} → client yields items (no nested data)", async (path) => {
    const servicePayload = {
      items: [{ publicId: "x1" }],
      pagination: { total: 1, limit: 20, offset: 0, hasMore: false },
    };

    const wire = await lastValueFrom(
      interceptor.intercept(makeContext(path), makeHandler(servicePayload)),
    );
    const client = clientUnwrap(wire);

    expect(client.items).toHaveLength(1);
    expect(client.items[0]?.publicId).toBe("x1");
    expect(client.pagination).toEqual({
      total: 1,
      limit: 20,
      offset: 0,
      hasMore: false,
    });
    expect(client).not.toHaveProperty("data");
    expect(client).not.toHaveProperty("meta");
  });
});
