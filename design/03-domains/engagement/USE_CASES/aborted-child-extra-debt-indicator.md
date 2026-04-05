# Thai Nhi Chỉ Báo Nợ Bổ Sung — Aborted Child Extra Debt Indicator

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-05

---

## Purpose

Xác định mức độ tụng Ngôi Nhà Nhỏ (NNN) bổ sung cần thiết cho thai nhi (con bị phá, sẩy, hoặc mất sớm). Thai nhi thường là chủ nợ nghiệp lực của cha mẹ; tụng NNN tiêu chuẩn có thể không đủ để hóa giải nghiệp và giúp thai nhi siêu thoát. Hệ thống phân tích đầu vào từ người dùng (mối quan hệ nợ nghiệp, tín hiệu giấc mơ) và đưa ra gợi ý số tấm NNN bổ sung. Đây là khuyến nghị mềm — người dùng quyết định số lượng cuối cùng.

---

## Owner Module

`engagement` — `LittleHouseService` / `ThaiNhiDebtIndicator`

---

## Actors

| Vai trò | Mô tả |
|---------|-------|
| Practitioner (người thực hành) | Người dùng khai báo thông tin thai nhi và tạo phiên tụng NNN |
| ThaiNhiDebtIndicator | Service nội bộ tính toán mức NNN khuyến nghị |
| DreamJournalInterpreter | Service phân tích tín hiệu giấc mơ liên quan |
| LittleHouseService | Service gốc quản lý phiên tụng NNN |

---

## Trigger

- Người dùng tạo phiên tụng NNN mới và đánh dấu `isThaiNhi: true`
- Người dùng cập nhật tín hiệu giấc mơ (`dreamSignal`) trong phiên thai nhi hiện có
- Hệ thống tái đánh giá khuyến nghị khi `isCreditRelationship` được xác nhận sau khi tạo

---

## Business Rules

| # | Quy tắc | Trạng thái |
|---|---------|-----------|
| BR-01 | Mỗi thai nhi cần tối thiểu **7 tấm NNN** (mức tối thiểu mặc định) | ✅ Bắt buộc |
| BR-02 | Nếu phát hiện mối quan hệ chủ nợ nghiệp lực (`isCreditRelationship: true`), nâng mức tối thiểu lên **21 tấm** | ✅ Bắt buộc |
| BR-03 | Tín hiệu giấc mơ: con xuất hiện ăn mặc tươm tất, vui vẻ, bình an → đã đủ NNN, không cần bổ sung thêm | ✅ `COMPLETED` |
| BR-04 | Tín hiệu giấc mơ: con xuất hiện rách rưới, khổ sở, khóc lóc → cần tụng thêm các buổi NNN | ⚠️ `NEED_MORE` |
| BR-05 | Chưa có tín hiệu giấc mơ (`dreamSignal: 'NONE'`) → duy trì lịch tụng hiện tại, không tăng không giảm | ⚠️ Giữ nguyên |
| BR-06 | Nếu `isCreditRelationship: true` VÀ `dreamSignal: 'NEED_MORE'` → nhân hệ số bổ sung: khuyến nghị thêm **1 buổi/tuần** cho đến khi nhận tín hiệu `COMPLETED` | ⚠️ Nhân hệ số |
| BR-07 | Hệ thống KHÔNG chặn cứng (hard block) — chỉ hiển thị gợi ý; người dùng quyết định số lượng cuối cùng | ✅ Tư vấn mềm |
| BR-08 | Một phiên thai nhi có thể liên kết nhiều con (nhiều thai nhi); mỗi con được tính riêng, tổng cộng lại | ✅ Bắt buộc |
| BR-09 | Số tấm tụng thực tế do người dùng nhập; hệ thống chỉ đưa ra `recommendedCount` và `urgencyLevel` | ✅ Tư vấn mềm |
| BR-10 | Khi `dreamSignal` chuyển sang `COMPLETED` → đánh dấu thai nhi là `RESOLVED`, ngừng gợi ý bổ sung | ✅ Kết thúc vòng lặp |

---

## Input Contract

