# ASYNC_LOCAL_STORAGE_POLICY

## Purpose

Chốt stance cho Async Local Storage trong backend PMTL.

## Scope

- request context propagation
- correlation id / actor context
- logging/tracing helpers

## Authority

- `required`

## Phase

- `all`

## Why

- ALS hữu ích nhưng cũng dễ thành magic context layer khó debug nếu bật quá sớm.

## Must

- phase_1 không bắt ALS làm baseline bắt buộc
- request correlation hiện tại ưu tiên explicit propagation qua logger/request context rules
- `nestjs-pino` dùng AsyncLocalStorage nội bộ cho request context là chấp nhận được; điều bị deferred là repo tự mở thêm một ALS abstraction mới làm application baseline
- nếu sau này bật ALS, mục tiêu phải rõ: logging context, trace correlation, or tenancy context

## Must not

- không dùng ALS để né explicit dependencies trong business flow
- không nhét mutable domain state vào ALS

## Trigger to adopt

- explicit request context propagation gây boilerplate quá mức
- observability/tracing needs vượt quá logger context hiện tại
- có verified need cho cross-async correlation trong production debugging

## Dependencies

- [OBSERVABILITY_ARCHITECTURE.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/deploy-ops/OBSERVABILITY_ARCHITECTURE.md)
- [AI_DEBUGGING_DISCIPLINE.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/deploy-ops/AI_DEBUGGING_DISCIPLINE.md)
