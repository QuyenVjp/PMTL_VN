# Ràng Buộc Tư Thế & Cửa Sổ 49 Ngày Phóng Sinh — Life Release Posture & 49-Day Window

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Nghi thức phóng sinh nâng cao
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Mở rộng `guide-life-release-interactive-flow.md` và `log-life-release.md` với 2 nghiệp vụ:

1. **49-Day Deceased Liberation Window** — phóng sinh cho người mới mất: cửa sổ thời gian 49 ngày sau khi mất, template đặc biệt của Thầy Lư.
2. **Posture & Gaze Constraints** — ràng buộc tư thế khi thả: không ném, nhìn lên không nhìn xuống mặt nước.

---

## Owner module

`vows-merit` — [xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — thực hiện phóng sinh
- `system` — validate cửa sổ 49 ngày, inject template Thầy Lư, hiển thị checklist tư thế

---

## Part 1: 49-Day Deceased Liberation Window

### Business rule

Khi người thân mới mất, linh hồn còn trong giai đoạn trung ấm (bardo) trong 49 ngày. Phóng sinh trong cửa sổ này **đặc biệt hiệu quả** giúp siêu độ. Hệ thống:
- Theo dõi `deceasedDate` và tính số ngày còn lại.
- Hiển thị **countdown banner** trong dashboard.
- Auto-inject lời khấn template Thầy Lư khi user tạo phiên phóng sinh cho người mới mất.

### Input bổ sung

```typescript
interface LifeReleaseForDeceasedInput {
  dedicationType:  "DECEASED"
  deceasedName:    string
  deceasedDate:    Date        // ngày mất
  purpose?:        string      // VD: "siêu độ về Tây Phương Cực Lạc"
}
```

### 49-Day Countdown Logic

```typescript
function is49DayWindowActive(deceasedDate: Date): boolean {
  const daysSince = Math.floor((Date.now() - deceasedDate.getTime()) / 86_400_000)
  return daysSince <= 49
}

function daysRemaining(deceasedDate: Date): number {
  return Math.max(0, 49 - Math.floor((Date.now() - deceasedDate.getTime()) / 86_400_000))
}
```

### Dashboard Banner (when window active)

```
🕯️ Cửa sổ siêu độ: [Tên người mất] — còn [N] ngày
"Phóng sinh trong 49 ngày sau khi mất giúp linh hồn được siêu thoát tốt hơn."
[+ Tạo phiên phóng sinh siêu độ]
```

Banner biến mất sau ngày 49.

### Thầy Lư Template Auto-inject

Khi `dedicationType = DECEASED` và cửa sổ 49 ngày còn active, lời khấn trong Phase 5 (On-site chanting) tự động inject template:

```
"Nam mô A Di Đà Phật. Nam mô Quán Thế Âm Bồ Tát.
Con [Tên người thực hiện], hôm nay ngày [ngày], thành tâm phóng sinh [số lượng] [loài vật].
Toàn bộ công đức phóng sinh này, con kính dâng lên Đức Quán Thế Âm Bồ Tát
để xin siêu độ cho hương linh [Họ tên đầy đủ người mất], pháp danh [pháp danh nếu có],
vừa qua đời ngày [ngày mất].
Kính xin Ngài từ bi tiếp dẫn về Tây Phương Cực Lạc.
Con xin đảnh lễ."
```

Template inject từ: `deceasedName`, `deceasedDate`, `actorName`, `releaseInfo.*`.

### Write path

1. Validate `dedicationType = DECEASED` → check `deceasedDate` không null.
2. Check `is49DayWindowActive(deceasedDate)`:
   - Nếu **trong cửa sổ** → inject Thầy Lư template, set `templateVariant = "DECEASED_49DAY"`.
   - Nếu **ngoài cửa sổ** → sử dụng template thông thường, hiện thông báo: *"Đã qua 49 ngày. Phóng sinh vẫn có công đức nhưng không còn trong cửa sổ siêu độ đặc biệt."*
3. Audit: `life-release.deceased.within-49-day-window` hoặc `life-release.deceased.past-49-days`.

---

## Part 2: Posture & Gaze Constraints

### Business rule

Khi thả sinh vật xuống nước:
- **KHÔNG được ném** — phải thả nhẹ nhàng, để sinh vật tự vào nước.
- **Nhìn lên, không nhìn xuống mặt nước** — tránh nhìn thẳng xuống khi thả.
- Nếu phóng sinh từ cầu cao → khuyến nghị thuê thuyền hoặc tìm bờ thấp.

### Checklist (Phase 4 — On-site)

Hiển thị trước khi user confirm [Đã thả xong]:

```
□ Tôi đã thả nhẹ nhàng — không ném sinh vật.
□ Tôi đã nhìn lên hoặc nhìn ra xa — không nhìn thẳng xuống mặt nước khi thả.
□ Sinh vật đã tiếp xúc trực tiếp với nước (không thả qua túi đóng kín).
```

Checkbox 3 là ADVISORY (không block nếu không tích — chỉ nhắc).

### Height Advisory

Nếu user nhập location note có keyword "cầu" (bridge), "cao" (high):

```
⚠️ Khuyến nghị: Phóng sinh từ cầu cao có thể làm sinh vật bị thương khi chạm nước.
   Hãy tìm bờ thấp hoặc thuê thuyền nhỏ để thả trực tiếp.
```

### Write path (extend Phase 4)

1. Render posture checklist.
2. Validate mandatory checkboxes (1 & 2) confirmed.
3. If height keyword detected → render advisory (non-blocking).
4. Save `postureChecklistConfirmed = true` to session.
5. Audit: `life-release.posture.confirmed`.

---

## Errors

| Condition | Error code | HTTP | Recovery |
|---|---|---|---|
| `deceasedDate` missing khi dedicationType=DECEASED | `invalid_body` | 400 | Nhập ngày mất |
| Posture checklist bắt buộc chưa tích | `posture_checklist_incomplete` | 400 | Tích đủ checkbox |
| Chưa đăng nhập | `unauthorized` | 401 | — |

---

## Audit

| Action | Actor | Trigger |
|---|---|---|
| `life-release.deceased.within-49-day-window` | actorUserId | Phóng sinh trong 49 ngày |
| `life-release.deceased.past-49-days` | actorUserId | Phóng sinh sau 49 ngày |
| `life-release.posture.confirmed` | actorUserId | Checklist tư thế hoàn thành |

---

## Notes for AI/codegen

- `LifeReleaseSession` cần thêm fields: `deceasedName?`, `deceasedDate?`, `templateVariant`, `postureChecklistConfirmed`.
- Thầy Lư template là **hardcoded string** với variable slots — không phải CMS content. Admin không thể sửa.
- `daysRemaining()` tính theo `deceasedDate` của user — không phải ngày tạo session.
- Dashboard banner cần cron hoặc real-time check khi load — không cache quá 24h.
- Cửa sổ 49 ngày tính theo **ngày dương lịch**, không phải âm lịch.
