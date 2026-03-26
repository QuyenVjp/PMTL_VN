# COMMON_ERRORS_RUNBOOK

## Purpose

Tạo runbook ngắn cho các nhóm lỗi Nest/common backend mà AI hoặc developer dễ xử lý sai.

## Scope

- bootstrap errors
- DI/module wiring errors
- route/middleware/prefix errors
- validation/filter/swagger drift

## Authority

- `required`

## Phase

- `all`

## Error families

### Dependency injection / module wiring

- triệu chứng: provider not found, circular dependency, unknown dependency index
- đọc theo thứ tự:
  - [ROOT_DOC_OWNERSHIP.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/01-repo-constitution/ROOT_DOC_OWNERSHIP.md)
  - [NEST_INTERNALS_POLICY.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/api-runtime/NEST_INTERNALS_POLICY.md)
  - [PLATFORM_MODULES.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/api-runtime/PLATFORM_MODULES.md)

### Route / prefix / middleware mismatch

- triệu chứng: route không match, docs path lệch, wildcard fail
- đọc:
  - [NESTJS_11_ADOPTION.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/api-runtime/NESTJS_11_ADOPTION.md)
  - [API_ROUTE_INVENTORY.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/api/API_ROUTE_INVENTORY.md)
  - [TRANSPORT_RUNTIME_POLICY.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/api-runtime/TRANSPORT_RUNTIME_POLICY.md)

### Validation / serialization / docs drift

- triệu chứng: request pass sai shape, docs hiện schema lệch, response leak field
- đọc:
  - [SERIALIZATION_POLICY.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/api-runtime/SERIALIZATION_POLICY.md)
  - [API_DTO_SHAPE_PLAN.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/api/API_DTO_SHAPE_PLAN.md)
  - [NEST_REQUEST_PIPELINE.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md)

### Prisma / migration / connection errors

- triệu chứng: P20xx, migrate fail, pool timeout, relation drift, shadow database fail
- đọc:
  - [PRISMA_7_POLICY.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/data-runtime/PRISMA_7_POLICY.md)
  - [PRISMA_QUERY_PATTERN_RULES.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/data-runtime/PRISMA_QUERY_PATTERN_RULES.md)
  - [MIGRATION_STRATEGY.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/data-runtime/MIGRATION_STRATEGY.md)
  - [ERROR_CODE_REGISTRY.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/api/ERROR_CODE_REGISTRY.md)

### Auth / cookies / CSRF / throttling

- đọc:
  - [SECURITY_POLICY.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/security-runtime/SECURITY_POLICY.md)
  - [manage-auth-session.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/03-domains/identity/USE_CASES/manage-auth-session.md)

### Meilisearch / SDK / task-state errors

- triệu chứng: invalid API key, search timeout, task failed, settings update fail, health ok nhưng index stale
- đọc:
  - [MEILISEARCH_ARCHITECTURE.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/optional-scale/MEILISEARCH_ARCHITECTURE.md)
  - [ERROR_CODE_REGISTRY.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/api/ERROR_CODE_REGISTRY.md)
- rules:
  - không coi `202 accepted` là thành công cuối cùng
  - kiểm `taskUid` qua Tasks API trước khi kết luận write succeeded
  - `waitForTask` chỉ dùng cho script/admin action có budget rõ; không block hot path mù quáng
  - `invalid_api_key` hoặc auth/key drift phải map về server-side secret/runbook issue, không giải bằng cách đẩy key xuống browser

## Must not

- không sửa lỗi theo stackoverflow snippet trước khi map lỗi vào owner doc
- không đổi owner contract chỉ để dập lỗi local
