/**
 * SearchService Unit Tests
 *
 * Coverage:
 * - search(): cache hit trả về ngay, cache miss gọi Meilisearch, fallback sang SQL khi Meili lỗi
 * - reindex(): bỏ qua khi engine không phải meilisearch, gọi meiliRequest cho mỗi index khi engine là meilisearch
 * - getAdminStatus(): "up" khi health check pass, "down" khi lỗi
 */

import { Test, TestingModule } from "@nestjs/testing";
import { SearchService } from "../search.service.js";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { ConfigService } from "../../../common/config/config.service.js";
import { CacheService } from "../../../common/cache/cache.service.js";
import { CircuitBreakerService } from "../../../common/resilience/circuit-breaker.service.js";
import type { SearchQuery } from "../search.schemas.js";

describe("SearchService", () => {
  let service: SearchService;
  let prismaMock: {
    post: { findMany: ReturnType<typeof vi.fn> };
    calendarEvent: { findMany: ReturnType<typeof vi.fn> };
    beginnerGuide: { findMany: ReturnType<typeof vi.fn> };
    download: { findMany: ReturnType<typeof vi.fn> };
    communityPost: { findMany: ReturnType<typeof vi.fn> };
    wisdomEntry: { findMany: ReturnType<typeof vi.fn> };
    wisdomQuestion: { findMany: ReturnType<typeof vi.fn> };
    sutraMetadata: { findMany: ReturnType<typeof vi.fn> };
  };
  let configMock: {
    searchEngine: string;
    searchSqlFallbackEnabled: boolean;
    meiliHost: string;
    meiliApiKey: string;
    meiliIndexPrefix: string;
    searchTimeoutMs: number;
  };
  let cacheMock: {
    getJson: ReturnType<typeof vi.fn>;
    setJson: ReturnType<typeof vi.fn>;
  };
  let circuitBreakerMock: {
    create: ReturnType<typeof vi.fn>;
  };

  // Circuit breaker fire mock — controlled per test
  let breakerFireMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    prismaMock = {
      post: { findMany: vi.fn().mockResolvedValue([]) },
      calendarEvent: { findMany: vi.fn().mockResolvedValue([]) },
      beginnerGuide: { findMany: vi.fn().mockResolvedValue([]) },
      download: { findMany: vi.fn().mockResolvedValue([]) },
      communityPost: { findMany: vi.fn().mockResolvedValue([]) },
      wisdomEntry: { findMany: vi.fn().mockResolvedValue([]) },
      wisdomQuestion: { findMany: vi.fn().mockResolvedValue([]) },
      sutraMetadata: { findMany: vi.fn().mockResolvedValue([]) },
    };

    configMock = {
      searchEngine: "meilisearch",
      searchSqlFallbackEnabled: true,
      meiliHost: "http://localhost:7700",
      meiliApiKey: "test-key",
      meiliIndexPrefix: "pmtl_",
      searchTimeoutMs: 3000,
    };

    cacheMock = {
      getJson: vi.fn(),
      setJson: vi.fn().mockResolvedValue(undefined),
    };

    breakerFireMock = vi.fn();

    // CircuitBreakerService.create() returns a breaker object with fire() + fallback()
    const mockBreaker = {
      fire: breakerFireMock,
      fallback: vi.fn(),
    };

    circuitBreakerMock = {
      create: vi.fn().mockReturnValue(mockBreaker),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ConfigService, useValue: configMock },
        { provide: CacheService, useValue: cacheMock },
        { provide: CircuitBreakerService, useValue: circuitBreakerMock },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ─── search() ────────────────────────────────────────────────────────────────

  describe("search()", () => {
    const baseQuery: SearchQuery = { q: "phật pháp", limit: 10, offset: 0 };

    it("should trả về cached result ngay khi cache hit", async () => {
      const cachedResult = { hits: [{ id: "1", title: "Phật pháp" }], totalHits: 1, engine: "meilisearch" };
      cacheMock.getJson.mockResolvedValue(cachedResult);

      const result = await service.search(baseQuery);

      expect(cacheMock.getJson).toHaveBeenCalledWith(expect.stringContaining("phật pháp"));
      expect(result).toEqual(cachedResult);
      // Không gọi meili hay prisma khi cache hit
      expect(breakerFireMock).not.toHaveBeenCalled();
      expect(prismaMock.post.findMany).not.toHaveBeenCalled();
    });

    it("should gọi Meilisearch khi cache miss và engine là meilisearch", async () => {
      cacheMock.getJson.mockResolvedValue(null);
      // Meili trả về hits
      breakerFireMock.mockResolvedValue({
        hits: [{ id: "post-1", title: "Bài viết", excerpt: "Trích đoạn", href: "/bai-viet/1", publishedAt: null }],
        estimatedTotalHits: 1,
      });

      const result = await service.search(baseQuery);

      expect(breakerFireMock).toHaveBeenCalled();
      expect(result).toMatchObject({
        engine: "meilisearch",
        fallbackUsed: false,
        query: "phật pháp",
      });
      expect(cacheMock.setJson).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ engine: "meilisearch" }),
        300,
      );
    });

    it("should fallback sang SQL khi Meilisearch throw lỗi", async () => {
      cacheMock.getJson.mockResolvedValue(null);
      configMock.searchEngine = "meilisearch";
      configMock.searchSqlFallbackEnabled = true;

      breakerFireMock.mockRejectedValue(new Error("Meilisearch connection refused"));
      prismaMock.post.findMany.mockResolvedValue([
        { publicId: "pub-1", title: "Hướng dẫn", slug: "huong-dan", publishedAt: new Date("2025-01-01") },
      ]);

      const result = await service.search(baseQuery);

      expect(result).toMatchObject({
        engine: "sql",
        fallbackUsed: true,
        query: "phật pháp",
      });
      expect(result.hits.length).toBeGreaterThan(0);
      // Cache fallback kết quả với TTL ngắn hơn
      expect(cacheMock.setJson).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ engine: "sql" }),
        60,
      );
    });

    it("should throw khi SQL fallback bị disabled và Meili lỗi", async () => {
      cacheMock.getJson.mockResolvedValue(null);
      configMock.searchEngine = "meilisearch";
      configMock.searchSqlFallbackEnabled = false;

      breakerFireMock.mockRejectedValue(new Error("Meilisearch down"));

      await expect(service.search(baseQuery)).rejects.toThrow("Search unavailable");
    });

    it("should dùng SQL trực tiếp khi engine là sql (không qua meili)", async () => {
      configMock.searchEngine = "sql";
      cacheMock.getJson.mockResolvedValue(null);
      prismaMock.post.findMany.mockResolvedValue([]);

      const result = await service.search(baseQuery);

      expect(breakerFireMock).not.toHaveBeenCalled();
      expect(result).toMatchObject({ engine: "sql", fallbackUsed: true });
    });

    it("should cache với key chứa query và index", async () => {
      const indexedQuery: SearchQuery = { q: "sám hối", index: "posts", limit: 5, offset: 0 };
      cacheMock.getJson.mockResolvedValue(null);
      breakerFireMock.mockResolvedValue({ hits: [], estimatedTotalHits: 0 });

      await service.search(indexedQuery);

      expect(cacheMock.getJson).toHaveBeenCalledWith(expect.stringContaining("posts"));
      expect(cacheMock.getJson).toHaveBeenCalledWith(expect.stringContaining("sám hối"));
    });
  });

  // ─── reindex() ───────────────────────────────────────────────────────────────

  describe("reindex()", () => {
    it("should bỏ qua (skipped) khi engine không phải meilisearch", async () => {
      configMock.searchEngine = "sql";

      const result = await service.reindex("all");

      expect(result).toMatchObject({
        status: "skipped",
        indexName: "all",
      });
      expect(breakerFireMock).not.toHaveBeenCalled();
    });

    it("should gọi meiliRequest cho tất cả indexes khi reindex('all')", async () => {
      configMock.searchEngine = "meilisearch";
      // ensureMeiliIndex + DELETE + POST (nếu có docs) per index
      breakerFireMock.mockResolvedValue({});
      // Mỗi index loadDocumentsForIndex → prisma trả về rỗng để tránh POST
      prismaMock.post.findMany.mockResolvedValue([]);
      prismaMock.calendarEvent.findMany.mockResolvedValue([]);
      prismaMock.beginnerGuide.findMany.mockResolvedValue([]);
      prismaMock.download.findMany.mockResolvedValue([]);
      prismaMock.communityPost.findMany.mockResolvedValue([]);
      prismaMock.wisdomEntry.findMany.mockResolvedValue([]);
      prismaMock.wisdomQuestion.findMany.mockResolvedValue([]);
      prismaMock.sutraMetadata.findMany.mockResolvedValue([]);

      const result = await service.reindex("all");

      expect(result).toMatchObject({
        status: "queued",
        indexName: "all",
      });
      expect((result as { indexes: string[] }).indexes).toHaveLength(8);
      // ít nhất: POST /indexes (ensure) + DELETE /documents per index = 10 calls tối thiểu
      expect(breakerFireMock.mock.calls.length).toBeGreaterThanOrEqual(10);
    });

    it("should chỉ reindex index được chỉ định khi không phải 'all'", async () => {
      configMock.searchEngine = "meilisearch";
      breakerFireMock.mockResolvedValue({});
      prismaMock.post.findMany.mockResolvedValue([]);

      const result = await service.reindex("posts");

      expect(result).toMatchObject({ status: "queued" });
      expect((result as { indexes: string[] }).indexes).toEqual(["posts"]);
    });

    it("should gửi documents lên Meili khi có docs trong DB", async () => {
      configMock.searchEngine = "meilisearch";
      breakerFireMock.mockResolvedValue({});
      prismaMock.post.findMany.mockResolvedValue([
        { publicId: "pub-1", title: "Bài viết test", slug: "bai-viet-test", publishedAt: new Date("2025-01-01") },
      ]);

      await service.reindex("posts");

      // Phải có ít nhất 1 lần gọi POST với documents
      const postDocumentsCalls = breakerFireMock.mock.calls.filter(
        (args) => args[0] === "POST" && (args[1] as string).includes("/documents"),
      );
      expect(postDocumentsCalls.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ─── getAdminStatus() ────────────────────────────────────────────────────────

  describe("getAdminStatus()", () => {
    it("should trả về health 'up' khi meili health check pass", async () => {
      configMock.searchEngine = "meilisearch";
      breakerFireMock.mockResolvedValue({ status: "available" });

      const result = await service.getAdminStatus();

      expect(result.meilisearch.health).toBe("up");
      expect(result.status).toBe("operational");
    });

    it("should trả về health 'down' khi meili health check throw lỗi", async () => {
      configMock.searchEngine = "meilisearch";
      breakerFireMock.mockRejectedValue(new Error("Meili không phản hồi"));

      const result = await service.getAdminStatus();

      expect(result.meilisearch.health).toBe("down");
      expect(result.status).toBe("degraded");
    });

    it("should trả về status 'operational' khi engine là sql (không cần Meili)", async () => {
      configMock.searchEngine = "sql";

      const result = await service.getAdminStatus();

      expect(result.engine).toBe("sql");
      expect(result.status).toBe("operational");
      // Không gọi Meili khi engine = sql
      expect(breakerFireMock).not.toHaveBeenCalled();
    });

    it("should chứa danh sách indexes với uid đúng prefix", async () => {
      configMock.searchEngine = "sql";
      configMock.meiliIndexPrefix = "pmtl_";

      const result = await service.getAdminStatus();

      expect(result.indexes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: "posts", uid: "pmtl_posts" }),
          expect.objectContaining({ name: "events", uid: "pmtl_events" }),
        ]),
      );
    });

    it("should bao gồm checkedAt ISO timestamp", async () => {
      configMock.searchEngine = "sql";

      const result = await service.getAdminStatus();

      expect(result.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });
});
