# HEART-INCENSE-ENVIRONMENT

## Owner
- `vows-merit` (Heart Incense)

## Purpose
Ràng buộc Môi trường cho Tâm Hương (Heart Incense Environmental Check)

---

## Business Rule

### Rule - Must Be Bright, Near Window
**Nghiệp vụ [Nguồn: Trình tự thắp tâm hương]:**
- Tâm Hương phải thắp ở nơi **yên tĩnh** và **sáng sủa** (bright)
- Tốt nhất: **cạnh cửa sổ** (near window)
- **CẤM:**
  - Nơi tăm tối
  - Tầng hầm
  - Nhà vệ sinh

---

## Service Logic

```typescript
export class HeartIncenseGuard {
  async validateEnvironment(dto: StartHeartIncenseDto) {
    if (!dto.isNearBrightWindow) {
      throw new BadRequestException(
        'Tâm Hương phải thắp ở nơi sáng sủa, lý tưởng nhất là gần cửa sổ'
      );
    }
  }
}
```

---

## UI Component

```
┌────────────────────────────────────────────┐
│  🕯️ Thắp Tâm Hương                       │
├────────────────────────────────────────────┤
│  Kiểm tra môi trường:                     │
│  [x] Nơi yên tĩnh                         │
│  [x] Sáng sủa (có ánh sáng tự nhiên)     │
│  [x] Gần cửa sổ (khuyến nghị)            │
│                                            │
│  [Bắt đầu]                                │
└────────────────────────────────────────────┘
```

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 11 Logic 4
