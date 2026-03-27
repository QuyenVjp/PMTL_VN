# TASK_SCHEDULING_POLICY

## Purpose

Chốt stance cho cron/scheduler trong `apps/api`.

## Scope

- Nest scheduler
- in-process cron jobs
- relation với outbox / queue / cleanup jobs

## Authority

- `required`

## Phase

- `all`

## Version basis

- NestJS `11.1.17`

## Why

- PMTL có cleanup/rebuild/use cases, nhưng phase_1 không nên mở scheduler bừa trước khi có ownership và failure model rõ.

## Must

- scheduler không phải baseline phase_1 mặc định
- mọi scheduled task phải có owner doc, idempotency note, và failure behavior rõ trước khi bật
- nếu job có thể chồng lặp, phải có lock/dedup strategy
- job nào đụng write-path quan trọng phải map sang audit/logging/alert expectations

## Must not

- không nhét business workflow quan trọng vào `@Cron()` chỉ vì tiện
- không dùng in-process scheduler như queue thay thế
- không bật scheduler cho nhiều replica mà không có concurrency control

## Allowed patterns

- housekeeping job nhẹ cho storage cleanup, stale manifest cleanup, hoặc projection repair khi owner docs đã chốt
- scheduler bootstrap muộn sau khi app readiness dependencies pass

## Deferred baseline

- phase_1: prefer manual/admin-triggered or startup-safe repair lanes
- phase_2+: chỉ mở rộng nếu optional-scale/docs owner cho phép

## Dependencies

- [OUTBOX_EVENT_TAXONOMY.md](../../04-execution-overlay/cross-module/OUTBOX_EVENT_TAXONOMY.md)
- [OBSERVABILITY_ARCHITECTURE.md](../../02-platform-baseline/deploy-ops/OBSERVABILITY_ARCHITECTURE.md)
- [IMPLEMENTATION_MAPPING.md](../../04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md)

