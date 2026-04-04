# BRD PHASE 20: Ngũ Đại Pháp Bảo & Event Sourcing Architecture

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Tầng Kiến Trúc Lõi
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-04

---

## Executive Summary

Architectural gap discovered: Karma (Nghiệp Chướng) cannot be deleted or overwritten—only offset by merit. Current CRUD-based DebtLedger violates karmic causality law. **Phase 20 mandates Event Sourcing (CQRS) architecture** for all karma tracking, plus 10 core logic implementations spanning the Five Golden Dharma Treasures (Ngũ Đại Pháp Bảo).

---

## 🏗️ CORE ARCHITECTURAL MANDATE

### Event Sourcing (CQRS) Pattern for Karma Ledger

**Spiritual Principle:**
- Karma is immutable: only created, never deleted/updated
- Balance = reduce(all_events) over user's history
- No DELETE or UPDATE on karma records

**Code Rule:**
```typescript
// FORBIDDEN
prisma.debt.update()  // ❌ Violates karma law
prisma.debt.delete()  // ❌ Violates karma law

// REQUIRED
prisma.debtEvent.create({
  type: 'KARMA_INCURRED' | 'KARMA_OFFSET' | 'MERIT_TRANSFERRED'
  amount: number
  timestamp: DateTime
  reason: string
})

// Current balance calculation
const balance = debtEvents
  .reduce((sum, event) =>
    event.type === 'KARMA_INCURRED'
      ? sum + event.amount
      : sum - event.amount
  , 0)
```

---

## 🚀 LOGIC 1: Recitation Economy Segregation

> **Domain:** `wisdom-qa`, `content`
> **Owner:** RecitationService / SegmentationEngine

### Purpose

Daily recitation quota (Kinh Bài Tập) is subsistence for spiritual life. Little House quota (Ngôi Nhà Nhỏ) is debt repayment. These two funding pools **MUST NOT be commingled**. Combining them violates the principle of energetic segregation.

### Business Rules

| Condition | Action |
|---|---|
| User logs Daily Recitation count | ✅ Increment `DailyCounter` only |
| User fills Little House count | ✅ Increment `LittleHouseCounter` only |
| Transfer attempted between counters | ❌ Reject, show segregation warning |
| Both counters visible on Dashboard | ✅ Display side-by-side, separate colors |
| Drag-drop transfer UI attempted | ❌ Disable, show tooltip |

### FE Behavior

```
Dashboard:

[Bài Tập Hàng Ngày]      [Ngôi Nhà Nhỏ]
(Màu Xanh / Blue)        (Màu Vàng / Gold)

📊 Chúng Thực Tụng:      📋 Trả Nợ:
████████░░ (800/1000)    ████░░░░░░ (125/500)

⚠️ CẢNH BÁO:
Kinh bài tập là để nuôi dưỡng huệ mạng.
NNN là để trả nợ.
Luật PMTL cấm cộng dồn 2 quỹ này.
```

### Audit

| Action | Trigger |
|---|---|
| `recitation.daily_counter_incremented` | Daily recitation logged |
| `recitation.lh_counter_incremented` | Little House logged |
| `recitation.transfer_attempt_blocked` | Segregation violation detected |

---

## 🚀 LOGIC 2: Location-Bound Vow Fulfillment

> **Domain:** `vows-merit`, `altar-management`
> **Owner:** VowService / LocationValidator

### Purpose

Bodhisattva compassion response at specific location. Vow answer must be returned at **exact altar/temple where vow was made**. Failing to return invalidates merit transfer.

### Business Rules

| Condition | Action |
|---|---|
| User creates Vow event | ✅ Capture GPS coordinates or AltarID |
| User marks vow `isAnswered = true` | ✅ Generate `[Awaiting Fulfillment at XYZ]` task |
| User checks in at fulfillment location | ✅ Check location match |
| Check-in location ≠ vow location | ⚠️ Show warning: "Wrong location detected" |
| User confirms correct location | ✅ Log fulfillment completion |

### Location Binding Schema

