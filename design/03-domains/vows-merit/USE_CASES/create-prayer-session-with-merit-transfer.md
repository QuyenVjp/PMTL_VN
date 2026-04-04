# Phát Nguyện & Chuyển Công Đức — Create Prayer Session with Merit Transfer

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Nghi thức phát nguyện và hồi hướng
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Cho phép `member` tạo một phiên phát nguyện chính thức (Prayer Session) với tối đa 3 lời cầu xin,
đảnh lễ đủ 6 vị Bồ Tát làm chứng, và chuyển công đức (Merit Transfer) từ hành trì đã hoàn thành
sang người thân cần được hỗ trợ. Hệ thống ghi nhận vào `MeritLedger` với đầy đủ audit trail.

---

## Owner module

`vows-merit` — [xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người phát nguyện và chuyển công đức
- `admin` — assisted entry khi nhập giúp đồng tu

---

## Trigger

User bấm **[Tạo phiên phát nguyện]** từ trang `/phat-nguyen` hoặc sau khi hoàn thành một hành trì
(Bạch Thoại, Phóng Sinh, hoặc Tiểu Phương Tử).

---

## Preconditions

- Có session hợp lệ.
- Nếu có `sourceActivityId` (gắn với hành trì vừa hoàn thành), record đó phải tồn tại và thuộc actor.

---

## Input contract

### Phần 1 — Lời Cầu Xin (Wishes)

```
{
  wishes: WishItem[]    // ÁP DỤNG: @ArrayMaxSize(3) — tối đa 3 lời cầu xin
}

WishItem {
  wishText:      string  // mô tả ngắn gọn lời cầu xin
  beneficiaryId?: string // nếu cầu cho người khác (tên người nhận)
}
```

**Validation quan trọng:** Nếu `wishes.length > 3`, service trả về `400` với message:
`"Tham cầu quá nhiều sẽ làm giảm sự linh ứng. Vui lòng giới hạn tối đa 3 lời cầu xin."`
Frontend cũng phải disable nút Add sau khi đủ 3 wishes — đây là double enforcement.

### Phần 2 — Đảnh Lễ 6 Vị Bồ Tát (Bodhisattva Attestation)

```
{
  bodhisattvaWitnessConfirmed: boolean  // bắt buộc = true
  // Danh sách 6 vị cố định — không cho phép user sửa:
  // 1. Quán Thế Âm Bồ Tát (Guan Yin)
  // 2. Nam Kinh Bồ Tát (Di Lặc)
  // 3. Thái Tuế Bồ Tát
  // 4. Quan Đế Bồ Tát
  // 5. Châu Xương Bồ Tát
  // 6. Quan Bình Bồ Tát
}
```

### Phần 3 — Chuyển Công Đức (Merit Transfer — tùy chọn)

```
{
  meritTransfer?: {
    sourceActivityType: "BAIHUA_READING" | "LIFE_RELEASE" | "LITTLE_HOUSE" | "CHANTING" | "GENERAL"
    sourceActivityId?:  string    // FK tới record hành trì cụ thể
    transferPercentage: number    // 10–100, bội số 10
    recipientName:      string    // tên người nhận
    recipientRelation:  string    // con, chồng, vợ, mẹ, cha,...
    purpose:            "HEALTH" | "WISDOM" | "CAREER" | "FAMILY_HARMONY" | "GENERAL"
  }
}
```

---

## Read set

- session + actor role
- `PrayerSession` của user trong 24 giờ qua (để advisory nếu đã có nhiều sessions)
- Source activity record nếu `sourceActivityId` được cung cấp
- `MeritLedger` balance hiện tại (tùy chọn — chỉ để hiển thị, không enforce limit)

---

## Write path

1. **Validate wishes**: Zod `z.array(WishItemSchema).max(3)`. Reject nếu `> 3`.
2. **Validate bodhisattvaWitnessConfirmed**: phải là `true`. Nếu `false`, reject với message yêu cầu đảnh lễ đủ 6 vị.
3. **Validate merit transfer** (nếu có):
   - `transferPercentage` phải là bội số 10, trong khoảng [10, 100].
   - Nếu `sourceActivityId` được cung cấp, verify record tồn tại và thuộc actor.
   - Nếu `transferPercentage >= 80`, render warning mềm phía client: *"Hồi hướng tỷ lệ cao có thể ảnh hưởng tạm thời đến năng lượng bảo vệ bản thân theo nguồn tham chiếu."*
4. **Tạo `PrayerSession`** record:
   ```
   {
     userId, wishes, bodhisattvaWitnessConfirmed: true,
     sessionDate: today(), status: "COMPLETED", createdAt
   }
   ```
5. **Nếu có `meritTransfer`**, tạo `MeritLedger` entry:
   ```
   {
     userId,
     entryType:          "TRANSFER_OUT",
     sourceActivityType,
     sourceActivityId,
     transferPercentage,
     recipientName,
     recipientRelation,
     purpose,
     sessionId:          prayerSession.id,
     note:               auto-generated summary,
     createdAt
   }
   ```
6. **Audit** `vows-merit.prayer-session.created`.
7. **Return** `PrayerSessionResponseDto` bao gồm session summary và merit transfer confirmation.

---

## MeritLedger — Cấu trúc Entity mới

```
MeritLedger {
  id                  String   @id
  publicId            String   @unique
  userId              String
  entryType           String   // "TRANSFER_OUT" | "EARNED_BAIHUA" | "EARNED_LIFE_RELEASE" | ...
  sourceActivityType  String?
  sourceActivityId    String?
  transferPercentage  Int?     // chỉ có khi entryType = TRANSFER_OUT
  recipientName       String?
  recipientRelation   String?
  purpose             String?
  sessionId           String?  // FK tới PrayerSession
  note                String?
  createdAt           DateTime
}
```

**Lưu ý thiết kế:** `MeritLedger` là **sổ ghi nhận** (ledger), không phải hệ thống tính điểm.
Dashboard chỉ hiển thị summary nhẹ. Không expose aggregate so sánh giữa người dùng.
Tham khảo: `MERIT-TRANSFER-PERCENTAGE.md`.

---

## Async side-effects

- **Phase 1:** Nếu `sourceActivityType = BAIHUA_READING`, update `WisdomEntry` reading stats (sync inline).
- **Phase 2+:** Outbox event `vows-merit.merit-transfer.recorded` → downstream `notification` gửi xác nhận hồi hướng cho user.

---

## Success result

- `PrayerSession` được tạo với đủ 6 vị Bồ Tát làm chứng.
- Nếu có merit transfer: `MeritLedger` entry ghi rõ nguồn công đức, tỷ lệ, và người nhận.
- UI hiển thị tóm tắt phiên phát nguyện có thể chia sẻ nội bộ (không auto-post lên community).

---

## Errors

| Condition | Error code | HTTP | Recovery |
|---|---|---|---|
| `wishes.length > 3` | `wish_limit_exceeded` | 400 | Xóa bớt lời cầu xin |
| `bodhisattvaWitnessConfirmed = false` | `invalid_body` | 400 | Phải xác nhận đảnh lễ |
| `transferPercentage` không phải bội số 10 | `invalid_body` | 400 | Nhập lại |
| `sourceActivityId` không tồn tại | `not_found` | 404 | Bỏ link hoặc chọn lại |
| Chưa đăng nhập | `unauthorized` | 401 | — |
| Cross-user assisted entry không đủ quyền | `forbidden` | 403 | — |

---

## Audit

| Action | Actor | Trigger |
|---|---|---|
| `vows-merit.prayer-session.created` | actorUserId | Session được tạo thành công |
| `vows-merit.merit-transfer.recorded` | actorUserId | MeritLedger entry được tạo |
| `vows-merit.prayer-session.assisted` | actorUserId (admin) | Admin nhập giúp member |

---

## Rate-limit requirement

- Scope: per-account
- Limit: 10 prayer sessions per day (soft limit — advisory, không hard-block)

---

## Outbox event

- Event type: `vows-merit.merit-transfer.recorded`
- Subscriber: `notification`
- Mode: sync-inline (Phase 1), outbox-required (Phase 2+)

---

## Recovery path

- `MeritLedger` không có derived aggregation — recovery chỉ cần đảm bảo entries không bị orphan.
- Nếu `PrayerSession` bị tạo nhưng `MeritLedger` không được tạo (transaction fail): retry trong transaction scope.

---

## Notes for AI/codegen

- `wishes` validation `@ArrayMaxSize(3)` phải ở cả DTO layer (NestJS) **và** Zod schema layer — không chỉ một trong hai.
- `MeritLedger` là entity **mới**, cần Prisma migration. Không tái dùng `VowProgressEntry` hay `LifeReleaseJournal`.
- Danh sách 6 vị Bồ Tát là **hardcoded enum trong content**, không phải user input — chỉ render checkbox xác nhận, không cho user thêm/bớt.
- `transferPercentage >= 80` chỉ trigger **warning mềm phía client**, không block server-side.
- Wording policy: không dùng ngôn ngữ "điểm công đức còn lại" hay "balance". Xem `MERIT-TRANSFER-PERCENTAGE.md`.
- `MeritLedger.entryType = "EARNED_*"` (các loại tự kiếm được) sẽ được tạo bởi các module khác (Bạch Thoại, Phóng Sinh) — không phải bởi Prayer Session. Prayer Session chỉ tạo `TRANSFER_OUT`.
