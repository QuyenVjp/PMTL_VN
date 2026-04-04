# Chế Độ Trợ Niệm Lâm Chung 8 Giờ — Deathbed Lockdown Protocol

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi người thân vừa qua đời, 8 giờ đầu là cực kỳ quan trọng. Bất kỳ tiếng khóc, sờ mó thi thể, hay khuấy động nào đều đẩy linh hồn xuống cõi thấp hơn. Hệ thống kích hoạt **chế độ trợ niệm khóa toàn màn hình**, tắt mọi notification, và hiển thị cảnh báo liên tục trong 8 giờ.

---

## Owner module

`engagement` — EndOfLifeService / DeathbedProtocol
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người kích hoạt chế độ lâm chung (thường là thân nhân)
- `system` — khóa UI, tắt notification, đếm ngược 8 giờ

---

## Trigger

Khi user bấm `[Kích Hoạt Chế Độ Lâm Chung]` trong emergency panel.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User kích hoạt `[Chế độ Lâm Chung]` | ✅ Vào lockdown mode |
| Lockdown activated | 🔇 Tắt TẤT CẢ notification |
| Lockdown mode | 📍 Giản lược UI → chỉ còn counter tụng niệm |
| 8 giờ trôi qua | ⏰ Tự động thoát, trở về normal mode |
| User thoát thủ công | ✅ Confirm exit + log session |

---

## Input Contract

```typescript
interface DeathbedActivateDto {
  deceasedName: string
  deceasedRelation: string  // "Mẹ" | "Cha" | "Con" | "Vợ/Chồng"
  mantraChoice: 'VANG_SANH' | 'QUAN_THE_AM' | 'DIA_TANG'
}
```

---

## Write Path

```
POST /api/engagement/deathbed/activate
1. Validate deceasedName không trống
2. Create DeathbedSession:
   - activatedAt = now()
   - expiresAt = now() + 8 hours
   - status = ACTIVE
3. Mute all notifications for userId (flag on UserPreferences)
4. Return: { sessionId, expiresAt, mantraAudioUrl }

POST /api/engagement/deathbed/:sessionId/increment
1. Validate session ACTIVE + not expired
2. INCREMENT recitationCount
3. Return: { count, remainingSeconds }

POST /api/engagement/deathbed/:sessionId/exit
1. UPDATE status = MANUAL_EXIT, exitedAt = now()
2. Restore notification settings
3. Return: { sessionSummary }

CRON: check sessions WHERE expiresAt <= now() AND status = ACTIVE
→ Auto-complete: status = COMPLETED
→ Restore notifications
```

---

## FE Behavior

```
════════════════════════════════════════
           🙏 TRỢ NIỆM LÂM CHUNG 🙏
════════════════════════════════════════

              BẠN ĐÃ KHẤN:
      "Namo Đại Từ Đại Bi Quán
          Thế Âm Bồ Tát"

════════════════════════════════════════

         Lần Niệm: [███████░░░] 847

════════════════════════════════════════

🚨 BÁO ĐỘNG ĐỎ 🚨

┌─────────────────────────────────────┐
│ TUYỆT ĐỐI KHÔNG KHÓC LÓC           │
│ KHÔNG ĐỤNG CHẠM VÀO THI THỂ        │
│ KHÔNG DI CHUYỂN GIƯỜNG CHIẾU        │
│ GIỮ BÌNH TĨNH & NIỆM LIÊN TỤC      │
└─────────────────────────────────────┘

        Thời gian còn lại:
         07:12:34 (hh:mm:ss)

Audio: [🔊 Chú Vãng Sanh Lặp Lại]

[Thoát Chế Độ Này]  ← small, requires confirm
════════════════════════════════════════
```

---

## Schema Notes

```prisma
model DeathbedSession {
  id               String   @id @default(cuid())
  userId           String
  deceasedName     String
  deceasedRelation String
  activatedAt      DateTime @default(now())
  expiresAt        DateTime // + 8 hours
  recitationCount  Int      @default(0)
  mantraPlayed     String   @default("VANG_SANH")
  status           String   @default("ACTIVE") // ACTIVE | COMPLETED | MANUAL_EXIT
  exitedAt         DateTime?
  // Migration: CREATE TABLE "DeathbedSession" (...)
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `deathbed.mode_activated` | User click emergency button |
| `deathbed.8h_lockdown_started` | Session created |
| `deathbed.notifications_muted` | Alerts silenced |
| `deathbed.recitation_counted` | Counter increment |
| `deathbed.8h_expired` | Auto-exit |
| `deathbed.mode_exited` | Session logged |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| deceasedName trống | `deceased_name_required` | 422 |
| Session expired | `deathbed_session_expired` | 410 |

---

## Related

- [88-buddhas-overnight-deadzone.md](../../wisdom-qa/USE_CASES/88-buddhas-overnight-deadzone.md) — overnight deadzone liên quan
- [yin-time-deadzone-2-5am.md](../../calendar/USE_CASES/yin-time-deadzone-2-5am.md) — yin time restrictions
