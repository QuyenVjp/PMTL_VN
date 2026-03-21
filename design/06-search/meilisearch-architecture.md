# MEILISEARCH_ARCHITECTURE — Search Engine + SQL Fallback Contract

File này chốt thiết kế đầy đủ cho Meilisearch Phase 2+ và SQL fallback Phase 1.
Phase 1 dùng SQL `ILIKE`/`tsvector` — Meilisearch chỉ bật khi trigger được đáp ứng.

> **Unified index mapping**: `06-search/unified-index-mapping.md` — field mapping per docType
> **Outbox pipeline**: `baseline/outbox-dispatcher-model.md` — search-sync event taxonomy
> **BullMQ**: `baseline/bullmq-worker-architecture.md` — `pmtl:search-sync` queue
> **Env vars**: `tracking/env-inventory.md` — MEILISEARCH_* group
> **Search decisions**: `06-search/decisions.md` — architectural rationale

---

## Phase trigger (exact)

Bật Meilisearch khi **ít nhất 1** điều kiện sau:

| Trigger | Measurement |
|---|---|
| SQL search p95 > 500ms | Pino logs showing `search.query.duration_ms > 500` |
| ILIKE queries cause table scans on posts > 10k rows | `EXPLAIN ANALYZE` shows Seq Scan on posts |
| Multi-type search needed (posts + wisdom + chants combined) | Feature requirement from product |
| Vietnamese full-text ranking unacceptable with tsvector | User search relevance feedback |

**Prerequisite**: BullMQ + Valkey both active (outbox-driven sync requires queue).

---

## Architecture overview

```
Phase 1 (SQL fallback):
  GET /api/search?q=term
    → SearchService.querySql()
    → Postgres ILIKE / tsvector
    → unified SearchDocument shape

Phase 2+ (Meilisearch active):
  GET /api/search?q=term
    → SearchService.queryMeilisearch()
    → Meilisearch HTTP API
    → unified SearchDocument shape

  Content publish/update/delete
    → outbox_event (search-sync types)
    → OutboxDispatcherCron
    → pmtl:search-sync BullMQ queue
    → SearchSyncHandler (apps/worker)
    → Meilisearch upsert / delete
```

`SEARCH_ENGINE` env var controls routing: `sql` (default) or `meilisearch`.
SearchService reads this at startup — no runtime toggle.

---

## Index design

**Single unified index** — all 8 docTypes in one index.

Index name: `pmtl_content` (from `MEILISEARCH_INDEX_UID` env, default `pmtl_content`)

### Rationale for single index
- Vietnamese search users do not know which "module" a result belongs to — they search across all content types
- Cross-type ranking unified by Meilisearch relevance score
- Filter by `docType` at query time (`filter: "docType = post"`)

### Meilisearch index settings

```typescript
// apps/api/src/platform/search/meilisearch-index.settings.ts

export const PMTL_INDEX_SETTINGS: Settings = {
  searchableAttributes: [
    'title',           // highest weight (listed first)
    'excerpt',
    'body',
    'tags',
    'sourceName',
  ],

  filterableAttributes: [
    'docType',
    'language',
    'categories',
    'tags',
    'moduleOwner',
    'provenanceType',
  ],

  sortableAttributes: [
    'publishedAt',
    'indexedAt',
  ],

  rankingRules: [
    'words',
    'typo',
    'proximity',
    'attribute',
    'sort',
    'exactness',
    // No custom rules — default ranking is sufficient for editorial content
  ],

  // Vietnamese requires no special tokenizer — Meilisearch handles Unicode well
  // Chinese characters in body (original sutras) also work via default tokenizer

  displayedAttributes: [
    'docType',
    'moduleOwner',
    'publicId',
    'slug',
    'title',
    'excerpt',
    'tags',
    'categories',
    'language',
    'sourceName',
    'sourceUrl',
    'provenanceType',
    'publishedAt',
    // 'body' is NOT displayed (bandwidth) — excerpt shown instead
    // 'docId' is NOT displayed (internal only)
  ],

  typoTolerance: {
    enabled: true,
    minWordSizeForTypos: {
      oneTypo: 5,
      twoTypos: 9,
    },
    disableOnAttributes: ['tags', 'docType'],
  },

  pagination: {
    maxTotalHits: 500,  // hard cap for public queries
  },
};
```

---

## Query contract (Meilisearch path)

