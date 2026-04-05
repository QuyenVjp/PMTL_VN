# Khóa Công Đức Khi Khuyên Đạo Liên Tục — Convincing Form 7-Day Cooldown Lock
> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Phase 47 - Strict enforcement
> **Cập nhật:** 2026-04-06

## Purpose
Khi làm Thăng Văn Khuyến Đạo cho người nhà không tin Phật mỗi ngày liên tục trong 1 tháng (30 ngày), công đức của người tu sẽ bị hút cạn và tặng hết cho đối phương. BẮT BUỘC PHẢI NGƯNG LẠI 1 TUẦN để bảo vệ công đức bản thân.

## Owner module
`engagement` — tracking khuyên đạo streak và cooldown enforcement

## Actors
- User (người khuyên đạo)
- System (rate limiter + countdown)
- Target beneficiary (người được khuyên đạo)

## Trigger
Khi User báo cáo hoàn thành Thăng Văn Khuyến Đạo (bấm `[Báo cáo đã làm Thăng Văn]`) cho cùng một `Target_ID`, streak tính đến 30 ngày liên tục.

## Business Rules

| Rule | Detail |
|------|--------|
| Streak Tracking | Hệ thống đếm `ConvincingForm_Streak` cho mỗi cặp `(User, Target_ID)` |
| Trigger Cooldown | Khi `Streak == 30 days`, tự động activate `Cooldown_Lock` kéo dài 7 ngày |
| During Cooldown | Nút `[Báo cáo đã làm Thăng Văn]` bị **Disabled**, hiển thị đếm ngược |
| Other Recitations OK | Tụng Tâm Kinh, các bài khác vẫn có thể tiếp tục bình thường |
| Reset After 7 Days | Khi 7 ngày hết, streak reset = 0, cooldown unlock |

## Input Contract

```typescript
interface ConvincingFormSubmissionDto {
  userId: string;
  targetId: string;  // người được khuyên đạo
  completedDate: Date;
  meritAmount?: number;
}

interface ConvincingFormStreakCheckDto {
  userId: string;
  targetId: string;
}

interface ConvincingFormStreakResponseDto {
  currentStreak: number;  // 0-30
  isLockedByCooldown: boolean;
  cooldownRemainingDays?: number;  // nếu locked
  nextUnlockDate?: Date;
}
```

## Write Path (NestJS pseudocode)

```
POST /engagement/convincing-form/submit
  Input: ConvincingFormSubmissionDto

  1. Fetch current streak: SELECT streak FROM ConvincingFormStreak WHERE userId=$1 AND targetId=$2
  2. Check if cooldown active: IF cooldown_ends > NOW -> return 400 "Bạn đang trong khoảng thời gian bảo vệ công đức. Vui lòng chờ"
  3. If streak == 29: increment streak to 30, activate cooldown (cooldown_ends = NOW + 7 days)
  4. Else if streak < 29: increment streak by 1
  5. Log audit: INSERT INTO ConvincingFormAudit (userId, targetId, action, date)
  6. Return: { streak: 30, isLocked: true, cooldownDays: 7 }
```

## FE Behavior

```
[Khuyên Đạo "Tên Người"](button: Báo cáo đã làm Thăng Văn)
Streak: 🔥 29 / 30 ngày

[Nút Báo cáo] (Enabled, màu xanh)
  ↓ Click ↓
[Thành công! Bạn đã hoàn thành 30 ngày liên tục.]
[🚨 CẢNH BÁO: Hệ thống đang khóa Thăng Văn để bảo vệ công đức của bạn.]
[Countdown: 7 ngày 0 giờ]
[Nút Báo cáo] (Disabled, màu xám)
[Bạn vẫn có thể tiếp tục tụng Tâm Kinh cho người nhà!]
```

## Schema Notes

```prisma
model ConvincingFormStreak {
  id             String   @id @default(cuid())
  userId         String
  targetId       String
  currentStreak  Int      @default(0)
  cooldownEnds   DateTime?
  lastSubmitted  DateTime
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@unique([userId, targetId])
}

model ConvincingFormAudit {
  id        String   @id @default(cuid())
  userId    String
  targetId  String
  action    String  // "STREAK_INCREMENT", "COOLDOWN_ACTIVATED", "COOLDOWN_RESET"
  date      DateTime @default(now())
}
```

## Audit
Mỗi lần submit đều log: `ConvincingFormAudit.action` = "STREAK_INCREMENT" hoặc "COOLDOWN_ACTIVATED"

## Error Codes

| Code | Message |
|------|---------|
| CONVINCING_COOLDOWN_ACTIVE | Hệ thống đang khóa Thăng Văn để bảo vệ công đức của bạn. Vui lòng chờ đến {nextUnlockDate}. |
| CONVINCING_TARGET_NOT_FOUND | Người được khuyên đạo không tồn tại. |

## Notes
- Công đức bị hút cạn là một ràng buộc tinh thần, hệ thống chỉ enforce cooldown để bảo vệ.
- Người dùng CÓ THỂ tiếp tục khuyên đạo bằng cách khác (không qua hệ thống), nhưng hệ thống không theo dõi.

## Related
- `engagement/manage-ngoi-nha-nho-sheet.md` — merit tracking
- `wisdom-qa/prescribe-karmic-remedy.md` — beneficiary karma analysis
