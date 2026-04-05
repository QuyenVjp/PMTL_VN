# Khiên Bảo Vệ Chuyển Nghiệp Khi Niệm NNN Thay Người Khác — Karmic Transference Shield (NNN Proxy Recitation)

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-05

---

## Purpose

Khi hành giả niệm Ngôi Nhà Nhỏ (NNN) thay cho người khác, có rủi ro tâm linh: vong linh của người cần được trợ giúp có thể "bám theo" người niệm, về nhà cùng họ, gây chuyển nợ nghiệp hoặc truyền khổ nạn sang người niệm. Use case này định nghĩa cơ chế hiển thị cảnh báo và bài cầu nguyện bảo vệ bắt buộc khi `isRecitingForOther = true`, đồng thời ghi lại audit trail về việc người dùng có xem lời cầu nguyện trước khi tiến hành hay không.

---

## Owner Module

`engagement` — `LittleHouseService` / `KarmicTransferenceShield`

---

## Actors

| Actor | Vai trò |
|-------|---------|
| Practitioner (người niệm) | Hành giả thực hiện việc niệm NNN thay người khác |
| Beneficiary (người được niệm) | Người cần được trợ giúp, có thể có vong linh cần hóa giải |
| LittleHouseService | Điều phối logic nghiệp vụ, kích hoạt shield khi cần |
| KarmicTransferenceShield | Sub-service xử lý hiển thị cảnh báo, lưu audit |
| AuditLogger | Ghi nhận trạng thái xem / bỏ qua lời cầu nguyện bảo vệ |

---

## Trigger

- Hành giả bắt đầu phiên niệm NNN mới với `isRecitingForOther = true`
- Hành giả thay đổi trường `beneficiaryName` từ trống sang có giá trị trong phiên đang diễn ra
- Hành giả nhấn nút "Bắt đầu niệm" hoặc xác nhận phiên niệm proxy

---

## Business Rules

| # | Quy tắc | Loại |
|---|---------|------|
| BR-01 | Khi `isRecitingForOther = true`, hệ thống **phải** hiển thị cảnh báo rủi ro chuyển nghiệp trước khi cho phép bắt đầu phiên niệm | ✅ Bắt buộc |
| BR-02 | Cảnh báo là **tư vấn mềm** (soft advisory) — người dùng CÓ THỂ bỏ qua và tiếp tục, không bị chặn cứng | ⚠️ Advisory |
| BR-03 | Bài cầu nguyện bảo vệ bắt buộc phải được hiển thị đầy đủ với tên người niệm, số tấm NNN, và tên người được niệm được điền vào template | ✅ Bắt buộc |
| BR-04 | Hệ thống ghi nhận `shield_viewed = true` khi người dùng đã xem đủ bài cầu nguyện (scroll đến cuối hoặc xác nhận đã đọc) | ✅ Bắt buộc |
| BR-05 | Nếu người dùng bỏ qua mà chưa xem bài cầu nguyện → hệ thống ghi `shield_skipped = true` trong audit | ✅ Bắt buộc |
| BR-06 | Trường `shield_skipped` không được ngăn cản việc tạo phiên niệm — chỉ phục vụ audit trail | ⚠️ Advisory |
| BR-07 | Bài cầu nguyện bảo vệ **không thể** bị ẩn hoặc tắt bởi cấu hình người dùng — luôn hiển thị khi điều kiện kích hoạt | ❌ Không cho phép tắt |
| BR-08 | Nếu `beneficiaryName` trống khi `isRecitingForOther = true` → hệ thống phải yêu cầu điền tên trước khi hiển thị bài cầu nguyện | ✅ Bắt buộc |
| BR-09 | Nếu `reciterQuantity` (số tấm NNN dự kiến niệm) không có → dùng placeholder `[SỐ TẤM]` trong bài cầu nguyện, không chặn hiển thị | ⚠️ Degraded mode |
| BR-10 | Phần còn lại (`remainderQuantity`) được tính là tổng số tấm NNN của bộ kinh trừ đi số tấm người niệm sẽ niệm; nếu không xác định được → dùng placeholder | ⚠️ Degraded mode |
| BR-11 | Use case này áp dụng riêng cho NNN (Ngôi Nhà Nhỏ) proxy recitation, **không** áp dụng cho phóng sinh (life liberation) — xem `proxy-liberation-karma-shield.md` | ❌ Out of scope |

---

## Input Contract

