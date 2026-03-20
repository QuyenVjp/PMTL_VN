# DEPLOY_RUNBOOK (Quy trình triển khai)

File này lấp gap audit đã nêu: có restore runbook nhưng chưa có deploy runbook.

## Baseline target

- single VPS
- `apps/web`
- `apps/api`
- `apps/admin`
- `Postgres`
- `Caddy`

## Standard deploy flow

1. verify backup exists
2. verify migration plan reviewed
3. build/pull images
4. run DB migration
5. start `apps/api`
6. verify `/health/live`, `/health/ready`, `/health/startup`
7. start `apps/web` và `apps/admin`
8. run smoke checks
9. monitor logs and error rate

## Rollback flow

1. stop doing damage
2. rollback app image if schema still compatible
3. if migration caused incompatible state, use restore path
4. verify health and smoke again

## Migration failure handling

- nếu migration fail trước commit: giữ app cũ, fix migration, rerun
- nếu migration đã đổi schema một phần: đánh giá rollback vs restore
- không “tay nhanh hơn não” bằng cách sửa DB live thủ công mà không ghi log/runbook note

## Post-deploy checklist

- auth works
- content read works
- upload works
- health endpoints healthy
- logs readable by requestId
- no spike in `5xx`

## Rule

- deploy runbook không thay backup/restore runbook
- deploy success chỉ được gọi là thật khi smoke path quan trọng đã pass
