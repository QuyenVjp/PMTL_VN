# Tự vệ tại Khu vực Âm Khí — Yin-Energy Location Defense

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-04

---

## Purpose

Nếu người dùng bắt buộc phải đi đến những nơi có trường khí phức tạp, cực Âm (như Bệnh viện, Lò hỏa táng, Nghĩa trang), rất dễ bị vong linh bám theo hoặc ngạ quỷ xin Kinh. Hệ thống phải tự động phát hiện vị trí và kích hoạt chế độ bảo vệ.

---

## Owner module

`wisdom-qa` — LocationDefenseService / YinEnergyDetector

---

## Trigger

App detects user location based on geolocation or explicit location logging. Detects high-Yin locations:
- Hospital (BV)
- Crematory (Lò hỏa táng)
- Cemetery / Graveyard (Nghĩa trang)

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User opens App at Hospital/Crematory/Cemetery | ✅ Detect Yin-energy zone |
| Activate [Yin-Energy Defense] mode | ✅ Show urgent recommendation |
| Recommend: Continuous Great Compassion Mantra | ✅ Suggest audio play |
| Temporarily disable Heart Sutra / Amitabha Sutra | ⚠️ Prevent unwanted spirit attraction |
| User leaves Yin zone | ✅ Deactivate defense mode |

---

## FE Behavior

```
User opens App at Hospital

🚨 PHÒ NGỮ ÂM KHÍ

Bạn đang ở khu vực từ trường phức tạp
(Bệnh viện/Lò hỏa táng/Nghĩa trang).

⚠️ Dễ bị vong linh bám theo.

💡 Lời khuyên:
  1. Hãy nhép miệng niệm Chú Đại Bi
     liên tục (không ngừng)
  2. Hoặc bật Audio Chú Đại Bi trên
     điện thoại phát nhỏ để tạo vòng
     tròn bảo vệ xung quanh

[🔊 Bật Audio Chú Đại Bi]  [Đã hiểu]

---

After dismissal, app enters Defense Mode:

Daily Recitation:
- Great Compassion (大悲咒) — [Start] ✅
- Heart Sutra (心经) — [Start] 🔒 DISABLED
  Reason: "Tạm khóa ở khu vực Âm khí
           để tránh hút vong linh"
- Amitabha Sutra (阿弥陀经) — [Start] 🔒 DISABLED

---

When user leaves Yin zone:

Defense mode automatically deactivates
(geolocation or manual override)

All recitations re-enabled
```

---

## Location Classification

```typescript
interface YinEnergyLocation {
  type: "HOSPITAL" | "CREMATORY" | "CEMETERY";
  risk_level: "HIGH";
  disabled_recitations: ["HEART_SUTRA", "AMITABHA_SUTRA"];
  recommended_recitations: ["GREAT_COMPASSION"];
}

const YIN_LOCATIONS = [
  // Hospitals
  { keyword: "bệnh viện", type: "HOSPITAL" },
  { keyword: "hospital", type: "HOSPITAL" },

  // Crematory
  { keyword: "lò hỏa táng", type: "CREMATORY" },
  { keyword: "crematory", type: "CREMATORY" },

  // Cemetery
  { keyword: "nghĩa trang", type: "CEMETERY" },
  { keyword: "cemetery", type: "CEMETERY" }
];
```

---

## Audit

| Action | Trigger |
|---|---|
| `location.yin_energy_detected` | User enters Yin zone |
| `defense.mode_activated` | Defense mode on |
| `recitation.disabled_in_yin_zone` | Heart Sutra/Amitabha disabled |
| `defense.mode_deactivated` | User leaves Yin zone |

---

## Notes

Adaptive location-based protection system. Prevents unintended spirit interaction in spiritually vulnerable environments through intelligent recitation management and continuous protective mantra suggestion.