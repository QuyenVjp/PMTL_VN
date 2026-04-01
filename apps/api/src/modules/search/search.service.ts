import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { ConfigService } from "../../common/config/config.service.js";
import { CacheService } from "../../common/cache/cache.service.js";
import { CircuitBreakerService } from "../../common/resilience/circuit-breaker.service.js";
import type CircuitBreaker from "opossum";
import type { SearchQuery } from "./search.schemas.js";

type SearchIndex = "posts" | "events" | "guides" | "downloads" | "community";

type SearchHit = {
  id: string;
  index: SearchIndex;
  title: string;
  excerpt: string;
  href: string;
  publishedAt?: string | null;
};

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly searchableIndexes: SearchIndex[] = ["posts", "events", "guides", "downloads", "community"];
  private meiliBreaker!: CircuitBreaker<[string, string, unknown?], unknown>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly cache: CacheService,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {
    // Circuit breaker wraps the raw Meilisearch HTTP call.
    // Opens at 50% failure rate; falls back to SQL search automatically.
    this.meiliBreaker = this.circuitBreaker.create(
      "meilisearch",
      (method: string, path: string, body?: unknown) => this.meiliRequestRaw(method, path, body),
      { timeout: 3000, errorThresholdPercentage: 50, resetTimeout: 15000, volumeThreshold: 5 },
    );
    this.meiliBreaker.fallback(() => {
      this.logger.warn({ msg: "search.meilisearch.circuit_open_fallback" });
      return null; // null signals callers to use SQL fallback
    });
  }

  private getCacheKey(query: SearchQuery): string {
    const { q, index, limit, offset } = query;
    return `search:${index || 'all'}:${q}:${limit}:${offset}`;
  }

  async search(query: SearchQuery) {
    const startedAt = Date.now();
    const cacheKey = this.getCacheKey(query);

    // Try cache first
    const cached = await this.cache.getJson<any>(cacheKey);
    if (cached) {
      this.logger.debug(`Search cache hit for: ${cacheKey}`);
      return cached;
    }
    const targetIndexes = this.resolveTargetIndexes(query.index);

    if (this.configService.searchEngine === "meilisearch") {
      try {
        const meiliResult = await this.searchWithMeilisearch(query, targetIndexes);
        const result = {
          ...meiliResult,
          query: query.q,
          processingTimeMs: Date.now() - startedAt,
          engine: "meilisearch" as const,
          fallbackUsed: false,
        };
        
        // Cache successful results for 300 seconds
        await this.cache.setJson(cacheKey, result, 300);
        return result;
      } catch (error) {
        this.logger.warn(
          `Meilisearch search failed, switching to SQL fallback: ${
            error instanceof Error ? error.message : "unknown_error"
          }`,
        );
      }
    }

    if (!this.configService.searchSqlFallbackEnabled) {
      throw new Error("Search unavailable: fallback is disabled");
    }

    const fallback = await this.searchWithSqlFallback(query, targetIndexes);
    const fallbackResult = {
      ...fallback,
      query: query.q,
      processingTimeMs: Date.now() - startedAt,
      engine: "sql" as const,
      fallbackUsed: true,
    };
    
    // Cache fallback results for shorter duration (60 seconds)
    await this.cache.setJson(cacheKey, fallbackResult, 60);
    return fallbackResult;
  }

  async reindex(indexName: string) {
    const targetIndexes =
      indexName === "all"
        ? this.searchableIndexes
        : this.resolveTargetIndexes(indexName as SearchQuery["index"] | "all" | undefined);

    if (this.configService.searchEngine !== "meilisearch") {
      return {
        status: "skipped",
        indexName,
        message: "Search engine hiện tại không phải meilisearch",
      } as const;
    }

    const reindexed: SearchIndex[] = [];
    for (const index of targetIndexes) {
      const docs = await this.loadDocumentsForIndex(index);
      await this.ensureMeiliIndex(index);
      await this.meiliRequest("DELETE", `/indexes/${this.indexUid(index)}/documents`);
      if (docs.length > 0) {
        await this.meiliRequest("POST", `/indexes/${this.indexUid(index)}/documents`, docs);
      }
      reindexed.push(index);
    }

    return {
      status: "queued",
      indexName,
      indexes: reindexed,
      message: "Reindex đã gửi lên Meilisearch",
    } as const;
  }

  async getAdminStatus() {
    let meiliHealth: "up" | "down" = "down";
    if (this.configService.searchEngine === "meilisearch") {
      try {
        await this.meiliRequest("GET", "/health");
        meiliHealth = "up";
      } catch {
        meiliHealth = "down";
      }
    }

    return {
      engine: this.configService.searchEngine,
      fallback: "postgresql-fts",
      status: meiliHealth === "up" || this.configService.searchEngine === "sql" ? ("operational" as const) : ("degraded" as const),
      meilisearch: {
        host: this.configService.meiliHost,
        health: meiliHealth,
      },
      indexes: this.searchableIndexes.map((name) => ({ name, uid: this.indexUid(name) })),
      checkedAt: new Date().toISOString(),
    };
  }

  private resolveTargetIndexes(index: SearchQuery["index"] | "all" | undefined): SearchIndex[] {
    if (!index) return this.searchableIndexes;
    if (index === "sutras") return ["guides"];
    if (index === "all") return this.searchableIndexes;
    if (this.searchableIndexes.includes(index as SearchIndex)) return [index as SearchIndex];
    return this.searchableIndexes;
  }

  private indexUid(index: SearchIndex): string {
    return `${this.configService.meiliIndexPrefix}${index}`;
  }

  private meiliHeaders(): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this.configService.meiliApiKey) {
      headers.Authorization = `Bearer ${this.configService.meiliApiKey}`;
    }
    return headers;
  }

  /** Routes through circuit breaker — falls back to null when circuit is open */
  private async meiliRequest(method: string, path: string, body?: unknown): Promise<unknown> {
    return this.meiliBreaker.fire(method, path, body);
  }

  private async meiliRequestRaw(method: string, path: string, body?: unknown): Promise<unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.configService.searchTimeoutMs);
    try {
      const res = await fetch(`${this.configService.meiliHost}${path}`, {
        method,
        headers: this.meiliHeaders(),
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Meili ${method} ${path} failed (${res.status}): ${text}`);
      }
      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        return await res.json();
      }
      return await res.text();
    } finally {
      clearTimeout(timeout);
    }
  }

  private async searchWithMeilisearch(query: SearchQuery, indexes: SearchIndex[]) {
    const perIndexLimit = Math.max(1, Math.min(query.limit, 20));
    const allHits: SearchHit[] = [];
    let estimatedTotal = 0;

    for (const index of indexes) {
      const payload = {
        q: query.q,
        offset: query.offset,
        limit: perIndexLimit,
        attributesToRetrieve: ["id", "title", "excerpt", "href", "publishedAt"],
      };
      const raw = (await this.meiliRequest("POST", `/indexes/${this.indexUid(index)}/search`, payload)) as {
        hits?: Array<Record<string, unknown>>;
        estimatedTotalHits?: number;
      };
      estimatedTotal += raw.estimatedTotalHits ?? 0;

      const mapped = (raw.hits ?? []).map((hit): SearchHit => ({
        id: this.safeString(hit.id),
        index,
        title: this.safeString(hit.title),
        excerpt: this.safeString(hit.excerpt),
        href: this.safeString(hit.href),
        publishedAt: typeof hit.publishedAt === "string" ? hit.publishedAt : null,
      }));
      allHits.push(...mapped);
    }

    const hits = allHits.slice(0, query.limit);
    return { hits, totalHits: estimatedTotal || hits.length };
  }

  private async searchWithSqlFallback(query: SearchQuery, indexes: SearchIndex[]) {
    const q = query.q.trim();
    const hits: SearchHit[] = [];

    if (indexes.includes("posts")) {
      const rows = await this.prisma.post.findMany({
        where: {
          status: "PUBLISHED",
          OR: [{ title: { contains: q, mode: "insensitive" } }, { excerpt: { contains: q, mode: "insensitive" } }],
        },
        select: { publicId: true, title: true, excerpt: true, slug: true, publishedAt: true },
        orderBy: { publishedAt: "desc" },
        take: query.limit,
        skip: query.offset,
      });
      hits.push(
        ...rows.map((r) => ({
          id: r.publicId,
          index: "posts" as const,
          title: r.title,
          excerpt: r.excerpt ?? "",
          href: `/bai-viet/${r.slug}`,
          publishedAt: r.publishedAt?.toISOString() ?? null,
        })),
      );
    }

    if (indexes.includes("events")) {
      const rows = await this.prisma.calendarEvent.findMany({
        where: {
          status: "PUBLISHED",
          OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }],
        },
        select: { publicId: true, title: true, description: true, publishedAt: true },
        orderBy: { startAt: "desc" },
        take: query.limit,
        skip: query.offset,
      });
      hits.push(
        ...rows.map((r) => ({
          id: r.publicId,
          index: "events" as const,
          title: r.title,
          excerpt: r.description ?? "",
          href: `/lich-su-kien/${r.publicId}`,
          publishedAt: r.publishedAt?.toISOString() ?? null,
        })),
      );
    }

    if (indexes.includes("guides")) {
      const rows = await this.prisma.beginnerGuide.findMany({
        where: {
          status: "PUBLISHED",
          OR: [{ title: { contains: q, mode: "insensitive" } }, { excerpt: { contains: q, mode: "insensitive" } }],
        },
        select: { publicId: true, title: true, excerpt: true, slug: true, publishedAt: true },
        orderBy: { publishedAt: "desc" },
        take: query.limit,
        skip: query.offset,
      });
      hits.push(
        ...rows.map((r) => ({
          id: r.publicId,
          index: "guides" as const,
          title: r.title,
          excerpt: r.excerpt ?? "",
          href: `/huong-dan/${r.slug}`,
          publishedAt: r.publishedAt?.toISOString() ?? null,
        })),
      );
    }

    if (indexes.includes("downloads")) {
      const rows = await this.prisma.download.findMany({
        where: {
          status: "PUBLISHED",
          OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }],
        },
        select: { publicId: true, title: true, description: true, publishedAt: true },
        orderBy: { publishedAt: "desc" },
        take: query.limit,
        skip: query.offset,
      });
      hits.push(
        ...rows.map((r) => ({
          id: r.publicId,
          index: "downloads" as const,
          title: r.title,
          excerpt: r.description ?? "",
          href: `/tai-lieu#${r.publicId}`,
          publishedAt: r.publishedAt?.toISOString() ?? null,
        })),
      );
    }

    if (indexes.includes("community")) {
      const rows = await this.prisma.communityPost.findMany({
        where: {
          status: "APPROVED",
          isHidden: false,
          content: { contains: q, mode: "insensitive" },
        },
        select: { publicId: true, content: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: query.limit,
        skip: query.offset,
      });
      hits.push(
        ...rows.map((r) => ({
          id: r.publicId,
          index: "community" as const,
          title: `Bài chia sẻ #${r.publicId.slice(-6)}`,
          excerpt: r.content.slice(0, 220),
          href: `/cong-dong/${r.publicId}`,
          publishedAt: r.createdAt.toISOString(),
        })),
      );
    }

    const sliced = hits.slice(0, query.limit);
    return { hits: sliced, totalHits: sliced.length };
  }

  private async ensureMeiliIndex(index: SearchIndex): Promise<void> {
    const uid = this.indexUid(index);
    try {
      await this.meiliRequest("POST", "/indexes", { uid, primaryKey: "id" });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("index_already_exists")) {
        throw error;
      }
    }
  }

  private async loadDocumentsForIndex(index: SearchIndex): Promise<SearchHit[]> {
    if (index === "posts") {
      const rows = await this.prisma.post.findMany({
        where: { status: "PUBLISHED" },
        select: { publicId: true, title: true, excerpt: true, slug: true, publishedAt: true },
      });
      return rows.map((r) => ({
        id: r.publicId,
        index,
        title: r.title,
        excerpt: r.excerpt ?? "",
        href: `/bai-viet/${r.slug}`,
        publishedAt: r.publishedAt?.toISOString() ?? null,
      }));
    }
    if (index === "events") {
      const rows = await this.prisma.calendarEvent.findMany({
        where: { status: "PUBLISHED" },
        select: { publicId: true, title: true, description: true, publishedAt: true },
      });
      return rows.map((r) => ({
        id: r.publicId,
        index,
        title: r.title,
        excerpt: r.description ?? "",
        href: `/lich-su-kien/${r.publicId}`,
        publishedAt: r.publishedAt?.toISOString() ?? null,
      }));
    }
    if (index === "guides") {
      const rows = await this.prisma.beginnerGuide.findMany({
        where: { status: "PUBLISHED" },
        select: { publicId: true, title: true, excerpt: true, slug: true, publishedAt: true },
      });
      return rows.map((r) => ({
        id: r.publicId,
        index,
        title: r.title,
        excerpt: r.excerpt ?? "",
        href: `/huong-dan/${r.slug}`,
        publishedAt: r.publishedAt?.toISOString() ?? null,
      }));
    }
    if (index === "downloads") {
      const rows = await this.prisma.download.findMany({
        where: { status: "PUBLISHED" },
        select: { publicId: true, title: true, description: true, publishedAt: true },
      });
      return rows.map((r) => ({
        id: r.publicId,
        index,
        title: r.title,
        excerpt: r.description ?? "",
        href: `/tai-lieu#${r.publicId}`,
        publishedAt: r.publishedAt?.toISOString() ?? null,
      }));
    }
    const rows = await this.prisma.communityPost.findMany({
      where: { status: "APPROVED", isHidden: false },
      select: { publicId: true, content: true, createdAt: true },
    });
    return rows.map((r) => ({
      id: r.publicId,
      index,
      title: `Bài chia sẻ #${r.publicId.slice(-6)}`,
      excerpt: r.content.slice(0, 220),
      href: `/cong-dong/${r.publicId}`,
      publishedAt: r.createdAt.toISOString(),
    }));
  }

  private safeString(value: unknown): string {
    return typeof value === "string" ? value : "";
  }
}
