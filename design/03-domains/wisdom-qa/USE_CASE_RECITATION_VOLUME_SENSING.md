# USE CASE: Recitation Volume Sensing (Whisper vs Silent)
**Module:** `wisdom-qa`, `content`  
**Phase:** 40 - 15 Luật Vật Lý & Tâm Linh Cực Kỳ Vi Tế  
**Source:** Dharma Door Core Texts, Recitation Physiology

---

## 📋 Tóm Tắt Nghiệp VỤ

**Tụng kinh lớn tiếng → tổn khí. Tụng kinh thầm hoàn toàn → tổn huyết. Phải tìm điểm cân bằng: nhép miệng phát âm siêu nhỏ vừa đủ tai mình nghe.**

### 📏 BA CẬP ĐỘ:
- **Lớn tiếng (SAI)** → Tổn Khí (lỗ hổng)
- **Thầm hoàn toàn (SAI)** → Tổn Huyết (trệ lưu)
- **Thì thầm nhỏ (ĐÚNG)** → Cân bằng

---

## 🎯 Acceptance Criteria

### AC1: Loud Recitation Detection
**GIVEN** recite aloud  
**WHEN** volume too high  
**THEN** 
- Warn about Qi loss:
  ```
  🔊 CẢNH BÁO: TỤNG QUÁ LỚN TIẾNG
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Hệ thống phát hiện:
  - Bạn tụng Tâm Kinh to rõ (>65dB)
  - Giọng lớn, rõ ràng, mọi người nghe
  
  ❌ KHÔNG ĐƯỢC!
  
  Hậu quả:
  - Tụng kinh lớn tiếng = tổn KHÁT
  - Khí = năng lượng sống
  - Tổn khí → lỗ hổng năng lượng
  - Vong linh có thể xâm nhập
  
  Triệu chứng tổn khí:
  ✗ Cảm thấy đuối sức dù mới tụng
  ✗ Đau đầu, choáng váng
  ✗ Dễ bị cảm lạnh
  ✗ Miễn dịch yếu
  
  ✅ PHẢI LÀM:
  ✓ Giảm âm lượng
  ✓ Giữ độ khí vừa đủ
  ✓ Nhép miệng phát âm siêu nhỏ
  
  [Giảm Âm Lượng]
  ```

### AC2: Silent Recitation Detection (Blood Stagnation)
**GIVEN** recite completely silent  
**WHEN** detect no vocalization  
**THEN** 
- Warn about Blood stagnation:
  ```
  🤐 CẢNH BÁO: TỤNG HOÀN TOÀN THẦM
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Hệ thống phát hiện:
  - Bạn tụng Kinh hoàn toàn im lặng
  - Không một âm thanh
  - Chỉ trong tâm (mind recitation)
  
  ❌ KHÔNG ĐƯỢC!
  
  Hậu quả:
  - Tụng kinh hoàn toàn thầm → tổn HUYẾT
  - Huyết = lưu thông máu
  - Tổn huyết → đình trệ lưu thông
  - Gây bệnh tắc mạch, u tuyến
  
  Triệu chứng tổn huyết:
  ✗ Cảm thấy nặng nề, buồn chán
  ✗ Lưu thông máu yếu
  ✗ Tê tại từng bộ phận cơ thể
  ✗ Nguy hiểm về tim mạch
  
  ✅ PHẢI LÀM:
  ✓ Phát âm ít nhất
  ✓ Nhép miệng để tiếng siêu nhỏ
  ✓ Vừa đủ cho tai mình nghe
  ✓ Không để người khác nghe rõ
  
  [Tăng Âm Lượng Tối Thiểu]
  ```

### AC3: Optimal Whisper Volume
**GIVEN** adjust to balanced level  
**WHEN** reach sweet spot  
**THEN** 
- Show ideal recitation:
  ```
  ✨ ÂMÙ LƯỢNG CHUẨN: NHẸ NHỏ RIÊNG TƯ
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Cách tụng ĐÚNG:
  
  Nhép miệng phát âm:
  - Siêu nhỏ, nhẹ
  - Chỉ BẠN nghe thấy
  - Người ở cạnh không rõ (hoặc nghe nhẹ)
  - Giọng như thì thầm, não bộ nghe
  
  💡 Mô tả âm lượng:
  - Lớn tiếng: "NAM MỌ..." (65-75dB)
  ↓↓↓
  - Bình thường: "nam mọ..." (45-55dB)
  ↓↓↓
  - Nhẹ: "nam...mọ..." (30-40dB) ✅ ĐÚNG
  ↓↓↓
  - Thầm: (không phát âm) ❌ SAI
  
  ✅ CẬP ĐỘ CHUẨN:
  - Tai bạn vừa vừa nghe được
  - Tâm chúng tập trung vào chữ
  - Hơi thở vừa vừa sao cho có âm
  
  [Điều Chỉnh Âm Lượng Tối Ưu]
  ```

