# Kỷ Luật Duy Trì Và Niệm Bù Công Khóa Hằng Ngày — Daily Recitation Continuity & Makeup Discipline
> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-09

## Purpose
Thiết lập luật vận hành cho `Bài tập hàng ngày` như một nghĩa vụ tu học bắt buộc phải hoàn thành mỗi ngày, không được đứt quãng tùy tiện. Module phải giúp người tu:

- đặt mức công khóa bền vững thay vì đặt quá cao rồi bỏ dở
- xử lý đúng các trường hợp `niệm trước`, `niệm bù`
- giữ tách biệt tuyệt đối giữa `Bài tập hàng ngày`, `Ngôi Nhà Nhỏ`, và `Kinh văn Tự tu`
- tránh niệm bù sai cách, nhất là với `Lễ Phật Đại Sám Hối Văn`

## Owner module
`wisdom-qa` — `DailyRecitationDisciplineService` / `DailyPracticeContinuityGuard`

## Actors
- `member` — người thực hành công khóa hằng ngày
- `system` — nhắc nhở, ghi nhận thiếu hụt, chặn logic gộp sai
- `admin` — cấu hình preset, xem audit và giải thích rule

## Trigger
- user tạo hoặc chỉnh `daily recitation preset`
- user báo trước ngày đặc biệt sẽ khó hoàn thành
- user kết ngày mà chưa hoàn tất công khóa
- user xin ghi `niệm bù` cho ngày hôm trước

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Công khóa hằng ngày, Ngôi Nhà Nhỏ, Kinh văn Tự tu | ✅ Ghi nhận thành 3 lane riêng, không thay thế lẫn nhau |
| User đặt bài tập quá cao so với khả năng duy trì | ⚠️ Gợi ý hạ xuống mức bền vững để ngày nào cũng hoàn thành được |
| User niệm vượt định mức ngày | ✅ Ghi là `extraRecitationCount`, không tự tăng baseline mặc định |
| Biết trước có ngày bận/đặc biệt | ✅ Cho phép tạo `preRecitationPlan` và hoàn thành sớm sau khi user xác nhận lời thưa với Bồ Tát |
| Chưa kịp hoàn thành trong ngày | ✅ Tạo `makeupPromise` cho ngày hôm sau, kèm nội dung lời thưa chuẩn |
| Một ngày quá bận nhưng vẫn còn khả năng niệm ít | ✅ Hệ thống vẫn yêu cầu giữ `minimum continuity`, tối thiểu phải có niệm kinh trong ngày |
| User muốn bỏ trắng một ngày hoàn toàn | ❌ Không khuyến khích; phải hiện cảnh báo đứt mạch công khóa |
| Niệm bù `Lễ Phật Đại Sám Hối Văn` dồn quá nhiều trong một ngày | ❌ Chặn hoặc cảnh báo cứng; nên chia nhiều ngày, tổng mỗi ngày tốt nhất không vượt 7 biến |
| User chưa có giờ/chỗ cố định | ⚠️ Gợi ý chọn `preferredPracticeWindow` và `preferredPracticeLocation` cố định |

## Standard Prayer Copy

### Niệm trước

```text
Xin Đại Từ Đại Bi Quán Thế Âm Bồ Tát từ bi chứng giám,
con tên là [Họ tên],
vì [lý do chính đáng] nên hôm nay con xin được hoàn thành công khóa sớm hơn cho ngày [dd/mm/yyyy].
```

### Niệm bù

```text
Xin Đại Từ Đại Bi Quán Thế Âm Bồ Tát tha thứ cho con tên là [Họ tên],
bài tập của ngày hôm nay con sẽ hoàn thành bù vào ngày mai.
```

## Input Contract

```typescript
interface DailyRecitationDisciplinePresetDto {
  userId: string
  baselineItems: Array<{
    sutraKey: string
    targetCount: number
  }>
  minimumContinuityRule: {
    requireAnyRecitationDaily: true
    preferredFallbackSutraKey: "GREAT_COMPASSION_MANTRA"
    minimumFallbackCount: number
  }
  preferredPracticeWindow?: {
    startTime: string
    endTime: string
  }
  preferredPracticeLocation?: "HOME_ALTAR" | "QUIET_ROOM" | "TRAVEL_FALLBACK"
}

interface PreRecitationPlanDto {
  userId: string
  targetDate: string
  reason: string
  baselineItemsCompletedEarly: Array<{
    sutraKey: string
    count: number
  }>
}

interface MakeupPromiseDto {
  userId: string
  missedDate: string
  carryToDate: string
  missedItems: Array<{
    sutraKey: string
    remainingCount: number
  }>
  acknowledgedPrayer: boolean
}
```

## Write Path

