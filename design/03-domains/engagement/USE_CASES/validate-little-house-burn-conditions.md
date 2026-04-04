# Kiểm Tra Điều Kiện Đốt Tiểu Phương Tử — Validate Little House Burn Conditions

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Nghi thức đốt Ngôi Nhà Nhỏ
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Trước khi user được phép kích hoạt luồng đốt Tiểu Phương Tử (NNN), hệ thống kiểm tra
**thời gian** và **thời tiết** để hiển thị advisory hoặc block phù hợp.

Khác với `self-cultivation-sutras-burn-flow.md` (áp dụng cho tờ Tự Tu Lễ Phật),
use-case này áp dụng riêng cho **Tiểu Phương Tử (Little House / NNN sheets)** —
đối tượng người nhận, nghi thức, và safety gate khác nhau.

**Khung giờ đẹp nhất (Golden Time):** 8:00, 10:00, 16:00.
**Hard block:** sau sunset hoặc trước sunrise, trừ `isEmergency = true`.

---

## Owner module

`engagement` — [xem CONTRACTS.md](../CONTRACTS.md)
Thời tiết lấy từ external Weather API, được cache 30 phút.

---

## Actors

- `member` — khởi động luồng đốt
- `system` — kiểm tra điều kiện và quyết định gate outcome

---

## Trigger

User bấm **[Bắt đầu nghi thức đốt]** từ màn hình Ngôi Nhà Nhỏ tracker, sau khi sheet đã ở trạng thái `CHANTED`.

---

## Preconditions

- Có session hợp lệ.
- Sheet phải ở trạng thái `CHANTED` (không thể đốt sheet ở `DRAFT` hoặc `SIGNED`).
- Sheet phải có đầy đủ `recipientName` và `donorName`.

---

## Input contract

```
{
  sheetId:       string    // publicId của LittleHouseSheet
  isEmergency?:  boolean   // true = bỏ qua hard block thời gian/thời tiết
  userLat?:      number    // tọa độ để lấy sunrise/sunset chính xác
  userLon?:      number
}
```

---

## Read set

- session + actor role
- `LittleHouseSheet` record (validate status = `CHANTED` và ownership)
- Thời gian hiện tại theo timezone của user (hoặc Vietnam default `Asia/Ho_Chi_Minh`)
- Sunrise/sunset time cho ngày hôm nay (từ API hoặc precalculated)
- Weather condition (từ Weather API cache, optional — advisory only)

---

## Write path — Validation Guard (multi-gate)

### Gate 1: Sheet State Check

1. Load `LittleHouseSheet` theo `sheetId`.
2. Verify `sheet.userId = actorUserId` (hoặc admin).
3. Verify `sheet.status = "CHANTED"`. Nếu không → `400 precondition_not_met`.
4. Verify `recipientName` và `donorName` đều có giá trị. Nếu thiếu → `400 incomplete_sheet`.

### Gate 2: Time Validation (HARD BLOCK)

5. Lấy thời gian hiện tại và so sánh với `sunriseTime` / `sunsetTime`:
   ```
   isNightTime = currentTime < sunriseTime OR currentTime > sunsetTime
   ```
6. Nếu `isNightTime = true` và `isEmergency = false`:
   - **HARD BLOCK** — trả về `403 burn_time_restricted` với message:
     *"Hiện tại là ban đêm. Theo hướng dẫn pháp môn, không nên đốt Tiểu Phương Tử ban đêm trừ khi là ca cấp cứu bệnh hiểm nghèo."*
   - Gợi ý khung giờ gần nhất: 8:00 sáng hôm sau.
7. Nếu `isEmergency = true`: bỏ qua gate này, ghi log `emergencyBurnOverride = true`.

### Gate 3: Golden Time Advisory (SOFT — không block)

8. Kiểm tra khung giờ hiện tại có gần Golden Time không:
   ```
   goldenWindows = ["08:00-08:30", "10:00-10:30", "16:00-16:30"]
   isGoldenTime = currentTime falls in any goldenWindow
   ```
9. Nếu ngoài Golden Time nhưng vẫn là ban ngày:
   - Hiển thị **advisory card màu vàng** (không block): *"Khung giờ đẹp nhất để đốt là 8:00, 10:00 và 16:00. Bạn vẫn có thể tiến hành nếu muốn."*

### Gate 4: Weather Check (ADVISORY — không block)

10. Gọi Weather API (cache 30 phút). Nếu API timeout/fail → bỏ qua gate này, không delay luồng.
11. Nếu weather = `Rain` | `Thunderstorm` | `Drizzle`:
    - Hiển thị **advisory card màu cam**: *"Thời tiết hiện tại có mưa. Khuyến nghị đợi thời tiết khô ráo để đốt được thuận lợi."*
    - Không block — user bấm [Xác nhận tiếp tục] để proceed.

### Gate 5: Burn Confirmation Modal

