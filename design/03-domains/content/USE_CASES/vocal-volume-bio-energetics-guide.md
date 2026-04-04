# Hướng Dẫn Âm Lượng Tụng Kinh Theo Khí Huyết — Vocal Volume Bio-Energetics Guide

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn Phase 30)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Đọc Kinh lớn tiếng quá mức sẽ làm tổn Khí (tổn thương năng lượng thở, hao tổn thể lực). Đọc thầm hoàn toàn trong bụng mà không nhép miệng sẽ làm tổn Huyết (đình trệ lưu thông máu, gây ứ trệ). Quy tắc đúng: nhép miệng phát ra âm thanh cực nhỏ vừa đủ để tai mình nghe thấy — không to hơn, không nhỏ hơn. Hệ thống phải nhắc nhở rule này mỗi khi user mở Kinh văn để tụng.

---

## Owner module

`content` — EReaderService / BioEnergeticsGuide
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người đang tụng kinh qua E-Reader
- `system` — hiển thị banner nhắc nhở cố định, Phase 2+ có thể dùng Web Audio API

---

## Trigger

Khi user mở bất kỳ file Kinh văn nào trong E-Reader với `sessionType = ACTIVE_RECITATION` (tụng niệm chủ động, không phải nghe thụ động).

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User mở kinh với `sessionType = ACTIVE_RECITATION` | ✅ Hiển thị BioEnergetics Banner cố định |
| User mở kinh với `sessionType = PASSIVE_LISTENING` | ❌ Không hiển thị banner (nghe thụ động, khác rule) |
| User dismiss banner | ✅ Banner minimize nhưng vẫn accessible |
| Phase 2+: decibel < ngưỡng tối thiểu (đọc thầm hoàn toàn) | ⚠️ Viền màn hình nhấp nháy vàng |
| Phase 2+: decibel > ngưỡng tối đa (đọc quá to) | ⚠️ Viền màn hình nhấp nháy đỏ |

---

## Input Contract

```typescript
interface OpenEReaderSessionDto {
  contentId:   string
  sessionType: 'ACTIVE_RECITATION' | 'PASSIVE_LISTENING' | 'STUDY'
}
```

---

## Write Path

```
GET /api/content/ereader/session/open

1. Parse sessionType
2. If sessionType == 'ACTIVE_RECITATION':
   → Include bioEnergeticsReminder: true in response payload
   → FE renders BioEnergetics Banner
3. If sessionType != 'ACTIVE_RECITATION':
   → Include bioEnergeticsReminder: false
   → FE does not render banner
```

---

## FE Behavior

### Banner cố định (góc dưới màn hình):

```
┌────────────────────────────────────────────────────────┐
│ 🫁 Quy Tắc Khí Huyết                          [_] thu │
│────────────────────────────────────────────────────────│
│ Nhép miệng, phát âm thanh CỰC NHỎ — tai mình nghe.    │
│                                                        │
│  ❌ Quá TO  → Tổn Khí (hao hơi, tổn thể lực)          │
│  ❌ Quá NHỎ/Thầm hoàn toàn → Tổn Huyết (ứ trệ máu)   │
│  ✅ Vừa đủ nghe rõ = ĐÚNG CHUẨN                       │
└────────────────────────────────────────────────────────┘
```

- Banner dính cố định (`position: sticky` bottom) khi đang tụng
- Tap `[_]` → minimize thành nút nhỏ góc màn hình, tap lại để mở ra
- Banner KHÔNG tự động dismiss — user phải chủ động minimize

### Phase 2+ — Web Audio API Feedback (khi tích hợp microphone):

```
Viền màn hình nhấp nháy VÀNG nhạt:
→ "Hệ thống không nghe thấy âm thanh — bạn đang đọc thầm?
   Hãy nhép miệng và phát ra âm thanh nhỏ."

Viền màn hình nhấp nháy ĐỎ:
→ "Âm lượng quá lớn — tổn Khí!
   Hãy hạ giọng xuống mức tai mình vừa nghe thấy."
```

---

## Schema Notes

```prisma
model EReaderSession {
  // ... existing fields ...
  sessionType           String   @default("ACTIVE_RECITATION")
  bioEnergeticsAckAt    DateTime?  // lần đầu user mở session này
  // Migration: ALTER TABLE "EReaderSession" ADD COLUMN "sessionType" TEXT DEFAULT 'ACTIVE_RECITATION'
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `content.ereader.bio_energetics_banner_shown` | Banner hiển thị khi mở kinh |
| `content.ereader.bio_energetics_banner_minimized` | User thu banner |

---

## Errors

Không có error codes — đây là informational feature, không block.

---

## Notes for AI/codegen

- Phase 1: banner tĩnh chỉ là văn bản — không cần microphone
- Phase 2+: Web Audio API (`navigator.mediaDevices.getUserMedia`) để đo decibel — cần user permission
- Banner phải visible ngay cả khi user đang ở chế độ full-screen tụng niệm
- Kết hợp với `passive-listening-active-chanting-segregation.md` — sessionType phải được phân loại đúng trước

---

## Related

- [passive-listening-active-chanting-segregation.md](./passive-listening-active-chanting-segregation.md) — phân loại nghe thụ động vs tụng chủ động
- [hardware-posture-enforcer.md](./hardware-posture-enforcer.md) — các ràng buộc vật lý khác khi tụng kinh
