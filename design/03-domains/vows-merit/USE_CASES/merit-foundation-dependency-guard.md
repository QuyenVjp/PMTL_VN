# Điều Kiện Nền Tảng Công Đức Cho Thần Chú Biến Hóa — Merit Foundation Dependency Guard

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 256, 258, 758, 759)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Các thần chú *Đại Kiết Tường Thiên Nữ Chú* (cầu hôn nhân/sự nghiệp) và *Công Đức Bảo Sơn Thần Chú* (chuyển hóa việc thiện thành công đức) chỉ linh nghiệm khi người niệm đã có nền tảng công đức từ trước. Người chưa từng phóng sinh, chưa độ người, chưa làm việc thiện mà niệm các chú này sẽ không đạt được hiệu quả như kỳ vọng — ví như gieo hạt trên đất đá không có màu mỡ.

---

## Owner module

`vows-merit` — MeritLedgerService / MantaPrerequisiteChecker
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — cấu hình thần chú vào thời khóa
- `system` — truy vấn MeritLedger, hiển thị cảnh báo nền tảng

---

## Trigger

Khi user thêm một trong các thần chú sau vào thời khóa:
- `GREAT_AUSPICIOUS_GODDESS_MANTRA` (Đại Kiết Tường Thiên Nữ Chú)
- `MERIT_MOUNTAIN_MANTRA` (Công Đức Bảo Sơn Thần Chú)

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| `meritScore >= MERIT_THRESHOLD` (đã phóng sinh, độ người, thiện nguyện) | ✅ ALLOWED — không cần warning |
| `meritScore < MERIT_THRESHOLD` VÀ `lifeReleaseCount == 0` VÀ `guidanceCount == 0` | ⚠️ SOFT WARNING — hiển thị advisory icon + tooltip |
| User dismiss advisory | ✅ ALLOWED — ghi nhận đã đọc cảnh báo |

---

## Input Contract

```typescript
interface AddMeritMantaDto {
  mantaType: 'GREAT_AUSPICIOUS_GODDESS_MANTRA' | 'MERIT_MOUNTAIN_MANTRA'
  userId: string
}

interface MeritSummary {
  totalMeritScore:   number
  lifeReleaseCount:  number   // số lần đã phóng sinh
  guidanceCount:     number   // số người đã độ/giới thiệu
  hasDonation:       boolean
}
```

---

## Write Path

```
POST /api/vows-merit/recitation-schedule/add-mantra

1. Load MeritSummary for userId from MeritLedger
2. If mantaType in [GREAT_AUSPICIOUS_GODDESS_MANTRA, MERIT_MOUNTAIN_MANTRA]:
   a. Check: totalMeritScore >= MERIT_THRESHOLD (config) OR lifeReleaseCount > 0 OR guidanceCount > 0
   b. If NONE satisfied → return 200 with { warnings: [{ code: 'merit_foundation_insufficient' }] }
   c. If satisfied → return 200 clean
3. Insert RecitationScheduleItem (không chặn nếu user đã dismiss)
```

---

## FE Behavior

```
Nút [Bắt đầu niệm] với icon cảnh báo khi merit thấp:

[▶ Bắt đầu niệm ⚠️]
           │
           ▼ Hover/tap vào ⚠️
┌────────────────────────────────────────────────────┐
│ ⚠️  Nền Tảng Công Đức                              │
│────────────────────────────────────────────────────│
│ Thần chú này yêu cầu nền tảng thiện nguyện.        │
│ Hồ sơ công đức của bạn hiện chưa ghi nhận:         │
│  • Phóng sinh                                      │
│  • Độ người / giới thiệu Phật Pháp                 │
│                                                    │
│ Niệm mà chưa có nền tảng có thể không đạt hiệu     │
│ quả như mong đợi. Hãy kết hợp với Phát Nguyện      │
│ và Phóng Sinh để tăng cường hiệu quả.              │
│                                                    │
│               [Tôi Đã Hiểu]                        │
└────────────────────────────────────────────────────┘
```

- Tooltip chỉ xuất hiện khi `meritFoundationInsufficient = true`
- Không block nút [Bắt đầu niệm]
- Sau khi user tap `[Tôi Đã Hiểu]`, icon ⚠️ biến mất trong session hiện tại

---

## Schema Notes

```prisma
model RecitationScheduleItem {
  // ... existing fields ...
  meritAdvisoryAck  Boolean  @default(false)
  // Migration: ALTER TABLE "RecitationScheduleItem" ADD COLUMN "meritAdvisoryAck" BOOLEAN DEFAULT FALSE
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `mantra.merit.foundation_advisory_shown` | User có merit thấp thêm các chú này |
| `mantra.merit.foundation_advisory_ack` | User tap "Tôi Đã Hiểu" |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Merit thấp — chỉ warning, không block | `merit_foundation_insufficient` | 200 + warnings[] |

---

## Notes for AI/codegen

- `MERIT_THRESHOLD` nên là config constant, không hard-code
- `MeritLedger` cần expose method `getMeritSummary(userId): MeritSummary`
- Rule này KHÔNG chặn cứng — luôn soft-block, quyết định cuối thuộc user
- Phase 2+: có thể cung cấp shortcut "Thêm Phóng Sinh Ngay" từ modal để giải quyết nhanh

---

## Related

- [log-life-release.md](./log-life-release.md) — phóng sinh → tăng meritScore
- [propagation-vow-goal-tracker.md](./propagation-vow-goal-tracker.md) — guidanceCount tracking
