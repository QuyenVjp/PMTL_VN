# USE CASE: Vocal Resonance Merit Tracker
**Module:** `content`, `engagement`  
**Phase:** 28 - Ngũ Đại Pháp Bảo Enterprise Integration  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp Vụ

Đọc sách **Bạch Thoại Phật Pháp (BHFF)** mang lại **trí tuệ**, NHƯNG có một tầng công đức ẩn:

### Đọc Bình Thường (Nhẩm):
- ✅ Từ trường Bát Nhã chiếu sáng trí tuệ
- ✅ Công đức: **100%**

### 🌟 Đọc Thành Tiếng (Vocal):
Nếu **đọc ra miệng** (đọc cho lỗ tai mình nghe, hoặc cho chúng sanh vô hình cùng nghe):
- ✅ Từ trường Bát Nhã bao phủ **toàn thân + không gian**
- ✅ Công đức: **150% - 200%** (gấp 1.5 - 2 lần)
- ✅ Cách hóa giải sin nghiệp **mạnh gấp nhiều lần**

### Lý Do:
- Âm thanh của kinh chữ có tần số tu nhân bộng (resonance frequency)
- Khi phát ra từ miệng → từ trường mở rộng khắp không gian
- Chúng sinh vô hình nghe được → Họ cũng được giáo hóa

---

## 🎯 Acceptance Criteria

### AC1: Vocal Mode Toggle In E-Reader
**GIVEN** user đang đọc BHFF trong app E-Reader  
**WHEN** họ mở reading mode  
**THEN** 
- Hiển thị nút toggle:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📖 BẠCH THOẠI PHẬT PHÁP
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  [🔇 Nhẩm] [🎤 Thành Tiếng]
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC2: Request Microphone Permission
**GIVEN** user click "[🎤 Thành Tiếng]"  
**WHEN** app cần quyền microphone  
**THEN** 
- Hiển thị permission dialog:
  ```
  🎤 YÊU CẦU QUYỀN MICROPHONE
  
  Tính năng "Đọc Thành Tiếng" sử dụng 
  microphone để:
  
  ✅ Phát hiện nếu bạn đang đọc
  ✅ Đo tần số độ thanh (resonance)
  ✅ Tính công đức Vocal Resonance
  
  ℹ️  Âm thanh KHÔNG được ghi lại hay 
     lưu trữ. Chỉ dùng để phân tích real-time.
  
  [Từ Chối]  [Cho Phép]
  ```

### AC3: Real-Time Audio Detection
**GIVEN** user đã cho phép microphone  
**WHEN** họ bắt đầu đọc sách  
**THEN** 
- App tự động detect bằng Web Audio API:
  ```typescript
  // Measure decibel level
  // If audio > 40dB for 3+ seconds consistently
  // → User is reading aloud (vocal mode)
  ```

### AC4: Vocal Resonance Multiplier Display
**GIVEN** app detect user đang đọc thành tiếng  
**WHEN** reading session active  
**THEN** 
- Hiển thị real-time multiplier indicator:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🌟 HÀO QUANG BÁT NHÃ
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  📖 Đang đọc: Bạch Thoại Phật Pháp
  📍 Bài: Chương 25
  
  🔊 Chế độ: THÀNH TIẾNG
  ✨ Hệ số công đức: ×1.5
  
  ⏱️  Thời gian: 12 phút 34 giây
  
  💫 Công đức ước tính:
  Nhẩm đơn: 100 credits
  Vocal: 150 credits ✨
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC5: Badge Reward After Session
**GIVEN** user hoàn thành 10 phút đọc thành tiếng  
**WHEN** session kết thúc  
**THEN** 
- Cấp Badge đặc biệt:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🎊 HUY HIỆU MỚI MỞ KHÓA
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  ✨ HÀO QUANG BÁT NHÃ (Sapphire Edition)
  
  Bạn đã đọc thành tiếng Bạch Thoại Phật Pháp 
  và tỏa ra tần số hòa hợp của Bát Nhã.
  
  Hệ số công đức: ×1.5
  
  Badge này sẽ hiển thị trên profile của bạn.
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC6: Gamification Leaderboard
**GIVEN** users đang thi đua vocal reading  
**WHEN** they complete sessions  
**THEN** 
- Hiển thị leaderboard:
  ```
  🏆 BẢNG XẾP HẠNG - ĐỌCCK THÀNH TIẾNG
  
  1. 👤 Nguyễn Minh An - 45 giờ ⭐⭐⭐
  2. 👤 Trần Thanh Hương - 38 giờ ⭐⭐
  3. 👤 Lê Văn Hải - 32 giờ ⭐
  
  Bạn: #87 (5.2 giờ) ✨
  
  [Đọc Thêm Để Tăng Hạng]
  ```

