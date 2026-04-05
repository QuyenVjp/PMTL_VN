# USE CASE: Auspicious Day Amnesty Multiplier
**Module:** `calendar`, `vows-merit`  
**Phase:** 28 - Ngũ Đại Pháp Bảo Enterprise Integration  
**Source:** Buddhism in Plain Terms [Nguồn 246, 247], Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp Vụ

**Lễ Phật Đại Sám Hối Văn** (Great Repentance Text) là pháp bảo mạnh để tiêu nghiệp, NHƯNG có quy tắc nghiêm ngặt:

### Quy Tắc Thường Ngày:
- ⚠️ **Giới hạn: 5-7 biến/ngày**
- Nếu niệm quá → Kích hoạt nghiệp chướng bùng phát ngay lập tức
- Oan gia đến đòi nợ, gây ra tai nạn, bệnh tật

### 🎉 NGOẠI LỆ ĐẶC BIỆT - Ngày Lễ Lớn:
Vào các ngày **Phật Đản, Vía Quán Thế Âm Bồ Tát, Vía Địa Tạng Bồ Tát**, chư Phật Bồ Tát **đại xá thiên hạ** (amnesty).

Ngày này có thể niệm **LÊN TỚI 27, 49, hoặc 87 biến** để:
- ✅ Xóa nghiệp cực mạnh
- ✅ **KHÔNG SỢ** bị nghiệp chướng bùng phát đòi nợ ngay lập tức
- ✅ Bồ Tát bảo trợ, oan gia được siêu độ

**Timing rất quan trọng:** Phải niệm **ĐÚNG NGÀY** Lễ lớn mới có hiệu lực.

---

## 🎯 Acceptance Criteria

### AC1: Lunar Calendar Auspicious Day Flagging
**GIVEN** hệ thống quản lý Lunar Calendar  
**WHEN** import/sync calendar data  
**THEN** 
- Đánh dấu `isAuspiciousDay: true` cho các ngày:
  - Phật Đản (初八 tháng 四)
  - Vía Quán Thế Âm Bồ Tát (十九 tháng 二/六/九)
  - Vía Địa Tạng Bồ Tát (三十 tháng 七)
  - Vía Phật A Di Đà (十七 tháng 十一)
  - ... (danh sách đầy đủ theo lịch Phật giáo)

### AC2: Auto-Bypass Daily Limit On Auspicious Days
**GIVEN** hôm nay là `isAuspiciousDay = true`  
**WHEN** user thiết lập số lượng Lễ Phật trong Daily Prescription  
**THEN** 
- Validation rule giới hạn 7 biến **tự động bị vô hiệu hóa**
- Cho phép nhập 27, 49, hoặc 87 biến
- Hiển thị badge đặc biệt:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🎉 HÔM NAY LÀ NGÀY ĐẠI XÁ
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Vía Quán Thế Âm Bồ Tát (19/02 âm lịch)
  
  ✨ Giới hạn Lễ Phật đã được MỞ KHÓA
  
  Hôm nay bạn có thể tụng:
  • 27 biến (khuyến nghị)
  • 49 biến (mạnh)
  • 87 biến (cực mạnh)
  
  để tiêu trừ đại nghiệp mà KHÔNG SỢ kích hoạt 
  oan gia đòi nợ!
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC3: Push Notification At Day Start
**GIVEN** hôm nay là ngày Lễ lớn  
**WHEN** 6:00 AM (local time)  
**THEN** 
- Gửi push notification:
  ```
  🎊 HÔM NAY LÀ NGÀY ĐẠI XÁ!
  
  Vía Quán Thế Âm Bồ Tát
  
  Hệ thống đã mở khóa giới hạn Lễ Phật 
  Đại Sám Hối Văn.
  
  Bạn có thể tụng 27, 49 hoặc 87 biến ngay 
  hôm nay để tiêu trừ đại nghiệp mà không sợ 
  kích hoạt oan gia!
  
  [Thiết Lập Ngay]  [Xem Chi Tiết]
  ```

### AC4: Smart Prescription Suggestion
**GIVEN** user mở app vào ngày Lễ lớn  
**WHEN** họ vào trang Daily Recitation  
**THEN** 
- Hiển thị quick action:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  💡 THIẾT LẬP NHANH - NGÀY ĐẠI XÁ
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Hôm nay là cơ hội đặc biệt để tiêu nghiệp.
  
  Chọn phác đồ khuyến nghị:
  
  ○ Nhẹ: 27 biến Lễ Phật (1-2 giờ)
  ○ Chuẩn: 49 biến Lễ Phật (2-3 giờ)
  ○ Mạnh: 87 biến Lễ Phật (4-5 giờ)
  
  [Áp Dụng]  [Tự Thiết Lập]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC5: Validation Guard Bypass
**GIVEN** backend nhận request với số lượng Lễ Phật > 7  
**WHEN** validate prescription  
**THEN** 
- Check `isAuspiciousDay` từ calendar service:
  ```typescript
  if (repentanceCount > 7) {
    const isAuspiciousDay = await this.calendarService.isAuspiciousDay(
      new Date()
    );
    
    if (!isAuspiciousDay) {
      throw new BadRequestException({
        message: "Vượt quá giới hạn an toàn 7 biến Lễ Phật/ngày",
        code: "REPENTANCE_LIMIT_EXCEEDED",
        currentLimit: 7,
        attempted: repentanceCount
      });
    }
    
    // Auspicious day → Allow bypass
  }
  ```