```typescript
interface VowEvent {
  userId: string
  intention: string
  createdAt: DateTime
  altarLocation: {
    latitude: number
    longitude: number
    altarName: string
    altarId: string
  }

  isAnswered: boolean
  fulfillmentLocation?: {
    latitude: number
    longitude: number
    timestamp: DateTime
    matchesOriginal: boolean
  }
}
```

### FE Behavior

```
Lời Nguyện Đã Linh Ứng:

[Tên Lời Nguyện]
Phát nguyện tại: Chùa Phật Giáo, Quận 1, TP.HCM

📍 CHỜ HOÀN NGUYỆN TẠI:
Quận 1, TP.HCM (GPS: 10.7749, 106.7016)

[Check-in Tọa độ]

---

❌ Lỗi vị trí!
Bạn đang ở: Quận 2, TP.HCM
Bạn phải quay lại đúng nơi đã phát nguyện lúc đầu
để dâng hương hoa trả lễ.

[Chuyển Hướng đến Chùa]
```

### Audit

| Action | Trigger |
|---|---|
| `vow.created_with_location` | Vow event captured |
| `vow.fulfillment_location_required` | Vow marked answered |
| `vow.location_validation_passed` | Check-in at correct location |
| `vow.location_mismatch_detected` | Wrong location detected |

---

## 🚀 LOGIC 3: Vegetarian Vow Rescheduler

> **Domain:** `calendar`, `vows-merit`
> **Owner:** VegetarianVowService / RescheduleEngine

### Purpose

Unforeseen hardship may prevent vegetarian vow observance. Instead of breaking vow, user may request Bodhisattva permission to reschedule or substitute (2 flexible days in month). System enforces vocal pledge before rescheduling allowed.

### Business Rules

| Condition | Action |
|---|---|
| VegetarianDay arrives | ✅ Mark day in calendar |
| User cannot observe | ✅ Show `[Xin Dời Ngày]` button |
| Button clicked | ⏳ Display mandatory pledge recitation |
| Pledge recited (audio/text) | ✅ Unlock rescheduling UI |
| New date selected | ✅ Log reschedule event with reason |

### Pledge Text (Mandatory Recitation)

```
"Namo Đại Từ Đại Bi Quán Thế Âm Bồ Tát,
Con là [Tên], hôm nay vì hoàn cảnh [Lý do cụ thể],
Con xin phép dời ngày ăn chay sang ngày [Ngày mới].
Xin Bồ Tát từ bi tha thứ cho con."
```

### FE Behavior

```
Ngày Ăn Chay: Mùng 1 Âm Lịch

⚠️ HÔM NAY PHẢI ĂN CHAY

[Dự tính ăn chay] [Xin Dời Ngày]

---

Modal: Khấn Xin Dời Ngày

Hãy đọc to lời khấn này:

"Namo Đại Từ Đại Bi Quán Thế Âm Bồ Tát,
Con là [Tên], hôm nay vì hoàn cảnh [Lý do],
Con xin phép dời sang ngày [Chọn Ngày]..."

[Đã đọc xong, Xác nhận]

---

Rescheduled to: [Ngày mới]
Status: ✅ Khấn xin được chấp thuận
```

### Audit

| Action | Trigger |
|---|---|
| `vow.vegetarian_day_marked` | Scheduled day arrived |
| `vow.reschedule_request_initiated` | User clicks reschedule |
| `vow.pledge_recitation_completed` | Vocal pledge recorded |
| `vow.rescheduled_with_reason` | New date confirmed |

---

## 🚀 LOGIC 4: Birthday Longevity Release Trigger

> **Domain:** `identity`, `notifications`, `life-liberation`
> **Owner:** LifeLiberation Service / BirthdayTrigger

### Purpose

Golden moment for longevity release (Phóng Sinh Cầu Trường Thọ) is user's birthday. System auto-reminds 7 days prior to encourage proactive planning.

### Business Rules

| Condition | Action |
|---|---|
| User's birthday in identity profile | ✅ Store in system |
| 7 days before birthday | ✅ Send notification at 9 AM |
| User opens notification | ✅ Navigate to Life Liberation section |
| Life Liberation form shown | ✅ Pre-fill user name as primary beneficiary |
| User configures release | ✅ Log event with intent |

### Notification Content

