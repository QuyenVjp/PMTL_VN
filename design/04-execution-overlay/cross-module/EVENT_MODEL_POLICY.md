# EVENT_MODEL_POLICY

## Purpose

Chốt event model tổng cho backend PMTL.

## Scope

- domain events
- outbox-worthy events
- direct call vs async dispatch

## Authority

- `required`

## Phase

- `all`

## Why

- PMTL đã có interaction map và outbox taxonomy, nhưng thiếu một file nói rõ khi nào event chỉ là design concept, khi nào được phép thành runtime primitive.

## Must

- default interaction path vẫn là direct service call qua contract rõ
- chỉ promote một interaction sang event khi có lý do rõ: decoupling, retry boundary, async delivery, audit fan-out, integration lane
- event name, payload shape, idempotency expectation phải map được sang [OUTBOX_EVENT_TAXONOMY.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/cross-module/OUTBOX_EVENT_TAXONOMY.md)
- nếu event có side-effect user-visible, phải có recovery/replay stance

## Must not

- không dùng event bus như cách né circular dependency design tệ
- không emit event mơ hồ kiểu “updated” mà không rõ aggregate/resource/action
- không coi event design note là bằng chứng runtime dispatcher đã tồn tại

## Allowed patterns

- synchronous domain service call cho phase_1 core paths
- outbox-ready event schema cho future async activation
- admin/manual replay lane khi owner docs yêu cầu

## Dependencies

- [MODULE_INTERACTIONS.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/cross-module/MODULE_INTERACTIONS.md)
- [OUTBOX_EVENT_TAXONOMY.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/cross-module/OUTBOX_EVENT_TAXONOMY.md)
- [IMPLEMENTATION_MAPPING.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md)

