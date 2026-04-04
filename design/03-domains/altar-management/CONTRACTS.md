# altar-management — Contracts

> **Owner:** `AltarValidationService` / `AltarItemProtocolService` (trong `EngagementModule`)
> **Cập nhật:** 2026-04-04
> **Decisions:** [DECISIONS.md](./DECISIONS.md)

---

## API Route Groups

Tất cả routes thuộc `/api/engagement/altar/` ở Phase 1 (subdomain của engagement).

| Method | Route | Auth | Mô tả |
|---|---|---|---|
| `POST` | `/api/engagement/altar/validate` | `member` | Pre-ceremony condition check |
| `POST` | `/api/engagement/altar/damage-report` | `member` | Báo cáo đồ thờ hư hỏng → inject urgent task |
| `POST` | `/api/engagement/altar/incense/validate` | `member` | Validate cắm hương (số lẻ, hướng) |
| `POST` | `/api/engagement/altar/water/validate` | `member` | Validate nước Đại Bi (không sôi) |

---

## DTO Shapes

```typescript
// Pre-ceremony altar check
interface AltarConditionCheckDto {
  ceremonyType: 'BURN_NNN' | 'DAILY_RECITATION' | 'LIFE_RELEASE' | 'GENERAL'
  incenseReady: boolean
  waterTemperatureStatus: 'COOL' | 'WARM' | 'HOT' | 'BOILING'
  containerMaterial?: 'CERAMIC_WHITE' | 'PORCELAIN' | 'METAL' | 'OTHER'
}

interface AltarConditionResult {
  passed: boolean
  blockers: AltarBlocker[]  // items preventing ceremony
  warnings: AltarWarning[]  // items to be aware of
}

// Damage report
interface AltarDamageReportDto {
  itemType: 'INCENSE_BURNER' | 'STATUE' | 'VASE' | 'BOWL' | 'LAMP' | 'OTHER'
  damageDescription: string
  discoveredAt: Date
}

interface AltarDamageResult {
  urgentTaskId: string       // injected DailyTask: 7 biến Lễ Phật
  auditEventId: string
  remedyInstructions: string
}
```

---

## Invariants (Bất biến nghiệp vụ)

| Rule | Code | HTTP |
|---|---|---|
| Nước Đại Bi không được đang sôi/nóng | `water_temperature_forbidden` | 400 |
| Bình không phải gốm/sứ trắng cho NNN | `metal_container_forbidden` | 400 |
| Cắm số chẵn hương | `even_incense_count_forbidden` | 400 |
| UUID/barcode trên đồ thờ | `uuid_on_sacred_item_forbidden` | 400 |
| AI-generated ảnh tứ linh không đạt | `ai_generated_sacred_image_rejected` | 422 |

---

## Audit Events

| Event | Trigger |
|---|---|
| `altar.condition_check_passed` | Altar check OK |
| `altar.condition_check_failed` | One or more blockers found |
| `altar.damage_reported` | Member reports damaged item |
| `altar.urgent_task_injected` | 7-biến task created after damage |
| `altar.water_temperature_blocked` | Boiling water detected |
| `altar.metal_container_blocked` | Metal container detected |