```
🎂 Sắp đến sinh nhật của bạn

Theo PMTL, đây là thời điểm hiệu nghiệm nhất
trong năm để phóng sinh cầu trường thọ.

Hãy lên kế hoạch ngay!

[Xem Chi Tiết Phóng Sinh]
```

### Audit

| Action | Trigger |
|---|---|
| `birthday.identified_in_profile` | User sets birthday |
| `birthday.reminder_sent` | 7 days before birthday |
| `life_liberation.birthday_triggered` | Release initiated on birthday |

---

## 🚀 LOGIC 5: Proxy Name Card Generator

> **Domain:** `life-liberation`, `altar-management`
> **Owner:** ProxyLifeService / NameCardEngine

### Purpose

When releasing animals on behalf of sick person, user **MUST NOT speak their own name aloud**. Energy flows to the named beneficiary only. System generates bright-colored digital name card to prevent verbal slip-ups.

### Business Rules

| Condition | Action |
|---|---|
| User selects `[Phóng Sinh Thay]` (proxy) | ✅ Load sick person info |
| Input: beneficiary name + animal count | ✅ Generate Name Card UI |
| Name Card appears | ✅ Lock all other app interactions |
| Card displays in full-screen yellow/red | ✅ Display beneficiary name prominently |
| User reads card (no other UI available) | ✅ Prevent accidental speech |

### Name Card Template

```
═══════════════════════════════════════════
            🙏 PHÓNG SINH THAY 🙏
═══════════════════════════════════════════

Hôm nay [TÊN NGƯỜI BỆNH]
đã mua [SỐ LƯỢNG] con cá/chim...

Xin Bồ Tát phù hộ cho [TÊN NGƯỜI BỆNH]
sớm bình phục, trường thọ.

═══════════════════════════════════════════

⚠️ CHỈ ĐƯỢC ĐỌC CHỮ TRÊN MÀN HÌNH NÀY ⚠️

CẤM NHẮC TÊN CỦA BẠN BẰNG MIỆNG!

Nếu không công đức sẽ chạy ngược về bạn.
Người bệnh sẽ không nhận được.

[Đã Hiểu, Tiếp Tục Phóng Sinh]
```

### Audit

| Action | Trigger |
|---|---|
| `proxy_release.initiated` | User selects proxy mode |
| `name_card.generated` | Beneficiary info confirmed |
| `name_card.acknowledged` | User confirms understanding |
| `proxy_release.completed` | Release logged |

---

## 🚀 LOGIC 6: Sacred Object Damage Protocol

> **Domain:** `wisdom-qa`, `content`
> **Owner:** DiagnosisService / DamageProtocol

### Purpose

Accidental or intentional disrespect to Buddha statue/image (破法器 - breaking dharma vessel) is grave transgression. Must immediately begin **Repentance Buddha Sūtra recitation** (禮佛大懺悔文) to atone.

### Business Rules

| Condition | Action |
|---|---|
| User logs daily health/practice log | ✅ Show optional symptoms checklist |
| User selects: `[破損 / 碎裂佛像]` (Broke statue) | ✅ Trigger emergency protocol |
| Protocol activated | ❌ Override all other diagnoses |
| Red alert shown | ✅ Auto-generate daily prescription |
| Prescription: Repentance Buddha Sūtra | ✅ Lock into daily goals |
| User confirms understanding | ✅ Log transgression event |

### Emergency Prescription

```
🚨 CẢNH BÁO TỨC KHẨN

Bạn đã phạm tội bất kính với Pháp Bảo.
Đã làm rơi vỡ / hư hỏng tượng, ảnh Phật.

⛔ LỆNH: Lập Tức Niệm Lễ Phật

Tài liệu: Lễ Phật Đại Sám Hối Văn
(Repentance Buddha Sūtra)

Tần suất: Hàng ngày, tối thiểu 1 lần
Thời gian: Cho đến khi bạn cảm thấy được tha thứ

[Bắt Đầu Niệm Ngay]
```

### Audit

| Action | Trigger |
|---|---|
| `object_damage.reported` | User logs broken statue |
| `emergency_protocol.activated` | Damage severity confirmed |
| `repentance_prescribed` | Daily goal auto-generated |
| `transgression.logged` | Event recorded in karma ledger |

