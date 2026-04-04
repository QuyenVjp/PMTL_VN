# Rào Chắn Thời Gian & Thời Tiết Khi Niệm Kinh — Recitation Time & Weather Guard

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Ba nhóm quy tắc cứng điều tiết **khi nào** người dùng được phép submit kinh và **cách tạm dừng an toàn**:

1. **Dead Zone Guard (Logic 4)** — Giờ 2:00–5:00 sáng: cấm tuyệt đối mọi loại kinh.
2. **Weather-Time Lock (Logic 5)** — Một số loại kinh cấm sau 22:00 hoặc khi trời dông/mưa to.
3. **Pause/Resume Algorithm (Logic 6)** — Khi đang niệm dài bị ngắt, phải niệm "Ông Lai Mu Suo He" để tạm dừng và tiếp tục.

---

## Owner module

`vows-merit` (recitation guards, session state)
`calendar` (weather integration, time-zone awareness)
`notification` (push alerts khi gần dead zone)

---

## Part A — Absolute Dead Zone Guard (Logic 4)

### Business Rule

Từ **02:00:00 → 04:59:59** theo múi giờ của người dùng là giờ **âm khí vượng nhất**.
Tuyệt đối cấm submit bất kỳ kinh văn nào trong khoảng này — kể cả Tâm Hương hay kinh ngắn.

### Scope

Áp dụng cho **tất cả** `POST /api/vows-merit/recitation-logs` và các endpoint tương đương.

### Write Path

```
Guard: RecitationDeadZoneGuard (NestJS CanActivate)
─────────────────────────────────────────────────
1. Extract user timezone từ JWT claim `tz` (VD: "Asia/Ho_Chi_Minh").
   - Fallback: "Asia/Ho_Chi_Minh" nếu thiếu.
2. Lấy currentLocalTime = toZonedTime(now(), userTimezone).
3. Nếu currentLocalTime.hour ∈ [2, 3, 4]:
   throw ForbiddenException({
     error:   "recitation_dead_zone",
     message: "Giờ âm khí vượng (2:00–5:00 sáng). Tuyệt đối không niệm kinh vào lúc này.",
     severity: "SPIRITUAL_BLOCK",
     retryAfter: "05:00"
   })
4. Nếu không → pass through.
```

### FE Behavior

- Nút [Bắt đầu niệm] / [Lưu kinh] bị **disabled hoàn toàn** từ 02:00–04:59 giờ địa phương.
- Hiện banner đỏ: `"Giờ âm khí vượng (2–5 giờ sáng). Hệ thống tạm khóa để bảo vệ bạn."`
- Hiện countdown đến 05:00.
- Push Notification proactive 10 phút trước 02:00 (Phase 2+): `"Nếu bạn đang niệm kinh, hãy kết thúc trước 2 giờ sáng."`.

### Errors

| Condition | Code | HTTP |
|---|---|---|
| Giờ [02:00–04:59] local | `recitation_dead_zone` | 403 |

---

## Part B — Weather-Time Lock by Sutra Type (Logic 5)

### Business Rule

Một số loại kinh có **năng lượng âm** cao hơn, cần ràng buộc thêm ngoài dead zone:

| Loại kinh | Cấm sau | Cấm khi thời tiết |
|---|---|---|
| `TAM_KINH` (Tâm Kinh / Heart Sutra) | 22:00 | Dông bão / mưa to |
| `VANG_SINH_CHU` (Vãng Sinh Chú) | 22:00 | Dông bão / mưa to |
| `LE_PHAT_DAI_SAM_HOI_VAN` (Lễ Phật Đại Sám Hối Văn) | 22:00 (đến 5:00 AM) | Dông bão / mưa to |

> Các loại kinh khác (CHU_DAI_BI, 10 Tiểu Chú) chỉ áp dụng Dead Zone ở Part A.

### Weather Integration

- Module: `calendar` gọi **OpenWeatherMap API** (One Call 3.0).
- Weather condition codes bị block: `200–232` (Thunderstorm), `502–504` (Heavy/Very Heavy Rain), `522` (Heavy Shower).
- Cache kết quả 15 phút per user-location để tránh over-call.
- `WeatherContext` được truyền vào `RecitationGuard` qua DI.

### Write Path

```
Guard: RecitationWeatherTimeGuard (áp sau DeadZoneGuard)
─────────────────────────────────────────────────────────
1. Đọc sutraType từ request body.
2. Nếu sutraType ∉ WEATHER_TIME_RESTRICTED_SUTRAS → pass through.
3. Kiểm tra time:
   - currentLocalHour >= 22 OR currentLocalHour < 5 (cho LE_PHAT_DAI_SAM_HOI_VAN)
   - currentLocalHour >= 22 (cho TAM_KINH, VANG_SINH_CHU)
   → throw 403 recitation_after_hours
4. Lấy weatherContext = await WeatherService.getCurrentCondition(userLocation):
   - userLocation từ profile hoặc IP geolocation.
   - Nếu weatherCode ∈ BLOCKED_CODES:
     → throw 403 recitation_weather_block
5. Pass through nếu không vi phạm.
```

### FE Behavior

- Hiển thị realtime weather indicator khi user ở màn hình niệm kinh.
- Khi `sutraType` thuộc restricted list + thời gian gần 22:00: hiện banner vàng cảnh báo sớm 15 phút.
- Nếu đang dông: overlay đỏ phủ nút Submit kèm icon sấm sét + text: `"Trời đang dông, không được niệm [Tên kinh]. Vui lòng chờ trời yên."`.

### Errors

| Condition | Code | HTTP |
|---|---|---|
| Quá 22:00 local (restricted sutra) | `recitation_after_hours` | 403 |
| Weather = Thunderstorm/Heavy Rain | `recitation_weather_block` | 403 |