```typescript
// DTO tạo phiên NNN cho thai nhi
export class CreateThaiNhiSessionDto {
  /** Phiên này có dành cho thai nhi không */
  isThaiNhi: boolean;

  /** Số lượng thai nhi trong phiên này (mặc định: 1) */
  thaiNhiCount?: number; // default: 1, min: 1

  /** Mối quan hệ chủ nợ nghiệp lực đã được xác nhận */
  isCreditRelationship?: boolean; // optional, user-assessed

  /**
   * Tín hiệu giấc mơ gần nhất liên quan đến thai nhi
   * COMPLETED  — con xuất hiện bình an, vui vẻ
   * NEED_MORE  — con xuất hiện khổ sở, rách rưới
   * NONE       — chưa có giấc mơ liên quan
   */
  dreamSignal?: 'COMPLETED' | 'NEED_MORE' | 'NONE'; // default: 'NONE'

  /** Ghi chú bổ sung từ người dùng (tùy chọn) */
  userNote?: string;
}

// DTO cập nhật tín hiệu giấc mơ cho phiên đã tạo
export class UpdateThaiNhiDreamSignalDto {
  sessionId: string;
  dreamSignal: 'COMPLETED' | 'NEED_MORE' | 'NONE';
  dreamDate?: Date;
  dreamNote?: string;
}

// Output: kết quả từ ThaiNhiDebtIndicator
export interface ThaiNhiDebtRecommendation {
  recommendedTamPerChild: number;      // tấm NNN khuyến nghị mỗi con
  totalRecommendedTam: number;         // tổng tấm NNN khuyến nghị (x thaiNhiCount)
  urgencyLevel: 'STANDARD' | 'ELEVATED' | 'CRITICAL';
  extraSessionsPerWeek: number;        // buổi bổ sung mỗi tuần gợi ý
  dreamSignalStatus: 'COMPLETED' | 'NEED_MORE' | 'NONE';
  isResolved: boolean;                 // true khi dreamSignal === 'COMPLETED'
  advisoryMessage: string;             // thông điệp tư vấn hiển thị cho người dùng
}
```

---

## Write Path

```
POST /engagement/little-house/sessions  { isThaiNhi: true, ... }
  │
  ▼
LittleHouseService.createSession(dto)
  │
  ├─ if dto.isThaiNhi === false → skip ThaiNhiDebtIndicator, proceed normally
  │
  └─ if dto.isThaiNhi === true
       │
       ▼
     ThaiNhiDebtIndicator.evaluate(dto)
       │
       ├─ baseTam = 7  (BR-01)
       │
       ├─ if isCreditRelationship === true
       │    baseTam = 21  (BR-02)
       │    urgencyLevel = 'ELEVATED'
       │
       ├─ resolve dreamSignal (default: 'NONE')
       │
       ├─ if dreamSignal === 'COMPLETED'
       │    isResolved = true
       │    extraSessionsPerWeek = 0
       │    urgencyLevel stays or downgrades to 'STANDARD'
       │
       ├─ if dreamSignal === 'NEED_MORE'
       │    extraSessionsPerWeek = 1
       │    if isCreditRelationship === true → urgencyLevel = 'CRITICAL'  (BR-06)
       │
       ├─ if dreamSignal === 'NONE'
       │    extraSessionsPerWeek = 0  (BR-05)
       │
       ├─ totalRecommendedTam = baseTam × (thaiNhiCount ?? 1)  (BR-08)
       │
       └─ return ThaiNhiDebtRecommendation
            │
            ▼
          LittleHouseService persists recommendation alongside session record
          Session flagged: thaiNhiProfile linked (see Schema Notes)
```

---

## FE Behavior

```
┌─────────────────────────────────────────────────────────────┐
│  Tạo Phiên Tụng NNN                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [ ] Phiên này dành cho thai nhi                            │
│      ↓ (khi được chọn, hiện thêm các trường bên dưới)      │
│                                                             │
│  Số lượng thai nhi:  [ 1  ▾ ]                               │
│                                                             │
│  Mối quan hệ nghiệp lực:                                    │
│  ( ) Chưa xác định   (o) Có — là chủ nợ nghiệp lực         │
│                                                             │
│  Tín hiệu giấc mơ gần nhất:                                 │
│  (o) Chưa có giấc mơ                                        │
│  ( ) Con xuất hiện bình an, vui vẻ  ✅                      │
│  ( ) Con xuất hiện khổ sở, rách rưới ⚠️                    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  GỢI Ý HỆ THỐNG                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Số tấm NNN khuyến nghị:  21 tấm / con               │  │
│  │  Tổng khuyến nghị:        21 tấm                     │  │
│  │  Mức độ ưu tiên:          CAO (ELEVATED)             │  │
│  │  Buổi bổ sung/tuần:       1 buổi                     │  │
│  │                                                       │  │
│  │  ⚠️ Thai nhi có dấu hiệu là chủ nợ nghiệp lực.       │  │
│  │  Cần tụng thêm các buổi NNN cho đến khi nhận được    │  │
│  │  tín hiệu giấc mơ bình an từ con.                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Số tấm thực tế bạn muốn tụng: [ _____ ]                   │
│  (Bạn có thể điều chỉnh theo thực tế của mình)             │
│                                                             │
│  Ghi chú: [ _________________________________ ]             │
│                                                             │
│               [ Hủy ]   [ Tạo Phiên Tụng ]                 │
└─────────────────────────────────────────────────────────────┘

-- Sau khi tạo: banner tóm tắt trạng thái thai nhi --

┌─────────────────────────────────────────────────────────────┐
│  TÌNH TRẠNG THAI NHI                         [Cập nhật]     │
│  Thai nhi: 1 con  |  Tấm đã tụng: 0 / 21                   │
│  Tín hiệu: Chưa có giấc mơ  |  Trạng thái: Đang tiến hành  │
└─────────────────────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model ThaiNhiProfile {
  id                   String              @id @default(cuid())
  sessionId            String              @unique
  session              LittleHouseSession  @relation(fields: [sessionId], references: [id])

  thaiNhiCount         Int                 @default(1)
  isCreditRelationship Boolean             @default(false)

  dreamSignal          DreamSignal         @default(NONE)
  dreamSignalUpdatedAt DateTime?

  recommendedTamPerChild Int               // from ThaiNhiDebtIndicator
  totalRecommendedTam    Int
  urgencyLevel           UrgencyLevel      @default(STANDARD)
  extraSessionsPerWeek   Int               @default(0)

  isResolved           Boolean             @default(false)
  resolvedAt           DateTime?

  createdAt            DateTime            @default(now())
  updatedAt            DateTime            @updatedAt

  @@index([sessionId])
  @@index([isResolved])
}

enum DreamSignal {
  COMPLETED
  NEED_MORE
  NONE
}

enum UrgencyLevel {
  STANDARD
  ELEVATED
  CRITICAL
}
```