---

## 🚀 LOGIC 7: Invalidation Prayer Lock

> **Domain:** `engagement`, `wisdom-qa`
> **Owner:** LittleHouseService / InvalidationEngine

### Purpose

Before discarding incorrectly-written Little House paper, user **MUST recite invalidation prayer** to Bodhisattva requesting permission to void the energetic binding on that specific sheet.

### Business Rules

| Condition | Action |
|---|---|
| User clicks `[Hủy Tờ Này]` (Invalidate) | ✅ Show mandatory prayer modal |
| Prayer modal displayed | ⏳ Block all action buttons |
| User reads prayer aloud | ✅ Wait for acknowledgment |
| User confirms `[Đã khấn xong]` | ✅ Update DB: STATUS = INVALIDATED |
| Prayer not read | ❌ Keep modal locked |

### Invalidation Prayer (Mandatory Recitation)

```
"Namo Đại Từ Đại Bi Quán Thế Âm Bồ Tát,
Con là [Tên], đã viết sai trên tấm Ngôi Nhà Nhỏ này.
Con xin phép hủy bỏ nó.
Xin Bồ Tát từ bi tha thứ cho con."
```

### FE Behavior

```
Modal: Hủy Bỏ Tờ NNN Sai

❌ BẠN KHÔNG ĐƯỢC TỰ ÝBỎ SÁCHI QUÁ!

Trước khi vứt bỏ, bạn PHẢI khấn báo cáo Bồ Tát:

"Namo Đại Từ Đại Bi Quán Thế Âm Bồ Tát,
Con là [Tên], đã viết sai trên tấm
Ngôi Nhà Nhỏ này.
Con xin phép hủy bỏ nó.
Xin Bồ Tát từ bi tha thứ cho con."

[Đã Khấn Xong]
(button disabled until checkbox checked)

[ ] Tôi đã đọc lời khấn này
```

### Audit

| Action | Trigger |
|---|---|
| `lh.invalidation_requested` | User clicks invalidate button |
| `lh.prayer_modal_shown` | Confirmation UI displayed |
| `lh.prayer_recitation_confirmed` | User acknowledges |
| `lh.status_invalidated` | DB record flagged as void |

---

## 🚀 LOGIC 8: Zen-Pure Land Syncretism (E-Reader)

> **Domain:** `content`
> **Owner:** BHFFService / ContentSegmentation

### Purpose

Dharma Heart Texts integrate two schools: **Zen (wisdom for worldly problems)** and **Pure Land (transcendence for final stage)**. Users should find content by emotional state, not genre.

### Business Rules

| Condition | Action |
|---|---|
| User opens BHFF E-Reader | ✅ Show two main tabs |
| Tab 1: `[Trí Tuệ Nhân Gian]` (Zen) | ✅ Filter articles addressing worldly issues |
| Tab 2: `[Siêu Thoát Vãng Sanh]` (Pure Land) | ✅ Filter articles on transcendence/afterlife |
| User selects Zen tab | ✅ Load content: work, relationships, disease, worry |
| User selects Pure Land tab | ✅ Load content: death, letting go, rebirth, ascension |

### Tab Contents

**TAB 1: Trí Tuệ Nhân Gian (Zen Wisdom for Life)**
```
- Giải quyết Trầm Cảm và Lo âu
- Cách Xử Lý Cãi Vã Gia Đình
- Tìm Mục Đích Công Việc
- Chữa Lành Từ Bệnh Tật
- Quản Lý Tiền Bạc & Nợ Nần
```

**TAB 2: Siêu Thoát Vãng Sanh (Pure Land Transcendence)**
```
- Chuẩn Bị Tâm Lý Đối Diện Cái Chết
- Giúp Người Thân Trước Lúc Ra Đi
- Pháp Môn Vãng Sanh & Tây Phương Cực Lạc
- Buông Bỏ Tham Luyến Nhân Gian
- Xin Lâm Ứng Ở Lứa Tuổi Cao
```

### FE Behavior