### AC6: Audit Log For Amplified Recitation
**GIVEN** user niệm Lễ Phật > 7 biến vào ngày Lễ lớn  
**WHEN** session hoàn thành  
**THEN** 
- Ghi audit với flag đặc biệt:
  ```typescript
  {
    eventType: "REPENTANCE_AMPLIFIED_SESSION",
    count: 49,
    isAuspiciousDay: true,
    auspiciousDayType: "GUANYIN_BIRTHDAY",
    limitBypassed: true,
    completedAt: <timestamp>
  }
  ```

### AC7: Historical Calendar View
**GIVEN** user xem lịch tháng  
**WHEN** calendar render  
**THEN** 
- Highlight các ngày Lễ lớn với icon đặc biệt:
  ```
  ┌─────────────────────────────────────┐
  │  Tháng 2 Âm Lịch                    │
  ├─────────────────────────────────────┤
  │  1   2   3   4   5   6   7          │
  │  8   9  10  11  12  13  14          │
  │ 15  16  17  18 [19]🎊 20  21        │
  │                 ↑                    │
  │         Vía Quán Âm (Đại Xá)        │
  └─────────────────────────────────────┘
  ```

### AC8: Post-Day Reminder
**GIVEN** ngày Lễ lớn sắp kết thúc (22:00)  
**AND** user chưa niệm Lễ Phật hôm nay  
**WHEN** notification trigger  
**THEN** 
- Gửi gentle reminder:
  ```
  ⏰ NHẮC NHỞ NGÀY ĐẠI XÁ
  
  Hôm nay là Vía Quán Thế Âm Bồ Tát.
  
  Bạn chưa niệm Lễ Phật Đại Sám Hối Văn.
  Còn 2 giờ trước khi ngày Đại Xá kết thúc.
  
  Đây là cơ hội quý báu để tiêu nghiệp!
  
  [Bắt Đầu Ngay]  [Bỏ Qua]
  ```

---

## 🔧 Technical Notes

### Database Schema
```prisma
model LunarCalendar {
  id                String   @id @default(cuid())
  date              DateTime @db.Date
  lunarMonth        Int
  lunarDay          Int
  lunarYear         Int
  
  // Auspicious day flagging
  isAuspiciousDay   Boolean  @default(false)
  auspiciousDayType String?  // BUDDHA_BIRTHDAY, GUANYIN_BIRTHDAY, etc.
  description       String?
  
  @@unique([date])
  @@index([isAuspiciousDay])
  @@index([lunarMonth, lunarDay])
}
```

### Calendar Service
```typescript
// Location: apps/api/src/calendar/services/lunar-calendar.service.ts

@Injectable()
export class LunarCalendarService {
  async isAuspiciousDay(date: Date): Promise<boolean> {
    const calendar = await this.prisma.lunarCalendar.findUnique({
      where: { date: startOfDay(date) }
    });
    
    return calendar?.isAuspiciousDay || false;
  }
  
  async getAuspiciousDayInfo(date: Date) {
    return await this.prisma.lunarCalendar.findUnique({
      where: { date: startOfDay(date) },
      select: {
        isAuspiciousDay: true,
        auspiciousDayType: true,
        description: true
      }
    });
  }
}
```

### Validation Schema With Bypass
```typescript
// DTO Validation
const RepentanceCountSchema = z.number().int().positive()
  .refine(
    async (count, ctx) => {
      if (count <= 7) return true;
      
      // Check if today is auspicious
      const isAuspicious = await calendarService.isAuspiciousDay(new Date());
      
      if (!isAuspicious) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vượt quá giới hạn an toàn 7 biến/ngày. Chỉ được phép vào ngày Lễ lớn."
        });
        return false;
      }
      
      return true;
    }
  );
```

### Notification Cron Job
```typescript
// Cron: Daily at 6:00 AM
@Cron('0 6 * * *')
async notifyAuspiciousDay() {
  const today = new Date();
  const isAuspicious = await this.calendarService.isAuspiciousDay(today);
  
  if (!isAuspicious) return;
  
  const dayInfo = await this.calendarService.getAuspiciousDayInfo(today);
  
  // Send to all active users
  await this.notificationService.sendToAll({
    title: "🎊 HÔM NAY LÀ NGÀY ĐẠI XÁ!",
    body: `${dayInfo.description} - Giới hạn Lễ Phật đã được mở khóa`,
    priority: "HIGH"
  });
}
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms [Nguồn 246, 247]
- **Q&A Huyền học:** Đại xá ngày Lễ lớn
- **Hướng dẫn thực hành:** Cách tận dụng ngày Đại Xá để tiêu nghiệp

---

## 🏷️ Tags
`#phase-28` `#ngu-dai-phap-bao` `#auspicious-day` `#amnesty-multiplier` `#repentance` `#calendar`
