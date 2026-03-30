import { Test, TestingModule } from "@nestjs/testing";
import { CacheService } from "../../common/cache/cache.service.js";
import { SearchService } from "./search.service.js";
import { ConfigService } from "../../common/config/config.service.js";
import { MeilisearchAdapter } from "./adapters/meilisearch.adapter.js";
import { SqlFallbackProvider } from "./providers/sql-fallback.provider.js";
import { DocumentMapper } from "./providers/document.mapper.js";
import type { SearchQuery } from "@pmtl/shared/schemas/search.js";
import type { SearchResult } from "./types/search.types.js";

describe("SearchService Redis Integration", () => {
  let service: SearchService;
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    const cacheServiceMock = {
      getJson: jest.fn(),
      setJson: jest.fn(),
    };

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
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: CacheService, useValue: cacheServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
        { provide: MeilisearchAdapter, useValue: meilisearchAdapterMock },
        { provide: SqlFallbackProvider, useValue: sqlFallbackProviderMock },
        { provide: DocumentMapper, useValue: documentMapperMock },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    cacheService = module.get(CacheService);
  });

  it("should return cached result when available", async () => {
    const query: SearchQuery = { q: "test", limit: 10, offset: 0 };
    const cachedResult: SearchResult = {
      hits: [{ id: "1", index: "posts", title: "Test", excerpt: "", href: "/test" }],
      totalHits: 1,
      query: "test",
      processingTimeMs: 50,
      engine: "meilisearch",
      fallbackUsed: false,
    };

    cacheService.getJson.mockResolvedValue(cachedResult);

    const result = await service.search(query);

    expect(cacheService.getJson).toHaveBeenCalledWith("search:test:community,downloads,events,guides,posts:10:0");
    expect(result).toMatchObject(cachedResult);
    expect(result.processingTimeMs).toBeGreaterThanOrEqual(0); // Should be updated for cache hit
  });

  it("should cache successful search results", async () => {
    const query: SearchQuery = { q: "test", limit: 10, offset: 0 };
    cacheService.getJson.mockResolvedValue(null); // No cache

    const searchResult = { hits: [], totalHits: 0 };
    const meilisearchAdapter = service["meilisearchAdapter"] as jest.Mocked<MeilisearchAdapter>;
    meilisearchAdapter.search.mockResolvedValue(searchResult);

    await service.search(query);

    expect(cacheService.setJson).toHaveBeenCalledWith(
      "search:test:community,downloads,events,guides,posts:10:0",
      expect.objectContaining({
        hits: [],
        totalHits: 0,
        query: "test",
        engine: "meilisearch",
        fallbackUsed: false,
      }),
      300 // 5 minutes TTL
    );
  });

  it("should generate different cache keys for different queries", async () => {
    const queries = [
      { q: "test1", limit: 10, offset: 0 },
      { q: "test2", limit: 20, offset: 0 },
      { q: "test1", limit: 10, offset: 10 },
      { q: "test1", index: "posts" as const, limit: 10, offset: 0 },
    ];

    cacheService.getJson.mockResolvedValue(null);
    const meilisearchAdapter = service["meilisearchAdapter"] as jest.Mocked<MeilisearchAdapter>;
    meilisearchAdapter.search.mockResolvedValue({ hits: [], totalHits: 0 });

    for (const query of queries) {
      await service.search(query);
    }

    expect(cacheService.getJson).toHaveBeenNthCalledWith(1, "search:test1:community,downloads,events,guides,posts:10:0");
    expect(cacheService.getJson).toHaveBeenNthCalledWith(2, "search:test2:community,downloads,events,guides,posts:20:0");
    expect(cacheService.getJson).toHaveBeenNthCalledWith(3, "search:test1:community,downloads,events,guides,posts:10:10");
    expect(cacheService.getJson).toHaveBeenNthCalledWith(4, "search:test1:posts:10:0");
  });
});