```
BHFF (Bạch Thoại Phật Pháp) E-Reader

[ Trí Tuệ Nhân Gian ]  [ Siêu Thoát Vãng Sanh ]

---

SELECTED: Trí Tuệ Nhân Gian

📚 Bài Viết Chuyên Trị Vấn Đề Nhân Gian:

1. [Tôi Bị Trầm Cảm Vì Công Việc]
2. [Gia Đình Cãi Vã Không Dứt]
3. [Làm Sao Sống Có Ý Nghĩa?]
4. [Bệnh Nan Y Có Lối Thoát?]
```

### Audit

| Action | Trigger |
|---|---|
| `bhff_reader.opened` | User accesses e-reader |
| `bhff.zen_tab_selected` | Worldly wisdom content requested |
| `bhff.pure_land_tab_selected` | Transcendence content requested |
| `bhff.article_completed` | Quota tracked per domain |

---

## 🚀 LOGIC 9: Totem Hotline Schedule Guard

> **Domain:** `contact`, `calendar`
> **Owner:** ContactService / HotlineScheduler

### Purpose

Master's totem consultation (看東西 - examining karmic blockages) follows strict Sydney schedule: **Tues/Wed/Sat only**. Other days: general Q&A only. System enforces schedule by timezone.

### Business Rules

| Condition | Action |
|---|---|
| Today = Tue/Wed/Sat (Sydney TZ) | ✅ Button: `[Gọi Xin Xem Đồ Đằng]` |
| Today = Fri/Sun (Sydney TZ) | ✅ Button: `[Gọi Vấn Đáp Phật Học - KHÔNG Xem]` |
| Other days | ✅ Button: `[Gọi Vấn Đáp Phật Học - KHÔNG Xem]` |
| User calls on schedule day | ✅ Proceed to hotline connection |
| User calls on non-schedule day | ⚠️ Show warning + schedule info |

### Button States

```typescript
function getHotlineButtonState(sydneyDate: Date) {
  const day = sydneyDate.getDay() // 0=Sun, 3=Wed, 4=Thu, 6=Sat
  const totemDays = [3, 4, 6] // Wed, Thu, Sat

  if (totemDays.includes(day)) {
    return {
      label: "Gọi Xin Xem Đồ Đằng",
      color: "gold",
      enabled: true
    }
  } else {
    return {
      label: "Gọi Vấn Đáp Phật Học - KHÔNG Xem Đồ Đằng",
      color: "blue",
      enabled: true,
      tooltip: "Xem Đồ Đằng chỉ có Thứ 4, 5, 7 (giờ Sydney)"
    }
  }
}
```

### FE Behavior

```
Đường Dây Nóng Đài Trưởng:

Today (Sydney): Thứ 6 (Friday)

🎯 Gọi Vấn Đáp Phật Học - KHÔNG Xem Đồ Đằng
[Gọi ngay]

ℹ️ Lưu ý:
Xem Đồ Đằng chỉ có Thứ 4, 5, 7 (giờ Sydney)
Hôm nay là Thứ 6, bạn sẽ được vấn đáp chung.

[Xem Lịch Đầy Đủ]
```

### Audit

| Action | Trigger |
|---|---|
| `hotline.button_state_checked` | User views hotline button |
| `hotline.totem_day_button_shown` | On scheduled totem day |
| `hotline.general_qa_button_shown` | On non-totem day |
| `hotline.call_initiated` | User clicks call button |

---

## 🚀 LOGIC 10: Extreme Weather Override (Emergency Little House Burn)

> **Domain:** `engagement`, `weather`
> **Owner:** LittleHouseService / WeatherGuard

### Purpose

Absolute rule: **Never burn Little House after sunset or during rain/overcast**. EXCEPTION: Only for critical life-death situations (patient in ICU, creditor demanding immediate karmic offset). System enforces override with typed acknowledgment.

### Business Rules

| Condition | Action |
|---|---|
| Weather = Sunny + Time < Sunset | ✅ `[Bắt Đầu Đốt NNN]` enabled |
| Weather = Rainy OR Time > Sunset | 🔒 `[Bắt Đầu Đốt NNN]` locked/grayed |
| Lock active but user in emergency | ⏳ Show hidden unlock option |
| User clicks `[Mở Khóa Ngoại Lệ]` | ✅ Show confirmation dialog |
| User types `XÁC NHẬN NGUY KỊCH KHẨN CẤP` | ✅ Bypass guard, allow burn |
| User does NOT type exact phrase | ❌ Lock remains, prevents override |