---

## Audit

| Sự kiện | Ghi log |
|---------|---------|
| Tạo ThaiNhiProfile | `thai_nhi_profile_created` — sessionId, thaiNhiCount, isCreditRelationship, dreamSignal, recommendedTam, urgencyLevel |
| Cập nhật dreamSignal | `thai_nhi_dream_signal_updated` — sessionId, oldSignal, newSignal, dreamDate |
| Đánh dấu isResolved | `thai_nhi_resolved` — sessionId, resolvedAt, totalTamRecited |
| Người dùng ghi đè số tấm | `thai_nhi_user_override` — sessionId, recommendedTam, actualTam |

---

## Errors

| Mã lỗi | Nguyên nhân | Hành động |
|--------|-------------|-----------|
| `thai_nhi_count_invalid` | `thaiNhiCount` < 1 hoặc không phải số nguyên | Trả về 400, yêu cầu nhập lại |
| `thai_nhi_session_not_found` | `sessionId` không tồn tại khi cập nhật dreamSignal | Trả về 404 |
| `thai_nhi_already_resolved` | Cố cập nhật dreamSignal sau khi `isResolved: true` | Trả về 409, hiển thị trạng thái đã hoàn thành |
| `thai_nhi_dream_signal_invalid` | `dreamSignal` không phải `COMPLETED / NEED_MORE / NONE` | Trả về 400 |
| `thai_nhi_profile_duplicate` | Tạo ThaiNhiProfile cho sessionId đã có | Trả về 409 |

---

## Notes for AI/codegen

- `ThaiNhiDebtIndicator` là một service độc lập nhỏ, không trực tiếp ghi database — chỉ trả về `ThaiNhiDebtRecommendation`; `LittleHouseService` chịu trách nhiệm persist.
- Khi `dreamSignal` chuyển sang `COMPLETED`, tự động set `isResolved = true` và `resolvedAt = now()` — không cần hành động thủ công từ người dùng.
- Logic nhân hệ số (BR-06) áp dụng chỉ khi đồng thời có `isCreditRelationship: true` VÀ `dreamSignal: 'NEED_MORE'`; chỉ một trong hai điều kiện thì không kích hoạt `urgencyLevel: CRITICAL`.
- `recommendedTamPerChild` và `totalRecommendedTam` chỉ là gợi ý; hệ thống KHÔNG block người dùng tụng ít hơn — ghi log `thai_nhi_user_override` nếu `actualTam < recommendedTam`.
- Tích hợp `DreamJournalInterpreter`: khi người dùng lưu giấc mơ liên quan đến thai nhi vào dream journal, có thể auto-suggest cập nhật `dreamSignal` thông qua event hoặc UI prompt — xem `dream-journal-interpreter.md`.
- `thaiNhiCount` cho phép một phiên khai báo nhiều con cùng lúc; tổng khuyến nghị = `recommendedTamPerChild × thaiNhiCount`.

---

## Related

- `dream-journal-interpreter.md` — nguồn phân tích tín hiệu giấc mơ, ánh xạ hình ảnh giấc mơ → `DreamSignal`
- `dream-to-debt-quantifier.md` — lượng hóa nợ nghiệp từ tín hiệu giấc mơ, bổ sung thêm ngữ cảnh định lượng
- `bardo-49day-priority-queue.md` — logic ưu tiên hàng đợi linh hồn trong 49 ngày đầu, liên quan đến thứ tự tụng khi có nhiều đối tượng cùng lúc
