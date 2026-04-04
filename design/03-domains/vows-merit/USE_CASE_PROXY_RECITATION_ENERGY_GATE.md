# USE CASE: Proxy Recitation Energy Gate
**Module:** `vows-merit`, `little-house`  
**Phase:** 28 - Ngũ Đại Pháp Bảo Enterprise Integration  
**Source:** Buddhism in Plain Terms [Nguồn 319, 320], Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp Vụ

Cứu người là đại công đức. **NHƯNG** nếu bản thân người niệm đang yếu (công phu bài tập hàng ngày kém), việc niệm **Ngôi Nhà Nhỏ (NNN) cho bệnh nhân ung thư hoặc người bệnh nặng** sẽ:

### ⚠️ Nguy Hiểm Sinh Mệnh:
- Vong linh đối phương (bệnh của họ) sẽ **nhảy sang nhập vào chính mình**
- Người niệm bắt đầu bị bệnh như người được niệm
- Trong trường hợp nghiêm trọng: có thể dẫn đến tử vong

### Nguyên Tắc An Toàn:
**Muốn cứu người, trước tiên phải tự cứu mình.**

Chỉ được niệm NNN cho người khác (proxy recitation) khi:
- ✅ Công phu hàng ngày của bản thân đã đủ mạnh
- ✅ Thường xuyên niệm ít nhất **21 biến Chú Đại Bi/ngày**
- ✅ Duy trì ổn định trong **30 ngày gần nhất**

---

## 🎯 Acceptance Criteria

### AC1: Calculate Daily Recitation Score
**GIVEN** hệ thống cần đánh giá năng lượng của user  
**WHEN** tính toán `DailyRecitationScore`  
**THEN** 
- Lấy dữ liệu 30 ngày gần nhất
- Tính điểm dựa trên:
  ```typescript
  DailyRecitationScore = (
    (averageDaBeiBiCount * 3) +      // Chú Đại Bi weight: 3
    (averageHeartSutraCount * 2) +   // Tâm Kinh weight: 2
    (averageLittleHouseCount * 5) +  // NNN weight: 5
    (consistencyRate * 10)            // Tính nhất quán weight: 10
  );
  
  // Consistency Rate = % số ngày có công phu trong 30 ngày
  ```

### AC2: Minimum Safety Threshold
**GIVEN** user muốn tạo Ngôi Nhà Nhỏ cho người khác  
**WHEN** họ set `isProxy = true` (Kính tặng người khác)  
**THEN** 
- System check điều kiện:
  ```typescript
  const SAFE_THRESHOLD = {
    averageDaBeiBi: 21,        // Tối thiểu 21 Đại Bi/ngày
    consistencyRate: 0.8,      // 80% số ngày có công phu
    minimumDays: 30            // Duy trì 30 ngày
  };
  ```

### AC3: Block Unsafe Proxy Recitation
**GIVEN** `DailyRecitationScore` < Safe Threshold  
**WHEN** user cố bấm `[Bắt Đầu Niệm]` cho NNN proxy  
**THEN** 
- Nút bị khóa (disabled)
- Hiển thị RED ALERT:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🚨 TỪ BI ĐI KÈM TRÍ TUỆ
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Hệ thống phát hiện công phu hàng ngày của bạn 
  chưa đủ mạnh để gánh nghiệp thay người khác.
  
  📊 Đánh giá hiện tại:
  
  Chú Đại Bi trung bình: 7 biến/ngày ❌
  (Yêu cầu: ≥ 21 biến/ngày)
  
  Tính nhất quán: 12/30 ngày (40%) ❌
  (Yêu cầu: ≥ 24/30 ngày = 80%)
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  ⚠️  CẢNH BÁO:
  Việc gánh nghiệp thay người khác lúc này 
  sẽ NGUY HIỂM ĐẾN TÍNH MẠNG của bạn.
  
  Vong linh của người bệnh sẽ nhảy sang 
  nhập vào bạn, khiến bạn bị bệnh như họ.
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  💡 HƯỚNG DẪN:
  
  1. Tăng Chú Đại Bi lên 21 biến/ngày
  2. Duy trì ổn định trong 30 ngày
  3. Hệ thống sẽ tự động mở khóa khi đủ năng lượng
  
  [Đóng]  [Xem Hướng Dẫn Tăng Năng Lượng]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC4: API-Level Protection
**GIVEN** client cố bypass frontend check  
**WHEN** gửi request tạo proxy LittleHouse  
**THEN** 
- Backend guard validate
- Trả về `403 Forbidden`:
  ```json
  {
    "statusCode": 403,
    "error": "Forbidden",
    "message": "Công phu hàng ngày chưa đủ mạnh để niệm Ngôi Nhà Nhỏ cho người khác. Yêu cầu tối thiểu 21 biến Chú Đại Bi/ngày, duy trì 30 ngày.",
    "code": "INSUFFICIENT_ENERGY_FOR_PROXY_RECITATION",
    "userStats": {
      "averageDaBeiBi": 7,
      "requiredDaBeiBi": 21,
      "consistencyRate": 0.4,
      "requiredConsistency": 0.8,
      "daysTracked": 30
    }
  }
  ```

