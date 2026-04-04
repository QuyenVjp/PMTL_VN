# BIO-EXHAUSTION-BLOCKER

## Owner
- `engagement` (Symptom Tracking)

## Purpose
Chốt chặn Kiệt sức Thể chất (Physical Exhaustion Blocker) - Prevent spiritual burnout

---

## Business Rule

### Rule - Lips Sores/Blisters = HARD STOP
**Nghiệp vụ [Nguồn 289-290]:**
- Niệm TPT quá nhiều → **Môi bị nổi mụn nước, lở loét** (sores and blisters)
- Dấu hiệu vượt quá giới hạn năng lượng sinh học
- **KHÔNG ĐƯỢC PHÉP (not permissible)**
- Phải DỪNG ngay lập tức

---

## Schema Hints

```prisma
model SymptomLog {
  // ... existing
  symptomType         String
  isCritical          Boolean @default(false)
  actionRequired      String? // "HARD_STOP", "REDUCE", "MONITOR"
}
```

---

## Service Logic

```typescript
export class BioExhaustionGuard {
  checkCriticalSymptom(dto: LogSymptomDto) {
    if (dto.symptomType === 'LIPS_SORES_BLISTERS') {
      // Hard stop
      return {
        isCritical: true,
        actionRequired: 'HARD_STOP',
        message: 'CẢNH BÁO: Bạn đang vắt kiệt năng lượng. Lập tức DỪNG niệm TPT.',
      };
    }
  }
}
```

---

## UI Component

```
┌────────────────────────────────────────────┐
│  🔴 CẢNH BÁO NGHIÊM TRỌNG                 │
├────────────────────────────────────────────┤
│  Triệu chứng: Nổi mụn nước/Lở môi        │
│                                            │
│  BẠN ĐANG VẮT KIỆT NĂNG LƯỢNG!           │
│                                            │
│  Lập tức DỪNG niệm Tiểu Phương Tử.        │
│                                            │
│  Chuyển sang:                             │
│  • Chỉ niệm Chú Đại Bi cho CHÍNH BẠN     │
│  • Hồi phục công lực                      │
│                                            │
│  [Tôi đã dừng]                            │
└────────────────────────────────────────────┘
```

---

## References
- Sources 289-290: Bio-exhaustion blocker

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 10 Logic 9
