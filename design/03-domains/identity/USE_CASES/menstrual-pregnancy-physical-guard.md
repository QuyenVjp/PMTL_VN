# Nhắc Nhở Vệ Sinh Tâm Linh Kỳ Kinh & Thai Kỳ — Menstrual & Pregnancy Physical Guard

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Phụ nữ trong kỳ kinh nguyệt hoặc mang thai **hoàn toàn có thể** bái lạy và tụng niệm bình thường. Luật PMTL không cấm — chỉ khuyến khích cẩn thận vệ sinh khi thực hiện nghi lễ (dâng hương, thay nước, đặt hoa quả). Hệ thống hiển thị nhắc nhở nhẹ nhàng, trang trọng.

---

## Owner module

`identity` — HealthService / BiologicalGuard
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` (female) — người dùng đang trong kỳ kinh hoặc mang thai
- `system` — nhắc nhở soft reminder khi thực hiện ritual actions

---

## Trigger

Khi user (gender = FEMALE) thực hiện `[Dâng Hương]`, `[Thay Nước]`, `[Đặt Hoa Quả]` với trạng thái profile = `menstrual` hoặc `pregnant`.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User gender = FEMALE | ✅ Enable optional health tracking |
| User log: "Kỳ kinh nguyệt" | ✅ Flag `healthStatus = MENSTRUAL` trong profile |
| User thực hiện ritual actions | ✅ Hiển thị soft reminder (không block) |
| User log: "Mang thai" | ✅ Flag `healthStatus = PREGNANT` |
| Status = PREGNANT + user bái lạy | ✅ Gợi ý đứng thay vì quỳ |
| Reminder hiển thị | 📲 Nhẹ nhàng, trang trọng — không phán xét |

---

## Input Contract

```typescript
interface HealthStatusUpdateDto {
  healthStatus: 'NONE' | 'MENSTRUAL' | 'PREGNANT'
  weekOfPregnancy?: number  // Optional, chỉ khi PREGNANT
}
```

---

## Write Path

```
PATCH /api/identity/profile/health-status
1. Validate healthStatus ∈ ['NONE', 'MENSTRUAL', 'PREGNANT']
2. UPDATE UserProfile: healthStatus, healthStatusUpdatedAt = now()
3. Audit: health.menstrual_status_logged | health.pregnancy_status_logged

// Soft reminder injection (không block):
GET /api/identity/profile/ritual-reminder?action=OFFERING
1. Load user.healthStatus
2. If MENSTRUAL: return reminder type = HANDWASH
3. If PREGNANT: return reminder type = STANDING_BOW
4. If NONE: return null (no reminder)
```

---

## FE Behavior

```
Kỳ kinh nguyệt:

💡 Lưu ý Vệ Sinh Tâm Linh
┌─────────────────────────────────────┐
│ Bạn đang trong kỳ kinh nguyệt.      │
│                                     │
│ Bạn hoàn toàn có thể bái lạy và    │
│ niệm kinh bình thường.              │
│                                     │
│ Khi dâng hương/thay nước/hoa quả:  │
│ ✅ Rửa tay thật kỹ bằng xà phòng   │
│ ✅ Giữ vệ sinh sạch sẽ             │
│                                     │
│ Luật PMTL không cấm, chỉ khuyến    │
│ khích cẩn thận để giữ trang nghiêm. │
└─────────────────────────────────────┘
[Đã Hiểu]  [Thêm Chi Tiết]

──────────────────────────────────────

Mang thai:

💡 Lưu ý Cho Phụ Nữ Mang Thai
┌─────────────────────────────────────┐
│ Bạn đang mang thai.                │
│ ✅ Có thể bái lạy & niệm kinh      │
│ ✅ Khuyến khích đứng thay vì quỳ   │
│ ✅ Tránh cúi gập người kéo dài     │
│ ✅ Bảo vệ thai nhi & trang nghiêm  │
│                                     │
│ Bồ Tát sẽ hiểu rõ hoàn cảnh của con│
└─────────────────────────────────────┘
[Đã Hiểu]
```

---

## Schema Notes

```prisma
model UserProfile {
  // ... existing fields ...
  healthStatus          HealthStatus @default(NONE)
  healthStatusUpdatedAt DateTime?
  weekOfPregnancy       Int?
  // Migration: ALTER TABLE "UserProfile" ADD COLUMN "healthStatus" TEXT DEFAULT 'NONE'
}

