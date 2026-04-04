# Cảm Biến Năng Lượng Dương Khi Phóng Sinh — Life Release Peak Yang Energy Sensor

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Phóng sinh mượn năng lượng mặt trời (Dương khí) để tiêu trừ tai họa. Thời điểm và thời tiết ảnh hưởng trực tiếp đến hiệu quả:

| Điều kiện | Quy tắc |
|---|---|
| Ban đêm (sau hoàng hôn) | **CẤM** — không phóng sinh |
| Ban ngày + nắng đẹp | **TỐT NHẤT** — Dương khí đỉnh điểm |
| Ban ngày + âm u / mưa | **ĐƯỢC** — nhưng phải cẩn thận |

---

## Owner module

`vows-merit` — LifeReleaseJournal
Phối hợp: `calendar` (weather + sunrise/sunset API)

---

## Actors

- `member` — chuẩn bị đi phóng sinh, mở flow log
- `system` — check GPS, thời tiết, giờ mặt trời, hiển thị status badge

---

## Trigger

User mở màn hình **[Ghi Phóng Sinh]** hoặc bấm **[Chuẩn bị đi phóng sinh]**.

---

## Weather + Time Integration

### Data Sources

```
1. GPS location: browser Geolocation API hoặc user-set default location
2. Sunrise/Sunset: OpenWeatherMap One Call API
   → fields: current.sunrise, current.sunset (Unix timestamp)
3. Weather condition: current.weather[0].id
   → Sunny/Clear:  id 800-802
   → Cloudy:       id 803-804, 7xx
   → Rain:         id 500-531
   → Thunderstorm: id 200-232
```

### Decision Logic

```
function getYangEnergyStatus(
  currentTime: Date,
  sunrise: Date,
  sunset: Date,
  weatherId: number
): YangEnergyStatus

─────────────────────────────────────────────────────
if (currentTime < sunrise || currentTime >= sunset):
  return NIGHTTIME_BLOCKED

if (weatherId in [800, 801, 802]):  // Sunny/Clear
  return PEAK_YANG

if (weatherId in [803, 804] || weatherId >= 700):  // Cloudy/Foggy
  return DAYLIGHT_ACCEPTABLE

if (weatherId in [500..531]):  // Rain
  return DAYLIGHT_ACCEPTABLE   // vẫn được, nhưng note mưa

if (weatherId in [200..232]):  // Thunderstorm
  return NIGHTTIME_BLOCKED     // treat as blocked (cũng cấm niệm kinh)
```

---

## Status Badges & FE Behavior

### NIGHTTIME_BLOCKED

```
┌──────────────────────────────────────────────────────────┐
│  🔴  CẤM PHÓNG SINH VÀO BAN ĐÊM                        │
│                                                          │
│  Hiện tại: 20:45 — Mặt trời đã lặn lúc 18:12          │
│                                                          │
│  Phóng sinh vào ban đêm sẽ không mang lại              │
│  năng lượng Dương. Vui lòng thực hiện ban ngày.        │
│                                                          │
│  Mặt trời mọc ngày mai: 05:47                          │
└──────────────────────────────────────────────────────────┘
```

- Nút **[Bắt đầu Phóng Sinh]** bị **disabled hoàn toàn**.
- User vẫn có thể **pre-fill thông tin** (loại vật, số lượng, nguyện vọng) để chuẩn bị.
- Nút submit chỉ unlock sau sunrise.

### PEAK_YANG

```
┌──────────────────────────────────────────────────────────┐
│  🟢  ĐẠT ĐỈNH NĂNG LƯỢNG DƯƠNG                         │
│                                                          │
│  Trời nắng đẹp — Thời điểm tốt nhất để phóng sinh     │
│  Năng lượng Dương đang ở đỉnh điểm                    │
│                                                          │
│  🌤  Nắng đẹp · 14:30 · Còn 3:42 đến hoàng hôn       │
└──────────────────────────────────────────────────────────┘
```

- Nút **[Bắt đầu Phóng Sinh]** ENABLED, màu xanh lá.

### DAYLIGHT_ACCEPTABLE

```
┌──────────────────────────────────────────────────────────┐
│  🟡  Trời âm u — Vẫn có thể phóng sinh ban ngày       │
│                                                          │
│  Trời hiện đang [âm u / có mưa nhẹ].                  │
│  Phóng sinh ban ngày vẫn được phép,                    │
│  nhưng năng lượng Dương không đạt đỉnh điểm.          │
│  Xin hãy cẩn thận.                                     │
└──────────────────────────────────────────────────────────┘
```

- Nút **[Bắt đầu Phóng Sinh]** ENABLED, màu vàng/amber.

---

## API Endpoint

```
GET /api/vows-merit/life-release/yang-status?lat=10.77&lng=106.70
──────────────────────────────────────────────────────────────────
Response:
{
  status:          "PEAK_YANG" | "DAYLIGHT_ACCEPTABLE" | "NIGHTTIME_BLOCKED",
  currentTime:     ISO8601,
  sunrise:         ISO8601,
  sunset:          ISO8601,
  minutesToSunset: number,
  weatherCode:     number,
  weatherDesc:     string,
  canProceed:      boolean,
  message:         string   // localized Vietnamese message
}
```

Cache: 15 phút per (lat, lng rounded to 0.1°).

---

## Write Path — Enforcement

```
POST /api/vows-merit/life-release-journals
────────────────────────────────────────────
// Thêm vào validation step hiện có:

1. Nếu releaseDateTime provided:
   a. Check yang status tại (releaseDateTime, userLocation).
   b. Nếu status = NIGHTTIME_BLOCKED:
      → throw 422 {
          error:   "nighttime_release_forbidden",
          message: "Phóng sinh vào ban đêm bị cấm. Phải thực hiện ban ngày."
        }
2. Attach yangStatus vào record metadata cho audit.
```

---

## Schema Notes

```prisma
model LifeReleaseJournal {
  // ... existing fields ...
  releaseDateTime    DateTime?
  yangStatus         String?   // "PEAK_YANG" | "DAYLIGHT_ACCEPTABLE" | "NIGHTTIME_BLOCKED"
  weatherCodeAtTime  Int?
  sunriseAtLocation  DateTime?
  sunsetAtLocation   DateTime?
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `life-release.yang-check.peak` | Status PEAK_YANG khi mở flow |
| `life-release.yang-check.acceptable` | Status DAYLIGHT_ACCEPTABLE |
| `life-release.yang-check.blocked` | Status NIGHTTIME_BLOCKED |
| `life-release.nighttime.rejected` | API reject submission về đêm |

---

## Related

- [log-life-release.md](./log-life-release.md) — Core life release journal flow
- [life-release-merit-guard.md](./life-release-merit-guard.md) — Merit stealing prevention
- [recitation-time-weather-guard.md](./recitation-time-weather-guard.md) — Weather guard pattern (tương tự)
