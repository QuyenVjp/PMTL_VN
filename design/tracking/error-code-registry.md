# ERROR_CODE_REGISTRY (Danh mục mã lỗi)

File này chốt `canonical error codes (mã lỗi chuẩn)` cho `apps/api`.
Nó lấp đúng gap audit đã chỉ ra: có error envelope nhưng chưa có registry.

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
- `storage.provider_unavailable`

### Community / Moderation

- `community.comment_closed`
- `community.post_locked`
- `moderation.report_duplicate`
- `moderation.decision_invalid`
- `moderation.target_not_found`

### Search / Calendar / Notification

- `search.engine_unavailable`
- `search.reindex_not_enabled`
- `calendar.event_not_found`
- `notification.subscription_invalid`
- `notification.delivery_disabled`

### Platform / Generic

- `platform.feature_disabled`
- `platform.conflict`
- `platform.not_found`
- `platform.unexpected_error`

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
