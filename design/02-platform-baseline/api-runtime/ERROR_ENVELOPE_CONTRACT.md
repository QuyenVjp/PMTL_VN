# ERROR_ENVELOPE_CONTRACT

File này chốt JSON error envelope chuẩn cho `apps/api`.
Nó làm rõ phần shape/metadata/detail projection, còn canonical code list vẫn do [ERROR_CODE_REGISTRY.md](../../04-execution-overlay/api/ERROR_CODE_REGISTRY.md) sở hữu.

Authority liên quan:

- [DECISIONS.md](../../01-repo-constitution/DECISIONS.md)
- [NEST_REQUEST_PIPELINE.md](../../02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md)
- [ERROR_CODE_REGISTRY.md](../../04-execution-overlay/api/ERROR_CODE_REGISTRY.md)
- [ZOD_4_RUNTIME_POLICY.md](../../02-platform-baseline/api-runtime/ZOD_4_RUNTIME_POLICY.md)

Precedence note:

- nếu file này mâu thuẫn với root decision baseline, [DECISIONS.md](../../01-repo-constitution/DECISIONS.md) thắng
- trong lane error handling chi tiết, file này thắng overview docs

## Canonical shape

```json
{
  "error": {
    "code": "validation.invalid_body",
    "message": "Dữ liệu gửi lên không hợp lệ.",
    "status": 400,
    "requestId": "req_123",
    "details": {
      "fieldErrors": {
        "email": ["Email không hợp lệ."]
      }
    }
  }
}
```

## Required fields

- `code`
- `message`
- `status`
- `requestId`

## Optional fields

- `details`
- `details.fieldErrors`
- route-family specific safe metadata nếu owner doc đã chốt

## Rules

- `code` phải ổn định theo thời gian và map về registry canon
- `message` an toàn cho client; không lộ stack trace, SQL, internal class names, raw upstream payload
- `requestId` luôn hiện diện để nối log/metrics/runbook
- `details` chỉ là safe projection, không trả raw validator internals

## Validation detail stance

- Zod parse errors phải map qua validation-error mapper, không trả raw `ZodError`
- field-level output ưu tiên tree-safe projection theo `z.treeifyError()` hoặc mapper tương đương
- không leak raw input value, internal path formatter, hoặc implementation-only issue codes

## Status/code mapping

- `400` transport/boundary invalid
- `401` thiếu hoặc sai auth/session
- `403` không đủ quyền
- `404` entity không tồn tại hoặc không public
- `409` duplicate/conflict
- `422` semantic validation fail nếu route family cần tách rõ
- `429` rate-limit/abuse guard
- `500` unexpected server error
- `503` dependency/platform unavailable

## Forbidden drift

- route family tự bẻ envelope khác shape canon
- interceptor/filter đổi mọi lỗi thành generic `500`
- trả English framework default message ra public API khi repo đang cần Vietnamese-safe wording
