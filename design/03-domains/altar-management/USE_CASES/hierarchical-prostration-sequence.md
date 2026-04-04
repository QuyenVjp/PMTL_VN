# Trình Tự Bái Lạy Phân Cấp Chư Phật — Hierarchical Prostration Sequence (Phase 42 Logic 10)

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 407, 861)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04 (Phase 42 Logic 10 Revision)

---

## Purpose

Trong nghi thức buổi sáng/tối tại Guan Yin Tang, visitor mới phải tuân theo đúng thứ bậc vũ trụ từ cao đến thấp khi bái lạy chư Phật. Không được đảo thứ tự, không được bỏ qua, không được quay lại bước trước. Hệ thống cung cấp AR map chỉ vị trí tôn tượng, highlight từng tôn tượng theo đúng trình tự, và chỉ cho phép tiến khi user xác nhận đã hoàn thành mỗi bước với 3 biến niệm ngành tương ứng. Hoàn thành tất cả 5 bước sẽ nhận badge.

---

## Owner module

`altar-management` — HierarchicalProstrationSequenceGuide / AltarRitualTracker
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `new_visitor` — thực hiện nghi thức bái lạy, bấm xác nhận từng bước (chant 3 times each)
- `system` — enforce thứ tự bàn cầu, disable nút tiến nếu bước hiện tại chưa hoàn thành, lưu log, cấp badge completion

---

## Trigger

Khi visitor mới đến Guan Yin Tang (POST /api/altar-management/guide/new-visitor-onboarding) hoặc bắt đầu AR-guided prostration từ in-app.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Bắt đầu phiên bái lạy mới | ✅ `completedSequence = []`, highlight Thích Ca Mâu Ni Phật (Step 1) |
| User chant 3 lần bước hiện tại | ✅ Client tracking (honor-based or timer-based) |
| User bấm [Hoàn thành bước — Tiếp theo] | ✅ Validate `currentStep === expectedStep`, advance |
| User attempt skip hoặc đảo thứ tự | ❌ 400 `prostration_sequence_violation` |
| User cố bấm bước trước (quay lại) | ❌ Nút "Quay lại" không tồn tại — không cho phép |
| Hoàn thành bước 5 (Quan Bình Bồ Tát) | ✅ Session `allCompleted = true`, `completedAt = now()` |
| | ✅ Award completion badge "🏅 Nghi Thức Bái Lạy Hoàn Toàn" |
| Đang ở bước nào đó, đóng app | ⚠️ Session lưu `completedSequence[]`, resume khi mở lại |

Thứ bậc bắt buộc (5 bước, không thay đổi):

| Bước | Tôn tượng | Chant Count |
|---|---|---|
| 1 | Thích Ca Mâu Ni Phật | 3 lần |
| 2 | Quán Thế Âm Bồ Tát | 3 lần |
| 3 | Nam Kinh Bồ Tát (Địa Tạng Vương) | 3 lần |
| 4 | Thái Tuế Bồ Tát | 3 lần |
| 5 | Quan Đế / Châu Xương / Quan Bình Bồ Tát | 3 lần |

---

## Input Contract

```typescript
interface InitiateProstrationGuideDto {
  visitorId: string
  locationId: string  // Guan Yin Tang location ID
}

interface AdvanceProstrationStepDto {
  sessionId: string
  currentStep: number        // 1–5, client sends to double-check
  chantCompleted: boolean    // user confirmed 3 chants done
}

interface ProstrationSessionState {
  id: string
  visitorId: string
  locationId: string
  completedSequence: number[]    // e.g., [1, 2, 3] after 3 steps done
  allCompleted: boolean          // true when completedSequence.length === 5
  completedAt?: string           // ISO 8601 datetime
}

enum ProstrationStep {
  THICH_CA_MAU_NI         = 1,
  QUAN_THE_AM_BO_TAT      = 2,
  DIA_TANG_VUONG_BO_TAT   = 3,
  THAI_TUE_BO_TAT         = 4,
  QUAN_DE_TRIO            = 5,
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
POST /api/altar-management/guide/new-visitor-onboarding
1. Validate visitorId, locationId
2. Create ProstrationSession:
   → completedSequence = []
   → allCompleted = false
3. Return session with AR map data + first step highlight
4. Audit: altar.prostration.sequence-started

POST /api/altar-management/prostration/advance-step
1. Validate sessionId exists, belongs to user
2. Validate currentStep ∈ {1, 2, 3, 4, 5}
3. Calculate expectedStep = completedSequence.length + 1
4. Validate currentStep === expectedStep
   → If not: throw 400 prostration_sequence_violation
5. Validate chantCompleted === true
6. Add currentStep to completedSequence
7. If completedSequence.length === 5:
   → session.allCompleted = true
   → session.completedAt = now()
   → Audit: altar.prostration.all-steps-completed
   → Award badge: "🏅 Nghi Thức Bái Lạy Hoàn Toàn"
8. Else:
   → Audit: altar.prostration.step-{currentStep}-completed
9. Return updated session state
```

