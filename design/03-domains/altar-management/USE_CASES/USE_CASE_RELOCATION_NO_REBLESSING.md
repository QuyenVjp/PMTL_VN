# USE CASE: Relocation No-Reblessing Workflow
**Module:** `altar-management`, `calendar`  
**Phase:** 34 - Tầng Kiểm Soát Vật Lý & Chống Trục Lợi Pháp Bảo  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

Khi **chuyển nhà**:

### 🏠 TẠI NHÀ CŨ:
1. Thắp nén nhang cuối
2. Đợi cháy hết
3. Thỉnh Bồ Tát xuống → bọc vải đỏ

### 🏠 TẠI NHÀ MỚI:
1. **Bàn thờ PHẢI lập ĐẦU TIÊN** (trước khi dọn đồ)
2. Thắp 3 nén nhang
3. Niệm 7 Đại Bi + 7 Tâm Kinh
4. **KHÔNG cần khai quang lại** → Tượng tự động có linh khí

---

## 🎯 Acceptance Criteria

### AC1: Relocation Checklist Creation
**GIVEN** user create "Relocation" event  
**WHEN** input moving date  
**THEN** 
- System auto-generate 2-phase checklist:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🚚 DANH SÁCH CHUYỂN NHÀ (Liên Quan Đến Bàn Thờ)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  GIAI ĐOẠN 1: NHÀ CŨ
  
  ☐ Thắp nén nhang cuối & đợi cháy hết
  ☐ Khấn xin Bồ Tát xuống
  ☐ Bọc tượng bằng vải đỏ
  ☐ Đã hoàn thành bàn thờ cũ
  
  GIAI ĐOẠN 2: NHÀ MỚI
  
  ☐ Lập bàn thờ ĐẦU TIÊN (trước dọn đồ)
  ☐ Thắp 3 nén nhang
  ☐ Niệm 7 Đại Bi
  ☐ Niệm 7 Tâm Kinh
  ☐ Đã hoàn thành lập bàn thờ mới
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC2: Old House - Final Blessing Alert
**GIVEN** user in Phase 1 (Old House)  
**WHEN** day before moving  
**THEN** 
- Send reminder notification:
  ```
  🏠 CHUẨN BỊ CHUYỂN NHÀ
  
  ⚠️  THẮP NHEN NHANG CUỐI
  
  Hôm nay bạn cần:
  1. Thắp 1 nén nhang cuối cùng
  2. Đợi nó cháy hết
  3. Đọc lời khấn xin Bồ Tát xuống
  4. Bọc tượng bằng vải đỏ
  
  [Xem Hướng Dẫn]
  ```

### AC3: New House - Setup First Alert
**GIVEN** relocation day  
**WHEN** user indicate arrival at new house  
**THEN** 
- Critical alert (RED):
  ```
  🚨 ĐẬU LÙNG CẢNH BÁO!
  
  PHẢI LẬP BÀN THỜ ĐẦU TIÊN
  
  Ngay khi đến nhà mới, TRƯỚC KHI dọn đồ đạc:
  
  1. Lập bàn thờ
  2. Thắp 3 nén nhang
  3. Niệm 7 Đại Bi
  4. Niệm 7 Tâm Kinh
  
  SAI QUY TẮC → Bị điều tiết bất lợi
  
  [Bắt Đầu Setup]
  ```

### AC4: Setup Locked Until Completed
**GIVEN** user finish new altar setup  
**WHEN** all rituals complete  
**THEN** 
- Unlock Phase 2:
  ```
  ✅ BÀN THỜ MỚI ĐÃ ĐƯỢC LẬP
  
  Bồ Tát đã ngự giá tại nhà mới của bạn.
  
  💡 Lưu Ý: Tượng KHÔNG CẦN khai quang lại.
  Bạn chỉ cần dâng hương & lạy bái.
  
  Giờ bạn có thể bắt đầu dọn đồ đạc vào nhà.
  
  [Hoàn Thành]
  ```

### AC5: Reassurance Message
**GIVEN** phase 2 complete  
**WHEN** show success  
**THEN** 
- Display:
  ```
  ✨ CHUYỂN NHÀ THÀNH CÔNG
  
  Theo giáo lý, tượng Bồ Tát đã được 
  khai quang lần đầu sẽ TỰ ĐỘNG có linh khí 
  ở bất kỳ nơi nào bạn thắp hương.
  
  BẠN KHÔNG CẦN làm lễ khai quang lại.
  
  Chỉ cần tiếp tục dâng hương, lạy bái hàng ngày.
  
  🙏 Bồ Tát sẽ tiếp tục bảo vệ bạn ở nhà mới.
  ```

---

## 🔧 Technical Notes

### Relocation Event Model
```prisma
model RelocationEvent {
  id              String   @id @default(cuid())
  userId          String
  oldAddress      String
  newAddress      String
  movingDate      DateTime
  
  phase1Complete  Boolean  @default(false) // Old house
  phase2Complete  Boolean  @default(false) // New house
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Quy tắc chuyển nhà
- **Q&A Huyền học:** Không cần khai quang lại
- **Hướng dẫn thực hành:** Trình tự chuyển bàn thờ

---

## 🏷️ Tags
`#phase-34` `#altar-management` `#relocation` `#no-reblessing` `#workflow-gate`