### Lock UI

```
🚫 KHÔNG ĐƯỢC PHÉP ĐỐT NNN HÔM NAY

Lý do: Trời mưa / Đã lặn mặt trời

Luật PMTL: Chỉ được đốt dưới nắng vàng
và trước khi mặt trời lặn.

─────────────────────────────────────

[Mở Khóa Ngoại Lệ]
(visible only if truly emergency)

─────────────────────────────────────

Modal (after click):

⚠️ XÁC NHẬN NGUY KỊCH KHẨN CẤP

Bệnh nhân đang ở bộ phận ICU nguy kịch?
Oan gia trái chủ đòi mạng quá gấp?

Gõ chính xác: XÁC NHẬN NGUY KỊCH KHẨN CẤP

[________________] (textbox)

[Hủy] [Mở Khóa NNN]
(button enabled only after typing)
```

### Weather Integration

```typescript
interface WeatherGuard {
  weatherAPI: WeatherProvider

  canBurnLittleHouse(timestamp: Date, location: GeoPoint): boolean {
    const weather = this.weatherAPI.getWeather(location, timestamp)
    const isSunny = !weather.isRaining && !weather.isOvercast
    const isBeforeSunset = timestamp < this.calculateSunset(location, timestamp)

    return isSunny && isBeforeSunset
  }

  requiresEmergencyBypass(canBurn: boolean): boolean {
    return !canBurn // If normal burning blocked, override available
  }
}
```

### Audit

| Action | Trigger |
|---|---|
| `weather.lh_burn_feasibility_checked` | User attempts to start burn |
| `weather.burn_allowed` | Weather + time permit |
| `weather.burn_blocked` | Weather/time prevents |
| `weather.emergency_override_unlocked` | User types override phrase |
| `lh.burn_completed_under_emergency` | Emergency burn completed |

---

## 📊 Summary Table: Phase 20 Logics

| # | Logic | Domain | Mandate |
|---|---|---|---|
| Arch | Event Sourcing (CQRS) | vows-merit | NO DELETE/UPDATE on karma |
| 1 | Recitation Economy Segregation | wisdom-qa, content | 2 separate counters, no transfer |
| 2 | Location-Bound Vow Fulfillment | vows-merit, altar-management | Vow return at exact GPS location |
| 3 | Vegetarian Vow Rescheduler | calendar, vows-merit | Pledge recitation before reschedule |
| 4 | Birthday Longevity Trigger | identity, notifications | Auto-remind 7 days pre-birthday |
| 5 | Proxy Name Card Generator | life-liberation | Full-screen card, lock other UI |
| 6 | Sacred Object Damage Protocol | wisdom-qa | Emergency Repentance prescription |
| 7 | Invalidation Prayer Lock | engagement | Prayer before DB invalidation |
| 8 | Zen-Pure Land Syncretism | content | Two e-reader tabs by emotional state |
| 9 | Totem Hotline Schedule Guard | contact, calendar | Sydney timezone-based button state |
| 10 | Extreme Weather Override | engagement, weather | Typed phrase unlock for ICU/creditor |

---

## 🎯 Implementation Priority

1. **CRITICAL (Week 1):** Event Sourcing architecture + Logic 1 (Segregation)
2. **HIGH (Week 2):** Logics 2, 3, 4 (Vow, Vegetarian, Birthday)
3. **HIGH (Week 3):** Logics 5, 6, 7 (Proxy, Damage, Invalidation)
4. **MEDIUM (Week 4):** Logics 8, 9, 10 (Content, Hotline, Weather)

---

## 🔗 Related Documentation

- `design/01-contracts/` — Schema updates for event sourcing
- `.claude/agents/` — PMTL-specific subagent roles
- `CLAUDE.md` — Execution rules and verification mapping
- `design/03-domains/` — Individual domain logic files (Phases 16-19)

---

**Status:** Ready for implementation
**Last Updated:** 2026-04-04
**Reviewed by:** PMTL Architecture Council
