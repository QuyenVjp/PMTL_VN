# ERROR_CODE_REGISTRY (Danh mục mã lỗi)

File này chốt `canonical error codes (mã lỗi chuẩn)` cho `apps/api`.
Nó lấp đúng gap audit đã chỉ ra: có error envelope nhưng chưa có registry.
Envelope shape owner nằm ở [ERROR_ENVELOPE_CONTRACT.md](../../02-platform-baseline/api-runtime/ERROR_ENVELOPE_CONTRACT.md).

## Envelope

```json
{
  "error": {
    "code": "auth.invalid_credentials",
    "message": "Thông điệp an toàn cho client",
    "status": 401,
    "requestId": "req_123"
  }
}
```

## Rules

- `code` phải ổn định theo thời gian
- `message` có thể thay wording, nhưng không đổi nghĩa
- không lộ internal stack trace
- validation error có thể thêm `details`

## Registry

### Auth / Identity

- `auth.invalid_credentials`
- `auth.session_missing`
- `auth.session_expired`
- `auth.refresh_reused`
- `auth.forbidden`
- `auth.account_suspended`
- `auth.email_not_verified`
- `auth.reset_token_invalid`
- `auth.reset_token_expired`

### Validation / Boundary

- `validation.invalid_body`
- `validation.invalid_query`
- `validation.invalid_params`
- `validation.invalid_env`
- `validation.constraint_failed`

Rules:
- `validation.invalid_env` chỉ dùng cho startup/config boot validation, không dùng cho request-time assumptions mơ hồ.
- `validation.invalid_body` = body JSON/form payload không qua schema.
- `validation.invalid_query` = URL query params không qua schema.
- `validation.invalid_params` = path params không qua schema.
- `validation.constraint_failed` = qua schema nhưng fail semantic/business constraint rõ.

### Rate limit / Abuse

- `rate_limit.exceeded`
- `rate_limit.service_unavailable`
- `security.csrf_failed`
- `security.cors_denied`

### Content / Media

- `content.not_found`
- `content.publish_precondition_failed`
- `media.file_type_not_allowed`
- `media.file_too_large`
- `media.file_missing`
- `media.delete_forbidden`

### Community / Moderation

- `community.comment_closed`
- `community.post_locked`
- `moderation.report_duplicate`
- `moderation.decision_invalid`
- `moderation.target_not_found`

### Search / Calendar / Notification

- `search.engine_unavailable`
- `search.authorization_missing`
- `search.invalid_api_key`
- `search.reindex_not_enabled`
- `search.task_failed`
- `search.task_not_found`
- `search.index_settings_update_failed`
- `search.query_invalid`
- `search.query_too_short`
- `search.cursor_invalid`
- `calendar.event_not_found`
- `calendar.month_invalid`
- `calendar.aggregate_unavailable`
- `calendar.advisory_unavailable`
- `notification.subscription_invalid`
- `notification.subscription_missing`
- `notification.delivery_disabled`
- `notification.push_not_supported`
- `notification.preferences_degraded`

### Storage / Upload

- `storage.quota_exceeded`
- `storage.permission_denied`
- `storage.signed_url_expired`
- `storage.signed_url_invalid`
- `storage.upload_finalize_failed`
- `storage.root_unavailable`
- `storage.provider_unavailable`

### Page / Aggregate bootstrap

- `dashboard.aggregate_unavailable`
- `offline.bundle_list_unavailable`
- `offline.sync_degraded`
- `page.aggregate_unavailable`
- `page.partial_data_warning`

### Engagement / Practice

- `engagement.practice_profile_invalid`
- `engagement.practice_profile_conflict`
- `engagement.practice_log_invalid`
- `engagement.practice_log_conflict`
- `engagement.practice_sheet_invalid`
- `engagement.practice_sheet_transition_invalid`
- `engagement.practice_foundation_warning`

### Wisdom offline / bundle sync

- `wisdom.offline.version_stale`
- `wisdom.offline.bundle_not_found`
- `wisdom.offline.device_fingerprint_required`

### Contact

- `contact.not_found`
- `contact.update_forbidden`
- `contact.volunteer_duplicate`

### Vows / Merit

- `vows.not_found`
- `vows.status_invalid`
- `vows.progress_conflict`
- `vows.assisted_entry_forbidden`

### Admin operations

- `admin.insufficient_role`
- `admin.self_modification_forbidden`
- `admin.audit_immutable`
- `admin.feature_flag_locked`
- `admin.moderation_state_invalid`
- `admin.reindex_already_running`
- `admin.health_projection_unavailable`

### Platform / Generic

- `platform.feature_disabled`
- `platform.conflict`
- `platform.not_found`
- `platform.unexpected_error`

### Prisma / Persistence

- `prisma.unique_conflict`
- `prisma.record_not_found`
- `prisma.foreign_key_conflict`
- `prisma.transaction_conflict_retryable`
- `prisma.pool_timeout`
- `prisma.query_invalid`
- `prisma.migration_failed`

## Status mapping guideline

- `400`: invalid input / precondition fail
- `401`: thiếu hoặc sai auth
- `403`: có auth nhưng không đủ quyền
- `404`: resource không tồn tại hoặc không public
- `409`: conflict / duplicate / optimistic failure
- `422`: semantic validation fail nếu cần tách rõ
- `429`: rate limit hit
- `500`: unexpected server error
- `503`: dependency/platform temporarily unavailable

## Cross-reference

Error code được nhắc ở [PAGE_LOADER_CONTRACTS.md](../web/PAGE_LOADER_CONTRACTS.md), [API_DTO_SHAPE_PLAN.md](./API_DTO_SHAPE_PLAN.md), [HEALTH_CONTRACT.md](../../02-platform-baseline/api-runtime/HEALTH_CONTRACT.md), hoặc domain `CONTRACTS.md` thì phải có row canon ở file này trước khi scaffold.

Thiếu row tương ứng = `blocked at design`.
