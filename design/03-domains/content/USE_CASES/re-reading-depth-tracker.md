# Theo Dõi Độ Sâu Đọc Lại — Re-reading Depth Tracker

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Đọc lại bài BHFF nhiều lần giúp user thấm nhuần ở tầng năng lượng sâu hơn mỗi lần. Hệ thống theo dõi số lần đọc, trao huy hiệu đặc biệt ở các mốc 1, 3, 7, 21, 108 lần, và gợi ý đọc lại khi quá 30 ngày chưa trở lại bài.

---

## Owner module

`content` — BHFFService / DepthMetrics
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — đọc/đọc lại bài BHFF
- `system` — log read events, award badges, gợi ý re-reading

---

## Trigger

1. User hoàn thành bài viết BHFF (≥ 30% thời gian đọc — xem anti-skimming-merit-guard)
2. Cron daily: scan bài đọc > 30 ngày trước, gợi ý user đọc lại

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User hoàn thành bài (≥30% read time) | ✅ Log read event, increment readCount |
| readCount đạt mốc badge | 🏆 Award depth badge |
| Mốc 1 | Huy hiệu "Gieo Duyên" 🌱 |
| Mốc 3 | Huy hiệu "Minh Lý" 💡 |
| Mốc 7 | Huy hiệu "Phá Ngã" 🔥 |
| Mốc 21 | Huy hiệu "Giác Ngộ" ⭐ |
| Mốc 108 | Huy hiệu "Phật Tâm" 🪷 |
| > 30 ngày kể từ lần đọc cuối | 💡 Gợi ý đọc lại bài này |

---

## Input Contract

```typescript
interface ArticleReadEvent {
  userId: string
  articleId: string
  readAt: Date
  elapsedMinutes: number
  wasQualified: boolean  // true nếu ≥ 30% reading time
}

enum DepthBadge {
  SEED_PLANTING = 1,     // Gieo Duyên
  UNDERSTANDING = 3,     // Minh Lý
  EGO_DISSOLUTION = 7,   // Phá Ngã
  ENLIGHTENMENT = 21,    // Giác Ngộ
  BUDDHA_MIND = 108      // Phật Tâm
}

interface ArticleReadHistory {
  userId: string
  articleId: string
  readCount: number
  lastReadAt: Date
  earnedBadges: DepthBadge[]
  nextBadge: DepthBadge | null
}
```

---

## Write Path

```
POST /api/content/bhff/:articleId/complete (triggered after ≥30% time)
1. Upsert ArticleReadHistory:
   → readCount += 1
   → lastReadAt = now()
2. Check badge milestones:
   → If readCount in [1, 3, 7, 21, 108]:
      Insert UserBadge { badgeType: DepthBadge[readCount], articleId, earnedAt: now() }
      Send push notification: "🏆 Huy Hiệu Mới: [BadgeName]"
3. Audit: bhff.read_event_logged, bhff.depth_badge_earned (if applicable)

CRON daily 08:00 → re-reading suggestions
1. SELECT userId, articleId WHERE lastReadAt < now()-30days AND readCount < 108
2. Per user: send push suggestion (max 1 per day)
```

---

## FE Behavior — Badge Display in Library

```
Thư Viện:

[Tôi Bị Trầm Cảm...]
Đã đọc: 1 tháng trước
Lần đọc: 1 🌱 (Huy hiệu Gieo Duyên)

─────────────────────────────────────

💡 GỢI Ý TỪ HỆ THỐNG:

Bạn đã đọc bài này 1 tháng trước.
Hệ thống khuyến nghị đọc lại để
lĩnh hội tầng năng lượng sâu hơn.

Tiến độ đến Huy Hiệu "Minh Lý":
1/3 lần đọc ██░░ 33%

[Đọc Lại Ngay]
```

---

## FE Behavior — Badge Earned Notification

```
🏆 HUY HIỆU MỚI!

"Minh Lý" 💡

Bạn đã đọc bài
[Tôi Bị Trầm Cảm Vì Công Việc]
3 lần.

Tầng nhận thức của bạn đang
thăng hoa!

Tiến độ tiếp theo → "Phá Ngã" (7 lần)
4/7 lần đọc ████░░░ 57%

[Xem Huy Hiệu]  [Đọc Tiếp]
```

---

## Schema Notes

```prisma
model ArticleReadHistory {
  id          String   @id @default(cuid())
  userId      String
  articleId   String
  readCount   Int      @default(0)
  lastReadAt  DateTime @updatedAt
  createdAt   DateTime @default(now())

  @@unique([userId, articleId])
  @@index([userId, lastReadAt])
}

model UserDepthBadge {
  id          String   @id @default(cuid())
  userId      String
  articleId   String
  badgeType   Int      // 1 | 3 | 7 | 21 | 108
  earnedAt    DateTime @default(now())

  @@unique([userId, articleId, badgeType])
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `bhff.read_event_logged` | Article completed (≥30% time) |
| `bhff.read_count_incremented` | History updated |
| `bhff.depth_badge_earned` | Milestone 1/3/7/21/108 hit |
| `bhff.reread_suggested` | 30+ days since last read |

---

## Related

- [anti-skimming-merit-guard.md](./anti-skimming-merit-guard.md) — 30% reading time guard
- [bhff-reading-merit-transfer-engine.md](./bhff-reading-merit-transfer-engine.md) — merit transfer