### AC5: Visual Energy Meter
**GIVEN** user vào trang Proxy Recitation  
**WHEN** page load  
**THEN** 
- Hiển thị "Năng Lượng Bảo Hộ" meter:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🛡️  NĂNG LƯỢNG BẢO HỘ
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Chú Đại Bi (21 biến/ngày):
  ████░░░░░░ 7/21 (33%) ❌
  
  Tính nhất quán (24/30 ngày):
  ████████░░ 12/24 (50%) ❌
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Tổng điểm năng lượng: 45/100 ⚠️
  (Yêu cầu: ≥ 80/100)
  
  Trạng thái: KHÔNG AN TOÀN cho Proxy Recitation
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC6: Progressive Unlock Notification
**GIVEN** user đang cải thiện công phu hàng ngày  
**WHEN** `DailyRecitationScore` vượt ngưỡng an toàn  
**THEN** 
- Gửi congratulatory notification:
  ```
  🎉 NĂNG LƯỢNG ĐÃ ĐỦ MẠNH!
  
  Chúc mừng! Công phu 30 ngày qua của bạn 
  đã đạt mức an toàn.
  
  Giờ đây bạn có thể niệm Ngôi Nhà Nhỏ 
  để giúp đỡ người khác một cách an toàn.
  
  Năng lượng hiện tại: 85/100 ✅
  
  [Xem Chi Tiết]
  ```

### AC7: Exception For Family Emergency
**GIVEN** người thân ruột thịt (cha/mẹ/vợ/chồng/con) gặp bệnh nặng khẩn cấp  
**WHEN** user cần niệm ngay dù chưa đủ năng lượng  
**THEN** 
- Cung cấp emergency override:
  ```
  ⚠️  KHẨN CẤP GIA ĐÌNH
  
  Nếu đây là trường hợp khẩn cấp (người thân ruột thịt 
  bệnh nặng), bạn có thể niệm với rủi ro cao.
  
  ☐ Tôi xác nhận:
    - Đây là cha/mẹ/vợ/chồng/con ruột của tôi
    - Họ đang bệnh nặng cần cấp cứu
    - Tôi chấp nhận rủi ro nghiệp chướng nhập vào bản thân
    - Tôi sẽ tăng gấp đôi công phu sau khi niệm xong
  
  [Hủy]  [Xác Nhận Khẩn Cấp]
  ```

---

## 🔧 Technical Notes

### Score Calculation Service
```typescript
// Location: apps/api/src/vows-merit/services/daily-recitation-score.service.ts

@Injectable()
export class DailyRecitationScoreService {
  async calculateScore(userId: string, days: number = 30): Promise<number> {
    const records = await this.prisma.dailyRecitationLog.findMany({
      where: {
        userId,
        date: {
          gte: subDays(new Date(), days)
        }
      },
      orderBy: { date: 'desc' }
    });
    
    // Calculate averages
    const totalDays = records.length;
    const avgDaBeiBi = records.reduce((sum, r) => sum + r.daBeiBiCount, 0) / totalDays;
    const avgHeartSutra = records.reduce((sum, r) => sum + r.heartSutraCount, 0) / totalDays;
    const avgLittleHouse = records.reduce((sum, r) => sum + r.littleHouseCount, 0) / totalDays;
    
    // Calculate consistency (% of days with practice)
    const consistencyRate = totalDays / days;
    
    // Weighted score
    const score = (
      (avgDaBeiBi * 3) +
      (avgHeartSutra * 2) +
      (avgLittleHouse * 5) +
      (consistencyRate * 10)
    );
    
    return Math.round(score);
  }
  
  async isSafeForProxyRecitation(userId: string): Promise<boolean> {
    const records = await this.prisma.dailyRecitationLog.findMany({
      where: {
        userId,
        date: {
          gte: subDays(new Date(), 30)
        }
      }
    });
    
    const totalDays = records.length;
    const avgDaBeiBi = records.reduce((sum, r) => sum + r.daBeiBiCount, 0) / totalDays;
    const consistencyRate = totalDays / 30;
    
    return avgDaBeiBi >= 21 && consistencyRate >= 0.8;
  }
}
```

### Database Schema
```prisma
model DailyRecitationLog {
  id                String   @id @default(cuid())
  userId            String
  date              DateTime @db.Date
  daBeiBiCount      Int      @default(0)
  heartSutraCount   Int      @default(0)
  littleHouseCount  Int      @default(0)
  
  user User @relation(fields: [userId], references: [id])
  
  @@unique([userId, date])
  @@index([userId, date])
}

model LittleHouse {
  // ... existing fields
  
  isProxy                   Boolean  @default(false)
  proxyRecipientName        String?
  proxyRelationship         String?  // PARENT, SPOUSE, CHILD, FRIEND, OTHER
  emergencyOverride         Boolean  @default(false)
  emergencyOverrideReason   String?
  userEnergyScoreAtCreation Int?
}
```

### NestJS Guard
```typescript
// Guard: ProxyRecitationEnergyGuard
// Location: apps/api/src/vows-merit/guards/

@Injectable()
export class ProxyRecitationEnergyGuard implements CanActivate {
  constructor(
    private readonly scoreService: DailyRecitationScoreService
  ) {}
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const dto = request.body;
    
    // Only check for proxy recitation
    if (!dto.isProxy) return true;
    
    // Allow if emergency override acknowledged
    if (dto.emergencyOverride && dto.emergencyOverrideReason) {
      // Log the override
      return true;
    }
    
    // Check energy level
    const isSafe = await this.scoreService.isSafeForProxyRecitation(
      request.user.id
    );
    
    if (!isSafe) {
      throw new ForbiddenException({
        message: "Công phu hàng ngày chưa đủ mạnh để niệm cho người khác",
        code: "INSUFFICIENT_ENERGY_FOR_PROXY_RECITATION"
      });
    }
    
    return true;
  }
}
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms [Nguồn 319, 320]
- **Q&A Huyền học:** Rủi ro khi trợ niệm cho người bệnh nặng
- **Hướng dẫn thực hành:** Cách tăng năng lượng bảo hộ

---

## 🏷️ Tags
`#phase-28` `#ngu-dai-phap-bao` `#proxy-recitation` `#energy-gate` `#safety-guard` `#vows-merit` `#little-house`
