# API_VERSIONING_POLICY

## Purpose

Chốt stance cho `API versioning` trong PMTL.

## Scope

- `apps/api`
- route surface, docs surface, client compatibility

## Authority

- `required`

## Phase

- `all`

## Version basis

- NestJS `11.1.17`

## Why

- Nest có nhiều cách versioning, nhưng PMTL phase_1 không cần thêm complexity nếu chưa có backward-compat burden thật.

## Must

- phase_1 không bật API versioning layer toàn cục
- route canon ở [API_ROUTE_INVENTORY.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/api/API_ROUTE_INVENTORY.md) là source of truth, không tự thêm `/v1`
- nếu sau này mở versioning, phải chốt lại bằng decision update trước khi scaffold

## Must not

- không thêm URL versioning `/v1`
- không thêm header/media-type versioning âm thầm
- không annotate controller bằng version metadata khi repo chưa chốt strategy

## Allowed patterns

- breaking change nhỏ được xử lý bằng additive evolution khi chưa có multi-version support
- explicit replacement route chỉ khi owner docs chốt migration path rõ

## Trigger to open versioning

- có external clients không nâng đồng thời được
- có admin/web/app consumers lệch release cadence thật
- có route family cần breaking contract mà additive evolution không đủ

## Dependencies

- [API_ROUTE_INVENTORY.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/api/API_ROUTE_INVENTORY.md)
- [IMPLEMENTATION_MAPPING.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md)

