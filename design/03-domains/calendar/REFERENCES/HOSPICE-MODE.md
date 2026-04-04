# HOSPICE-MODE

## Owner
- `calendar` + `vows-merit`

## Purpose
Giao thức Lâm Chung / Chuyển Cõi (End-of-Life / Hospice Mode)

---

## Business Rule

### Rule - Simplify to Pure Land Chanting Only
**Nghiệp vụ [Nguồn: Master Lu Words of Wisdom]:**
- Giai đoạn hấp hối (lâm chung)
- Không còn sức nhớ/niệm Đại Bi, Tâm Kinh
- **Phương pháp duy nhất:**
  - Buông bỏ mọi thứ
  - Chỉ niệm hồng danh Bồ Tát liên tục
  - Cho đến khi Ngài đến đón

---

## Schema Hints

```prisma
model UserProfile {
  // ... existing
  isHospiceMode    Boolean @default(false)
  hospiceModeDate  DateTime?
}
```

---

## Service Logic

```typescript
export class HospiceModeService {
  async enableHospiceMode(userId: string) {
    await this.prisma.userProfile.update({
      where: { userId },
      data: {
        isHospiceMode: true,
        hospiceModeDate: new Date(),
      },
    });

    // Disable complex features
    await this.featureToggleService.disableForUser(userId, [
      'LITTLE_HOUSE',
      'DREAM_JOURNAL',
      'LEARNING',
      'MERIT_TRACKING',
    ]);
  }
}
```

---

## UI Component

```
┌────────────────────────────────────────────┐
│                                            │
│                                            │
│              🙏 LÂM CHUNG MODE            │
│                                            │
│                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                            │
│                                            │
│     Nam Mô Đại Từ Đại Bi                 │
│     Cứu Khổ Cứu Nạn                       │
│     Quán Thế Âm Bồ Tát                    │
│                                            │
│                                            │
│            [  BẮT ĐẦU NIỆM  ]            │
│                                            │
│            Đã niệm: 0 biến                │
│                                            │
│                                            │
└────────────────────────────────────────────┘
```

---

## References
- Master Lu Words of Wisdom - End of Life guidance

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 11 Logic 3
