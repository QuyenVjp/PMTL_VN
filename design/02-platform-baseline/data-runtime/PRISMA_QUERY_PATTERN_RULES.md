# PRISMA_QUERY_PATTERN_RULES

File này chốt cách PMTL dùng Prisma Client trong code thật.
Nó tồn tại để AI scaffold không suy từ ví dụ CRUD đơn giản thành query style bừa bãi.

Authority chain:

- [PRISMA_7_POLICY.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/data-runtime/PRISMA_7_POLICY.md)
- [NEST_REQUEST_PIPELINE.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md)
- [SERIALIZATION_POLICY.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/api-runtime/SERIALIZATION_POLICY.md)
- [API_DTO_SHAPE_PLAN.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/api/API_DTO_SHAPE_PLAN.md)

## Baseline

- Prisma Client access chỉ đi qua service/repository layer.
- Controller không viết query Prisma trực tiếp.
- Mặc định ưu tiên query builder rõ nghĩa trước khi mở raw SQL.

## Read query rules

- Public/detail/list projections phải bám DTO owner; không `findMany()` rồi để controller cắt field bằng tay.
- Ưu tiên:
  - `select` khi DTO shape nhỏ và ổn định
  - `include` khi nested relation thật sự là owner của response
  - `omit` để loại field nhạy cảm hoặc field repo đã chốt không lộ
- Không dùng `include: true` kiểu rộng tay cho relation rồi giao FE tự map.

## Relation query rules

- Relation phải explicit trong schema và query; không dựa vào client-side guessing.
- Với nested read:
  - chỉ include relation cần cho route hiện tại
  - tránh over-fetch tree lớn nếu page chỉ cần summary
- Với many-to-many có business metadata hoặc cần referential actions:
  - ưu tiên explicit join model
  - không dùng implicit many-to-many như default reflex

## Index / uniqueness rules

- Mọi query hot path phải có owner nghĩ đến index tương ứng.
- `@@unique`, compound IDs, và domain uniqueness phải được thiết kế cùng use case, không thêm sau vì lỗi runtime.
- Preview features như `partialIndexes` không là baseline mặc định; chỉ mở khi owner doc chốt rõ.

## Null / undefined rules

- Bật `strictUndefinedChecks`.
- TypeScript phải hỗ trợ bằng `exactOptionalPropertyTypes`.
- Không truyền `undefined` vào query `where` / `data` object như thói quen.
- Dùng `Prisma.skip` khi thực sự muốn bỏ field khỏi mutation/query object.

## Transaction rules

- Dùng transaction cho mọi flow `read -> validate -> write` có race risk.
- Interactive transaction là mặc định cho:
  - auth/session rotation
  - moderation decision
  - dedupe/conflict-sensitive write
  - assisted-entry hoặc any write path có audit append cùng transaction
- Conflict/deadlock lane có thể retry hữu hạn với helper tập trung; không copy-paste retry loop ở từng service.

## Raw SQL / TypedSQL rules

- ORM query là baseline.
- Nếu Prisma query builder diễn đạt quá tệ hoặc query là SQL-first:
  - ưu tiên TypedSQL nếu line thực tế support
  - nếu chưa dùng TypedSQL thì gom raw SQL tập trung
- Canonical placement:
  - `apps/api/prisma/sql/` cho TypedSQL hoặc SQL artifacts tập trung
  - wrapper/helper ở data layer, không import SQL trực tiếp từ controller
- Không dùng raw SQL inline ở controller/service cho query có khả năng tái dùng.

## Error / logging rules

- Prisma errors phải map sang `ERROR_CODE_REGISTRY.md`, không đẩy raw Prisma code thẳng ra client.
- Query failures, retry, deadlock, pool timeout phải có structured log context:
  - `module`
  - `action`
  - `prismaCode?`
  - `model?`
  - `requestId`

## PgBouncer / pooling rules

- Nếu phase sau bật PgBouncer:
  - runtime client đi pooled URL
  - Prisma CLI/migrate đi direct URL qua `prisma.config.ts`
- Không chạy migration qua pooled PgBouncer path.

## Testing rules

- Query helper/repository quan trọng phải có integration test.
- Transaction-heavy flow không chỉ test happy path; phải có conflict/error path ít nhất ở mức targeted test.

## Forbidden drift

- `findUnique/findMany` full record rồi sanitize thủ công ở controller
- tạo helper query trùng lặp ở nhiều module
- dùng raw SQL để “nhanh hơn” mà không có owner wrapper
- coi TypedSQL/raw SQL như escape hatch mặc định
- để Prisma error text hoặc stack leak ra API envelope