```text
POST /api/wisdom/daily-recitation/preset
1. Validate baselineItems phải là mức user có thể duy trì mỗi ngày
2. Nếu preset vượt ngưỡng an toàn của sutra nhạy cảm:
   → return recommendation, không silent-save
3. Save preset + continuity settings

POST /api/wisdom/daily-recitation/pre-recitation-plan
1. Validate targetDate ở tương lai
2. Save planned early completion counts
3. Mark targetDate state = PRE_COVERED

POST /api/wisdom/daily-recitation/end-of-day-check
1. Compare today's actual counts với baseline
2. Nếu đủ:
   → mark COMPLETED
3. Nếu thiếu nhưng đã có ít nhất một recitation:
   → mark INCOMPLETE_WITH_CONTINUITY
   → suggest makeupPromise
4. Nếu thiếu hoàn toàn:
   → mark MISSED
   → show high-friction warning

POST /api/wisdom/daily-recitation/makeup-promise
1. Validate carryToDate = next valid practice day
2. Save missedItems separately from today's baseline
3. If sutraKey = REPENTANCE_LITURGY and totalDailyCount > 7:
   → reject with split-across-days guidance
4. Return separated counters:
   - todayBaseline
   - makeupBacklog
   - extraRecitation
```

## FE Behavior

```text
Màn hình Công Khóa Hằng Ngày

[Công khóa hôm nay]
- Chú Đại Bi: 2/3
- Tâm Kinh: 3/3
- Lễ Phật: 0/1
- Vãng Sanh Chú: 12/21

[Duy trì liên tục]
"Dù bận đến đâu, hôm nay vẫn nên có niệm kinh."
[Niệm ít nhất vài biến Chú Đại Bi]

[Niệm trước]
Cho ngày: [2026-04-12]
Lý do: [Đi công tác / di chuyển dài / việc gia đình]
[Tạo kế hoạch niệm trước]

[Niệm bù]
Ngày thiếu: 2026-04-08
Thiếu: Lễ Phật 1 biến, Vãng Sanh Chú 9 biến
⚠️ Lễ Phật nên chia nhiều ngày, tổng mỗi ngày không vượt 7 biến
[Xác nhận niệm bù ngày mai]

[Kỷ luật công khóa]
- Đặt mức thấp nhưng làm đều mỗi ngày
- Niệm thêm được tính riêng
- Không cộng sang Ngôi Nhà Nhỏ
- Ưu tiên giờ và nơi cố định để tâm dễ định
```

## Schema Notes

```prisma
model DailyRecitationDisciplinePreset {
  // ... existing fields ...
  preferredPracticeWindowStart String?
  preferredPracticeWindowEnd   String?
  preferredPracticeLocation    String?
  minimumFallbackSutraKey      String?
  minimumFallbackCount         Int?    @default(1)
}

model DailyRecitationDayState {
  // ... existing fields ...
  status             String   // COMPLETED | PRE_COVERED | INCOMPLETE_WITH_CONTINUITY | MISSED
  makeupBacklogJson  Json?
  continuityKept     Boolean  @default(false)
}

// Migration:
// ALTER TABLE "DailyRecitationDisciplinePreset" ADD COLUMN ...;
// ALTER TABLE "DailyRecitationDayState" ADD COLUMN ...;
```

## Audit

| Action | Trigger |
|---|---|
| `recitation.discipline_preset_saved` | user lưu baseline công khóa |
| `recitation.pre_recitation_planned` | user tạo kế hoạch niệm trước |
| `recitation.day_marked_incomplete_with_continuity` | ngày đó chưa đủ baseline nhưng vẫn có niệm |
| `recitation.makeup_promise_created` | user xác nhận niệm bù |
| `recitation.makeup_rejected_rep_liturgy_overflow` | niệm bù Lễ Phật bị chặn vì vượt ngưỡng |

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Gộp công khóa vào Ngôi Nhà Nhỏ | `daily_recitation_commingling_forbidden` | 400 |
| Niệm bù Lễ Phật vượt ngưỡng an toàn ngày | `repentance_makeup_daily_limit_exceeded` | 422 |
| carryToDate không hợp lệ | `invalid_makeup_target_date` | 422 |
| Niệm trước cho ngày quá khứ | `pre_recitation_future_date_required` | 422 |

## Notes for AI/codegen

- `baseline`, `makeup backlog`, và `extra recitation` phải là 3 lớp dữ liệu tách biệt.
- Không tự động coi `niệm thêm` là baseline mới; user phải xác nhận nếu muốn nâng công khóa chính thức.
- `minimum continuity` là rule nhắc giữ mạch tu học, không được biến thành loophole để baseline luôn bị thiếu.
- Với `Lễ Phật Đại Sám Hối Văn`, UI phải ưu tiên gợi ý chia ngày thay vì dồn bù một lần.

## Related

- [daily-recitation-system.md](./daily-recitation-system.md)
- [recitation-economy-segregation.md](./recitation-economy-segregation.md)
- [beginner-repentance-mantra-7-repetitions.md](./beginner-repentance-mantra-7-repetitions.md)
