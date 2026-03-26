# Phase Semantics

File này chốt ngôn ngữ phase để tránh lẫn giữa `planned`, `deferred`, `phase_2 ready`, và `forbidden`.

## Phase Meanings

### `phase_1`

Là baseline bắt buộc cho first launch.

### `phase_2`

Là phần được phép kích hoạt khi có trigger rõ hoặc khi phase_1 đã ổn định.

### `phase_3`

Là lớp scale và quan sát nâng cao, không được mặc định kéo vào scaffold sớm.

### `all`

Áp dụng xuyên phase, thường là rule nền tảng.

## PMTL Practical Mapping

- `phase_1`: full component list owner là [DECISIONS.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/01-repo-constitution/DECISIONS.md) section 2.
- `phase_2`: optional-scale activations như `Valkey`, `BullMQ`, outbox dispatcher, push notifications, `Meilisearch`, `R2` chỉ bật theo trigger docs tương ứng.
- `phase_3`: observability/scale lanes như OTEL, Prometheus/Grafana/Alertmanager, `PgBouncer` vẫn là later-phase systems cho đến khi trigger đo được.
- File này chốt nghĩa của phase labels; không phải owner của full component inventories.

## Guardrail

Không file phase_2 hoặc phase_3 nào được dùng để ngầm hợp thức hóa dependency trong phase_1 nếu chưa có trigger doc rõ và overlay tương ứng.