enum HealthStatus {
  NONE
  MENSTRUAL
  PREGNANT
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `health.menstrual_status_logged` | User update profile |
| `health.pregnancy_status_logged` | User update profile |
| `health.reminder_shown_menstrual` | Ritual action attempted |
| `health.reminder_shown_pregnancy` | Ritual action attempted |
| `health.handwashing_acknowledged` | User confirm |

---

## Errors

Không có hard block cho nhắc nhở vệ sinh — đây là **soft reminder only**. Xem Part B bên dưới cho hard block riêng biệt áp dụng khi mang thai.

---

## Notes for AI/codegen

- Reminder phần vệ sinh (Part A) là **informational only** — không block bất kỳ action nào.
- Tone tuyệt đối phải trung tính, nhẹ nhàng — không phán xét, không nói "cấm".
- Hiển thị tối đa 1 lần/session để tránh spam.

---

## Part B: Cảnh Báo Bảo Vệ Thai Nhi Khi Niệm Thay — Pregnancy Proxy Recitation Advisory

> **Nguồn bổ sung:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn Phase 30)

Phụ nữ mang thai có trường khí bảo vệ chưa đủ mạnh. Khi tụng Ngôi Nhà Nhỏ thay cho người khác (proxy recitation), oan gia trái chủ của đối phương có thể tìm đến thai nhi. Hệ thống hiển thị cảnh báo mạnh mẽ để người dùng tự quyết định có tiếp tục hay không.

### Trigger

Khi user có `healthStatus = PREGNANT` tạo task NNN với `isProxy = true` (Kính tặng người khác).

### Business Rule bổ sung

| Điều kiện | Hành động |
|---|---|
| `healthStatus = PREGNANT` VÀ `isProxy = false` (niệm cho mình) | ✅ ALLOWED — không cảnh báo thêm |
| `healthStatus = PREGNANT` VÀ `isProxy = true` (niệm cho người khác) | ⚠️ STRONG WARNING — hiển thị cảnh báo bảo vệ thai nhi, yêu cầu xác nhận nhận thức rủi ro |
| User xác nhận đã hiểu rủi ro | ✅ ALLOWED với audit log |

### Input Contract bổ sung

```typescript
interface LittleHouseCreateDto {
  // ... existing fields ...
  pregnancyProxyRiskAcknowledged?: boolean  // bắt buộc khi PREGNANT + isProxy = true
}
```

### Write Path bổ sung

```
POST /api/vows-merit/little-houses (khi isProxy = true)

1. Load user.healthStatus
2. If healthStatus == 'PREGNANT' AND isProxy == true:
   a. Validate pregnancyProxyRiskAcknowledged == true
      → If false: return 200 with strongWarning: { code: 'pregnancy_proxy_risk_advisory' }
      → FE must display warning modal and require acknowledgment
   b. Log audit: health.pregnancy_proxy_risk_acknowledged
3. Continue normal proxy flow
```

### FE Behavior bổ sung

```
┌──────────────────────────────────────────────────────────┐
│ ⚠️  Cảnh Báo Bảo Vệ Thai Nhi                             │
│──────────────────────────────────────────────────────────│
│ Bạn đang mang thai và muốn niệm NNN cho người khác.      │
│                                                          │
│ Theo Pháp Môn Tâm Linh, khi trường khí chưa đủ mạnh,   │
│ việc gánh nghiệp cho người khác có thể ảnh hưởng đến    │
│ thai nhi. Hãy cân nhắc kỹ trước khi quyết định.        │
│                                                          │
│ Khuyến nghị: Chỉ niệm cho chính mình và thai nhi        │
│ trong giai đoạn mang thai này.                           │
│                                                          │
│ [ ] Tôi đã hiểu rủi ro và vẫn muốn tiếp tục            │
│                                                          │
│    [Tiếp Tục Niệm Thay]    [Niệm Cho Bản Thân]          │
└──────────────────────────────────────────────────────────┘
```

- Nút `[Tiếp Tục Niệm Thay]` chỉ active sau khi tick checkbox xác nhận
- Nút `[Niệm Cho Bản Thân]` là nút mặc định được highlight
- Đây là **advisory với forced acknowledgment**, không phải hard 4xx block

### Audit bổ sung

| Action | Trigger |
|---|---|
| `health.pregnancy_proxy_warning_shown` | Cảnh báo hiển thị |
| `health.pregnancy_proxy_risk_acknowledged` | User xác nhận nhận thức rủi ro và tiếp tục |
| `health.pregnancy_proxy_redirected_self` | User chọn niệm cho bản thân |

---

## Related

- [update-profile.md](./update-profile.md) — profile update flow
- [proxy-recitation-spirit-defense.md](../../vows-merit/USE_CASES/proxy-recitation-spirit-defense.md) — lời khấn bảo vệ khi niệm thay
- [life-release-posture-constraints.md](../../vows-merit/USE_CASES/life-release-posture-constraints.md) — posture constraints
