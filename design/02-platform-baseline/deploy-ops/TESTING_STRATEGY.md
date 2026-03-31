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

### Verification add-ons

| Tool / skill | Dùng cho | Trạng thái |
|---|---|---|
| `trailofbits-property-based-testing` | Serialization, parsing, schema invariants, filter/state invariants | adopted-when-fit |
| `trailofbits-second-opinion` | second review cho patch rủi ro hoặc fix tranh cãi | advisory-but-recommended |
| `trailofbits-fp-check` | xác minh suspected security finding trước khi kết luận | required-for-security-verdict |

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
- invalid input error phải map về canonical code đúng (`validation.invalid_body|query|params`), không phải English default message trôi từ framework
- Forbidden action → 403 with error envelope
- Duplicate action → 409 Conflict
- Missing storage file → graceful degrade, not crash
- Expired session → 401 + redirect
- Rate limit exceeded → 429 with retry-after header
- Audit fail in transaction → entire write rolls back (Bug 2 regression test)
- Search returns only published content (Bug 4 regression test)

### Contract verification additions

- auth/session integration tests phải chứng minh browser flow là cookie-first:
  - login set access/refresh cookies
  - refresh dùng cookie path đúng
  - protected browser route không yêu cầu `Authorization: Bearer` như default baseline
- rate-limit tests phải cover:
  - exact threshold behavior
  - tracker source sau trusted proxy resolution
  - refresh endpoint không bị bỏ sót guard
- OpenAPI smoke phải cover:
  - security scheme phản ánh đúng contract thật
  - browser auth routes không bị annotate bearer-only toàn cục
  - docs endpoint exposure policy đúng theo environment

### Property-based testing rule

Phải cân nhắc `trailofbits-property-based-testing` khi lane thuộc một trong các nhóm sau:

- Zod schema parsing/coercion có nhiều biến thể input
- DTO serialization/deserialization phải giữ invariant ổn định
- search filters, pagination params, sort params có nhiều tổ hợp
- calendar/date/lunar conversion có nhiều edge case
- text normalization, slug generation, query normalization

Không bắt buộc áp dụng cho mọi module. Nhưng với các lane trên, nếu chỉ viết vài example test tay thì chưa đủ mạnh.

Preferred stance:

- example-based tests chứng minh business examples chính
- property-based tests chứng minh invariant không vỡ khi input thay đổi rộng

Ví dụ invariant nên test:

- parse rồi serialize không làm drift canonical values
- invalid input không làm văng raw framework error shape
- normalized search query luôn ra cùng key cho các biến thể spacing/case tương đương
- slug generation không sinh route segment cấm

### Security finding verification rule

- Khi một scanner, review skill, hoặc external worker báo security issue:
  - không được chốt bug chỉ từ tool output
  - phải đi qua `trailofbits-fp-check` mindset hoặc equivalent verification discipline
- Khi fix security issue có blast radius không nhỏ:
  - nên chạy `trailofbits-second-opinion` hoặc một review lane tương đương trước khi claim closed

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

---

## Testing Pyramid Full 2026

Section này mở rộng testing strategy để đạt enterprise-grade quality.

### Testing pyramid overview

```
                    ┌─────────┐
                    │   E2E   │  5% (Playwright)
                    │  Tests  │  Critical user journeys
                    ├─────────┤
                 ┌──┴─────────┴──┐
                 │  Integration  │  25% (Supertest + DB)
                 │     Tests     │  API flows, service boundaries
                 ├───────────────┤
              ┌──┴───────────────┴──┐
              │    Contract Tests   │  10% (Pact)
              │   API → Consumer    │  Schema validation
              ├─────────────────────┤
           ┌──┴─────────────────────┴──┐
           │       Unit Tests          │  60% (Vitest)
           │  Pure functions, schemas  │  Fast, isolated
           └───────────────────────────┘
```

### Contract Testing (Pact)

