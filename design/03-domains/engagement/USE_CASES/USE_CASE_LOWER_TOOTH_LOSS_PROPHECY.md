# USE CASE: Lower Tooth Loss Prophecy Matrix
**Module:** `engagement` (Dream Analysis)  
**Phase:** 25 - Micro-Normalization & Specific Karma Measurement  
**Source:** Buddhism in Plain Terms, Hướng dẫn Ngôi Nhà Nhỏ, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp Vụ

Trong hệ thống giải mộng của PMTL, giấc mơ thấy **"bị rụng chiếc răng hàm dưới"** là một điềm báo cực kỳ nguy hiểm và CỤ THỂ:

### 🚨 Ý Nghĩa Chính Xác:
Báo hiệu mối quan hệ tồi tệ HOẶC **vấn đề sức khỏe nghiêm trọng** sẽ giáng xuống một **NGƯỜI THÂN NHỎ TUỔI HƠN** (younger family member - thường là con cái, cháu).

### Phân Biệt:
- **Răng TRÊN** rụng → Người thân lớn tuổi hơn (cha mẹ, ông bà)
- **Răng DƯỚI** rụng → Người thân nhỏ tuổi hơn (con cái, cháu)

### ⚠️ Yêu Cầu Hành Động Khẩn Cấp:
Khi detect được dream pattern này → **RED ALERT** → Phác đồ cấp cứu:
1. ✅ Thêm ngay **"Chú Giải Kết"** vào thời khóa cho đứa trẻ
2. ✅ Khẩn cấp niệm **Ngôi Nhà Nhỏ** cho "Người cần kinh của [Tên đứa trẻ]"
3. ✅ Làm **TRƯỚC KHI** sự việc nổ ra (timing rất quan trọng)

---

## 🎯 Acceptance Criteria

### AC1: Keyword Detection In Dream Text
**GIVEN** user nhập nội dung giấc mơ  
**WHEN** AI `DreamInterpreter` phân tích text  
**THEN** 
- Detect các keyword patterns:
  - Vietnamese: `rụng răng dưới`, `mất răng hàm dưới`, `răng dưới rơi`, `nhổ răng dưới`
  - English: `lost lower tooth`, `lower tooth fell out`, `bottom tooth extraction`

### AC2: Trigger RED ALERT
**GIVEN** keyword `[Rụng răng dưới]` được detect  
**WHEN** analysis hoàn thành  
**THEN** 
- Kích hoạt **RED ALERT** UI:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🚨 CẢNH BÁO ĐIỀM MƠ NGUY HIỂM
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Giấc mơ của bạn chứa điềm báo nghiêm trọng:
  
  "RỤNG RĂNG HÀM DƯỚI"
  
  Ý nghĩa: Người thân NHỎ TUỔI HƠN (con/cháu) 
  sắp gặp nạn hoặc chống đối.
  
  Hành động khẩn cấp được khuyến nghị ⬇️
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC3: Generate Emergency Prescription
**GIVEN** RED ALERT được kích hoạt  
**WHEN** hệ thống generate prescription  
**THEN** 
- Tạo phác đồ chi tiết:
  ```
  📋 PHÁC ĐỒ KHẨN CẤP - HÓA GIẢI ĐIỀM MƠ
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🎯 Đối tượng: Người thân nhỏ tuổi hơn 
     (con/cháu/em)
  
  ⏰ Timing: LẬP TỨC (trước khi sự việc nổ ra)
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  BƯỚC 1: Thêm "Chú Giải Kết" vào thời khóa
  
  Đối tượng niệm cho: [Tên đứa trẻ]
  Số lượng: 49 biến/ngày, trong 7-21 ngày
  Mục đích: Hóa giải oan kết, tránh tai nạn
  
  [+ Thêm Vào Thời Khóa]
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  BƯỚC 2: Niệm Ngôi Nhà Nhỏ
  
  Kính tặng: Người cần kinh của [Tên đứa trẻ]
  Số lượng: 3-7 tờ
  Thời gian: Tuần này
  
  [+ Tạo Ngôi Nhà Nhỏ Ngay]
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  BƯỚC 3: Theo dõi sát sao
  
  - Quan sát hành vi/sức khỏe của trẻ
  - Chú ý các dấu hiệu bất thường
  - Tiếp tục niệm cho đến khi có mộng tốt
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC4: Quick Action Buttons
**GIVEN** prescription được hiển thị  
**WHEN** user muốn hành động ngay  
**THEN** 
- Cung cấp shortcut buttons:
  1. `[+ Thêm Chú Giải Kết Vào Thời Khóa]` → Pre-fill form với:
     - Mantra: "Chú Giải Kết"
     - Count: 49
     - Target: [Danh sách con cái để chọn]
  2. `[+ Tạo Ngôi Nhà Nhỏ Ngay]` → Pre-fill LittleHouse form với:
     - Recipient: "Người cần kinh của [Child Name]"
     - Quantity: 3-7 sheets
     - Urgency: HIGH

### AC5: Child Selection Interface
**GIVEN** user bấm quick action button  
**WHEN** form mở ra  
**THEN** 
- Hiển thị danh sách con cái/cháu đã được lưu trong hệ thống:
  ```
  👨‍👩‍👧‍👦 CHỌN NGƯỜI THÂN CẦN HÓA GIẢI
  
  ○ Nguyễn Văn A (Con trai, 8 tuổi)
  ○ Nguyễn Thị B (Con gái, 5 tuổi)
  ○ [+ Thêm người thân mới]
  
  [Hủy]  [Xác Nhận]
  ```

### AC6: Dream Pattern Confidence Score
**GIVEN** AI phân tích giấc mơ  
**WHEN** detect keyword "răng dưới"  
**THEN** 
- Hiển thị confidence level:
  ```
  🎯 Độ Chính Xác Phân Tích: 95%
  
  Pattern match: "rụng răng hàm dưới"
  Category: Người thân nhỏ tuổi hơn
  Severity: ⚠️⚠️⚠️ (3/3 - Cao)
  Action required: Khẩn cấp
  ```

### AC7: Context Disambiguation
**GIVEN** dream text chứa thêm context  
**WHEN** AI phân tích chi tiết  
**THEN** 
- Refine interpretation:
  
  **Example 1:** "Mơ thấy con trai rụng răng dưới"
  → Confidence: 99% (explicit mention)
  → Target: Con trai
  
  **Example 2:** "Mơ thấy mình rụng răng dưới"
  → Confidence: 85% (implicit - có thể là con/cháu)
  → Suggest: "Bạn có con/cháu nhỏ tuổi không? Điềm này thường báo cho người thân nhỏ tuổi hơn."

### AC8: Follow-Up Dream Tracking
**GIVEN** user đã thực hiện phác đồ  
**WHEN** họ có giấc mơ tiếp theo  
**THEN** 
- Link dream sequence:
  ```
  📊 Theo Dõi Hiệu Quả
  
  Giấc mơ ban đầu: 01/04/2026 - Rụng răng dưới
  Phác đồ bắt đầu: 02/04/2026
  
  Giấc mơ mới nhất: 10/04/2026 - [New dream]
  
  Đánh giá: 
  ○ Tình hình cải thiện (có mộng tốt)
  ○ Chưa rõ ràng (tiếp tục theo dõi)
  ○ Vẫn có mộng xấu (tăng cường niệm)
  ```

---

## 🔧 Technical Notes

### AI Dream Analyzer
```typescript
// Location: apps/api/src/engagement/services/dream-interpreter.service.ts

