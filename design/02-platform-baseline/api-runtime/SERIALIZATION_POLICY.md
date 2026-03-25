# SERIALIZATION_POLICY

## Purpose

Chốt `response serialization stance` cho `apps/api`.

## Scope

- `apps/api`
- response body từ controller tới client
- DTO projection, null/undefined/date/enum handling

## Authority

- `required`

## Phase

- `all`

## Version basis

- NestJS `11.1.17`
- OpenAPI/runtime contract pins: [VERSION_MATRIX.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/dependency-version/VERSION_MATRIX.md)

## Why

- PMTL đã có route canon và DTO shape plan, nhưng nếu không khóa serialization stance thì controller/interceptor dễ tự bịa projection.

## Must

- response shape phải bám [API_DTO_SHAPE_PLAN.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/api/API_DTO_SHAPE_PLAN.md) và [API_ROUTE_INVENTORY.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/api/API_ROUTE_INVENTORY.md)
- controller chỉ trả DTO/public projection, không trả raw Prisma record hoặc internal entity shape
- `Date` phải serialize ra ISO-8601 string ở public/admin API surfaces
- enum public-facing phải dùng vocabulary đã chốt ở DTO plan / contract owner
- field `undefined` không được dùng như API signal; field optional phải được quyết định rõ là omit hay explicit `null`
- mọi aggregate/page response phải đi qua explicit mapper/factory khi shape không còn là trivial pass-through

## Must not

- không dùng `ClassSerializerInterceptor` như default magic layer cho toàn app
- không expose raw `BigInt`, `Decimal`, ORM metadata, relation internals, hoặc transport-only debug fields
- không để interceptor toàn cục tự wrap mọi response ngoài canonical envelope đã chốt
- không encode policy bằng naming convention mơ hồ kiểu `internal*`, `private*` rồi hy vọng serializer tự ẩn

## Allowed patterns

- explicit mapper function ở service/facade layer
- DTO shell để phục vụ docs/runtime typing nếu shape đã có owner rõ
- route-specific serializer/helper cho aggregate nặng

## Forbidden patterns

- trả trực tiếp Prisma payload từ controller
- dùng class-transformer decorators rải rác như business policy
- dựa vào implicit JSON serialization để quyết định public contract

## Dependencies

- [NEST_REQUEST_PIPELINE.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md)
- [API_DTO_SHAPE_PLAN.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/api/API_DTO_SHAPE_PLAN.md)
- [API_ROUTE_INVENTORY.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/api/API_ROUTE_INVENTORY.md)
- [ERROR_CODE_REGISTRY.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/api/ERROR_CODE_REGISTRY.md)

