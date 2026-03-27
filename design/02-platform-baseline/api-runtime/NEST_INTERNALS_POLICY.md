# NEST_INTERNALS_POLICY

## Purpose

Chốt stance cho các Nest internals dễ bị dùng sai.

## Scope

- lifecycle events
- injection scopes
- module reference
- circular dependency escape hatches

## Authority

- `required`

## Phase

- `all`

## Lifecycle events

- allowed:
  - bootstrap wiring
  - graceful shutdown/release resources
  - readiness-safe platform init
- forbidden:
  - business side effects ẩn
  - domain workflow orchestration khó test

## Injection scopes

- singleton là mặc định
- request scope chỉ cho case chứng minh được như request tracking / tenant context / per-request cache thật sự cần
- transient không được dùng như style mặc định

## Module reference

- chỉ dùng cho bootstrap, plugin-like resolution, hoặc dynamic runtime case thật sự cần
- không dùng như service locator trong business flow

## Circular dependency

- ưu tiên refactor qua:
  - exported contract
  - facade boundary
  - event/outbox
  - ownership move
- `forwardRef()` chỉ là escape hatch cuối, không phải default pattern

## Must not

- không chấp nhận circular dependency vì “Nest chạy được”
- không request-scope cả module chỉ để né state leak ở service design tệ

## Dependencies

- [NEST_REQUEST_PIPELINE.md](../../02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md)
- [EVENT_MODEL_POLICY.md](../../04-execution-overlay/cross-module/EVENT_MODEL_POLICY.md)
- [MODULE_INTERACTIONS.md](../../04-execution-overlay/cross-module/MODULE_INTERACTIONS.md)