```typescript
// apps/api/src/platform/search/search.service.ts

async queryMeilisearch(dto: SearchQueryDto): Promise<SearchResultDto> {
  const index = this.meiliClient.index(this.config.indexUid);

  const filter: string[] = [];
  if (dto.docType) filter.push(`docType = "${dto.docType}"`);
  if (dto.language) filter.push(`language = "${dto.language}"`);
  if (dto.tags?.length) {
    filter.push(`tags IN [${dto.tags.map(t => `"${t}"`).join(', ')}]`);
  }

  const result = await index.search(dto.q, {
    limit: Math.min(dto.limit ?? 20, 50),   // max 50 per request
    offset: dto.offset ?? 0,
    filter: filter.join(' AND ') || undefined,
    sort: dto.sort === 'newest' ? ['publishedAt:desc'] : undefined,
    attributesToHighlight: ['title', 'excerpt'],
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>',
    attributesToCrop: ['body'],
    cropLength: 100,
  });

  return {
    engine: 'meilisearch',
    totalHits: result.estimatedTotalHits ?? 0,
    hits: result.hits.map(normalizeHit),
    processingTimeMs: result.processingTimeMs,
  };
}
```

---

## Query contract (SQL fallback path)

```typescript
// apps/api/src/platform/search/search-sql-fallback.service.ts

async querySql(dto: SearchQueryDto): Promise<SearchResultDto> {
  // SQL fallback only covers posts in Phase 1
  // Expand to other docTypes if needed before Meilisearch activation
  const term = `%${dto.q.replace(/[%_]/g, '\\$&')}%`;

  const posts = await this.prisma.post.findMany({
    where: {
      status: 'published',
      publishedAt: { not: null, lte: new Date() },
      OR: [
        { title: { contains: dto.q, mode: 'insensitive' } },
        { contentPlainText: { contains: dto.q, mode: 'insensitive' } },
      ],
      ...(dto.language ? { language: dto.language } : {}),
    },
    orderBy: { publishedAt: 'desc' },
    take: Math.min(dto.limit ?? 20, 50),
    skip: dto.offset ?? 0,
    select: {
      publicId: true, slug: true, title: true,
      excerptComputed: true, tags: { select: { name: true } },
      publishedAt: true,
    },
  });

  return {
    engine: 'sql-fallback',
    totalHits: posts.length,  // approximate — no count query for performance
    hits: posts.map(p => ({
      docType: 'post',
      publicId: p.publicId,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerptComputed,
      tags: p.tags.map(t => t.name),
      language: 'vi',
      publishedAt: p.publishedAt!.toISOString(),
    })),
    processingTimeMs: 0,  // not tracked in fallback
  };
}
```

**Draft/hidden enforcement**: `status = 'published' AND publishedAt IS NOT NULL AND publishedAt <= NOW()` is applied at Prisma where clause level — no bypass possible.

---

## SearchService routing

```typescript
// apps/api/src/platform/search/search.service.ts

@Injectable()
export class SearchService {
  private readonly engine: 'sql' | 'meilisearch';

  constructor(
    private readonly sqlFallback: SearchSqlFallbackService,
    private readonly meiliSearch: MeilisearchQueryService,
    private readonly config: SearchConfig,
  ) {
    this.engine = config.engine; // from SEARCH_ENGINE env
  }

  async query(dto: SearchQueryDto): Promise<SearchResultDto> {
    if (this.engine === 'meilisearch') {
      try {
        return await this.meiliSearch.query(dto);
      } catch (err) {
        this.logger.warn({ action: 'search.meilisearch.fallback', reason: err.message });
        return await this.sqlFallback.querySql(dto);  // graceful degradation
      }
    }
    return await this.sqlFallback.querySql(dto);
  }
}
```

---

## Indexing pipeline (Phase 2+)

### Trigger path

```
1. Content publish → outbox_event { eventType: 'content.post.published', aggregateId: postPublicId }
2. OutboxDispatcherCron → pmtl:search-sync queue
3. SearchSyncHandler (apps/worker) receives job
4. Handler calls SearchIndexService.upsert(document)
5. SearchIndexService builds SearchDocumentDto (owner module provides data)
6. Meilisearch.index.addOrUpdateDocuments([doc])
```

### SearchSyncHandler

