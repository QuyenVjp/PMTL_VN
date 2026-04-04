# Cấm Đĩa Kim Loại Đựng NNN — Metal Container Ban

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Chỉ được dùng đĩa gốm/sứ trắng để đốt Ngôi Nhà Nhỏ. Đĩa kim loại (sắt, nhôm, inox...) chặn năng lượng truyền đến cõi âm, làm vô hiệu hóa toàn bộ nghi thức. Hệ thống yêu cầu user xác nhận chất liệu đĩa trong pre-burn checklist.

---

## Owner module

`engagement` — LittleHouseService / ContainerValidator
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — chuẩn bị đốt NNN
- `system` — pre-burn checklist xác nhận chất liệu, chặn nếu kim loại

---

## Trigger

Khi user bắt đầu burn flow — bước "Kiểm Tra Dụng Cụ" (container validation step).

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User chọn "Gốm/Sứ trắng" | ✅ Proceed to burn |
| User chọn "Kim loại" | ❌ Block burn, hiển thị lý do |
| User không chọn | ❌ Cannot proceed |
| Metal container blocked | ✅ Show alternative suggestion |

---

## Input Contract

```typescript
type ContainerMaterial = 'CERAMIC_WHITE' | 'PORCELAIN' | 'METAL' | 'OTHER'

interface ContainerValidationDto {
  sessionId: string
  containerMaterial: ContainerMaterial
}

function isContainerAllowed(material: ContainerMaterial): boolean {
  return material === 'CERAMIC_WHITE' || material === 'PORCELAIN'
}
```

---

## Write Path

```
POST /api/engagement/little-house/burn/validate-container
1. Check dto.containerMaterial
2. If METAL or not CERAMIC/PORCELAIN:
   → return 400 { code: 'metal_container_forbidden' }
3. If CERAMIC_WHITE or PORCELAIN:
   → Mark containerValidated = true, proceed
4. Audit: burn.container_material_confirmed
```

---

## FE Behavior — Container Validation Step

```
Chuẩn Bị Đốt NNN — Kiểm Tra Dụng Cụ

Đĩa đựng NNN của tôi là:

☑️ Gốm/Sứ trắng       ✅ ĐƯỢC PHÉP
☐ Kim loại (sắt/nhôm/inox)  ❌ CẤM

─────────────────────────────────────

(Nếu chọn Kim loại:)

❌ LỖI: CẤM DÙNG ĐĨA KIM LOẠI

Năng lượng NNN không thể xuyên qua
kim loại để truyền đến cõi âm.

Toàn bộ nghi thức sẽ bị vô hiệu hóa.

✅ CHỈ ĐƯỢC DÙNG:
   Đĩa sứ trắng hoặc đĩa gốm

[Thay Đĩa & Thử Lại]
(Nút tiếp tục bị disabled cho đến khi chọn đúng loại)
```

---

## Audit

| Action | Trigger |
|---|---|
| `burn.container_check_initiated` | Pre-burn step shown |
| `burn.ceramic_confirmed` | Proper material selected |
| `burn.metal_detected` | Forbidden material selected |
| `burn.metal_container_blocked` | Burn flow blocked |
| `burn.container_replaced_retry` | User changes container |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Metal container selected | `metal_container_forbidden` | 400 |
| No material selected | `container_material_required` | 422 |

---

## Notes for AI/codegen

- Validation là required step — không bypass được.
- Chỉ 2 acceptable values: `CERAMIC_WHITE`, `PORCELAIN`.
- Không cần phân biệt màu sắc gốm — chỉ cần không phải kim loại.

---

## Related

- [burn-container-sanitization-protocol.md](./burn-container-sanitization-protocol.md) — post-burn cleaning
- [burn-container-altitude-constraint.md](./burn-container-altitude-constraint.md) — height requirements
- [validate-little-house-burn-conditions.md](./validate-little-house-burn-conditions.md) — general burn conditions
