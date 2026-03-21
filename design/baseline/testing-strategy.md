# TESTING_STRATEGY (Chiến lược kiểm thử)

File này chốt verification baseline cho PMTL_VN.
Không có testing strategy rõ → paper architecture.

> **Stack**: NestJS + Prisma + Zod (backend), Next.js + React (frontend)
> **Test runner**: Vitest (cả backend lẫn frontend)

---

## Tool choices (Chốt)

| Tool | Dùng cho | Lý do |
|---|---|---|
| **Vitest** | Unit + integration test runner | Fast, ESM-native, compatible với cả NestJS và React |
| **Supertest** | HTTP integration tests | Test NestJS routes end-to-end in-process |
| **Testing Library** | React component tests | DOM testing, accessible queries |
| **Playwright** | E2E browser tests (Phase 2+) | Cross-browser, reliable, ít flaky |
| **Faker.js** | Test data generation | Deterministic seeding, realistic data |

---

## Test layers

### Unit tests

Áp dụng cho:
- Pure mappers / transformers
- Zod schema validators
- Policy helpers (permission checks, business rules)
- Small service rules (không cần DB)
- Date/lunar calendar utils

```typescript
// Ví dụ: test Zod schema
describe('CreateVowSchema', () => {
  it('rejects empty content', () => {
    expect(() => CreateVowSchema.parse({ content: '' })).toThrow();
  });
});
```

### Integration tests

Áp dụng cho:
- API module routes (controller → service → repository → DB)
- Prisma repository flows
- Auth/session lifecycle (login → access → refresh → logout)
- Upload boundary (validate → store → metadata → retrieve)
- Rate-limit guard behavior
- Audit log creation in transaction

```typescript
// Ví dụ: test auth flow
describe('POST /api/auth/login', () => {
  it('returns access + refresh cookies on valid credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'test@pmtl.vn', password: 'valid_password_123' });
    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']).toEqual(
      expect.arrayContaining([
        expect.stringContaining('access_token'),
        expect.stringContaining('refresh_token'),
      ]),
    );
  });
});
```

### E2E / Smoke tests

Áp dụng cho:
- Register → verify email → login → dashboard
- Publish post → verify public access
- Submit comment → pending → approve
- Upload media → retrieve
- Health endpoints respond correctly
- Admin login → moderation queue

---

## Test database strategy

### Per-test isolation

```typescript
// Cách 1 (recommended): Transaction rollback
beforeEach(async () => {
  await prisma.$executeRaw`BEGIN`;
});
afterEach(async () => {
  await prisma.$executeRaw`ROLLBACK`;
});

// Cách 2: Truncate all tables between test suites
afterAll(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE users, posts, ... CASCADE`;
});
```

### Test database setup

```bash
# docker-compose.test.yml
services:
  test-db:
    image: postgres:18
    environment:
      POSTGRES_DB: pmtl_test
      POSTGRES_USER: pmtl_test
      POSTGRES_PASSWORD: test_only
    ports:
      - "5433:5432"
```

```bash
# Run before tests
DATABASE_URL="postgresql://pmtl_test:test_only@localhost:5433/pmtl_test"
npx prisma migrate deploy
npx vitest run
```

---

## Coverage priorities

Không chạy theo % vô hồn. Ưu tiên test cho:

| Priority | Area | Min coverage target |
|---|---|---|
| P0 — Critical | Auth/session lifecycle | 90%+ |
| P0 — Critical | Upload boundary (MIME, size, delete auth) | 90%+ |
| P1 — High | Moderation decisions | 80%+ |
| P1 — High | Rate-limit guards | 80%+ |
| P1 — High | Audit log creation | 80%+ |
| P2 — Medium | Content CRUD publish flow | 70%+ |
| P2 — Medium | Practice log / Ngôi Nhà Nhỏ | 70%+ |
| P3 — Low | UI components (snapshot/visual) | Best effort |

**Global minimum**: 60% line coverage. Blocks cần P0/P1 không được dưới target.

---

## Failure-focused checks (Bắt buộc)

Mỗi module phải có tests cho:

- Invalid input → Zod validation error
- Forbidden action → 403 with error envelope
- Duplicate action → 409 Conflict
- Missing storage file → graceful degrade, not crash
- Expired session → 401 + redirect
- Rate limit exceeded → 429 with retry-after header
- Audit fail in transaction → entire write rolls back (Bug 2 regression test)
- Search returns only published content (Bug 4 regression test)

---

## CI/CD integration

```yaml
# .github/workflows/test.yml (hoặc tương đương)
jobs:
  test:
    services:
      postgres:
        image: postgres:18
        env:
          POSTGRES_DB: pmtl_test
          POSTGRES_USER: pmtl_test
          POSTGRES_PASSWORD: test_only
    steps:
      - checkout
      - pnpm install
      - prisma migrate deploy (test DB)
      - vitest run --coverage
      - Upload coverage report
```

### CI gates (phải pass trước merge)

- [ ] All unit + integration tests pass
- [ ] Coverage >= global minimum
- [ ] TypeScript type check pass
- [ ] ESLint pass
- [ ] Prisma schema validate

---

## Test data rules

- Fixtures phải rõ owner module — không "sample data chung chung"
- Seed DB cho integration test: tối thiểu và deterministic
- Dùng `faker.seed(12345)` cho reproducible data
- Không dùng production data cho tests
- Sensitive fields (password hash, tokens) dùng test constants, không hardcode real secrets

---

## Frontend testing (Phase 2+)

| Layer | Tool | Scope |
|---|---|---|
| Component | Testing Library + Vitest | Isolated component rendering |
| Hook | renderHook + Vitest | Custom hooks logic |
| E2E | Playwright | Critical user flows (login, practice, search) |

**Priority**: Backend tests trước, frontend tests sau. Solo dev không cần frontend tests ngay phase 1 nếu backend tests solid.

---

## Student note

Với solo dev:
- Ít test nhưng trúng chỗ còn hơn nhiều test vô nghĩa
- Auth, upload, publish, restore flow phải ưu tiên hơn UI snapshot
- Nếu thời gian có hạn: P0 tests → integration tests → skip E2E/snapshot
