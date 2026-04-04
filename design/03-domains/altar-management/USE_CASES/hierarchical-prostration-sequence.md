# Trình Tự Bái Lạy Phân Cấp Chư Phật — Hierarchical Prostration Sequence

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 407, 861)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Trong nghi thức buổi sáng/tối, lễ bái phải tuân theo đúng thứ bậc vũ trụ từ cao đến thấp. Không được đảo thứ tự, không được bỏ qua, không được quay lại bước trước. Hệ thống highlight từng tôn tượng theo đúng trình tự và chỉ cho phép tiến khi user xác nhận đã lạy xong mỗi bước.

---

## Owner module

`altar-management` — AltarRitualTracker / ProstrationSequencer
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — thực hiện nghi thức bái lạy, bấm xác nhận từng bước
- `system` — enforce thứ tự, disable nút tiến nếu bước hiện tại chưa xác nhận, lưu log

---

## Trigger

Khi user bắt đầu nghi thức buổi sáng hoặc buổi tối từ màn hình AltarProfile.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Bắt đầu phiên bái lạy | ✅ `currentStep = 0`, highlight Thích Ca Mâu Ni Phật |
| User bấm [Lạy xong — Tiếp theo] | ✅ Validate `currentStep === session.expectedStep`, advance |
| `currentStep !== session.expectedStep` | ❌ 400 `prostration_step_out_of_order` |
| User cố bấm bước trước (quay lại) | ❌ Nút "Quay lại" không tồn tại — không cho phép |
| User cố bỏ qua bước | ❌ API validate step sequence — không cho phép skip |
| Hoàn thành bước 5 (Quan Bình Bồ Tát) | ✅ Session `completedAt = now()`, Audit `altar.prostration.completed` |
| Đang ở bước nào đó, đóng app | ⚠️ Session lưu `currentStep`, resume khi mở lại |

Thứ bậc bắt buộc (không thay đổi):

| Bước | Tôn tượng |
|---|---|
| 0 | Thích Ca Mâu Ni Phật |
| 1 | Quán Thế Âm Bồ Tát |
| 2 | Nam Kinh Bồ Tát (Địa Tạng Vương) |
| 3 | Thái Tuế Bồ Tát |
| 4 | Quan Đế / Châu Xương / Quan Bình Bồ Tát |

---

## Input Contract

```typescript
interface LogProstrationSessionDto {
  altarProfileId: string
  currentStep: number     // 0–4, do client gửi lên để double-check
}

interface ProstrationSessionState {
  id: string
  userId: string
  altarProfileId: string
  currentStep: number       // 0–4
  expectedStep: number      // server-side authoritative step
  completedAt?: string      // ISO 8601 datetime
}

enum ProstrationStep {
  THICH_CA_MAU_NI         = 0,
  QUAN_THE_AM_BO_TAT      = 1,
  DIA_TANG_VUONG_BO_TAT   = 2,
  THAI_TUE_BO_TAT         = 3,
  QUAN_DE_TRIO            = 4,
}

const PROSTRATION_LABELS: Record<ProstrationStep, string> = {
  [ProstrationStep.THICH_CA_MAU_NI]:       'Thích Ca Mâu Ni Phật',
  [ProstrationStep.QUAN_THE_AM_BO_TAT]:    'Quán Thế Âm Bồ Tát',
  [ProstrationStep.DIA_TANG_VUONG_BO_TAT]: 'Nam Kinh Bồ Tát (Địa Tạng Vương)',
  [ProstrationStep.THAI_TUE_BO_TAT]:       'Thái Tuế Bồ Tát',
  [ProstrationStep.QUAN_DE_TRIO]:          'Quan Đế / Châu Xương / Quan Bình Bồ Tát',
}
```

---

## Write Path

```
POST /api/altar-management/prostration/start
1. Validate altarProfileId exists, belongs to user
2. Create ProstrationSession { currentStep: 0, expectedStep: 0 }
3. Audit: altar.prostration.started

POST /api/altar-management/prostration/advance-step
1. Validate sessionId exists, belongs to user
2. Validate body.currentStep === session.expectedStep
   → If not: throw 400 prostration_step_out_of_order
3. session.currentStep++
4. session.expectedStep++
5. If session.expectedStep > 4:
   → session.completedAt = now()
   → Audit: altar.prostration.completed
6. Else:
   → Audit: altar.prostration.step-advanced { step: newStep, label: PROSTRATION_LABELS[newStep] }
```