```typescript
// DTO: Bắt đầu phiên niệm NNN proxy
interface StartNNNProxySessionDTO {
  reciterId: string;              // ID hành giả đang niệm
  reciterName: string;            // Tên hành giả (điền vào bài cầu nguyện)
  isRecitingForOther: true;       // Phải là true để kích hoạt shield
  beneficiaryName: string;        // Tên người được niệm — bắt buộc không được trống
  reciterQuantity: number;        // Số tấm NNN người này sẽ niệm
  totalRequiredQuantity?: number; // Tổng số tấm NNN của bộ kinh (tùy chọn)
  sessionNote?: string;           // Ghi chú phiên (tùy chọn)
}

// DTO: Xác nhận trạng thái shield
interface ShieldAcknowledgementDTO {
  sessionId: string;
  shieldViewed: boolean;   // true nếu người dùng đã xem đủ bài cầu nguyện
  shieldSkipped: boolean;  // true nếu người dùng bỏ qua không xem
  acknowledgedAt: string;  // ISO timestamp
}

// Response: Dữ liệu bài cầu nguyện bảo vệ
interface KarmicShieldPrayerResponse {
  sessionId: string;
  prayerText: string;         // Bài cầu nguyện đã điền đầy đủ tên và số tấm
  hasMissingFields: boolean;  // true nếu có placeholder chưa điền được
  missingFields: string[];    // Danh sách field còn thiếu (nếu có)
}
```

---

## Write Path

```
// 1. Nhận StartNNNProxySessionDTO
validateInput(dto):
  if dto.isRecitingForOther !== true → skip shield flow
  if dto.beneficiaryName is empty → return error BENEFICIARY_NAME_REQUIRED
  if dto.reciterName is empty → return error RECITER_NAME_REQUIRED

// 2. Tạo phiên niệm ở trạng thái PENDING_SHIELD
session = LittleHouseSession.create({
  ...dto,
  status: "PENDING_SHIELD",
  shieldViewed: false,
  shieldSkipped: false,
})

// 3. Tính toán bài cầu nguyện bảo vệ
remainderQuantity = dto.totalRequiredQuantity
  ? dto.totalRequiredQuantity - dto.reciterQuantity
  : null

prayerText = buildProtectionPrayer({
  reciterName: dto.reciterName,
  reciterQuantity: dto.reciterQuantity,
  beneficiaryName: dto.beneficiaryName,
  remainderQuantity: remainderQuantity,
})

// 4. Trả về shield payload cho FE hiển thị
return KarmicShieldPrayerResponse {
  sessionId: session.id,
  prayerText: prayerText,
  hasMissingFields: remainderQuantity === null,
  missingFields: remainderQuantity === null ? ["remainderQuantity"] : [],
}

// 5. FE hiển thị cảnh báo và bài cầu nguyện
//    → Người dùng xác nhận đã đọc (shieldViewed=true)
//    → hoặc bỏ qua (shieldSkipped=true)

// 6. Nhận ShieldAcknowledgementDTO từ FE
processAcknowledgement(dto):
  session.shieldViewed = dto.shieldViewed
  session.shieldSkipped = dto.shieldSkipped
  session.shieldAcknowledgedAt = dto.acknowledgedAt
  session.status = "ACTIVE"
  AuditLogger.log("karmic_shield_acknowledgement", {
    sessionId: session.id,
    reciterId: session.reciterId,
    beneficiaryName: session.beneficiaryName,
    shieldViewed: dto.shieldViewed,
    shieldSkipped: dto.shieldSkipped,
  })
  return session
```

---

## FE Behavior

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️  CẢNH BÁO TÂM LINH — Niệm NNN Thay Người Khác          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Khi niệm Ngôi Nhà Nhỏ thay người khác, vong linh của      │
│  người cần được trợ giúp có thể bám theo bạn về nhà.       │
│  Hãy đọc và thực hành lời cầu nguyện bảo vệ dưới đây       │
│  trước khi bắt đầu niệm.                                    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  LỜI CẦU NGUYỆN BẢO VỆ                                     │
│                                                             │
│  "Thỉnh cầu Đại Từ Đại Bi Quán Thế Âm Bồ Tát phù hộ       │
│  cho con là [Nguyễn Văn A], bây giờ con niệm [10] tấm      │
│  Ngôi Nhà Nhỏ cho [Trần Thị B], phần còn lại [49] tấm      │
│  Ngôi Nhà Nhỏ xin người cần Kinh tìm [Trần Thị B]"        │
│                                                             │
│  [ ✓ Tôi đã đọc lời cầu nguyện này ]  ← checkbox          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   [ Tôi đã đọc — Bắt đầu niệm ]   [ Bỏ qua, tiếp tục ]   │
│     (shieldViewed = true)            (shieldSkipped = true) │
│                                                             │
└─────────────────────────────────────────────────────────────┘

  * Nút "Bỏ qua" luôn hiển thị — soft advisory, không chặn cứng
  * Nút "Bắt đầu niệm" chỉ active sau khi checkbox được tick
  * Nếu remainderQuantity = null → hiển thị "[SỐ DƯ]" dạng placeholder
    + thêm ghi chú: "Vui lòng điền số tấm còn lại khi biết"