### AC7: Merit Score Multiplier In Database
**GIVEN** session hoàn thành ở chế độ vocal  
**WHEN** calculate merit points  
**THEN** 
- Apply multiplier:
  ```typescript
  const baseMerit = 100; // reading credits
  const vocalMultiplier = isVocalMode ? 1.5 : 1.0;
  const totalMerit = baseMerit * vocalMultiplier;
  // totalMerit = 150
  ```

### AC8: Optional Fallback For Non-Microphone Devices
**GIVEN** user's device không có microphone  
**WHEN** họ click "[🎤 Thành Tiếng]"  
**THEN** 
- Fallback option:
  ```
  ℹ️  THIẾT BỊ KHÔNG CÓ MICROPHONE
  
  Bạn vẫn có thể nhận ×1.2 multiplier 
  (thay vì ×1.5) nếu bạn:
  
  ☐ Xác nhận rằng tôi sẽ đọc thành tiếng
     (mặc dù app không thể detect)
  
  [Đóng]  [Xác Nhận]
  ```

---

## 🔧 Technical Notes

### Web Audio API Integration
```typescript
// Location: apps/web/src/features/content/hooks/useVocalReading.ts

export function useVocalReading() {
  const [isVocalMode, setIsVocalMode] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const startVocalDetection = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    microphone.connect(analyser);
    
    const interval = setInterval(() => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const db = 20 * Math.log10(average / 255);
      
      setAudioLevel(db);
      
      // Detect if reading aloud (>40dB for 3+ sec)
      if (db > 40) {
        setIsVocalMode(true);
      }
    }, 500);
    
    return () => {
      clearInterval(interval);
      stream.getTracks().forEach(track => track.stop());
    };
  };
  
  return { isVocalMode, startVocalDetection, audioLevel };
}
```

### Database Schema
```prisma
model ReadingSession {
  id                String   @id @default(cuid())
  userId            String
  contentId         String
  startedAt         DateTime @default(now())
  endedAt           DateTime?
  durationSeconds   Int?
  
  // Vocal mode tracking
  isVocalMode       Boolean  @default(false)
  vocalDetectionStart DateTime?
  audioQuality      String?  // CLEAR, MUFFLED, NOISY
  
  // Merit calculation
  baseMerit         Int      @default(100)
  vocalMultiplier   Float    @default(1.0)
  totalMerit        Int
  
  user User @relation(fields: [userId], references: [id])
  
  @@index([userId, startedAt])
  @@index([isVocalMode])
}

model UserBadge {
  id                String   @id @default(cuid())
  userId            String
  badgeType         String   // VOCAL_RESONANCE_SAPPHIRE
  awardedAt         DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id])
  
  @@unique([userId, badgeType])
}
```

### Merit Calculator Service
```typescript
// Location: apps/api/src/content/services/merit-calculator.service.ts

calculateSessionMerit(session: ReadingSession): number {
  const baseMerit = session.baseMerit;
  
  if (session.isVocalMode) {
    return Math.floor(baseMerit * 1.5);
  }
  
  return baseMerit;
}
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Chương về tần số kinh chữ
- **Q&A Huyền học:** Sức mạnh của việc đọc thành tiếng
- **Hướng dẫn thực hành:** Cách đọc Bạch Thoại Phật Pháp tối ưu

---

## 🏷️ Tags
`#phase-28` `#ngu-dai-phap-bao` `#vocal-reading` `#merit-multiplier` `#gamification` `#content` `#engagement`