---

## FE Behavior

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  NGHI THỨC BÁI LẠY — BUỔI SÁNG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Trình tự phân cấp (5 bước, không đảo):

  ┌──────────────────────────────────┐
  │ ✅ Bước 1/5 — ĐANG LẠY          │
  │                                  │
  │   🟡 Thích Ca Mâu Ni Phật        │  ← highlighted
  │                                  │
  │   (hình ảnh tôn tượng)           │
  │                                  │
  │   [Lạy xong — Tiếp theo ▶]      │  ← enabled
  └──────────────────────────────────┘

  Hàng chờ (mờ, disabled):
  ──────────────────────────────────
  ○ Bước 2: Quán Thế Âm Bồ Tát
  ○ Bước 3: Nam Kinh Bồ Tát (Địa Tạng Vương)
  ○ Bước 4: Thái Tuế Bồ Tát
  ○ Bước 5: Quan Đế / Châu Xương / Quan Bình
  ──────────────────────────────────

Sau khi bấm [Tiếp theo]:
  ┌──────────────────────────────────┐
  │ ✅ Bước 1 — HOÀN THÀNH          │
  │   ✔ Thích Ca Mâu Ni Phật        │
  ├──────────────────────────────────┤
  │ ▶  Bước 2/5 — ĐANG LẠY         │
  │   🟡 Quán Thế Âm Bồ Tát        │  ← highlighted
  │   [Lạy xong — Tiếp theo ▶]     │
  └──────────────────────────────────┘

Không có nút [Quay lại].
Không có nút skip.

Khi hoàn thành tất cả 5 bước:
  ┌──────────────────────────────────┐
  │ 🎉 HOÀN THÀNH NGHI THỨC BÁI LẠY │
  │                                  │
  │   Tất cả 5 tôn tượng đã lễ bái  │
  │   đúng thứ bậc phân cấp.         │
  │                                  │
  │   [Hoàn tất nghi thức]           │
  └──────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Lỗi thứ tự:
  ┌──────────────────────────────────┐
  │ ❌ Sai thứ tự bái lạy            │
  │  Vui lòng hoàn thành bước hiện  │
  │  tại trước khi tiếp tục.         │
  └──────────────────────────────────┘
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Schema Notes

```prisma
model ProstrationSession {
  id             String    @id @default(cuid())
  userId         String
  altarProfileId String
  currentStep    Int       @default(0)   // 0–4
  expectedStep   Int       @default(0)   // server-authoritative
  completedAt    DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  user        User         @relation(fields: [userId], references: [id])
  altarProfile AltarProfile @relation(fields: [altarProfileId], references: [id])
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `altar.prostration.started` | Bắt đầu phiên bái lạy |
| `altar.prostration.step-advanced` | Hoàn thành một bước, chuyển sang bước tiếp theo |
| `altar.prostration.completed` | Hoàn thành toàn bộ 5 bước |

---

## Errors

| Điều kiện | Mã lỗi | HTTP | Phục hồi |
|---|---|---|---|
| `currentStep !== expectedStep` | `prostration_step_out_of_order` | 400 | Hoàn thành đúng bước hiện tại |
| `altarProfileId` không tồn tại | `altar_profile_not_found` | 404 | Kiểm tra lại hồ sơ bàn thờ |
| Session không tồn tại | `session_not_found` | 404 | Bắt đầu phiên mới |
| Chưa đăng nhập | `unauthorized` | 401 | — |

---

## Notes for AI/codegen

- `expectedStep` được lưu server-side và là nguồn sự thật — client-side `currentStep` chỉ dùng để double-check, không được dùng làm authority.
- Danh sách 5 tôn tượng là **constant** — không lấy từ database, không cấu hình được.
- Session resume: nếu user đóng app giữa chừng, load lại session và tiếp tục từ `currentStep`.
- Mỗi ngày một phiên sáng, một phiên tối — có thể tạo nhiều session nhưng mỗi phiên là độc lập.

---

## Related

- [auspicious-beast-ai-filter.md](./auspicious-beast-ai-filter.md) — altar item validation
- [sandalwood-horizontal-preservation.md](./sandalwood-horizontal-preservation.md) — incense ritual
- [sacred-item-damage-protocol.md](./sacred-item-damage-protocol.md) — altar integrity
