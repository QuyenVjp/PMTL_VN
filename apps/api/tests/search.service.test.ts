import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "../../common/config/config.service.js";
import { SearchService } from "./search.service.js";
import { MeilisearchAdapter } from "./adapters/meilisearch.adapter.js";
import { SqlFallbackProvider } from "./providers/sql-fallback.provider.js";
import { DocumentMapper } from "./providers/document.mapper.js";
import type { SearchQuery } from "@pmtl/shared/schemas/search.js";
import type { SearchHit } from "./types/search.types.js";

describe("SearchService", () => {
  let service: SearchService;
  let meilisearchAdapter: jest.Mocked<MeilisearchAdapter>;
  let sqlFallbackProvider: jest.Mocked<SqlFallbackProvider>;
  let documentMapper: jest.Mocked<DocumentMapper>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const meilisearchAdapterMock = {
      search: jest.fn(),
      reindex: jest.fn(),
      checkHealth: jest.fn(),
    };

    const sqlFallbackProviderMock = {
      search: jest.fn(),
    };

    const documentMapperMock = {
      loadDocumentsForIndex: jest.fn(),
    };

    const configServiceMock = {
      searchEngine: "meilisearch",
      searchSqlFallbackEnabled: true,
      meiliHost: "http://localhost:7700",
      meiliIndexPrefix: "pmtl_",
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: MeilisearchAdapter, useValue: meilisearchAdapterMock },
        { provide: SqlFallbackProvider, useValue: sqlFallbackProviderMock },
        { provide: DocumentMapper, useValue: documentMapperMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    meilisearchAdapter = module.get(MeilisearchAdapter);
    sqlFallbackProvider = module.get(SqlFallbackProvider);
    documentMapper = module.get(DocumentMapper);
    configService = module.get(ConfigService);
  });

  describe("search", () => {
    const mockQuery: SearchQuery = { q: "test query", limit: 10, offset: 0 };
    const mockHits: SearchHit[] = [
      {
        id: "test-1",
        index: "posts",
        title: "Test Post",
        excerpt: "Test excerpt",
        href: "/test-post",
        publishedAt: "2024-01-01T00:00:00.000Z",
      },
    ];

    it("should use meilisearch when configured", async () => {
      meilisearchAdapter.search.mockResolvedValue({ hits: mockHits, totalHits: 1 });

      const result = await service.search(mockQuery);

      expect(meilisearchAdapter.search).toHaveBeenCalledWith(mockQuery, ["posts", "events", "guides", "downloads", "community"]);
      expect(result).toMatchObject({
        hits: mockHits,
        totalHits: 1,
        query: "test query",
        engine: "meilisearch",
        fallbackUsed: false,
      });
      expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
    });

    it("should fallback to SQL when meilisearch fails", async () => {
      meilisearchAdapter.search.mockRejectedValue(new Error("Meilisearch connection failed"));
      sqlFallbackProvider.search.mockResolvedValue({ hits: mockHits, totalHits: 1 });

      const result = await service.search(mockQuery);

      expect(sqlFallbackProvider.search).toHaveBeenCalledWith(mockQuery, ["posts", "events", "guides", "downloads", "community"]);
      expect(result).toMatchObject({
        hits: mockHits,
        totalHits: 1,
        query: "test query",
        engine: "sql",
        fallbackUsed: true,
      });
    });

    it("should throw when fallback is disabled and meilisearch fails", async () => {
      configService.searchSqlFallbackEnabled = false;
      meilisearchAdapter.search.mockRejectedValue(new Error("Meilisearch connection failed"));

      await expect(service.search(mockQuery)).rejects.toThrow("Search unavailable: fallback is disabled");
    });

    it("should resolve sutras index to guides", async () => {
      const sutrasQuery: SearchQuery = { q: "test", index: "sutras", limit: 10, offset: 0 };
      meilisearchAdapter.search.mockResolvedValue({ hits: mockHits, totalHits: 1 });

      await service.search(sutrasQuery);

      expect(meilisearchAdapter.search).toHaveBeenCalledWith(sutrasQuery, ["guides"]);
    });
  });

  describe("reindex", () => {
    const mockDocs: SearchHit[] = [
      {
        id: "doc-1",
        index: "posts",
        title: "Document 1",
        excerpt: "Document excerpt",
        href: "/doc-1",
        publishedAt: "2024-01-01T00:00:00.000Z",
      },
    ];

    it("should reindex when meilisearch is configured", async () => {
      documentMapper.loadDocumentsForIndex.mockResolvedValue(mockDocs);
      meilisearchAdapter.reindex.mockResolvedValue();

      const result = await service.reindex("posts");

      expect(documentMapper.loadDocumentsForIndex).toHaveBeenCalledWith("posts");
      expect(meilisearchAdapter.reindex).toHaveBeenCalledWith("posts", mockDocs);
      expect(result).toEqual({
        status: "queued",
        indexName: "posts",
        indexes: ["posts"],
        message: "Reindex đã gửi lên Meilisearch",
      });
    });

    it("should skip reindex when not using meilisearch", async () => {
      configService.searchEngine = "sql";

      const result = await service.reindex("posts");

      expect(documentMapper.loadDocumentsForIndex).not.toHaveBeenCalled();
      expect(meilisearchAdapter.reindex).not.toHaveBeenCalled();
      expect(result).toEqual({
        status: "skipped",
        indexName: "posts",
        message: "Search engine hiện tại không phải meilisearch",
      });
    });

    it("should reindex all indexes when indexName is 'all'", async () => {
      documentMapper.loadDocumentsForIndex.mockResolvedValue(mockDocs);
      meilisearchAdapter.reindex.mockResolvedValue();

      const result = await service.reindex("all");

      expect(documentMapper.loadDocumentsForIndex).toHaveBeenCalledTimes(5); // all indexes
      expect(meilisearchAdapter.reindex).toHaveBeenCalledTimes(5);
      expect(result.indexes).toEqual(["posts", "events", "guides", "downloads", "community"]);
    });
  });

  describe("getAdminStatus", () => {
    it("should return operational status when meilisearch is healthy", async () => {
      meilisearchAdapter.checkHealth.mockResolvedValue("up");

      const result = await service.getAdminStatus();

      expect(result).toMatchObject({
        engine: "meilisearch",
        fallback: "postgresql-fts",
        status: "operational",
        meilisearch: {
          host: "http://localhost:7700",
          health: "up",
        },
      });
      expect(result.checkedAt).toBeDefined();
      expect(result.indexes).toHaveLength(5);
    });

    it("should return degraded status when meilisearch is down", async () => {
      meilisearchAdapter.checkHealth.mockResolvedValue("down");

      const result = await service.getAdminStatus();

      expect(result.status).toBe("degraded");
      expect(result.meilisearch.health).toBe("down");
    });

    it("should return operational status when using SQL engine", async () => {
      configService.searchEngine = "sql";

      const result = await service.getAdminStatus();

      expect(result.status).toBe("operational");
      expect(result.engine).toBe("sql");
    });
  });
});