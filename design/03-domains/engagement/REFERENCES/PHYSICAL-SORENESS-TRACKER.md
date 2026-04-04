# PHYSICAL-SORENESS-TRACKER

## Owner
- `engagement` (symptom tracking)

## Purpose
Cảnh báo đau nhức cơ thể khi niệm 88 Buddhas - dấu hiệu nghiệp chướng chuyển thành linh tính

---

## Business Rule

### Rule - Soreness = Karma Activation → Burn 4-7 LH
**Nghiệp vụ:**
- Đang niệm 88 Buddhas mà thấy đau mỏi ở một bộ phận cơ thể
- **KHÔNG phải bệnh lý** → nghiệp chướng chỗ đó đã chuyển thành linh tính
- **Hành động:** Đốt ngay 4-7 TPT cho "Oan gia trái chủ của [Tên]"

---

## UX Flow

```
User đang đọc 88 Buddhas E-Reader
  ↓
Click [Tôi bị đau nhức]
  ↓
Form: "Vị trí đau?" (Đầu, Vai, Lưng, Chân, Bụng, Khác)
  ↓
Auto-prescription:
  "NGHIỆP CHƯỚNG ĐANG KÍCH HOẠT!
   Hãy niệm ngay 4-7 TPT cho 'Oan gia trái chủ của [Tên bạn]'"
  ↓
[Tạo TPT ngay]
```

---

## Schema Hints

```prisma
model PhysicalSorenessLog {
  id          String   @id
  publicId    String   @unique
  userId      String
  loggedAt    DateTime
  bodyPart    String   // HEAD, SHOULDER, BACK, LEG, STOMACH, OTHER
  severity    Int      // 1-10
  duringActivity String  // "88_BUDDHAS", "HEART_SUTRA", etc.
  lhPrescribed Int     @default(5) // Auto-set 4-7
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
  @@map("physical_soreness_logs")
}
```

---

## UI Component

```
┌────────────────────────────────────────────┐
│  ⚡ NGHIỆP CHƯỚNG ĐANG KÍCH HOẠT          │
├────────────────────────────────────────────┤
│  Bạn đang đau ở: Vai phải                 │
│                                            │
│  Đây KHÔNG phải bệnh lý, mà là nghiệp     │
│  chướng đang chuyển thành linh tính.      │
│                                            │
│  ✅ Đây là dấu hiệu TỐT (trả nợ sớm)     │
│  ⚠️ Nhưng phải đốt TPT ngay               │
│                                            │
│  Kê đơn:                                  │
│  • 4-7 TPT cho "Oan gia trái chủ"        │
│                                            │
│  [Tạo TPT ngay]                           │
└────────────────────────────────────────────┘
```

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 7 Logic 5
