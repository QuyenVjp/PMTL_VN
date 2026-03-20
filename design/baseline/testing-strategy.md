# TESTING_STRATEGY (Chiến lược kiểm thử)

File này chốt `verification baseline (nền tảng kiểm chứng)` để tránh paper architecture.

## Test layers

### Unit test

Áp dụng cho:

- pure mappers
- validators
- policy helpers
- small service rules

### Integration test

Áp dụng cho:

- API modules
- Prisma repository flow
- auth/session lifecycle
- upload boundary

### E2E / smoke

Áp dụng cho:

- register/login/logout
- publish post
- submit comment
- upload media
- health endpoints

## Coverage priorities

- không chạy theo phần trăm vô hồn
- ưu tiên test cho:
  - risky write-path
  - auth/session
  - upload/storage
  - moderation decision
  - migration-sensitive areas

## First mandatory checks

- `identity` auth/session integration tests
- `content` publish/upload integration tests
- health/metrics smoke
- error envelope verification

## Test data rules

- test fixtures phải rõ owner module
- không để fixture mơ hồ kiểu “sample data chung chung”
- nếu cần seed DB cho integration test, seed phải tối thiểu và deterministic

## Failure-focused checks

Phải có test cho:

- invalid input
- forbidden action
- duplicate action
- missing storage file
- expired session
- rate limit exceeded

## Student note

Với solo dev:

- ít test nhưng trúng chỗ còn hơn nhiều test vô nghĩa
- auth, upload, publish, restore-related flow phải được ưu tiên hơn UI snapshot test
