# Bắt Buộc Niệm Tiên Quyết Khi Không Có Bàn Thờ — No-Altar 1+1 Prerequisite Enforcer

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Đốt Ngôi Nhà Nhỏ tại bàn thờ chỉ cần thắp tâm hương. Đốt không có bàn thờ (ban công, sân) phải thêm **1 biến Chú Đại Bi + 1 biến Tâm Kinh** trước để thành lập cầu nối năng lượng. Nếu không niệm đủ hai bài tiên quyết này, năng lượng NNN không đến được cõi âm đúng cách.

---

## Owner module

`engagement` — LittleHouseService / AltarPrerequisiteGuard
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — chọn địa điểm đốt NNN
- `system` — inject prerequisite tasks khi chọn "Không có bàn thờ", lock nút đốt

---

## Trigger

Khi user chọn địa điểm đốt = "Không có bàn thờ" (ban công, sân vườn, ngoài trời).

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User chọn "Có Bàn Thờ" | ✅ Standard flow, tiến thẳng sang thắp tâm hương |
| User chọn "Không Bàn Thờ" | ✅ Inject 2 prerequisite tasks |
| Prerequisite 1: Chú Đại Bi chưa xong | ❌ Nút đốt disabled |
| Prerequisite 2: Tâm Kinh chưa xong | ❌ Nút đốt disabled |
| Cả 2 prerequisites xong | ✅ Nút [Bắt Đầu Đốt] enabled |
| User đổi lại thành "Có Bàn Thờ" | ✅ Prerequisites cleared, nút enabled |

---

## Input Contract

```typescript
interface BurnLocationDto {
  hasAltar: boolean
}

interface AltarPrerequisiteState {
  required: boolean
  tasks: {
    id: string
    name: string
    sutraKey: string
    completed: boolean
    order: number
  }[]
  allCompleted: boolean
}

function injectAltarPrerequisites(hasAltar: boolean): AltarPrerequisiteState {
  if (hasAltar) return { required: false, tasks: [], allCompleted: true }
  return {
    required: true,
    tasks: [
      { id: 'prereq_1', name: 'Niệm 1 biến Chú Đại Bi', sutraKey: 'chu_dai_bi', completed: false, order: 1 },
      { id: 'prereq_2', name: 'Niệm 1 biến Tâm Kinh', sutraKey: 'tam_kinh', completed: false, order: 2 }
    ],
    allCompleted: false
  }
}
```

---

## Write Path

```
// FE-driven state — no separate API for prerequisites
// Burn API validates prerequisites before allowing burn

POST /api/engagement/little-house/burn
1. If dto.hasAltar = false:
   → Validate prerequisiteTasksCompleted = true
   → return 400 { code: 'altar_prerequisites_required' } if not
2. If prerequisites met or hasAltar = true:
   → Proceed with burn flow
```

---

## FE Behavior

```
Đốt Ngôi Nhà Nhỏ:

[1. Chọn Vị Trí]

Địa điểm: ○ Có Bàn Thờ
          ● Không Bàn Thờ (Ban công/Sân)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ VÌ KHÔNG CÓ BÀN THỜ:

Bạn BẮT BUỘC niệm 2 bài này trước để
thành lập cầu nối năng lượng:

[2. Hoàn Thành Tiên Quyết]

❌ Niệm 1 biến Chú Đại Bi
❌ Niệm 1 biến Tâm Kinh

[Bắt Đầu Niệm Chú Đại Bi]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

(Sau khi hoàn thành cả 2:)

✅ Niệm 1 biến Chú Đại Bi
✅ Niệm 1 biến Tâm Kinh

[3. Bắt Đầu Đốt] (enabled)

[Thắp Tâm Hương] → [Đốt NNN]
```

---

## Audit

| Action | Trigger |
|---|---|
| `lh.altar_status_selected` | User chọn location type |
| `lh.no_altar_detected` | No Altar selected |
| `lh.prerequisites_injected` | 2 tasks created |
| `lh.prerequisite_1_completed` | Chú Đại Bi done |
| `lh.prerequisite_2_completed` | Tâm Kinh done |
| `lh.burn_allowed` | Both prerequisites met |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Burn attempted without prerequisites | `altar_prerequisites_required` | 400 |

---

## Notes for AI/codegen

- Prerequisite tasks hiển thị inline trong burn flow stepper — không tách riêng thành modal.
- Thứ tự: Chú Đại Bi trước, Tâm Kinh sau — không cho phép đảo.
- Nếu user đang ở bước niệm Chú Đại Bi và muốn thay địa điểm → reset prerequisites state.

---

## Related

- [validate-little-house-burn-conditions.md](./validate-little-house-burn-conditions.md) — general burn validation
- [burn-container-sanitization-protocol.md](./burn-container-sanitization-protocol.md) — post-burn sanitization
- [altar-oil-lamp-fire-prohibition.md](./altar-oil-lamp-fire-prohibition.md) — altar fire rules
