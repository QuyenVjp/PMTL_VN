# Bổ Khuyết Chân Ngôn Chỉ Ở Cuối Session — End-Only Perfection Mantra
> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Phase 47)
> **Trạng thái:** Hidden state + unlock gate
> **Cập nhật:** 2026-04-06

## Purpose
Bài chú *Bổ Khuyết Chân Ngôn* dùng để bù đắp các lỗi phát âm sai sót. Tuy nhiên, **KHÔNG CẦN THIẾT** phải niệm bài này sau mỗi một loại Kinh văn. Nó chỉ được niệm từ 3 đến 7 biến **VÀO THỜI ĐIỂM SAU KHI ĐÃ NIỆM XONG TOÀN BỘ** khóa biểu Kinh văn của ngày hôm đó.

## Owner module
`wisdom-qa` — daily recitation completion flow

## Actors
- User (người tụng kinh)
- System (state machine)
- UI (hidden/revealed state)

## Trigger
User hoàn thành tất cả các bài Kinh của ngày (mark all as done)

## Business Rules

| Rule | Detail |
|------|--------|
| Hidden by Default | Bài Bổ Khuyết bị hidden (không hiển thị) suốt quá trình tụng |
| Unlock Condition | Chỉ unlock khi user đã HOÀN THÀNH TẤT CẢ các bài Kinh khác |
| Repetition Count | 3 đến 7 biến (user chọn) |
| Timing | Tụng vào cuối cùng, sau khi đã complete toàn bộ khóa |
| Optional | Không bắt buộc, nhưng khuyến khích |

## Input Contract

```typescript
enum PerfectionMantraCount {
  THREE = 3,
  FIVE = 5,
  SEVEN = 7,
}

interface DailyRecitationSessionDto {
  userId: string;
  sessionDate: Date;
  allRecitationsCompleted: boolean;
}

interface PerfectionMantraUnlockDto {
  sessionId: string;
  isUnlocked: boolean;
  recommendedCount: PerfectionMantraCount;
}

interface PerfectionMantraSubmissionDto {
  sessionId: string;
  count: PerfectionMantraCount;
  recitedAt: Date;
}
```

## Write Path

```
POST /wisdom-qa/daily-recitation/mark-complete
  Input: DailyRecitationSessionDto (with allRecitationsCompleted = true)

  1. Mark session: status = "COMPLETED"
  2. Unlock Bổ Khuyết section:
     - Hidden = false
     - Show modal: "Bạn đã hoàn thành tất cả Kinh văn! Giờ có thể tụng Bổ Khuyết Chân Ngôn (3-7 biến) để bù đắp lỗi phát âm."
  3. Display selection: [3 biến] [5 biến] [7 biến]
  4. Return: { unlockedPerfectionMantra: true }

POST /wisdom-qa/perfection-mantra/recite
  Input: PerfectionMantraSubmissionDto
  → Log audit
  → Mark session: perfectionMantraRecited = true, count = X
```

## FE Behavior

```
[Daily Recitation Session]

Các bài Kinh hôm nay:
☑ Tâm Kinh
☑ Đại Bi Chú
☑ Vãng Sanh Chú
☑ Sám Hối Văn

[Tất cả đã hoàn thành ✓]

  ↓ Click [Hoàn Thành Session] ↓

[🎉 Hoàn Thành! ]
[Modal]
┌──────────────────────────────┐
│ Bạn đã hoàn thành tất cả     │
│ Kinh văn hôm nay!            │
│                              │
│ Bây giờ có thể tụng Bổ      │
│ Khuyết Chân Ngôn (tùy chọn):│
│                              │
│ Bổ khuyết bao nhiêu biến?   │
│ [ ] 3 biến                  │
│ [ ] 5 biến                  │
│ [ ] 7 biến                  │
│ [Không tụng] [Chọn]         │
└──────────────────────────────┘
```

## Schema Notes

```prisma
model DailyRecitationSession {
  id                          String   @id @default(cuid())
  userId                      String
  sessionDate                 Date
  status                      String  // "IN_PROGRESS", "COMPLETED"
  allRecitationsCompleted     Boolean @default(false)
  perfectionMantraUnlocked    Boolean @default(false)
  perfectionMantraCount       Int?    // 3, 5, or 7
  perfectionMantraRecitedAt   DateTime?
  createdAt                   DateTime @default(now())
  updatedAt                   DateTime @updatedAt
}
```

## Audit
Log khi: session hoàn thành, mantra unlock, mantra recited

## Error Codes

| Code | Message |
|------|---------|
| MANTRA_NOT_UNLOCKED | Bổ Khuyết Chân Ngôn chưa unlock. Hãy hoàn thành tất cả Kinh văn trước. |

## Notes
- Bài này là "cải lành" sau khi tụng hoàn chỉnh, không cần thiết nhưng khuyến khích
- Mục đích là avoid lặp lại bài này sau mỗi Kinh (gây khó chịu)

## Related
- `wisdom-qa/daily-recitation-system.md` — main recitation tracker
- `wisdom-qa/non-fungible-repentance-rule.md` — repentance mantra rules