---

## Part C — Pause/Resume Algorithm (Logic 6)

### Business Rule

Khi đang niệm kinh dài (ChantingSession) và bị gián đoạn (cuộc gọi, việc khẩn), phải niệm câu **"Ông Lai Mu Suo He"** (1 lần) để thông báo với Bồ Tát tạm dừng, và niệm lại 1 lần khi muốn tiếp tục.

Không tạm dừng đúng cách = năng lượng bị bỏ lửng, không thành tâm.

### Actors

- `member` — đang trong ChantingSession trên ứng dụng

### Trigger

User bấm nút **[Tạm Dừng]** hoặc ứng dụng detect cuộc gọi đến (Phase 2+).

### Session State Machine

```
ACTIVE ──[user bấm Pause]──▶ PAUSED_PENDING_CONFIRM
PAUSED_PENDING_CONFIRM ──[user bấm "Đã Niệm"]──▶ PAUSED
PAUSED ──[user bấm Resume]──▶ RESUME_PENDING_CONFIRM
RESUME_PENDING_CONFIRM ──[user bấm "Đã Niệm"]──▶ ACTIVE
ACTIVE / PAUSED ──[user bấm Kết thúc]──▶ COMPLETED
```

### Write Path — Pause

```
POST /api/vows-merit/chanting-sessions/:id/pause
──────────────────────────────────────────────────
1. Validate session owned by actor, status = ACTIVE.
2. Set status = PAUSED_PENDING_CONFIRM.
3. Return payload cho FE render màn hình xác nhận:
   {
     instruction: "Hãy niệm: ÔNG LAI MU SUO HE — 1 lần",
     phonetic:    "Ong Lai Mu Suo He",
     confirmEndpoint: "/chanting-sessions/:id/pause-confirm"
   }

POST /api/vows-merit/chanting-sessions/:id/pause-confirm
1. Validate status = PAUSED_PENDING_CONFIRM.
2. Set status = PAUSED, pausedAt = now().
3. Audit: chanting.session.paused.
```

### Write Path — Resume

```
POST /api/vows-merit/chanting-sessions/:id/resume
──────────────────────────────────────────────────
1. Validate session owned by actor, status = PAUSED.
2. Set status = RESUME_PENDING_CONFIRM.
3. Return payload:
   {
     instruction: "Hãy niệm: ÔNG LAI MU SUO HE — 1 lần trước khi tiếp tục",
     phonetic:    "Ong Lai Mu Suo He",
     confirmEndpoint: "/chanting-sessions/:id/resume-confirm"
   }

POST /api/vows-merit/chanting-sessions/:id/resume-confirm
1. Validate status = RESUME_PENDING_CONFIRM.
2. Set status = ACTIVE, resumedAt = now().
3. Tính totalPausedMinutes += (resumedAt - pausedAt).
4. Audit: chanting.session.resumed.
```

### FE Behavior

- Nút [Tạm Dừng] luôn hiện trong màn hình đọc kinh văn.
- Khi bấm Pause: màn hình phủ mờ (backdrop), hiện khung lớn nền trắng viền vàng:
  ```
  ┌────────────────────────────────────┐
  │  Trước khi tạm dừng, hãy niệm:    │
  │                                    │
  │  ÔNG LAI MU SUO HE                │
  │  (Ong Lai Mu Suo He) — 1 lần      │
  │                                    │
  │         [Đã Niệm — Tạm Dừng]      │
  └────────────────────────────────────┘
  ```
- Text kinh văn bị **ẩn hoàn toàn** cho đến khi confirm Resume.
- Không thể skip modal bằng cách nhấn ra ngoài.

### Schema Notes

```prisma
model ChantingSession {
  // ... existing fields ...
  status              ChantingSessionStatus
  pausedAt            DateTime?
  resumedAt           DateTime?
  totalPausedMinutes  Int       @default(0)
}

enum ChantingSessionStatus {
  ACTIVE
  PAUSED_PENDING_CONFIRM
  PAUSED
  RESUME_PENDING_CONFIRM
  COMPLETED
  ABANDONED
}
```

### Errors

| Condition | Code | HTTP |
|---|---|---|
| Session không phải ACTIVE khi Pause | `invalid_session_state` | 409 |
| Session không phải PAUSED khi Resume | `invalid_session_state` | 409 |
| Session không thuộc actor | `forbidden` | 403 |

### Audit

| Action | Trigger |
|---|---|
| `chanting.session.pause.initiated` | User bấm [Tạm Dừng] |
| `chanting.session.paused` | User confirm đã niệm |
| `chanting.session.resume.initiated` | User bấm [Tiếp tục] |
| `chanting.session.resumed` | User confirm đã niệm |

---

## Notes for AI/codegen

- `RecitationDeadZoneGuard` phải dùng `date-fns-tz` hoặc `luxon` để convert time theo user timezone. Không dùng `new Date()` bare — sẽ sai múi giờ server.
- `WeatherService` cache theo `(userId + date + hour)` key để tránh gọi OpenWeather per request.
- Pause/Resume state machine nên có timeout: nếu session ở `PAUSED` quá 2 giờ → auto-complete với trạng thái `ABANDONED`.
- Ba guard nên là NestJS Guards riêng biệt, thứ tự áp dụng: `DeadZoneGuard` → `WeatherTimeGuard` → `SessionStateGuard`.

---

## Related

- [daily-recitation-system.md](../../wisdom-qa/USE_CASES/daily-recitation-system.md) — Sutra catalog và overview workflow
- [validate-altar-oil-and-water.md](./validate-altar-oil-and-water.md) — Các validation khác tại bàn thờ
