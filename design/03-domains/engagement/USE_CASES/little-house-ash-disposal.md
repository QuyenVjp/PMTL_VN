# Xử Lý Tro Tàn & Ngoại Lệ Nhíp Kim Loại — Little House Ash Disposal & Tweezers Exception

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Nghi thức đốt Ngôi Nhà Nhỏ sau khi hoàn thành
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Hướng dẫn và enforce quy trình xử lý tro tàn sau khi đốt Ngôi Nhà Nhỏ, bao gồm:
1. **Tweezers Metal Exception** — cho phép dùng nhíp/kẹp kim loại trong trường hợp đặc biệt (người già, bệnh).
2. **Ash Disposal Protocol** — trình tự xử lý tro đúng chuẩn (thả sông/biển, không đổ thùng rác).
3. **Interim Name Syntax** — cú pháp tên tạm trong 100 ngày sau khi đổi tên cúng dường.

---

## Owner module

`engagement` — LittleHouseSheet burn post-processing.

---

## Actors

- `member` — thực hiện nghi thức sau đốt
- `system` — hiển thị hướng dẫn, ghi nhận log

---

## Part 1: Tweezers Metal Exception

### Business rule

Dụng cụ đốt Ngôi Nhà Nhỏ tiêu chuẩn là **đũa/que tre/gỗ** (không kim loại).
Ngoại lệ được chấp nhận nếu user khai báo lý do hợp lệ:

| Lý do | Cho phép dùng nhíp kim loại |
|---|---|
| Người cao tuổi (≥70 tuổi) | ✅ |
| Đang bệnh / chấn thương tay | ✅ |
| Trẻ em thực hiện (cần an toàn) | ✅ |
| Không có dụng cụ tre/gỗ | ⚠️ ADVISORY (vẫn cho phép, nhắc mua) |
| Không có lý do | ❌ Nhắc dùng đũa tre |

### UI Behavior

Trong step "Dụng cụ đốt" của burn flow:

```
Mặc định hiển thị:
  "Dùng đũa tre hoặc que gỗ để xử lý tro — không dùng đồ kim loại."

Nút [Tôi cần dùng nhíp/kẹp kim loại] → expand modal:
  "Lý do sử dụng dụng cụ kim loại:"
  ○ Người cao tuổi
  ○ Đang bệnh / chấn thương
  ○ Vì sự an toàn của trẻ em
  ○ Không có dụng cụ phù hợp
  ○ Khác: [text input]
```

Sau khi chọn lý do → hệ thống ghi nhận exception và cho phép tiếp tục.

### Input

```typescript
interface ToolExceptionInput {
  sheetId:     string
  toolType:    "BAMBOO_CHOPSTICKS" | "WOOD_STICK" | "METAL_TWEEZERS" | "OTHER"
  exceptionReason?: "ELDERLY" | "ILLNESS" | "CHILD_SAFETY" | "NO_PROPER_TOOL" | "OTHER"
  exceptionNote?:   string
}
```

---

## Part 2: Ash Disposal Protocol

### Business rule

Sau khi tro nguội hoàn toàn, xử lý tro theo thứ tự ưu tiên:
1. **Thả sông / suối / biển** — đây là cách tốt nhất.
2. **Chôn trong đất sạch** (vườn, công viên) — nếu không có sông.
3. **Đổ vào bồn hoa / chậu cây** — chấp nhận được.
4. **Đổ vào thùng rác** — KHÔNG được khuyến nghị, hiển thị cảnh báo đỏ.

### Ash Disposal Checklist

Sau khi đốt xong, trước khi đóng session:

```
Xử lý tro tàn:

○ Tôi đã thả tro xuống sông/suối/biển    ← tốt nhất
○ Tôi đã chôn tro trong đất sạch
○ Tôi đã đổ tro vào chậu cây/bồn hoa
○ Khác: [mô tả]

[⚠️ Tôi phải đổ vào thùng rác (bất khả kháng)]
  → Hiển thị cảnh báo: "Tro Ngôi Nhà Nhỏ chứa tên oan gia trái chủ — nên xử lý trang trọng.
     Nếu bắt buộc đổ thùng rác, vui lòng bọc kín bằng giấy trắng sạch trước."
```

### Input

```typescript
interface AshDisposalInput {
  sheetId:      string
  disposalMethod: "RIVER_RELEASE" | "BURIED_IN_EARTH" | "FLOWER_POT" | "OTHER" | "TRASH_BIN"
  disposalNote?: string
}
```

### Write path

1. Save `ashDisposalMethod` to `LittleHouseSheet`.
2. Nếu `TRASH_BIN` → ghi note cảnh báo, audit `little-house.ash.trash-bin-disposal`.
3. Transition `burnStatus → DISPOSED`.
4. Audit: `little-house.ash.disposed`.

---

## Part 3: Interim Name Syntax (100-Day Grace Period)

### Business rule

Khi user đổi tên cúng dường (Dharma Name change), trong vòng **100 ngày** kể từ ngày `NameChangeApplication` được phê duyệt, Ngôi Nhà Nhỏ được viết theo định dạng:

```
Tên Cũ (Tên Mới)
```

Sau 100 ngày → chỉ dùng tên mới.

### Trigger

Khi user bắt đầu Phase 1 (viết tên OCTC) và hệ thống detect `actor.nameChangeApprovedAt IS NOT NULL`:

```typescript
function getNameForSheet(user: UserProfile, today: Date): string {
  if (!user.nameChangeApprovedAt) return user.currentName

  const daysSinceChange = Math.floor(
    (today.getTime() - user.nameChangeApprovedAt.getTime()) / 86_400_000
  )

  if (daysSinceChange <= 100) {
    return `${user.previousName} (${user.currentName})`
  }

  return user.currentName
}
```

### FE Display

Khi render tên mẫu trong little-house stepper:

```
Tên của bạn trên tờ: Nguyễn Văn A (Pháp Danh Mới)
(Đang trong 100 ngày chuyển tiếp — còn [N] ngày)
```

Sau ngày 100 → hiển thị tên mới trực tiếp, không còn cú pháp ngoặc.

---

## Errors

| Condition | Error code | HTTP | Recovery |
|---|---|---|---|
| Ash disposal không chọn | `ash_disposal_required` | 400 | Chọn phương pháp xử lý tro |
| Chưa đăng nhập | `unauthorized` | 401 | — |

---

## Audit

| Action | Trigger |
|---|---|
| `little-house.tool.metal-exception` | Dùng nhíp kim loại với lý do |
| `little-house.ash.disposed` | Ghi nhận phương pháp xử lý tro |
| `little-house.ash.trash-bin-disposal` | Cảnh báo đổ thùng rác |
| `little-house.name.interim-syntax-used` | Tên tạm (OldName (NewName)) được áp dụng |

---

## Notes for AI/codegen

- `LittleHouseSheet` cần thêm fields: `burnToolType`, `burnToolException?`, `ashDisposalMethod`, `ashDisposalNote?`.
- Cú pháp `Tên Cũ (Tên Mới)` chỉ áp dụng trong **100 ngày kể từ `nameChangeApprovedAt`** — cần index này trong user profile.
- Countdown "còn N ngày" trong tên tạm = `100 - daysSinceChange`.
- Tweezers exception không block burn flow — chỉ ghi nhận audit log để reference nếu có câu hỏi về đúng/sai sau này.
- Ash disposal là **required step** trước khi session kết thúc — không skip được.
