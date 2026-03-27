# CANONICAL_DECORATORS

## Purpose

Chốt danh sách custom decorators canonical cho `apps/api`.

## Scope

- route/class/parameter decorators do repo tự định nghĩa

## Authority

- `required`

## Phase

- `all`

## Canonical decorators allowed

- `@Public()` cho route không cần auth guard mặc định
- `@Roles(...)` hoặc equivalent metadata decorator nếu permission model yêu cầu
- `@CurrentUser()` hoặc equivalent parameter decorator khi request user projection đã chuẩn hóa
- `@RequestId()` hoặc equivalent parameter decorator nếu request context helper được bật

## Must not

- không tạo decorator che business logic
- không dùng decorator để giấu DB lookup nặng
- không tạo nhiều decorator gần nghĩa nhau chỉ khác naming

## Review rule

- decorator mới phải chứng minh tăng clarity rõ rệt và có consumer lặp lại
- decorator mới phải được thêm vào file này trước khi trở thành scaffold baseline

## Dependencies

- [NEST_FEATURE_ADOPTION_MATRIX.md](../../02-platform-baseline/api-runtime/NEST_FEATURE_ADOPTION_MATRIX.md)
- [SECURITY_POLICY.md](../../02-platform-baseline/security-runtime/SECURITY_POLICY.md)

