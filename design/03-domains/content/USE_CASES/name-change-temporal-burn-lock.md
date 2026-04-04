# Khóa Thời Gian & Thời Tiết Đốt Thăng Văn Đổi Tên — Name Change Form Temporal Burn Lock

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 406, 845)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Đơn Thăng Văn Đổi Tên có tính pháp lý tâm linh cao nhất. Đốt sai giờ hoặc lúc trời không nắng thì giấy sẽ không "bay lên" được — đơn trở thành vô dụng. Hệ thống phải chặn nút `[Xác Nhận Đã Đốt]` cho đến khi điều kiện thời gian và thời tiết đồng thời được đáp ứng.

---

## Owner module

`content` — SacredFormsService / TemporalBurnGate
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người chuẩn bị đốt Thăng Văn Đổi Tên
- `system` — kiểm tra giờ local và tình trạng thời tiết, block/unblock nút đốt

---

## Trigger

Khi user vào màn hình `[Xác Nhận Đã Đốt]` của form `NAME_CHANGE` (Thăng Văn Đổi Tên).

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Giờ LOCAL nằm trong `[06:00±15min, 08:00±15min, 16:00±15min]` VÀ thời tiết `SUNNY/CLEAR` | ✅ ALLOWED — unlock nút đốt |
| Giờ đúng NHƯNG thời tiết `CLOUDY/RAINY/OVERCAST` | ❌ BLOCK — hiện lý do thời tiết |
| Thời tiết `SUNNY` NHƯNG sai giờ | ❌ BLOCK — hiện đồng hồ đếm ngược đến giờ tiếp theo |
| Cả hai điều kiện đều sai | ❌ BLOCK — hiện cả hai lý do |
| WeatherAPI không khả dụng | ⚠️ WARNING — cho phép user tự xác nhận thủ công |

---

## Input Contract

```typescript
interface BurnNameChangeFormDto {
  formId:              string
  formType:            'NAME_CHANGE'
  userLocalTime:       string   // ISO timestamp với timezone
  weatherConfirmation: 'SUNNY' | 'CLOUDY' | 'RAINY' | 'UNKNOWN'
  manualOverride:      boolean  // true khi WeatherAPI unavailable
}
```

---

## Write Path

```
POST /api/content/sacred-forms/burn

1. Assert formType == 'NAME_CHANGE' — apply temporal rules
2. Parse userLocalTime → localHour: number (0-23), localMinute: number
3. Check timeWindow:
   validTimes = [
     { hour: 6,  tolerance: 15 },
     { hour: 8,  tolerance: 15 },
     { hour: 16, tolerance: 15 }
   ]
   inTimeWindow = validTimes.some(t =>
     Math.abs((localHour * 60 + localMinute) - t.hour * 60) <= t.tolerance
   )
4. Check WeatherAPI (spatial-environment-guard integration):
   weather = await WeatherService.getCurrentCondition(userId.location)
   weatherOk = weather in ['SUNNY', 'CLEAR', 'MOSTLY_SUNNY']
   OR manualOverride == true (fallback khi API down)
5. If NOT inTimeWindow:
   → Return 400 { error: 'burn_time_invalid', nextValidWindow: <next valid slot> }
6. If NOT weatherOk AND NOT manualOverride:
   → Return 400 { error: 'burn_weather_invalid', currentWeather: weather }
7. Mark form as BURNED, log audit event
```

---

## FE Behavior

### Màn hình chuẩn bị đốt (khi đúng giờ + nắng):

```
┌──────────────────────────────────────────────────────┐
│ ✅ Điều Kiện Đốt Đã Đủ                                │
│──────────────────────────────────────────────────────│
│  🕗 Giờ hiện tại: 08:03 ✅                            │
│  ☀️  Thời tiết: Trời nắng ✅                           │
│                                                      │
│         [Xác Nhận Đã Đốt Thăng Văn]                  │
└──────────────────────────────────────────────────────┘
```

### Màn hình bị chặn (sai giờ):

```
┌──────────────────────────────────────────────────────┐
│ ⛔ Chưa Đến Giờ Đốt                                   │
│──────────────────────────────────────────────────────│
│  Thăng văn đổi tên chỉ được đốt vào:                 │
│  • 6:00 sáng  (±15 phút)                             │
│  • 8:00 sáng  (±15 phút)                             │
│  • 4:00 chiều (±15 phút)                             │
│                                                      │
│  Giờ kế tiếp hợp lệ: 16:00 hôm nay                  │
│  Còn lại: ⏱ 02:47:33                                 │
│                                                      │
│     [Xác Nhận Đã Đốt] ← (disabled, màu xám)         │
└──────────────────────────────────────────────────────┘
```

### Màn hình bị chặn (trời không nắng):

```
┌──────────────────────────────────────────────────────┐
│ ⛔ Thời Tiết Không Phù Hợp                            │
│──────────────────────────────────────────────────────│
│  🌧️ Hiện tại: Trời mưa / có mây dày                  │
│                                                      │
│  Thăng văn đổi tên BẮT BUỘC đốt khi trời nắng.       │
│  Hãy chờ ngày trời nắng và đốt đúng giờ quy định.   │
│                                                      │
│  [Xác Nhận Thủ Công (WeatherAPI lỗi)]                │
│     [Xác Nhận Đã Đốt] ← (disabled)                  │
└──────────────────────────────────────────────────────┘
```

- Nút `[Xác Nhận Thủ Công]` chỉ hiện khi `WeatherAPI` timeout/unavailable
- Khi dùng manual override, ghi log `burn.manual_weather_override` để audit

---

## Schema Notes

```prisma
model SacredFormBurnEvent {
  // ... existing fields ...
  burnLocalTime    DateTime
  weatherStatus    String?    // SUNNY / CLOUDY / RAINY / MANUAL_OVERRIDE
  timeWindowValid  Boolean    @default(false)
  weatherValid     Boolean    @default(false)
  manualOverride   Boolean    @default(false)
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `form.name_change.burn_time_blocked` | Cố đốt sai giờ |
| `form.name_change.burn_weather_blocked` | Cố đốt khi trời không nắng |
| `form.name_change.burned_success` | Đốt thành công đủ điều kiện |
| `form.name_change.burn_manual_override` | Dùng manual override khi API lỗi |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Sai khung giờ | `burn_time_invalid` | 400 |
| Thời tiết không nắng | `burn_weather_invalid` | 400 |

---

## Notes for AI/codegen

- `WeatherService` là Phase 2+ external dependency (xem `PHASE_ACTIVATION_MATRIX.md`)
- Phase 1 fallback: chỉ check `userLocalTime`, hiển thị manual weather confirmation checkbox
- Tolerance `±15 phút` là config constant `NAME_CHANGE_BURN_TIME_TOLERANCE_MINUTES`
- Rule này chỉ áp dụng cho `NAME_CHANGE` form — các form khác (`CONVINCING_FORM`, `REPENTANCE_FORM`) có rules riêng

---

## Related

- [convincing-family-form-duty-cycle.md](./convincing-family-form-duty-cycle.md) — cooldown cycle cho form khuyến đạo
- [spiritual-applications.md](./spiritual-applications.md) — tổng quan các loại đơn tâm linh