```typescript
// apps/worker/src/handlers/search-sync.handler.ts

@Injectable()
export class SearchSyncHandler {
  async handle(job: Job<SearchSyncJobData>): Promise<void> {
    const { eventId, eventType, aggregateId, aggregateType } = job.data;

    // Idempotency check
    const key = `search-sync:${eventId}`;
    const alreadyDone = await this.prisma.processedJobLog.findUnique({
      where: { jobKey: key }
    });
    if (alreadyDone) {
      this.logger.info({ action: 'queue.job.duplicate_skipped', eventId });
      return;
    }

    // Route to correct handler by aggregateType
    switch (aggregateType) {
      case 'post':
        await this.syncPost(aggregateId, eventType);
        break;
      case 'wisdom_entry':
        await this.syncWisdomEntry(aggregateId, eventType);
        break;
      case 'chant_item':
        await this.syncChantItem(aggregateId, eventType);
        break;
      default:
        this.logger.warn({ action: 'search-sync.unknown_type', aggregateType });
        break;
    }

    // Mark processed
    await this.prisma.processedJobLog.upsert({
      where: { jobKey: key },
      create: { jobKey: key, processedAt: new Date() },
      update: {},
    });
  }

  private async syncPost(publicId: string, eventType: string): Promise<void> {
    if (eventType.endsWith('.deleted') || eventType.endsWith('.unpublished')) {
      await this.meiliIndex.deleteDocument(publicId);
      return;
    }
    const doc = await this.contentSearchDocBuilder.buildPostDocument(publicId);
    if (!doc) {
      this.logger.warn({ action: 'search-sync.post_not_found', publicId });
      return;
    }
    await this.meiliIndex.addOrUpdateDocuments([doc]);
  }
}
```

---

## Full reindex procedure

Used when: Meilisearch first activated, index corrupted, schema changed.

```typescript
// apps/api/src/platform/search/reindex.service.ts

@Injectable()
export class ReindexService {
  async fullReindex(): Promise<ReindexReport> {
    const report: ReindexReport = { total: 0, indexed: 0, skipped: 0, errors: [] };
    const batchSize = 100;

    // Clear existing index
    await this.meiliIndex.deleteAllDocuments();
    this.logger.info({ action: 'reindex.index_cleared' });

    // Posts
    let cursor = 0;
    while (true) {
      const posts = await this.prisma.post.findMany({
        where: { status: 'published', publishedAt: { lte: new Date() } },
        take: batchSize, skip: cursor,
        include: { tags: true, categories: true },
      });
      if (posts.length === 0) break;

      const docs = posts.map(p => this.contentDocBuilder.buildPostDocument(p));
      await this.meiliIndex.addOrUpdateDocuments(docs);
      report.indexed += docs.length;
      cursor += batchSize;
    }

    // Wisdom entries
    // ... same pattern for each docType

    report.total = report.indexed + report.skipped + report.errors.length;
    this.logger.info({ action: 'reindex.complete', ...report });
    return report;
  }
}
```

Admin trigger: `POST /api/admin/search/reindex` (requires `super-admin` role).
Audit: `search.full_reindex.triggered` with actor.

---

## Meilisearch connection config

```typescript
// apps/api/src/platform/search/meilisearch.config.ts
{
  host: process.env.MEILISEARCH_URL ?? 'http://meilisearch:7700',
  apiKey: process.env.MEILISEARCH_MASTER_KEY,  // required in Phase 2
}
```

### Client initialization pattern

```typescript
// apps/api/src/platform/search/meilisearch.module.ts
MeilisearchModule.forRootAsync({
  useFactory: (config: ConfigService) => ({
    host: config.get('MEILISEARCH_URL'),
    apiKey: config.get('MEILISEARCH_MASTER_KEY'),
  }),
  inject: [ConfigService],
})
```

---

## Search status endpoint

```typescript
// GET /api/search/status
// Public — no auth required

{
  engine: 'meilisearch' | 'sql-fallback',
  meilisearch: {
    status: 'healthy' | 'degraded' | 'unavailable',
    indexUid: 'pmtl_content',
    documentCount: 12543,
    lastUpdated: '2026-03-21T10:00:00Z',
  } | null,
  sqlFallback: {
    available: true,
  }
}
```

---

## Admin routes

| Route | Method | Description | Role |
|---|---|---|---|
| `/api/admin/search/status` | GET | Meilisearch health + document counts | `admin+` |
| `/api/admin/search/reindex` | POST | Trigger full reindex | `super-admin` |
| `/api/admin/search/index-settings` | GET | Current index settings | `admin+` |
| `/api/admin/search/index-settings` | PUT | Update index settings (careful!) | `super-admin` |
| `/api/admin/search/documents/:docId` | DELETE | Remove specific document | `admin+` |

