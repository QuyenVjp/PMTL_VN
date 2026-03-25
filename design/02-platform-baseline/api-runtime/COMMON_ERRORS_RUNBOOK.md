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

### Auth / cookies / CSRF / throttling

- đọc:
  - [SECURITY_POLICY.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/security-runtime/SECURITY_POLICY.md)
  - [manage-auth-session.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/03-domains/identity/USE_CASES/manage-auth-session.md)

## Must not

- không sửa lỗi theo stackoverflow snippet trước khi map lỗi vào owner doc
- không đổi owner contract chỉ để dập lỗi local

