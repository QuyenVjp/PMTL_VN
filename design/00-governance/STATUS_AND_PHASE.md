# Status And Phase

File này gộp implementation status semantics với phase semantics.
Mục tiêu là chặn kiểu đọc nhầm `design_ready` thành `implemented`, hoặc lôi phase 2/3 vào scaffold phase 1.

## Canonical Implementation Statuses

- `planned`
- `design_ready`
- `scaffolded`
- `partial`
- `implemented`
- `verified`
- `deferred`
- `excluded`

## Practical Interpretation

- `design_ready` != `scaffolded`
- `scaffolded` != `implemented`
- `implemented` != `verified`

Rule:

- overlay docs phải ưu tiên status machine-readable hoặc bảng nhất quán
- không dùng free-text status như `done`, `ready-ish`, `mostly-ready`, `nearly implemented`
- nếu cần nuance, giữ status canon và giải thích thêm ở cột note riêng

## Phase Meanings

### `phase_1`

Baseline bắt buộc cho first launch.

### `phase_2`

Được phép kích hoạt khi có trigger rõ hoặc phase 1 đã ổn định.

### `phase_3`

Lớp scale/observability nâng cao, không được kéo vào scaffold sớm theo cảm tính.

### `all`

Áp dụng xuyên phase, thường là rule nền tảng.

## PMTL Practical Mapping

- full Phase 1 component list owner là [DECISIONS.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/01-repo-constitution/DECISIONS.md)
- optional-scale activations như `Valkey`, `BullMQ`, `Meilisearch`, `R2`, push notifications chỉ bật theo trigger docs tương ứng
- observability/scale lanes như OTEL, Prometheus/Grafana/Alertmanager, `PgBouncer` vẫn là later-phase systems cho đến khi trigger đo được

## Guardrails

- file phase 2 hoặc phase 3 không được ngầm hợp thức hóa dependency trong phase 1
- `design-ready` không phải bằng chứng repo đã cài package hoặc runtime đã tồn tại
- khi conflict giữa phase prose và implementation truth, overlay owner docs thắng cho trạng thái runtime
