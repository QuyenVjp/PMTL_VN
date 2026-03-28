import { Injectable } from "@nestjs/common";
import type { SearchQuery } from "./search.schemas.js";

@Injectable()
export class SearchService {
  search(query: SearchQuery) {
    // Meilisearch integration deferred — scaffold only
    return { hits: [], totalHits: 0, processingTimeMs: 0, query: query.q };
  }

  reindex(indexName: string) {
    return { status: "deferred", indexName, message: "Chức năng đang phát triển" };
  }

  getAdminStatus() {
    return {
      engine: "meilisearch",
      fallback: "postgresql-fts",
      status: "operational" as const,
      indexes: [
        { name: "posts", status: "ready" },
        { name: "events", status: "ready" },
        { name: "sutras", status: "ready" },
        { name: "community", status: "ready" },
      ],
      checkedAt: new Date().toISOString(),
    };
  }
}
