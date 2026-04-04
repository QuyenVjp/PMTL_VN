# JOSS-PAPER-CLASH-WARNING

## Owner
- `engagement` (Little House burn flow)
- `content` (canonical warning copy)

## Purpose
Cảnh báo nghiêm trọng khi user chọn đốt TPT cho người chết (亡人) về việc **TUYỆT ĐỐI KHÔNG ĐỐT KÈM VÀNG MÃ TRUYỀN THỐNG**.

---

## Business Rule: Joss Paper Clash

### Rule - Không đốt vàng mã khi đốt TPT cho người chết
**Nghiệp vụ:**
- Khi user chọn mục đích đốt TPT là `[Cho người thân quá cố / 亡人]`.
- Hệ thống **bắt buộc** nhảy cảnh báo **Hard Warning** màu đỏ.

**Lý do tâm linh (giải thích cho user):**
- **TPT** (Tiểu Phương Tử) chứa năng lượng để đưa vong linh lên các cõi cao:
  - A-tu-la (Asura realm)
  - Cõi Trời (Deva realm)
- **Vàng mã truyền thống** (joss paper / spirit money) chỉ dùng ở cõi Âm (Địa phủ / Hell realm).

**Hậu quả nếu đốt kèm vàng mã:**
- Vong linh đang ở cõi trên (nhờ TPT) sẽ **khởi lòng tham** khi thấy tiền.
- Họ sẽ bay xuống nhặt tiền lẻ → bị **đọa (rớt)** trở lại các cõi dưới.
- Công sức đốt TPT trở nên vô nghĩa.

---

## Logic App

### When to Trigger
```javascript
if (littleHouse.recipientType === 'DECEASED') {
  // Show JossPaperClashWarning
}
```

### Warning Severity
- **Hard Red Warning** (không cho phép bỏ qua dễ dàng)
- Phải tick checkbox xác nhận đã hiểu mới cho tiếp tục
- Không chặn cứng (vì user có thể có hoàn cảnh đặc biệt) nhưng phải confirm 2 lần

---

## UX Flow

### Flow: Burn Little House for Deceased
```
User chọn recipientType = [Người chết / 亡人]
  ↓
System detect recipientType === DECEASED
  ↓
Show JossPaperClashWarning Banner (màu đỏ, lớn)
  ↓
User đọc warning
  ↓
Checkbox: [✓] Tôi đã hiểu và cam kết KHÔNG đốt kèm vàng mã
  ↓
Button [Tiếp tục đốt] (disabled until checkbox ticked)
  ↓
Proceed to burn flow
```

---

## UI Components

### 1. JossPaperClashWarning (Hard Red Banner)
**Display Conditions:**
- `recipientType === 'DECEASED'`
- Show ngay khi user select recipient type hoặc trước khi burn

**Content:**
```
┌────────────────────────────────────────────────────────────────┐
│  🚨 CẢNH BÁO QUAN TRỌNG                                       │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  KHI ĐỐT TIỂU PHƯƠNG TỬ CHO NGƯỜI CHẾT:                      │
│                                                                │
│  ⛔ TUYỆT ĐỐI KHÔNG ĐƯỢC ĐỐT KÈM VÀNG MÃ TRUYỀN THỐNG        │
│     (spirit money / joss paper)                                │
│                                                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                                │
│  Tại sao?                                                      │
│                                                                │
│  • TPT đưa vong linh lên cõi cao (A-tu-la, cõi Trời)         │
│  • Vàng mã chỉ dùng ở cõi Âm (Địa phủ)                        │
│                                                                │
│  Nếu đốt kèm vàng mã:                                         │
│  ❌ Vong linh ở cõi trên sẽ khởi lòng tham                    │
│  ❌ Bay xuống nhặt tiền → BỊ ĐỌA trở lại cõi dưới            │
│  ❌ Công sức đốt TPT trở nên vô nghĩa                         │
│                                                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                                │
│  [✓] Tôi đã hiểu và cam kết KHÔNG đốt kèm vàng mã             │
│                                                                │
│  [Quay lại]                       [Tiếp tục đốt] (disabled)   │
└────────────────────────────────────────────────────────────────┘
```

**Styling:**
- Background: `bg-red-50` (light red)
- Border: `border-4 border-red-600` (thick red border)
- Icon: 🚨 (emergency siren)
- Text: `text-red-900` (dark red for readability)
- Checkbox required to enable `[Tiếp tục đốt]`

### 2. Burn Guidance Card (khi đốt cho người chết)
**Show after user confirms warning:**
```
┌────────────────────────────────────────────────────┐
│  Hướng dẫn đốt TPT cho người quá cố                │
├────────────────────────────────────────────────────┤
│                                                    │
│  ✅ Chỉ đốt TPT (từng tờ một)                     │
│  ✅ Đọc lời khấn đúng tên người quá cố            │
│  ✅ Chọn thời gian ban ngày, trời quang           │
│                                                    │
│  ❌ KHÔNG đốt kèm vàng mã                         │
│  ❌ KHÔNG đốt vào ngày mưa hoặc đêm tối           │
│  ❌ KHÔNG đốt quá nhiều tờ trong 1 lần            │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## Schema Hints

### Extend LittleHouse model:
```prisma
enum RecipientType {
  SELF              // Cho bản thân
  DECEASED          // Cho người chết
  FAMILY_LIVING     // Cho người thân đang sống
  HOME_SPIRIT       // Cho linh tánh nhà
  KARMIC_CREDITOR   // Cho oan gia trái chủ
}

model LittleHouse {
  // ... existing fields ...
  recipientType         RecipientType? @map("recipient_type")
  jossPaperWarningShown Boolean        @default(false) @map("joss_paper_warning_shown")
  jossPaperWarningAcked Boolean        @default(false) @map("joss_paper_warning_acked")
}
```

---

## Service Logic

### BurnWarningService (NestJS)
```typescript
export class BurnWarningService {
  async checkJossPaperClash(littleHouseId: string): Promise<{
    requiresWarning: boolean;
    warningMessage: string;
  }> {
    const lh = await this.prisma.littleHouse.findUnique({
      where: { id: littleHouseId }
    });

    if (lh.recipientType === 'DECEASED') {
      return {
        requiresWarning: true,
        warningMessage: 'TUYỆT ĐỐI KHÔNG ĐỐT KÈM VÀNG MÃ khi đốt TPT cho người chết.'
      };
    }

    return { requiresWarning: false, warningMessage: '' };
  }

  async acknowledgeJossPaperWarning(littleHouseId: string) {
    await this.prisma.littleHouse.update({
      where: { id: littleHouseId },
      data: {
        jossPaperWarningShown: true,
        jossPaperWarningAcked: true
      }
    });
  }
}
```

---

## References
- `design/03-domains/content/REFERENCES/LITTLE-HOUSE-RITUAL-FLOW.md`
- `design/03-domains/content/REFERENCES/LITTLE-HOUSE-SPECIAL-CASES.md`
- External source: Master Lu teachings về TPT và vàng mã
- `design/05-references/external-research/XLFM_RITUAL_SOURCE_INDEX.md`

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 2 Module 8
