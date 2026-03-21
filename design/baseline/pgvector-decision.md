# PGVECTOR_DECISION — Explicit Exclusion with Boundary

File này chốt quyết định loại `pgvector` khỏi phase hiện tại.
Không phải "chưa nghĩ tới" — là quyết định có lý do và có trigger rõ để include sau.

---

## Quyết định: LOẠI KHỎI PHASE 1 và PHASE 2

**Status**: `explicit exclusion`
**Owner**: `apps/api` sẽ là nơi implement nếu được kích hoạt
**Reviewed**: 2026-03-21

---

## Lý do loại bỏ

| Lý do | Giải thích |
|---|---|
| Không có use case đo được | PMTL_VN phase 1–2 không có recommendation engine, không có "related content" AI, không có semantic search requirement cụ thể |
| Search đã được đáp ứng bởi SQL tsvector + Meilisearch | Full-text search Vietnamese đã đủ tốt với tsvector (phase 1) và Meilisearch (phase 2) |
| Tăng operational complexity | pgvector cần Postgres extension, embedding model inference, vector dimension quyết định sớm, index HNSW cần tuning |
| Chưa có embedding model chốt | Không có quyết định về model (multilingual-e5, PhoBERT, text-embedding-3-small) — quyết định này cần test trước |
| Coupling với AI API | Embedding generation cần external AI API (OpenAI, Cohere, etc.) — dependency mới với cost và latency |
| Restore complexity | pgvector index không restore identically across Postgres versions — thêm restore risk |

---

## Cái gì sẽ TỒN TẠI nếu được kích hoạt

Nếu trigger được đáp ứng, artifact runtime cần có:

| Artifact | Location | Mô tả |
|---|---|---|
| Postgres extension | `prisma/schema.prisma` | `extensions = [vector]` |
| Embedding dimension decision | `design/baseline/pgvector-decision.md` (updated) | Chốt 1536 (OpenAI) hoặc 768 (PhoBERT) |
| Migration | `prisma/migrations/` | Add vector column + HNSW index |
| EmbeddingService | `apps/api/src/platform/embedding/` | Calls embedding model API |
| Vector search adapter | `apps/api/src/modules/search/adapters/vector.adapter.ts` | pgvector similarity query |
| Feature flag | `pgvector.semantic_search.enabled` | Guard semantic search path |
| Env vars | `EMBEDDING_MODEL_URL`, `EMBEDDING_API_KEY`, `VECTOR_DIMENSIONS` | AI inference config |

---

## Trigger condition để reconsider

pgvector chỉ được xem xét lại khi **tất cả** các điều kiện sau đúng:

1. Meilisearch đã được bật và đang hoạt động ổn định ≥ 3 tháng
2. Có use case cụ thể: "tìm nội dung liên quan" hoặc "semantic search" được member yêu cầu nhiều
3. Embedding model đã được chọn và chi phí inference đã được ước tính
4. Team đã test restore procedure với pgvector extension bật
5. Vector dimension đã được chốt (không thể thay đổi sau khi có data)

---

## Ranh giới khi được include

- `pgvector` chỉ là **search projection** — không phải source of truth
- Postgres vẫn là source of truth; vector column là derived data
- Meilisearch và SQL fallback vẫn phải hoạt động độc lập
- Nếu embedding service down → fallback về Meilisearch/SQL, không crash app
- pgvector index chỉ cover `wisdom_entries`, `qa_entries`, `posts` — không phải tất cả tables

---

## Code location dự kiến (nếu activated)

```
apps/api/src/platform/embedding/
  embedding.module.ts
  embedding.service.ts        # External API call + caching
  embedding.config.ts

apps/api/src/modules/search/adapters/
  vector.adapter.ts            # pgvector similarity search
  meilisearch.adapter.ts       # (existing)
  sql.adapter.ts               # (existing)

prisma/schema.prisma           # Unsupported("vector") type per table
```

---

## Ghi chú cho AI/codegen

- Không thêm pgvector chỉ vì "có vẻ hay"
- Không embed vector column vào schema khi chưa đạt trigger
- Nếu user hỏi về related content → dùng Meilisearch `moreLikeThis` trước
- Quyết định này phải được update khi trigger được đáp ứng
