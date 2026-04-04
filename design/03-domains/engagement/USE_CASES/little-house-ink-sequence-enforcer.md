# Trình Tự Mực Viết Ngôi Nhà Nhỏ — Little House Ink & Sequence Enforcer

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Nghi thức viết Ngôi Nhà Nhỏ
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Enforce trình tự viết tờ Ngôi Nhà Nhỏ theo đúng 3 giai đoạn màu mực:
1. **Trước khi niệm kinh** — viết tên oan gia trái chủ (OCTC) bằng mực xanh/đen.
2. **Trong khi niệm kinh** — chấm điểm đỏ ≥80% số câu đã đọc.
3. **Sau khi hoàn thành** — ghi ngày tháng bằng mực đỏ.

Vi phạm trình tự này là **lỗi nghi thức nghiêm trọng** — phải được chặn ở FE và validate ở API.

---

## Owner module

`engagement` — [xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — viết và ghi nhận tờ Ngôi Nhà Nhỏ
- `system` — enforce trình tự, hiển thị step indicator

---

## State Machine

```
DRAFT
  │
  ├─[writeNames: ink=BLUE|BLACK]──► NAMES_WRITTEN
  │
NAMES_WRITTEN
  │
  ├─[startChanting]────────────────► CHANTING_IN_PROGRESS
  │
CHANTING_IN_PROGRESS
  │
  ├─[markRedDots: progress≥80%]───► CHANTING_COMPLETE
  │
CHANTING_COMPLETE
  │
  ├─[writeDate: ink=RED]───────────► COMPLETE
```

Transitions phải theo đúng thứ tự. Bất kỳ skip nào đều bị BLOCK.

---

## Phase 1: Viết Tên — BLUE/BLACK ink enforcer

### Business rule

Tên oan gia trái chủ (OCTC) **phải** được viết trước khi niệm kinh, bằng mực xanh hoặc đen.
Nếu user cố gắng chuyển sang giai đoạn chấm đỏ mà chưa confirm tên, hệ thống BLOCK.

### Input

```typescript
interface WriteNamesInput {
  sheetId:   string
  octcNames: string[]     // tối thiểu 1, tối đa 7 per sheet
  inkColor:  "BLUE" | "BLACK"
}
```

### Validation

```typescript
// BLOCK conditions:
if (sheet.status !== "DRAFT") throw "sheet_not_in_draft"
if (!["BLUE", "BLACK"].includes(input.inkColor)) throw "invalid_ink_color_for_names"
if (input.octcNames.length === 0) throw "names_required"
if (input.octcNames.length > 7) throw "max_7_names_per_sheet"
```

### Write path

1. Validate ink color = BLUE or BLACK only.
2. Save `octcNames[]` to `LittleHouseSheet.namesJson`.
3. Transition `status → NAMES_WRITTEN`.
4. Audit: `little-house.names.written`.

### FE stepper indicator

```
Step 1: [✏ Viết tên — Mực XANH/ĐEN] ← active
Step 2: [○ Chấm điểm — Mực ĐỎ]
Step 3: [○ Ghi ngày — Mực ĐỎ]
```

Color picker only shows BLUE and BLACK during Step 1. RED is greyed out with tooltip:
> *"Mực đỏ chỉ dùng để chấm điểm và ghi ngày — sau khi đã niệm xong."*

---

## Phase 2: Chấm Điểm Đỏ — In-progress tracker

### Business rule

Trong khi niệm kinh, user chấm điểm đỏ (●) cho mỗi câu/bài đã đọc. Hệ thống tính %
hoàn thành. Chỉ được chuyển sang Phase 3 khi **≥80%** số câu đã được chấm đỏ.

### Input

```typescript
interface MarkRedDotsInput {
  sheetId:        string
  completedLines: number   // số câu đã chấm đỏ
  totalLines:     number   // tổng số câu trên tờ (từ template)
}
```

### Validation

```typescript
if (sheet.status !== "CHANTING_IN_PROGRESS") throw "sheet_not_chanting"
const pct = completedLines / totalLines
if (pct < 0.80) {
  return {
    ok: false,
    message: `Mới hoàn thành ${Math.round(pct*100)}%. Cần ≥80% để sang bước tiếp theo.`,
    progress: pct
  }
}
```

### Write path

1. Save `completionPercent` to sheet.
2. If `pct >= 0.80` → transition `status → CHANTING_COMPLETE`.
3. Audit: `little-house.chanting.progress` (every save), `little-house.chanting.complete` (when ≥80%).

### FE progress indicator

```
Tiến trình niệm kinh: ████████░░ 80%

[Câu đã đọc: 80 / 100]

Nút [Hoàn thành niệm kinh] chỉ active khi ≥80%.
```

---

## Phase 3: Ghi Ngày — RED ink, date only

### Business rule

Ngày tháng được ghi **sau** khi hoàn thành niệm kinh, bằng mực đỏ.
Không được ghi ngày trước khi niệm xong (ngay cả khi quên trước đó).

### Input

```typescript
interface WriteDateInput {
  sheetId:     string
  completedAt: Date     // ngày hoàn thành thực tế
  inkColor:    "RED"    // bắt buộc phải là RED
}
```

### Validation

```typescript
if (sheet.status !== "CHANTING_COMPLETE") throw "chanting_not_complete"
if (input.inkColor !== "RED") throw "date_must_use_red_ink"
if (input.completedAt > new Date()) throw "date_cannot_be_future"
```

### Write path

1. Validate ink = RED.
2. Save `completedAt` to sheet.
3. Transition `status → COMPLETE`.
4. Trigger burn-eligibility check (validate-little-house-burn-conditions).
5. Audit: `little-house.date.written`, `little-house.sheet.complete`.

### FE behavior

- Color picker in Phase 3 shows **only RED** — BLUE/BLACK greyed out.
- Date picker defaults to today, allows backdating up to 7 days.
- Tooltip: *"Ghi ngày hoàn thành bằng mực đỏ."*

---

## Ink Transition Guard (cross-phase)

FE enforces a strict ink switching UX:

```
Phase 1 → color picker: [🔵 Xanh] [⚫ Đen]  — RED locked
Phase 2 → no color picker (progress counter only)
Phase 3 → color picker: [🔴 Đỏ]  — BLUE/BLACK locked
```

If user tries to manually submit wrong ink color via API → 422 with `invalid_ink_for_phase`.

---

## Errors

| Condition | Error code | HTTP | Recovery |
|---|---|---|---|
| Ink sai giai đoạn | `invalid_ink_for_phase` | 422 | Dùng đúng màu mực |
| Status không đúng | `sheet_status_mismatch` | 422 | Hoàn thành bước trước |
| Chưa đủ 80% | `chanting_incomplete` | 400 | Tiếp tục niệm đủ số câu |
| Ghi ngày trước khi xong | `chanting_not_complete` | 400 | Hoàn thành Phase 2 trước |
| Quá 7 tên / sheet | `max_7_names_exceeded` | 422 | Dùng tờ khác |
| Chưa đăng nhập | `unauthorized` | 401 | — |

---

## Audit

| Action | Trigger |
|---|---|
| `little-house.names.written` | Phase 1 hoàn thành |
| `little-house.chanting.progress` | Mỗi lần lưu % tiến trình |
| `little-house.chanting.complete` | Đạt ≥80% |
| `little-house.date.written` | Phase 3 hoàn thành |
| `little-house.sheet.complete` | Tờ đã ghi đầy đủ |

---

## Notes for AI/codegen

- `status` field trên `LittleHouseSheet` cần thêm states: `NAMES_WRITTEN`, `CHANTING_IN_PROGRESS`, `CHANTING_COMPLETE` nếu chưa có.
- Phase transitions là **one-way** — không cho phép quay lại phase trước (trừ admin override).
- `completionPercent` không hardcode 80% vào schema — lưu `completedLines` và `totalLines` riêng để admin có thể điều chỉnh ngưỡng per template sau này.
- FE stepper component nên dùng `LittleHouseSheet.status` làm source of truth cho active step — không dùng local state.
