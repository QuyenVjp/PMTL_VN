# Create Assisted Vow Progress Entry

## Purpose

- Cho phép admin nhập hộ tiến độ phát nguyện cho member khi cần hỗ trợ nhập liệu hoặc đồng bộ từ chứng từ ngoại tuyến.

## Owner module

- `vows-merit`

## Actors

- `admin`
- `super-admin`

## Trigger

- admin submit form ở `/admin/ho-tro/phat-nguyen/nhap-ho`
- API route: `POST /api/admin/vows/assisted-entry/progress`

## Preconditions

- target member tồn tại và đang ở scope được phép hỗ trợ
- vow target hoặc progress target resolve được
- assist reason hợp lệ theo policy audit

## Input contract

- `memberPublicId`
- `vowPublicId`
- `progressValue`
- `progressNote`
- `assistReason`
- optional `evidenceRef`

## Read set

- `vows`
- `vowMilestones`
- member identity context
- admin actor context

## Write path

1. Resolve target member và target vow.
2. Validate payload + assist policy.
3. Append canonical progress record hoặc update milestone aggregate theo contract owner.
4. Nếu progress làm đổi trạng thái vow, persist status transition trong cùng canonical transaction.
5. Ghi audit `vow.assisted_progress.create` với actor, target member, target vow, before/after summary.
6. **Phase 1**: reminder/calendar refresh nếu cần chỉ đi theo sync hoặc manual recompute path có recovery rõ.
7. **Phase 2+**: append outbox signal cho reminder/notification downstream khi reliability path đã bật.

## Success result

- Progress của vow được ghi đúng cho member mục tiêu.
- Admin workspace thấy lịch sử nhập hộ nhất quán với assisted-entry history.

## Errors

- `400`: payload sai hoặc `assistReason` thiếu
- `401`: chưa đăng nhập
- `403`: vượt scope hỗ trợ được phép
- `404`: member hoặc vow không tồn tại
- `409`: conflict trạng thái hoặc duplicate progress record theo idempotency key
- `500`: persist/audit/downstream sync lỗi

## Notes for AI/codegen

- Đây là canonical assisted-entry write-path riêng, không được gộp mơ hồ vào self-service milestone route.
- Nếu cần correction/void về sau, phải thêm action route rõ thay vì patch blind trên history.