---

## FE Behavior — New Visitor AR Prostration Guide

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🙏 HƯỚNG DẪN BÁI LẠY PHÂN CẤP — VISITOR MỚI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[AR MAP VIEW — Statue Positions + Step Numbers]

  Guan Yin Tang Layout:

  🟡 [1] Thích Ca Mâu Ni Phật (tượng chính ở trước)
  🔵 [2] Quán Thế Âm Bồ Tát (bên phải)
  ⚪ [3] Nam Kinh Bồ Tát (bên trái)
  🟣 [4] Thái Tuế Bồ Tát (sau)
  🟢 [5] Quan Đế Trio (ngoài cùng)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ┌──────────────────────────────────────────┐
  │ ✅ BẤT ĐẦU — BƯỚC 1/5                   │
  │                                          │
  │ 🟡 Thích Ca Mâu Ni Phật                  │
  │                                          │
  │ (hình ảnh tôn tượng)                     │
  │                                          │
  │ 📍 Vị trí: Trước đàn thờ (chính giữa)   │
  │                                          │
  │ 📿 Yêu cầu: Bái 3 lần + Niệm Ngành      │
  │                                          │
  │ [Bắt đầu chant ▶]  [⏱ Timer]             │
  │                                          │
  │ (3 lần hoàn thành ✓)                    │
  │                                          │
  │ [Hoàn thành bước — Tiếp theo ▶]         │
  └──────────────────────────────────────────┘

Hàng chờ (mờ, disabled):
──────────────────────────────────────────────
○ Bước 2: Quán Thế Âm Bồ Tát (bên phải)
○ Bước 3: Nam Kinh Bồ Tát — Địa Tạng Vương (bên trái)
○ Bước 4: Thái Tuế Bồ Tát (sau)
○ Bước 5: Quan Đế / Châu Xương / Quan Bình (ngoài)
──────────────────────────────────────────────

Không có nút [Quay lại].
Không có nút skip.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Sau khi bấm [Tiếp theo], chuyển sang bước 2:

  ┌──────────────────────────────────────────┐
  │ ✅ BƯỚC 1 — HOÀN THÀNH                  │
  │    ✔ Thích Ca Mâu Ni Phật               │
  ├──────────────────────────────────────────┤
  │ ▶  BẤT ĐẦU — BƯỚC 2/5                   │
  │                                          │
  │ 🟡 Quán Thế Âm Bồ Tát                   │
  │                                          │
  │ (hình ảnh tôn tượng)                     │
  │                                          │
  │ 📍 Vị trí: Bên phải đàn thờ              │
  │                                          │
  │ 📿 Yêu cầu: Bái 3 lần + Niệm Ngành      │
  │                                          │
  │ [Bắt đầu chant ▶]  [⏱ Timer]             │
  │                                          │
  │ [Hoàn thành bước — Tiếp theo ▶]         │
  └──────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Sau 5 bước hoàn thành:

  ┌──────────────────────────────────────────┐
  │ 🎉 HOÀN THÀNH NGHI THỨC BÁI LẠY        │
  │                                          │
  │ ✔ Bước 1: Thích Ca Mâu Ni Phật          │
  │ ✔ Bước 2: Quán Thế Âm Bồ Tát           │
  │ ✔ Bước 3: Nam Kinh Bồ Tát — Địa Tạng   │
  │ ✔ Bước 4: Thái Tuế Bồ Tát              │
  │ ✔ Bước 5: Quan Đế / Châu Xương / Bình  │
  │                                          │
  │ 🏅 Badge được cấp:                      │
  │    "Nghi Thức Bái Lạy Hoàn Toàn"        │
  │                                          │
  │ Tất cả 5 tôn tượng đã lễ bái đúng      │
  │ thứ bậc phân cấp. Xin cầu nguyện các   │
  │ vị Phật Bồ Tát phù hộ bạn.              │
  │                                          │
  │ [Kết Thúc Nghi Thức]                    │
  └──────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Lỗi thứ tự (nếu user cố đảo hoặc skip):

  ┌──────────────────────────────────────────┐
  │ ❌ Sai Thứ Tự Bái Lạy                    │
  │                                          │
  │ Bạn không thể bỏ qua hoặc đảo thứ tự   │
  │ các tôn tượng. Vui lòng hoàn thành     │
  │ bước hiện tại trước khi tiếp tục.       │
  │                                          │
  │ Bước dự kiến: Thích Ca Mâu Ni Phật     │
  │                                          │
  │ [Quay lại & Thử Lại]                    │
  └──────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Schema Notes

