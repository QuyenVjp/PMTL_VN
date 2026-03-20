# Startup Dependency Order (Thứ tự khởi động Platform Modules)

File này chốt **thứ tự khởi động** của 11 platform modules và hành vi khi từng module fail.
Không có doc này, khi hệ thống fail lúc boot, không ai biết thứ tự khởi tạo đúng là gì.

## Nguyên tắc

- platform module khởi động theo thứ tự dependency, không phải alphabet
- module sau **không được** tham chiếu module trước khi module trước ready
- `config` và `logging` là hard dependency của mọi module — fail ở đây là fail toàn bộ
- `health` và `metrics` cần tất cả các module đã ổn định để báo cáo đúng

---

## Initialization sequence (Thứ tự khởi tạo)

```
1. config
   ↓
2. logging
   ↓
3. errors
4. validation     (song song với errors, không phụ thuộc nhau)
   ↓
5. sessions
   ↓
6. feature-flags
7. rate-limit     (song song với feature-flags, cùng dep là config + logging + sessions)
8. storage        (song song với feature-flags)
   ↓
9. audit          (cần sessions để ghi actor context đúng)
   ↓
10. health
11. metrics       (song song với health)
```

---

## Module-by-module contract (Hợp đồng từng module)

### 1. `config`

| Trường | Giá trị |
|---|---|
| **Depends on** | không có — đọc từ env |
| **Provides** | typed env object, startup validation |
| **Fail behavior** | **ABORT** — không thể start nếu env thiếu hoặc sai |
| **Validation tool** | Zod schema trên toàn bộ env vars |

Quy tắc: config phải validate đủ toàn bộ env required trước khi để bất kỳ module nào tiếp tục.

---

### 2. `logging`

| Trường | Giá trị |
|---|---|
| **Depends on** | config (log level, log format, env name) |
| **Provides** | Pino logger instance, request context propagation |
| **Fail behavior** | **ABORT** — không thể vận hành mà không có observability |

Quy tắc: logger phải có sẵn trước khi bất kỳ business code nào chạy.

---

### 3. `errors`

| Trường | Giá trị |
|---|---|
| **Depends on** | logging |
| **Provides** | global exception filter, error envelope chuẩn |
| **Fail behavior** | **ABORT** — không có global error handler thì response bị leak chi tiết lỗi |

---

### 4. `validation`

| Trường | Giá trị |
|---|---|
| **Depends on** | không có (Zod pipe setup thuần) |
| **Provides** | global validation pipe (Zod-based) |
| **Fail behavior** | **ABORT** — mọi endpoint đều cần validation pipe |

Ghi chú: validation và errors có thể khởi tạo song song — không phụ thuộc nhau.

---

### 5. `sessions`

| Trường | Giá trị |
|---|---|
| **Depends on** | config, logging, Postgres (via Prisma) |
| **Provides** | session store, revoke helpers, token lifecycle |
| **Fail behavior** | **ABORT** — auth không hoạt động nếu session store unavailable |

Quy tắc: sessions module không được start mà không có DB connection.

---

### 6. `feature-flags`

| Trường | Giá trị |
|---|---|
| **Depends on** | config, logging, Postgres (feature_flags table) |
| **Provides** | flag evaluation service |
| **Fail behavior** | **DEGRADE** — nếu table thiếu, default về `flag = disabled` và log warning |

Quy tắc: fail-safe là tắt feature, không phải bật feature.

---

### 7. `rate-limit`

| Trường | Giá trị |
|---|---|
| **Depends on** | config, logging, sessions (cho per-account scoping) |
| **Provides** | rate limit guard, per-IP và per-account counting |
| **Fail behavior** | **FAIL OPEN với log** — nếu limiter store unavailable, cho qua nhưng log rõ |
| **Phase 1 store** | `rate_limit_records` Postgres table (xem quyết định cuối bên dưới) |

**Quyết định phase 1**: dùng `rate_limit_records` Postgres table, không phải Valkey.
Trigger migrate sang Valkey khi: volume đủ lớn hoặc lock contention trên table đo được.

---

### 8. `storage`

| Trường | Giá trị |
|---|---|
| **Depends on** | config, logging |
| **Provides** | storage interface + local disk adapter |
| **Fail behavior** | **DEGRADE** — text-heavy surfaces vẫn phục vụ được; upload/media trả 503 |

Quy tắc: storage fail không được làm chết toàn bộ app — chỉ chết các route cần file.

---

### 9. `audit`

| Trường | Giá trị |
|---|---|
| **Depends on** | logging, sessions (ghi actor context), Postgres (audit_logs table) |
| **Provides** | append-only audit log helper |
| **Fail behavior** | **ABORT** — required before launch; audit không được fail silently |

Quy tắc: audit append fail = hệ thống phải return error, không được tiếp tục write-path và bỏ qua audit.
Exception: chỉ được degrade nếu có explicit fallback queue được thiết kế và reviewed.

---

### 10. `health`

| Trường | Giá trị |
|---|---|
| **Depends on** | tất cả modules trên đã sẵn sàng |
| **Provides** | `/health/live`, `/health/ready`, `/health/startup` |
| **Fail behavior** | tự báo cáo degraded state — không abort |

Hành vi:
- `/health/live` — app process còn sống
- `/health/ready` — Postgres connect được, sessions sẵn sàng, storage không bị hard-fail
- `/health/startup` — toàn bộ module đã hoàn tất bootstrap

---

### 11. `metrics`

| Trường | Giá trị |
|---|---|
| **Depends on** | logging, config |
| **Provides** | `/metrics` với request/error/upload/rate-limit counters |
| **Fail behavior** | **DEGRADE** — `/metrics` trả 503 nhưng app vẫn chạy |

---

## Failure contract tóm tắt (Summary failure behavior)

| Module | Fail behavior | Hệ thống tiếp tục? |
|---|---|---|
| config | ABORT | Không |
| logging | ABORT | Không |
| errors | ABORT | Không |
| validation | ABORT | Không |
| sessions | ABORT | Không |
| feature-flags | DEGRADE (default-off) | Có, với warning |
| rate-limit | FAIL OPEN + log | Có, với cảnh báo |
| storage | DEGRADE (text-only) | Có, một phần |
| audit | ABORT | Không |
| health | self-report | Có |
| metrics | DEGRADE | Có |

---

## NestJS implementation notes

- dùng `NestJS Module.forRoot()` với async factory để đảm bảo async init đúng thứ tự
- dùng `APP_FILTER`, `APP_PIPE`, `APP_GUARD` token để đăng ký global providers
- `onModuleInit()` trên platform services cần connect + verify, không delay sang runtime
- startup probe (`/health/startup`) chỉ trả `200` khi tất cả `onModuleInit` đã pass
- không dùng lazy init cho config, logging, sessions, audit

## Notes for AI/codegen

- không tự ý đảo thứ tự khởi tạo platform modules
- khi thêm platform module mới, phải khai báo dependency rõ trong file này
- `audit` fail không được bị catch-and-ignore trong write-path
- `rate-limit` phase 1 = Postgres table — không tự ý thêm Valkey dependency