### AC4: Breathing Coordination
**GIVEN** reach optimal volume  
**WHEN** maintain during recitation  
**THEN** 
- Guide breathing technique:
  ```
  🌬️  HƠI THỞ: THÍCH ỨNG NHẸ NHÀNG
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Khi tụng ở âm lượng tối ưu:
  
  Kỹ thuật hơi thở:
  1. Hít vào bình thường (qua mũi)
  2. Nhẹ nhàng thở ra (qua miệng)
  3. Lúc thở ra: phát âm siêu nhỏ
  4. Lặp lại tự nhiên không vất vả
  
  💡 Lưu ý:
  - Không nên cố gắng "giữ hơi"
  - Không nên "nén hơi" để làm im lặng
  - Tự nhiên, nhịp nhàng, dài khoảng
  - Giống như nói chuyện thì thầm
  
  ⏱️  Duration: Có thể tụng 1-2 giờ không mệt
  
  [Duy Trì Âm Lượng Tối Ưu]
  ```

### AC5: Context-Based Volume Adjustment
**GIVEN** different recitation environments  
**WHEN** adjust for context  
**THEN** 
- Show adaptive guidance:
  ```
  🌍 NGỮ CẢNH: ĐIỀU CHỈNH LINH HOẠT
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Các tình huống khác nhau:
  
  ●1. Nhà một mình:
  → Có thể nhẹ hơn (nhìn thầm 80%)
  → Nhưng VẪN phải có âm siêu nhỏ
  
  ●2. Phòng khách (gia đình):
  → Giữ âm siêu nhỏ (thì thầm)
  → Không làm phiền người khác
  → Vừa đủ bạn nghe
  
  ●3. Nơi công cộng (quán, tàu):
  → Âm siêu nhỏ, hoàn toàn kín
  → Chỉ bạn biết bạn đang tụng
  → Hơi thở vừa vừa thôi
  
  ●4. Tại bàn thờ (lúc thắp hương):
  → Có thể hơi lớn hơn bình thường
  → Nhưng KHÔNG lớn tiếng
  → Vẫn tôn trọng sự im lặng
  
  ✅ QUY TẮC CHUNG:
  - Luôn tìm cân bằng
  - Không bao giờ lớn tiếng
  - Không bao giờ hoàn toàn im lặng
  
  [Điều Chỉnh Theo Ngữ Cảnh]
  ```

### AC6: Health Monitoring
**GIVEN** detect symptoms  
**WHEN** check volume impact  
**THEN** 
- Show wellness check:
  ```
  💚 KIỂM TRA: SỨC KHỎE QI/HUYẾT
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Sau khi tụng Kinh:
  
  Nếu thấy TỔNÙ KHÍ:
  ✗ Thở không yên, khó hít
  ✗ Đuối sức, mệt mỏi
  ✗ Đầu nhẹ, xoay tròn
  
  → Bạn đã tụng QUÁ LỚN
  → Cần giảm âm lượng ngay
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Nếu thấy TỔNÙ HUYẾT:
  ✗ Cơ thể nặng nề, chùng
  ✗ Máu chảy chậm
  ✗ Tê tại chân tay
  
  → Bạn đã tụng HOÀN TOÀN THẦM
  → Cần tăng âm siêu nhỏ ngay
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Nếu thấy CÂN BẰNG:
  ✓ Sảng khoái, tâm an
  ✓ Năng lượng ổn định
  ✓ Có thể tụng lâu không mệt
  
  → Âm lượng của bạn CHUẨN!
  
  [Xác Nhận Lựa Chọn]
  ```

### AC7: Audit Recitation Quality
**GIVEN** session complete  
**WHEN** log volume data  
**THEN** 
- Record compliance:
  ```typescript
  {
    recitationSessionId: <uuid>,
    userId: <uuid>,
    suturaType: 'HEART_SUTRA' | 'VANGSAMH',
    durationMinutes: 45,
    
    volumeMetrics: {
      averageDb: 38, // 25-45 dB = optimal whisper
      volumeConsistency: 'STABLE',
      noPeaks: true, // no loud spikes
      noSilence: true, // no complete silence
      qualityScore: 95
    },
    
    healthIndicators: {
      breatingEasy: true,
      noBreathlessness: true,
      noTinnitus: true,
      bloodFlowNormal: true
    },
    
    timestamp: now()
  }
  ```

---

## 📚 References

- **Giáo lý gốc:** Dharma Door Texts - Recitation Physiology
- **Q&A Huyền học:** Tại sao tổn khí/huyết?
- **Hướng dẫn thực hành:** Kỹ thuật hơi thở

---

## 🏷️ Tags
`#phase-40` `#recitation-volume` `#breathing-technique` `#qi-blood-balance` `#health-optimization`