---

## Failure mode: Meilisearch down

| Failure | Behavior |
|---|---|
| HTTP timeout / connection refused | SearchService catches error → fallback to SQL → log `search.meilisearch.fallback` |
| Indexing job fails (worker) | Job retried 3× via BullMQ → dead-lettered after 3 failures |
| Index corrupted | Reindex from Postgres — all data recoverable |
| Wrong API key | Startup health check fails → warn log → fallback to SQL |

`/health/ready` includes Meilisearch health check when `SEARCH_ENGINE=meilisearch`:
```typescript
meilisearch: await this.meili.health().catch(() => ({ status: 'unavailable' })),
```

---

## Docker Compose

```yaml
# infra/docker/docker-compose.meilisearch.yml (override file)
services:
  meilisearch:
    image: getmeili/meilisearch:v1.9
    env_file: /etc/pmtl/secrets/.env.production
    environment:
      MEILI_MASTER_KEY: ${MEILISEARCH_MASTER_KEY}
      MEILI_ENV: production
      MEILI_DB_PATH: /meili_data
    volumes:
      - meilisearch_data:/meili_data
    ports:
      - "7700:7700"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:7700/health"]
      interval: 30s
      timeout: 5s
      retries: 3
    restart: unless-stopped

volumes:
  meilisearch_data:
```

---

## Rollback

```bash
# Disable Meilisearch:
# Set SEARCH_ENGINE=sql in env → API auto-routes to SQL fallback
# Worker SearchSyncHandler jobs will fail silently (Meilisearch unreachable)
# Set outbox event status filter to not dispatch search-sync events

# No data loss: Postgres is source of truth
# Re-enable: set SEARCH_ENGINE=meilisearch + trigger full reindex
```

---

## Env vars

| Env | Required | Default | Purpose |
|---|---|---|---|
| `SEARCH_ENGINE` | no | `sql` | `sql` or `meilisearch` |
| `MEILISEARCH_URL` | Phase 2+ | — | HTTP URL: `http://meilisearch:7700` |
| `MEILISEARCH_MASTER_KEY` | Phase 2+ | — | Master API key (keep secret) |
| `MEILISEARCH_INDEX_UID` | no | `pmtl_content` | Index name |

---

## Code locations

| Artifact | Location |
|---|---|
| Search module | `apps/api/src/platform/search/search.module.ts` |
| Search service (router) | `apps/api/src/platform/search/search.service.ts` |
| SQL fallback service | `apps/api/src/platform/search/search-sql-fallback.service.ts` |
| Meilisearch query service | `apps/api/src/platform/search/meilisearch-query.service.ts` |
| Index settings | `apps/api/src/platform/search/meilisearch-index.settings.ts` |
| Reindex service | `apps/api/src/platform/search/reindex.service.ts` |
| Content doc builder | `apps/api/src/content/search/content-search-doc-builder.service.ts` |
| Wisdom doc builder | `apps/api/src/wisdom-qa/search/wisdom-search-doc-builder.service.ts` |
| SearchSync handler (worker) | `apps/worker/src/handlers/search-sync.handler.ts` |
| Search document schema | `packages/shared/src/schemas/search-document.schema.ts` |
| Admin controller | `apps/api/src/platform/search/search-admin.controller.ts` |
| Docker Compose | `infra/docker/docker-compose.meilisearch.yml` |

---

## Implementation proof criteria

| Check | Proof |
|---|---|
| SQL fallback | `SEARCH_ENGINE=sql` + query → results returned from Postgres, no Meilisearch calls |
| Meilisearch activated | `SEARCH_ENGINE=meilisearch` + Meilisearch running → search returns engine: 'meilisearch' |
| Graceful degradation | Stop Meilisearch → search auto-falls back to SQL, log shows fallback event |
| Draft not indexed | Post in draft status → not returned by any search path |
| Outbox-driven sync | Post published → outbox_event created → search-sync job → document in Meilisearch index |
| Idempotency | Replay same search-sync job → `duplicate_skipped` log, no duplicate in Meilisearch |
| Reindex | Admin triggers reindex → all published posts appear in Meilisearch, count matches DB |
| Status endpoint | `GET /api/search/status` returns current engine and document count |