const LOWER_TOOTH_PATTERNS = [
  // Vietnamese
  /rụng\s+răng\s+dưới/i,
  /mất\s+răng\s+(hàm\s+)?dưới/i,
  /răng\s+dưới\s+(rơi|gãy|nhổ)/i,
  /nhổ\s+răng\s+dưới/i,
  
  // English
  /lost?\s+lower\s+tooth/i,
  /(lower|bottom)\s+tooth\s+(fell|extraction|removed)/i,
];

async function analyzeDream(dreamText: string): Promise<DreamAnalysis> {
  // Check for lower tooth pattern
  const hasLowerToothPattern = LOWER_TOOTH_PATTERNS.some(
    pattern => pattern.test(dreamText)
  );
  
  if (hasLowerToothPattern) {
    return {
      severity: 'HIGH',
      category: 'YOUNGER_FAMILY_MEMBER_DANGER',
      confidence: 0.95,
      alert: {
        type: 'RED_ALERT',
        title: 'Điềm báo người thân nhỏ tuổi gặp nạn',
        urgency: 'IMMEDIATE'
      },
      prescription: generateLowerToothPrescription()
    };
  }
  
  // ... other dream patterns
}
```

### Database Schema
```prisma
model DreamEntry {
  id              String   @id @default(cuid())
  userId          String
  dreamDate       DateTime
  dreamText       String   @db.Text
  
  // AI analysis results
  category        String?
  severity        String?  // LOW, MEDIUM, HIGH
  confidence      Float?
  hasRedAlert     Boolean  @default(false)
  
  // Prescription tracking
  prescriptionId  String?
  prescriptionApplied Boolean @default(false)
  
  // Follow-up tracking
  relatedDreamIds Json?    // Array of linked dream IDs
  resolutionStatus String? // PENDING, IMPROVING, RESOLVED
  
  user User @relation(fields: [userId], references: [id])
  
  @@index([userId, dreamDate])
  @@index([hasRedAlert])
}

model DreamPrescription {
  id              String   @id @default(cuid())
  dreamEntryId    String
  prescriptionType String  // MANTRA_ADDITION, LITTLE_HOUSE, COMBINED
  targetPersonId  String?
  urgencyLevel    String
  generatedAt     DateTime @default(now())
  appliedAt       DateTime?
  
  @@index([dreamEntryId])
}
```

### Prescription Generator
```typescript
function generateLowerToothPrescription(): Prescription {
  return {
    steps: [
      {
        order: 1,
        title: 'Thêm "Chú Giải Kết" vào thời khóa',
        action: 'ADD_MANTRA',
        params: {
          mantra: 'JIEKNOET_CHOU', // Chú Giải Kết
          count: 49,
          frequency: 'DAILY',
          duration: '7-21 days',
          targetType: 'YOUNGER_FAMILY_MEMBER'
        }
      },
      {
        order: 2,
        title: 'Niệm Ngôi Nhà Nhỏ',
        action: 'CREATE_LITTLE_HOUSE',
        params: {
          quantity: '3-7',
          urgency: 'HIGH',
          recipientTemplate: 'Người cần kinh của [Child Name]'
        }
      },
      {
        order: 3,
        title: 'Theo dõi sát sao',
        action: 'MONITOR',
        params: {
          watchFor: ['behavioral changes', 'health issues', 'accidents'],
          continueUntil: 'positive dream appears'
        }
      }
    ],
    timing: 'IMMEDIATE',
    warningText: 'Làm TRƯỚC KHI sự việc nổ ra (timing rất quan trọng)'
  };
}
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Chương về giải mộng
- **Q&A Huyền học:** Ý nghĩa các loại giấc mơ về răng
- **Hướng dẫn thực hành:** Phác đồ khẩn cấp cho điềm mơ xấu

---

## 🏷️ Tags
`#phase-25` `#dream-analysis` `#prophecy` `#lower-tooth` `#child-protection` `#emergency-prescription` `#engagement`
