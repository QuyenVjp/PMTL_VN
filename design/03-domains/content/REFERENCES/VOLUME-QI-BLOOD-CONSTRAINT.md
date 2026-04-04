# VOLUME-QI-BLOOD-CONSTRAINT

## Owner
- `content` (E-Reader)

## Purpose
Ràng buộc Âm lượng Khí - Huyết (Volume / Qi-Blood Constraint)

---

## Business Rule

### Rule - Volume affects Qi and Blood circulation
**Nghiệp vụ:**
- Niệm kinh **quá to** → tổn Khí (tổn thương năng lượng)
- Niệm **hoàn toàn im lặng** (đọc thầm trong đầu) → trệ tuần hoàn máu (huyết)
- **Phương pháp đúng:** Nhép miệng phát ra âm thanh rất nhỏ (just audible)

---

## UX Flow

```
User mở E-Reader (Kinh, 88 Buddhas, v.v.)
  ↓
Persistent banner on E-Reader:
  "⚠️ CẢNH BÁO ÂM LƯỢNG:
   ❌ Không đọc thầm hoàn toàn (hại huyết)
   ❌ Không đọc tiếng to (tổn khí)
   ✅ Hãy nhép miệng âm thanh vừa đủ nghe"
```

---

## UI Components

### Persistent Volume Banner (Sticky)
```
┌────────────────────────────────────────────┐
│  ⚠️ QUY TẮC ÂM LƯỢNG NIỆM KINH            │
├────────────────────────────────────────────┤
│  ❌ KHÔNG đọc thầm hoàn toàn              │
│     (Hại máu huyết, trệ tuần hoàn)        │
│                                            │
│  ❌ KHÔNG đọc tiếng to                    │
│     (Tổn khí, tổn thương năng lượng)      │
│                                            │
│  ✅ Hãy nhép miệng âm thanh VỪA ĐỦ NGHE   │
│     (Chỉ cần bản thân nghe thấy)          │
│                                            │
│  [x] Tôi đã hiểu, không hiện lại         │
└────────────────────────────────────────────┘
```

### Audio Volume Guideline (Visual)
```
┌────────────────────────────────────────────┐
│  🔊 Âm lượng niệm kinh:                   │
│                                            │
│  |─────────────────────────────────────|  │
│  ^TOO     SILENT  CORRECT   LOUD    TOO^  │
│  LOUD                               LOUD   │
│                    ▲                       │
│              Nhép miệng nhỏ               │
└────────────────────────────────────────────┘
```

---

## Schema Hints

```prisma
model ReadingSessionPreference {
  id                    String   @id
  userId                String   @unique
  hasSeenVolumeWarning  Boolean  @default(false)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])
  @@map("reading_session_preferences")
}
```

---

## References
- External source: Wenda Q&A về âm lượng niệm kinh và khí huyết

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 7 Logic 8
