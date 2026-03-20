# ROOT_DOC_OWNERSHIP (Quyền sở hữu file gốc trong design)

File này tồn tại để xử lý đúng vấn đề audit đã chỉ ra:

- root docs bị trùng ý
- sửa một policy phải nhớ nhiều file
- AI dễ đọc nhầm file giải thích thành file chốt luật

Mục tiêu của file này là chốt:

- file nào là `canonical owner (file chủ sở hữu chuẩn)`
- file nào chỉ được `tóm tắt / dẫn link / giải thích`
- file nào là `ops/log/template`, không phải nơi phát minh rule mới

## Precedence rule (Quy tắc ưu tiên)

Nếu 2 file mâu thuẫn nhau, dùng thứ tự ưu tiên này:

1. `DECISIONS.md`
2. file owner chuyên biệt bên dưới
3. `README.md` và các file overview/tóm tắt

## Root file ownership map

| File | Vai trò duy nhất | Được phép chứa | Không được làm |
|---|---|---|---|
| `README.md` | mục lục + cách đọc | read order, launch scope, pointer | không lặp lại full policy |
| `DECISIONS.md` | canonical decision baseline | current direction, phase baseline, source-of-truth rules, anti-goals | không thay security/nest/detail owner files |
| `baseline/repo-structure.md` | folder/file placement owner | repo shape, module anatomy, placement rules | không lặp full security/infra policy |
| `baseline/platform-modules.md` | platform/control-plane owner | sessions, audit, flags, rate-limit, storage, health, metrics | không ôm domain module contracts |
| `baseline/nest-baseline.md` | NestJS app pipeline owner | request pipeline, Zod, Pino, guards, error envelope | không lặp full infra policy |
| `baseline/security.md` | security policy owner | auth, CSRF, CORS, cookies, upload security, webhook, secrets | không lặp infra topology |
| `baseline/infra.md` | infra phase owner | phase baseline, optional components, trigger rules | không biến thành deep ops tutorial |
| `tracking/audit-policy.md` | audit event taxonomy owner | what to log, actor/action/resource baseline | không lặp auth policy |
| `baseline/sla-slo.md` | service objectives owner | latency, availability, measurement notes | không lặp implementation status |
| `baseline/failure-modes.md` | failure behavior owner | degrade/fail-closed/fail-open matrix | không lặp full infra tutorial |
| `ops/backup-restore.md` | restore procedure owner | backup/restore commands, acceptance criteria | không phát minh policy security mới |
| `ops/restore-drill-log.md` | drill evidence log | dated drill records | không chứa rule mới |
| `tracking/implementation-mapping.md` | implementation truth owner | status `implemented/planned/required before launch` | không lặp rationale dài |
| `tracking/module-interactions.md` | cross-module interaction owner | ownership boundaries, direct vs async interaction | không lặp repo structure |
| `tracking/api-route-inventory.md` | API route inventory owner | route groups, auth scope, owner module | không thay use-case detail |
| `tracking/env-inventory.md` | env inventory owner | env names, scope, required/optional, owner app | không lặp full deploy steps |
| `tracking/error-code-registry.md` | error code owner | canonical error codes and meanings | không lặp route contracts |
| `baseline/migration-strategy.md` | DB/schema evolution owner | naming, rollout, rollback, seed rules | không lặp infra topology |
| `baseline/testing-strategy.md` | verification owner | test pyramid, coverage targets, seed/test data rules | không lặp domain ownership |
| `baseline/frontend-architecture.md` | web/admin frontend owner | RSC/client split, data fetching, UI package usage | không lặp backend auth policy |
| `ops/deploy-runbook.md` | deploy/rollback procedure owner | deploy, rollback, migration-fail handling | không thay backup runbook |
| `overview/terminology.md` | terminology owner | PMTL terms + `English (Việt)` notation | không lặp qua nhiều root files |
| `overview/source-analysis.md` | source-derived feature surface owner | official source notes + feature implications | không lặp source summaries |
| `baseline/writing-standards.md` | docs writing owner | contract/use-case standards | không lặp template ở nhiều file |

## Duplication rule (Quy tắc chống trùng)

Khi một file không phải owner cần nhắc lại policy:

- chỉ tóm tắt 1-3 bullet
- dẫn link tới file owner
- không copy toàn bộ nội dung

Ví dụ đúng:

- "`Valkey` chỉ bật khi có measured pain; xem `DECISIONS.md`."

Ví dụ sai:

- copy lại đầy đủ bảng phase baseline, trigger thresholds, accepted/deferred tool status

## Student note (Ghi chú cho sinh viên)

Audit đúng ở điểm này:

- docs nhiều không đồng nghĩa docs mạnh
- thiếu ownership cho từng file thì docs sẽ tự cắn nhau

File này là cái khóa để từ nay nếu anh sửa 1 policy, anh biết sửa đúng `owner file` trước.