```

---

## Schema Notes

```prisma
// Thêm vào model LittleHouseSession (chỉ các field mới)
model LittleHouseSession {
  // ... existing fields ...

  isRecitingForOther      Boolean   @default(false)
  beneficiaryName         String?
  shieldViewed            Boolean   @default(false)
  shieldSkipped           Boolean   @default(false)
  shieldAcknowledgedAt    DateTime?
}

// Thêm vào AuditLog entry (không tạo model mới — dùng chung AuditLog)
// action = "karmic_shield_acknowledgement"
// payload JSON chứa: sessionId, reciterId, beneficiaryName,
//                    shieldViewed, shieldSkipped, acknowledgedAt
```

---

## Audit

| Sự kiện | Khi nào | Dữ liệu ghi nhận |
|---------|---------|------------------|
| `karmic_shield_shown` | Shield hiển thị cho người dùng | `sessionId`, `reciterId`, `beneficiaryName`, `timestamp` |
| `karmic_shield_acknowledgement` | Người dùng xác nhận hoặc bỏ qua | `sessionId`, `reciterId`, `shieldViewed`, `shieldSkipped`, `acknowledgedAt` |
| `karmic_shield_prayer_viewed` | Checkbox "đã đọc" được tick | `sessionId`, `reciterId`, `timestamp` |

Audit log không được xóa. `shield_skipped = true` là dữ liệu hợp lệ, không phải lỗi hệ thống.

---

## Errors

| Mã lỗi | Điều kiện | HTTP | Hành vi |
|--------|-----------|------|---------|
| `beneficiary_name_required` | `isRecitingForOther = true` nhưng `beneficiaryName` trống | 400 | Chặn tạo phiên, yêu cầu điền tên |
| `reciter_name_required` | `reciterName` trống khi cần điền vào bài cầu nguyện | 400 | Chặn tạo phiên, yêu cầu điền tên |
| `session_not_found` | `sessionId` không tồn tại khi gửi acknowledgement | 404 | Trả lỗi, không tạo audit |
| `shield_already_acknowledged` | Gửi acknowledgement lần 2 cho cùng một session | 409 | Idempotent — trả lại trạng thái hiện tại, không ghi thêm audit |

---

## Notes for AI/Codegen

- `KarmicTransferenceShield` áp dụng **chỉ** cho NNN (Ngôi Nhà Nhỏ) proxy recitation. Đừng nhầm với `proxy-liberation-karma-shield.md` (phóng sinh / life liberation).
- Bài cầu nguyện bảo vệ là **nội dung cố định từ khai thị** — không được tự động sửa hoặc paraphrase. Chỉ điền tên và số tấm vào đúng placeholder.
- `shieldSkipped = true` là trạng thái hợp lệ — hệ thống vẫn tạo phiên niệm bình thường. Đây là soft advisory, không phải hard block.
- Thứ tự luồng: tạo session (PENDING_SHIELD) → hiển thị shield → nhận acknowledgement → chuyển sang ACTIVE. Không bỏ qua bước nào trong code.
- Khi `totalRequiredQuantity` không có, `remainderQuantity = null` → dùng placeholder trong prayer text, không throw error.
- `buildProtectionPrayer()` nên trả về chuỗi đầy đủ với các giá trị đã thay thế, kèm flag `hasMissingFields` nếu có placeholder chưa điền được.
- Không hard-code bài cầu nguyện ở tầng FE — luôn lấy từ API response để đảm bảo tên và số tấm được điền đúng server-side.

---

## Related

- `proxy-liberation-karma-shield.md` — Phiên bản shield cho phóng sinh (life liberation); cùng concept bảo vệ nhưng áp dụng cho luồng phóng sinh, không phải NNN
- `little-house-chanter-identity-lock.md` — Xác thực danh tính người niệm; đảm bảo `reciterName` và `reciterId` hợp lệ trước khi tạo phiên niệm