12. Sau khi qua tất cả gates, render **Burn Confirmation Modal** 4 bước:
    - **Bước 1:** Xác nhận người nhận và người tặng trên tờ.
    - **Bước 2:** Thắp hương / Tâm Hương (tùy `hasAltar`).
    - **Bước 3:** Đọc lời khấn cầu xin Bồ Tát chứng minh.
    - **Bước 4:** `[ ] Tôi xác nhận đã đốt tờ Ngôi Nhà Nhỏ hoàn toàn`
13. Khi user tích checkbox và bấm **[Xác nhận Đã Đốt]**:
    - Cập nhật `LittleHouseSheet.status = "BURNED"`.
    - Ghi `burnDate = now()`, `burnConditions = { isEmergency, weatherAdvisory, goldenTimeAdvisory }`.
    - Bắt user chọn phương án xử lý tro (required để đóng phiên).
14. Audit `engagement.little-house.burned`.

---

## hasAltar Branching (Tâm Hương)

Nếu user profile có `hasAltar = false`:
- Bước 2 của Burn Modal thay thành: **luồng Tâm Hương** gồm:
  1. Niệm 7 biến *Tịnh Khẩu Nghiệp Chân Ngôn*.
  2. Quán tưởng thắp hương trong tâm.
  3. Niệm 1 biến *Chú Đại Bi* + 1 biến *Tâm Kinh* (bảo vệ năng lượng trước khi đốt).
- Cảnh báo inline: *"Toàn bộ quá trình Tâm Hương chỉ dùng ý niệm. Tuyệt đối không làm các động tác tay chân giả vờ cắm hương hay lạy thật xuống đất."*

---

## Async side-effects

- Nếu user dùng `isEmergency = true` nhiều hơn 3 lần trong 30 ngày → flag để admin review (không block, chỉ flag).
- **Phase 2+:** Outbox event `engagement.little-house.burned` → `vows-merit` cập nhật vow progress nếu có `linkedVowId`.

---

## Success result

- `LittleHouseSheet` chuyển sang `BURNED` với đầy đủ metadata điều kiện đốt.
- User nhận xác nhận và hướng dẫn xử lý tro.

---

## Errors

| Condition | Error code | HTTP | Recovery |
|---|---|---|---|
| Sheet không ở trạng thái `CHANTED` | `precondition_not_met` | 400 | Hoàn thành niệm kinh trước |
| Sheet thiếu `recipientName` / `donorName` | `incomplete_sheet` | 400 | Điền đầy đủ thông tin tờ |
| Đang ban đêm, không có `isEmergency` | `burn_time_restricted` | 403 | Đợi đến 8:00 sáng |
| Sheet không thuộc actor | `forbidden` | 403 | — |
| Sheet không tồn tại | `not_found` | 404 | — |
| Chưa đăng nhập | `unauthorized` | 401 | — |

---

## Audit

| Action | Actor | Trigger |
|---|---|---|
| `engagement.little-house.burn-gate.passed` | actorUserId | Vượt qua tất cả gates |
| `engagement.little-house.burn-gate.blocked` | actorUserId | Bị hard block do ban đêm |
| `engagement.little-house.burned` | actorUserId | Xác nhận đốt hoàn tất |
| `engagement.little-house.emergency-burn` | actorUserId | `isEmergency = true` được dùng |

---

## Rate-limit requirement

- Không có rate limit trên burn flow — người dùng có thể đốt nhiều tờ liên tiếp.
- Flag `isEmergency` bị theo dõi aggregate (xem Async side-effects).

---

## Outbox event

- Event type: `engagement.little-house.burned`
- Subscriber: `vows-merit` (vow progress update)
- Mode: sync-inline (Phase 1), outbox-required (Phase 2+)

---

## Recovery path

- Nếu sheet bị kẹt ở `CHANTED` sau khi user báo đã đốt (app crash): Admin có thể manual set `BURNED` qua admin panel.
- Nếu Weather API không phản hồi: Gate 4 bị skip hoàn toàn, luồng không bị chặn.

---

## Notes for AI/codegen

- **Hard block ban đêm** áp dụng cho Little House. Khác với Life Release (chỉ advisory). Đây là sự khác biệt nghiệp vụ quan trọng.
- Sunrise/sunset time nên được pre-calculated cho timezone `Asia/Ho_Chi_Minh` và cache hàng ngày, không gọi API mỗi request.
- Weather API call phải có timeout 2s và circuit breaker — nếu fail thì skip, không throw error.
- `hasAltar` field nằm trên `UserProfile` — engagement module đọc qua user service, không duplicate field.
- Tâm Hương warning ("Tuyệt đối không làm các động tác tay chân giả vờ") phải hiển thị là **static inline text**, không phải dismissible — quy tắc cứng của pháp môn.
- Post-burn ash disposal options nằm trong Content CMS (BeginnerGuide category `POST_BURN`), không hardcode trong service.