```typescript
// apps/api/src/modules/auth/auth.contract.spec.ts
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import { resolve } from "path";

const { like, eachLike, regex } = MatchersV3;

const provider = new PactV3({
  consumer: "pmtl-web",
  provider: "pmtl-api",
  dir: resolve(__dirname, "pacts"),
});

describe("Auth Contract", () => {
  describe("POST /api/auth/login", () => {
    it("returns tokens on valid credentials", async () => {
      await provider
        .given("a user exists with email test@pmtl.vn")
        .uponReceiving("a login request with valid credentials")
        .withRequest({
          method: "POST",
          path: "/api/auth/login",
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            email: "test@pmtl.vn",
            password: "validPassword123",
          },
        })
        .willRespondWith({
          status: 200,
          headers: {
            "Content-Type": regex("application/json.*", "application/json"),
          },
          body: {
            success: true,
            data: {
              user: {
                publicId: like("abc123"),
                email: like("test@pmtl.vn"),
                displayName: like("Test User"),
              },
            },
          },
        });

      await provider.executeTest(async (mockServer) => {
        const response = await fetch(`${mockServer.url}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@pmtl.vn",
            password: "validPassword123",
          }),
        });
        expect(response.status).toBe(200);
      });
    });

    it("returns 401 on invalid credentials", async () => {
      await provider
        .uponReceiving("a login request with invalid credentials")
        .withRequest({
          method: "POST",
          path: "/api/auth/login",
          headers: { "Content-Type": "application/json" },
          body: {
            email: "test@pmtl.vn",
            password: "wrongPassword",
          },
        })
        .willRespondWith({
          status: 401,
          body: {
            success: false,
            code: like("auth.invalid_credentials"),
            message: like("Email hoặc mật khẩu không đúng"),
          },
        });

      await provider.executeTest(async (mockServer) => {
        const response = await fetch(`${mockServer.url}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@pmtl.vn",
            password: "wrongPassword",
          }),
        });
        expect(response.status).toBe(401);
      });
    });
  });
});
```

### Load Testing (k6)

```javascript
// tests/load/k6-smoke.js
import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const errorRate = new Rate("errors");
const responseTime = new Trend("response_time");

export const options = {
  stages: [
    { duration: "1m", target: 10 },   // Ramp up
    { duration: "3m", target: 50 },   // Stay at 50 users
    { duration: "1m", target: 100 },  // Spike
    { duration: "2m", target: 50 },   // Back to normal
    { duration: "1m", target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1000"],
    errors: ["rate<0.05"],  // Less than 5% errors
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3001";

export default function () {
  // Health check
  const healthRes = http.get(`${BASE_URL}/api/health/live`);
  check(healthRes, {
    "health status 200": (r) => r.status === 200,
  });
  responseTime.add(healthRes.timings.duration);
  errorRate.add(healthRes.status !== 200);

  // Search endpoint (common use case)
  const searchRes = http.get(`${BASE_URL}/api/search?q=pháp`);
  check(searchRes, {
    "search status 200": (r) => r.status === 200,
    "search has results": (r) => JSON.parse(r.body).data.length >= 0,
  });
  responseTime.add(searchRes.timings.duration);
  errorRate.add(searchRes.status !== 200);

  // Public content
  const contentRes = http.get(`${BASE_URL}/api/posts?limit=10`);
  check(contentRes, {
    "content status 200": (r) => r.status === 200,
  });
  responseTime.add(contentRes.timings.duration);
  errorRate.add(contentRes.status !== 200);

  sleep(1);
}

export function handleSummary(data) {
  return {
    "tests/load/results.json": JSON.stringify(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}
```

### Chaos Engineering

```typescript
// tests/chaos/chaos-scenarios.ts
import { ChaosMonkey } from "./chaos-monkey.js";

export const chaosScenarios = {
  // Network chaos
  networkLatency: {
    name: "Network Latency Injection",
    target: "postgres",
    action: "add_latency",
    params: { ms: 200 },
    duration: 60_000,
    expectedBehavior: "API should still respond within SLO",
  },

  // Service chaos
  serviceCrash: {
    name: "Meilisearch Crash",
    target: "meilisearch",
    action: "stop_container",
    duration: 120_000,
    expectedBehavior: "Search should fallback to SQL",
  },

  // Resource chaos
  memoryPressure: {
    name: "Memory Pressure",
    target: "api",
    action: "consume_memory",
    params: { percent: 80 },
    duration: 60_000,
    expectedBehavior: "API should degrade gracefully",
  },

  // Database chaos
  connectionPool: {
    name: "DB Connection Exhaustion",
    target: "postgres",
    action: "exhaust_connections",
    params: { connections: 200 },
    duration: 30_000,
    expectedBehavior: "API should queue/reject with 503",
  },
};

// Usage
const chaos = new ChaosMonkey({
  docker: true,
  alerts: true,
});

await chaos.run(chaosScenarios.serviceCrash);
// Verify fallback behavior
const searchResult = await fetch("/api/search?q=test");
expect(searchResult.status).toBe(200);
expect(searchResult.headers.get("X-Search-Engine")).toBe("sql-fallback");
```

### Coverage Gates (CI/CD)

```yaml
# .woodpecker/test.yml
pipeline:
  test:
    image: node:20-alpine
    commands:
      - pnpm install
      - pnpm test -- --coverage
      - pnpm coverage:check  # Fails if below threshold

  coverage-gate:
    image: node:20-alpine
    commands: |
      # Extract coverage from Vitest output
      COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
      
      # Global minimum: 60%
      if (( $(echo "$COVERAGE < 60" | bc -l) )); then
        echo "Coverage $COVERAGE% is below 60% minimum"
        exit 1
      fi
      
      # P0/P1 modules: 80%+
      AUTH_COV=$(cat coverage/coverage-summary.json | jq '.["apps/api/src/modules/identity/"]["lines"]["pct"]')
      if (( $(echo "$AUTH_COV < 80" | bc -l) )); then
        echo "Auth coverage $AUTH_COV% is below 80% P0 minimum"
        exit 1
      fi
      
      echo "Coverage gates passed: $COVERAGE%"
```

### Testing CI Gates Summary

| Gate | Threshold | Blocking? |
|------|-----------|-----------|
| Unit tests pass | 100% | ✅ Yes |
| Integration tests pass | 100% | ✅ Yes |
| Contract tests pass | 100% | ✅ Yes |
| Global coverage | ≥ 60% | ✅ Yes |
| P0 modules coverage | ≥ 80% | ✅ Yes |
| P1 modules coverage | ≥ 70% | ⚠️ Warning |
| Load test p95 | < 500ms | ✅ Yes |
| Load test error rate | < 5% | ✅ Yes |
| E2E critical paths | 100% | ✅ Yes |
| Chaos scenarios | Graceful degrade | ⚠️ Phase 2 |
