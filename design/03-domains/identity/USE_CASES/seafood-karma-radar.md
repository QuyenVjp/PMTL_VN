# Use Case: Seafood Karma Radar & Totem 50-Stars (Radar Nghiệp Hải Sản &50 Sao Dạo Tặc)

## Purpose (Mục đích)

- Recommend gratitude practice when user eats seafood and has an active totem (gợi ý thực hành biết ơn khi thành viên ăn hải sản và có dạo tặc hoạt động)
- Display advisory banner at dietary onboarding (hiển thị banner cảnh báo khi hoàn tất lựa chọn ăn uống)
- Track user dietary declaration and recommendation exposure (theo dõi khai báo ăn uống và hiển thị gợi ý của thành viên)

## owner module (module sở hữu)

- `identity` (primary: TotemKarmaProfiler)
- `engagement` (integration: advisory display and recommendation tracking)

## Actors (Tác nhân)

- `member`: completes onboarding dietary preferences (hoàn tất lựa chọn ăn uống trong onboarding)

## Trigger (Điểm kích hoạt)

- member posts dietary vow at onboarding: `POST /api/identity/profile/dietary-vow`

## Preconditions (Điều kiện tiên quyết)

- valid active session (phiên đang hoạt động hợp lệ)
- body phải hợp lệ theo `DietaryVowDto`
- user profile tồn tại (user đã register)

## Input contract (Hợp đồng đầu vào)

- `DietaryVowDto { avoidsSeafood: boolean, totemId?: string }`
- field `avoidsSeafood` là boolean declaration của thành viên (false = eats seafood)
- field `totemId` là optional reference đến active totem profile nếu có
- không dùng outbox cho phase 1 advisory; nếu cần reliability ở phase 2+ thì append `outbox_events`

## Read set (Tập dữ liệu đọc)

- `users` (current user profile)
- `user_profiles` (dietary vow history)
- `totem_profiles` (check totem activation and metadata)
- `sessions` (verify member context)

## write path (thứ tự ghi dữ liệu chuẩn)

1. Resolve current user từ session.
2. Validate request body theo `DietaryVowDto` schema.
3. Commit canonical update vào `user_profiles` với fields: `avoidsSeafood`, `lastDietaryVowUpdateAt`.
4. Append audit log `identity.dietary-vow.recorded`.
5. Check if `avoidsSeafood === false AND totemId present AND totem is active`:
   - nếu TRUE: render advisory recommendation (không block flow, informational only)
   - nếu FALSE: skip advisory, no recommendation shown
6. If advisory rendered: append audit log `identity.totem-karma-recommendation-shown`.
7. Return sanitized dietary profile DTO + advisory recommendation (nếu có).
8. **Phase 1**: advisory display là UI-only side-effect, không phải reliability-critical.
9. **Phase 2+**: nếu cần track recommendation exposure với reliability, append `outbox_events` signal.

## async (bất đồng bộ) side-effects

- **Phase 1**: advisory display là optional UI rendering, không làm hỏng dietary-vow canonical path.
- **Phase 2+**: recommendation exposure signal có thể đi qua outbox nếu cần audit reliability.

## success result (kết quả thành công)

- dietary vow được lưu vào `user_profiles`
- audit log `identity.dietary-vow.recorded` được ghi
- nếu recommendation được hiển thị: audit log `identity.totem-karma-recommendation-shown` được ghi
- client nhận sanitized dietary profile DTO + advisory text (nếu applicable)

## Advisory content (Nội dung gợi ý)

Khi `avoidsSeafood === false` AND totem active:

```
[Totem name] đã chịu khổ từ 50 kiếp nhân dạng để giúp bạn.
Nên niệm tên chư Bồ Tát 50 lần hoặc dâng 50 tờ NNN để cảm tạ.
```

Advisory includes:
- Totem name (pulled from `totem_profiles`)
- Default NNN count: 50 (adjustable by member via UI form)
- Number selector for user to override NNN count if desired
- Yellow advisory styling to indicate guidance (not enforcement)

## Errors (Lỗi dự kiến)

- `400`: body sai schema hoặc invalid `DietaryVowDto`
- `401`: session thiếu hoặc không hợp lệ
- `404`: user profile không tồn tại
- `422`: totemId reference invalid hoặc totem không active
- `500`: persistence hoặc system runtime lỗi

## Audit (Kiểm toán)

- action: `identity.dietary-vow.recorded`
  - log context: userId, avoidsSeafood, totemId (nếu có), requestId, timestamp
- action: `identity.totem-karma-recommendation-shown` (only if advisory rendered)
  - log context: userId, totemId, recommendedNnnCount, requestId, timestamp

## Idempotency & anti-spam (Tính không đổi & chống thư rác)

- cùng một payload lặp lại nên là NOOP hợp lệ (vow đã ghi rồi, không ghi lại)
- advisory recommendation sẽ được render lại nếu điều kiện vẫn TRUE (avoidsSeafood=false + totem active)
- replay outbox không được tạo duplicate recommendation-shown audit log khi phase 2+ đã bật

## Performance target (Mục tiêu hiệu năng)

- dietary vow recording nên hoàn tất trong `< 300ms`
- advisory recommendation resolve và render nên hoàn tất trong `< 100ms` thêm

## Notes for AI/codegen (Ghi chú cho AI và sinh mã)

- `user_profiles.avoidsSeafood` là canonical source cho dietary declaration (không phải totem profile)
- advisory recommendation là practice guidance dựa vào self-declaration + totem activation, không phải detection system
- không block flow nếu advisory không thể render; fallback là silent skip
- totem metadata (name, karma count) phải luôn tồn tại trước khi recommendation render; nếu corrupt thì skip advisory
- frontend UI number selector cho NNN count là optional convenience; backend advisory text là bắt buộc
- Yellow styling nhấn mạnh advisory là voluntary guidance, không phải hard constraint
