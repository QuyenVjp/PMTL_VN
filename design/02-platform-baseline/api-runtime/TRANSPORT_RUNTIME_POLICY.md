# TRANSPORT_RUNTIME_POLICY

## Purpose

Chốt transport/runtime concerns chưa đủ lớn để tách thành nhiều owner docs riêng.

## Scope

- compression
- keep-alive connections
- HTTPS & multiple servers stance

## Authority

- `required`

## Phase

- `all`

## Version basis

- NestJS `11.1.17`
- Express HTTP baseline

## Compression

### Must

- compression không phải phase_1 baseline mặc định
- nếu bật, phải verify không làm lệch streaming semantics, cache headers, hoặc proxy expectations

### Must not

- không bật compression chỉ vì benchmark local đẹp hơn
- không nén response nhỏ/nhạy cảm mà không xét reverse proxy đã xử lý chưa

## Keep-Alive connections

### Must

- keep-alive tuning là infra/runtime concern, không phải domain concern
- nếu chỉnh server keep-alive, phải align với reverse proxy / LB timeout

### Must not

- không tối ưu keep-alive ở app layer một mình rồi bỏ qua edge timeout mismatch

## HTTPS & multiple servers

### Must

- HTTPS authority nằm ở edge-delivery baseline
- `apps/api` phase_1 không dùng Nest multi-server setup làm baseline

### Must not

- không terminate TLS trong Nest app như default production stance
- không mở multiple server instances bên trong app process nếu không có decision update rõ

## Dependencies

- [INFRA_BASELINE.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/edge-delivery/INFRA_BASELINE.md)
- [SECURITY_POLICY.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/security-runtime/SECURITY_POLICY.md)
- [IMPLEMENTATION_MAPPING.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md)