```prisma
model ProstrationSession {
  id               String    @id @default(cuid())
  visitorId        String
  locationId       String    // Guan Yin Tang location
  completedSequence Int[]    // [1, 2, 3, 4, 5] when all done
  allCompleted     Boolean   @default(false)
  completedAt      DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  user             User      @relation(fields: [visitorId], references: [id])
  altarLocation    AltarProfile @relation(fields: [locationId], references: [id])

  @@index([visitorId])
  @@index([locationId])
  @@index([createdAt])
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `altar.prostration.sequence-started` | Visitor bắt đầu phiên bái lạy |
| `altar.prostration.step-1-completed` | Hoàn thành bước 1 (Thích Ca Mâu Ni Phật) |
| `altar.prostration.step-2-completed` | Hoàn thành bước 2 (Quán Thế Âm Bồ Tát) |
| `altar.prostration.step-3-completed` | Hoàn thành bước 3 (Nam Kinh Bồ Tát) |
| `altar.prostration.step-4-completed` | Hoàn thành bước 4 (Thái Tuế Bồ Tát) |
| `altar.prostration.step-5-completed` | Hoàn thành bước 5 (Quan Đế Trio) |
| `altar.prostration.all-steps-completed` | Hoàn thành toàn bộ 5 bước + badge awarded |

---

## Errors

| Điều kiện | Mã lỗi | HTTP | Phục hồi |
|---|---|---|---|
| `currentStep ≠ expectedStep` (skip/reorder) | `prostration_sequence_violation` | 400 | Hoàn thành đúng bước hiện tại theo thứ tự |
| `locationId` không tồn tại | `location_not_found` | 404 | Kiểm tra lại vị trí đạo tràng |
| Session không tồn tại | `session_not_found` | 404 | Bắt đầu phiên mới |
| `chantCompleted ≠ true` | `chant_not_completed` | 400 | Hoàn thành 3 lần niệm ngành |
| Chưa đăng nhập | `unauthorized` | 401 | — |

---

## Notes for AI/codegen

- `completedSequence` là mảng int lưu các bước đã hoàn thành — validate mỗi advance là `completedSequence.length + 1`.
- Danh sách 5 tôn tượng là **constant** — không lấy từ database, không cấu hình được.
- `currentStep` từ client chỉ dùng để double-check, server-side `expectedStep = completedSequence.length + 1` là authority.
- Session resume: nếu user đóng app giữa chừng, load lại session và tiếp tục từ `completedSequence.length + 1`.
- **Mỗi ngày một phiên** — user có thể tạo nhiều session nhưng mỗi phiên độc lập (không aggregate hàng ngày).
- Badge "🏅 Nghi Thức Bái Lạy Hoàn Toàn" được cấp khi `allCompleted = true` — thêm vào user achievement/badge system.
- AR map là optional enhancement — hệ thống vẫn hoạt động mà không cần AR nếu thiết bị không hỗ trợ.
- Chant timer (3 lần) có thể là honor-based (user xác nhận bằng tay) hoặc timer-based (auto-track 3 lần)—tùy vào UX design.

---

## Related

- [public-altar-oil-donation.md](./public-altar-oil-donation.md) — Phase 42 Logic 9: Oil donation + home cooking commitment
- [sacred-item-damage-protocol.md](./sacred-item-damage-protocol.md) — altar item damage & repentance
- [auspicious-beast-ai-filter.md](./auspicious-beast-ai-filter.md) — altar item filtering
