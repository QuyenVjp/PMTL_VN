# USE CASE: Mantra Interruption Lock Protocol
**Module:** `wisdom-qa`, `content`, `engagement`  
**Phase:** 40 - 15 Luật Vật Lý & Tâm Linh Cực Kỳ Vi Tế  
**Source:** Dharma Door Core Texts, Mantra Interruption Handling

---

## 📋 Tóm Tắt Nghiệp VỤ

**Khi đang tụng Kinh mà bị gián đoạn, phải niệm "Ông Lai Mu Suo He" để tạm khóa. Xong việc → niệm lại rồi mới tụng tiếp.**

### 🔐 KHÓA & MỞ:
- **Khóa:** "Ông Lai Mu Suo He" 1 lần
- **Mở:** "Ông Lai Mu Suo He" 1 lần
- **Kinh ngắn:** Niệm lại từ đầu (không cần khóa/mở)

---

## 🎯 Acceptance Criteria

### AC1: Long Sutra Detection
**GIVEN** reciting long sutra  
**WHEN** detect interruption  
**THEN** 
- Offer locking option:
  ```
  ⏸️  GIÃ̀N ĐOẠN: KHÓA KINH
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Bạn đang tụng: Tâm Kinh (Kinh Dài)
  Tiến độ: 30% (trang 2/6)
  
  Phát hiện: Điện thoại gọi đến
              Có khách đến
              Cần tạm dừng
  
  ⚠️  CẢNH BÁO:
  - Không được bỏ ngang kinh
  - Tâm sẽ bị "rơi vào hỗn độn"
  - Cần KHÓA lại trước khi rời
  
  ✅ PHẢI LÀM:
  ✓ Niệm "Ông Lai Mu Suo He" 1 lần
  ✓ Tạm dừng niệm
  ✓ Xử lý việc gấp
  ✓ Quay lại, niệm "Ông Lai Mu Suo He" 1 lần
  ✓ Tiếp tục từ chỗ dừng
  
  [Niệm Khóa - Tạm Dừng]
  ```

### AC2: Locking Mantra Recitation
**GIVEN** need to interrupt  
**WHEN** pause recitation  
**THEN** 
- Guide locking recitation:
  ```
  🔐 BƯỚC 1: KHÓA KINH
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Khi bị gián đoạn giữa tụng Kinh:
  
  Niệm 1 LẦN chữ khóa này:
  
  "Ông Lai Mu Suo He"
  (Âm Hán: Om Lai Mu Suo He)
  
  💡 Ý nghĩa:
  - "Ông" = Mở bắt đầu
  - "Lai Mu Suo He" = Khóa
  - Cách niệm: chậm, rõ ràng, 1 lần duy nhất
  
  ⏱️  Duration: ~5 giây
  
  Lúc này:
  - Kinh được "tạm dừng"
  - Tâm được "bảo vệ"
  - Có thể rời đi xử lý việc
  
  [Đã Khóa - Xử Lý Việc]
  ```

### AC3: Temporary Pause Period
**GIVEN** locking complete  
**WHEN** handling interruption  
**THEN** 
- Show pause window:
  ```
  ⏳ GIỮ GIỮ: XỬ LÝ VIỆC GẤP
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Từ lúc bạn niệm "Ông Lai Mu Suo He":
  - Kinh bị khóa an toàn
  - Bạn có thời gian xử lý
  - Không có giới hạn thời gian cố định
  
  Nên xử lý nhanh:
  - Trả lời điện thoại (2-5 phút)
  - Tiếp khách (5-10 phút)
  - Cấp cứu (dù bao lâu)
  
  ❌ CẤM:
  ✗ Để quá lâu (>1 giờ)
  ✗ Đi ăn cơm rồi quay lại
  ✗ Ngủ rồi thức dậy mở
  
  [Xử Lý Xong]
  ```

### AC4: Unlocking Mantra Recitation
**GIVEN** ready to resume  
**WHEN** complete interruption  
**THEN** 
- Guide unlocking:
  ```
  🔓 BƯỚC 2: MỞ KINH
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Xử lý xong việc gấp.
  Quay lại chỗ kinh.
  
  Niệm 1 LẦN chữ mở:
  
  "Ông Lai Mu Suo He"
  (Giống chữ khóa, nhưng lần này MỞ)
  
  💡 Cách phân biệt:
  - Khóa: Niệm khi chưa xong kinh
  - Mở: Niệm khi sẵn sàng tiếp tục
  - Cùng một chữ, nhưng ý khác nhau
  
  ⏱️  Duration: ~5 giây
  
  Lúc này:
  - Kinh được "mở khóa"
  - Tâm lại tập trung
  - Sẵn sàng tụng tiếp
  
  [Đã Mở - Tiếp Tục Tụng]
  ```

### AC5: Resume From Exact Point
**GIVEN** unlocking complete  
**WHEN** resume recitation  
**THEN** 
- Guide continuation:
  ```
  ▶️  TIẾP TỤC: TỪMM CHỖ DỪNG
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Sau khi niệm "Ông Lai Mu Suo He" (mở):
  
  ✅ TIẾP TỤC NGAY:
  - Bạn ở trang 2, dòng 5
  - Hãy tụng từ dòng 5 đó
  - Không cần tụng lại từ trang 1
  
  💡 Lý do:
  - Khóa/Mở chữ "định tâm"
  - Tâm không bị rơi vào hỗn độn
  - Kinh được "dính liền"
  
  ⏱️  Tiếp tục tụng đến hết
  
  [Hoàn Tất Kinh]
  ```

### AC6: Short Sutra Exception (Restart Rule)
**GIVEN** reciting short sutra  
**WHEN** interrupted  
**THEN** 
- Show alternative:
  ```
  📖 KINH NGẮN: TỤNG LẠI TỪ ĐẦU
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Nếu bạn tụng KINH NGẮN:
  - Tâm Kinh (short version) < 5 phút
  - Chú Vãng Sanh < 3 phút
  - Chú Đại Bi < 5 phút
  
  ❌ CÓ THỂ KHÔNG CẦN KHÓA/MỞ
  
  Thay vào đó:
  ✅ Bỏ nó, tụng lại từ đầu
  - Ngắn hơn khóa/mở
  - Tâm cũng yên tĩnh
  - Kết quả tương tự
  
  💡 Tiêu chí "ngắn":
  - < 10 phút = ngắn
  - >= 10 phút = dài (cần khóa)
  
  [Chọn Phương Pháp]
  ```

### AC7: Audit Interruption Handling
**GIVEN** sutra recitation complete  
**WHEN** log event  
**THEN** 
- Record lock/unlock:
  ```typescript
  {
    suturaRecitationSessionId: <uuid>,
    userId: <uuid>,
    suturaType: 'HEART_SUTRA' | 'VANGSAMH' | 'OTHER',
    suturaLength: 'SHORT' (<10min) | 'LONG',
    
    interruptions: [
      {
        interruptionTime: <timestamp>,
        lockingMantrasRecited: 1,
        pauseDurationMinutes: 5,
        unlockinMantrasRecited: 1,
        resumptionPoint: 'EXACT_LINE',
        status: 'SUCCESSFULLY_HANDLED'
      }
    ],
    
    complianceScore: 100,
    timestamp: now()
  }
  ```

---

## 📚 References

- **Giáo lý gốc:** Dharma Door Texts - Mantra Interruption
- **Q&A Huyền học:** Tại sao cần khóa/mở?
- **Hướng dẫn thực hành:** Kỹ thuật khóa lại

---

## 🏷️ Tags
`#phase-40` `#mantra-lock` `#interruption-protocol` `#mind-protection` `#sutra-recitation`
