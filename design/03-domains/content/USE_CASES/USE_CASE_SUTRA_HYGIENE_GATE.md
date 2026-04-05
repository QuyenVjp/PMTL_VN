# USE CASE: Sutra Hygiene Gate
**Module:** `content`, `engagement`  
**Phase:** 33 - Kiểm Soát Nhân Quả Chuyên Sâu & Ràng Buộc Pháp Bảo Vật Lý  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp Vụ

Kinh sách là Pháp bảo **cực kỳ thiêng liêng**.

### ⚠️ QUYẾT TẮC TUYỆT ĐỐI:
Trước khi đọc Kinh **BẮT BUỘC phải**:
- ✅ Rửa tay sạch sẽ
- ✅ Không được dùng tay bẩn/nước tiểu chạm vào Kinh
- ✅ Không được ăn mặn/thịt rồi tay dơ mà đặt lên Kinh

### ⚠️ HẬU QUẢ:
Nếu vi phạm → Pháp bảo bị ô uế → Công đức bị trừ, thậm chí **gặp tai nạn**.

---

## 🎯 Acceptance Criteria

### AC1: Mandatory Hygiene Confirmation Modal
**GIVEN** user mở E-Reader để bắt đầu tụng Kinh  
**WHEN** họ click vào module `content` hoặc bài Kinh  
**THEN** 
- Hiển thị **fullscreen Modal** (không skip được):
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🙏 XÁC NHẬN VỆ SINH TRƯỚC KHI ĐỌC KINH
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Kinh sách là PHÁP BẢO cực kỳ thiêng liêng.
  
  Trước khi đọc, bạn PHẢI:
  ✅ Rửa tay sạch sẽ
  ✅ Không dùng tay bẩn
  ✅ Không ăn mặn/thịt rồi tay dơ
  
  Nếu vi phạm → Pháp bảo bị ô uế 
  → Công đức bị trừ, có thể gặp tai nạn.
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  ☐ Tôi xác nhận đã rửa tay sạch sẽ
     và sẽ không dùng tay bẩn chạm vào Kinh
  
  [Hủy]  [Xác Nhận & Bắt Đầu Đọc]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC2: Checkbox Must Be Ticked
**GIVEN** modal hiển thị  
**WHEN** user chưa tick checkbox  
**THEN** 
- Nút "Xác Nhận & Bắt Đầu" bị **disabled (xám)**
- Không thể click

### AC3: Unblur Content After Confirmation
**GIVEN** user tick checkbox  
**WHEN** họ bấm "Xác Nhận"  
**THEN** 
- Modal đóng
- Nội dung Kinh được **unblurred** (hiển thị bình thường)
- Session logger ghi nhận: `hygieneConfirmed: true`

### AC4: Block Immediate Re-opening
**GIVEN** user confirm hygiene  
**WHEN** họ đóng app hoặc reload page  
**THEN** 
- Session flag `hygieneConfirmedForDate` được lưu
- Chỉ cần confirm **1 lần mỗi ngày**
- Nếu reset date (chuyển ngày khác) → Phải confirm lại

### AC5: Educational Tooltip
**GIVEN** user hover vào icon "?" trên modal  
**WHEN** tooltip shows  
**THEN** 
- Giải thích chi tiết:
  ```
  ℹ️  TẠI SAO CÓ QUY TẮC VỆ SINH?
  
  📿 PHÁP BẢO = BỔN CHÂN SỬ PHẬT
  
  Nếu tay bẩn chạm vào Kinh:
  • Năng lượng Kinh văn bị ô uế
  • Từ trường Bát Nhã bị giảm
  • Công đức của bạn bị trừ
  • Có thể gặp tai nạn
  
  ✅ CÁCH GIỮ GÌNC:
  
  1. Rửa tay sạch sẽ trước
  2. Không ăn mặn rồi không rửa
  3. Không chạm tay bẩn
  4. Để Kinh ở nơi sạch
  ```

---

## 🔧 Technical Notes

### Frontend Component
```typescript
// Location: apps/web/src/features/content/components/HygieneConfirmationModal.tsx

export function HygieneConfirmationModal({ onConfirm, onCancel }) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  // Check if already confirmed today
  const confirmedToday = localStorage.getItem('hygieneConfirmedForDate');
  const today = format(new Date(), 'yyyy-MM-dd');
  
  if (confirmedToday === today) {
    // Skip modal
    useEffect(() => onConfirm(), []);
    return null;
  }
  
  return (
    <Modal open backdrop="static">
      <ModalHeader>🙏 Xác Nhận Vệ Sinh Trước Khi Đọc Kinh</ModalHeader>
      <ModalBody>
        {/* Content */}
        <Checkbox
          checked={isConfirmed}
          onChange={(e) => setIsConfirmed(e.target.checked)}
          label="Tôi xác nhận đã rửa tay sạch sẽ..."
        />
      </ModalBody>
      <ModalFooter>
        <Button onClick={onCancel}>Hủy</Button>
        <Button
          disabled={!isConfirmed}
          onClick={() => {
            localStorage.setItem('hygieneConfirmedForDate', today);
            onConfirm();
          }}
        >
          Xác Nhận & Bắt Đầu
        </Button>
      </ModalFooter>
    </Modal>
  );
}
```

### Database Schema
```prisma
model RecitationSession {
  id                    String   @id @default(cuid())
  userId                String
  contentId             String
  startedAt             DateTime @default(now())
  
  // Hygiene tracking
  hygieneConfirmed      Boolean  @default(false)
  hygieneConfirmedAt    DateTime?
  
  user User @relation(fields: [userId], references: [id])
  
  @@index([userId, startedAt])
}
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Sự tôn kính Pháp bảo
- **Q&A Huyền học:** Quy tắc vệ sinh khi tiếp xúc Kinh sách
- **Hướng dẫn thực hành:** Cách giữ gìn Kinh văn

---

## 🏷️ Tags
`#phase-33` `#content` `#sutra-hygiene` `#dharma-protection` `#engagement`
