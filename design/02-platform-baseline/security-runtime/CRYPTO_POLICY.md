# CRYPTO_POLICY

## Purpose

Chốt encryption/hashing stance cho PMTL backend.

## Scope

- password hashing
- token/secret handling
- signed payload / webhook verification

## Authority

- `required`

## Phase

- `all`

## Why

- security policy đã có auth và secret rules, nhưng crypto decisions cần owner rõ để codegen không bịa helper lung tung.

## Must

- password hashing phải dùng approved auth path và parameter set đã chốt trong security/auth docs
- secret comparison phải là constant-time khi path đó thật sự nhạy cảm
- signed webhook/token verification phải đi qua canonical verification flow, không tự viết mỗi module một kiểu

## Must not

- không tự phát minh crypto primitive
- không dùng reversible encryption cho password
- không tạo utility `crypto.ts` kiểu god-file chứa đủ thứ hash/sign/encrypt mà không có owner use case

## Allowed patterns

- auth/password hashing helper trong identity/platform auth lane
- HMAC/signature verification cho webhook/raw-body paths
- approved library wrappers với narrow purpose

## Dependencies

- [SECURITY_POLICY.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/security-runtime/SECURITY_POLICY.md)
- [manage-auth-session.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/03-domains/identity/USE_CASES/manage-auth-session.md)

