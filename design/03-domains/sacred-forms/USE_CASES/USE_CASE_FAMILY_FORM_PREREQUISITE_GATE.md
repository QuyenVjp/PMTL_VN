# USE CASE: Pre-Recitation Family Prerequisite Gate
**Module:** `sacred-forms`, `vows-merit`  
**Phase:** 33 - Kiểm Soát Nhân Quả Chuyên Sâu & Ràng Buộc Pháp Bảo Vật Lý  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

Việc làm **"Đơn Khuyến Đạo Người Nhà"** (xin Bồ Tát mở trí tuệ cho người nhà tin Phật) là **một nghi lễ cực kỳ thận trọng**.

### ⚠️ TUYỆT ĐỐI KHÔNG ĐƯỢC:
Làm đơn này **NGAY LẬP TỨC** mà người nhà chưa "sẵn sàng".

### ✅ ĐỀU KIỆN TIÊN QUYẾT:
**Phải thực hiện sau khi đã**:
- Kiên trì tụng **7 biến Tâm Kinh mỗi ngày**
- Dành cho **người nhà cụ thể** (không phải tụng chung chung)
- **Liên tục trong ≥ 30 ngày**

### Lý Do:
Công đức từ tâm linh cần "tích lũy" trước khi có khả năng "mở cửa" cho người khác.

---

## 🎯 Acceptance Criteria

### AC1: Lock Form By Default
**GIVEN** user muốn tạo "Đơn Khuyến Đạo Người Nhà"  
**WHEN** họ click vào module `sacred-forms`  
**THEN** 
- Nút `[Tạo Đơn Khuyến Đạo]` bị **KHÓA** (Disabled):
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📋 ĐƠNS KHUYẾN ĐẠO NGƯỜI NHÀ
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  [🔒 Tạo Đơn Mới] ← DISABLED
  
  ℹ️  Điều kiện mở khóa:
  
  Bạn phải tụng Tâm Kinh:
  ✓ 7 biến/ngày
  ✓ Dành cho người: [Chọn người nhà]
  ✓ Liên tục ≥ 30 ngày
  
  Tiến độ hiện tại:
  ████░░░░░░ 12/30 ngày
  
  Còn cần: 18 ngày nữa
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC2: Query Daily Recitation Log
**GIVEN** system need to unlock form  
**WHEN** check prerequisite  
**THEN** 
- Query `DailyRecitationLog`:
  ```typescript
  const prerequisiteMet = await this.prisma.dailyRecitationLog.count({
    where: {
      userId,
      targetPersonId: <family_member_id>,
      date: {
        gte: subDays(new Date(), 30)
      },
      heartSutraCount: { gte: 7 }
    }
  }) >= 30;
  ```

### AC3: Auto-Unlock When Ready
**GIVEN** user completes 30 days  
**WHEN** system detect completion  
**THEN** 
- Nút auto-unlock:
  ```
  ✅ [Tạo Đơn Khuyến Đạo]
  
  Notification:
  
  🎉 ĐIỀU KIỆN ĐỰ ĐỦ!
  
  Bạn đã tụng Tâm Kinh liên tục 30 ngày 
  cho [Tên người nhà].
  
  Giờ đây bạn có thể tạo Đơn Khuyến Đạo 
  để xin Bồ Tát mở trí tuệ cho họ.
  ```

### AC4: Form Fields Pre-Filled
**GIVEN** user unlock and open form  
**WHEN** form render  
**THEN** 
- Auto-fill from recitation history:
  ```
  Người cần Khuyến Đạo: [Pre-filled: Tên]
  Ngày bắt đầu tụng: [Pre-filled: 30 ngày trước]
  Số ngày tụng Tâm Kinh: [Pre-filled: 30 ngày]
  Số biến mỗi ngày: [Pre-filled: 7 biến]
  
  Cam kết: ☐ Tôi sẵn sàng đổi cam kết 
            khuyến đạo người này
  ```

### AC5: API-Level Enforcement
**GIVEN** client try to bypass frontend  
**WHEN** send POST request to create form  
**THEN** 
- Backend guard check:
  ```typescript
  if (!prerequisiteMet) {
    throw new ForbiddenException({
      message: "Chưa đủ điều kiện tiên quyết",
      code: "PREREQUISITE_NOT_MET",
      required: {
        heartSutraPerDay: 7,
        daysContinuous: 30,
        forPerson: <family_member_id>
      },
      current: {
        daysMet: 12,
        averagePerDay: 6.8
      }
    });
  }
  ```

### AC6: Progress Indicator Visual
**GIVEN** form is locked  
**WHEN** user viewing page  
**THEN** 
- Display progress bar:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📊 Tiến Độ Mở Khóa
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Tâm Kinh 7 biến/ngày cho [Tên]:
  ████████░░ 12/30 ngày (40%)
  
  Thời gian còn lại: 18 ngày
  Dự kiến mở khóa: [Ngày]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

---

## 🔧 Technical Notes

### Prerequisite Guard
```typescript
// Location: apps/api/src/sacred-forms/guards/family-form-prerequisite.guard.ts

@Injectable()
export class FamilyFormPrerequisiteGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const targetFamilyMemberId = request.body.targetFamilyMemberId;
    
    const meritDays = await this.prisma.dailyRecitationLog.count({
      where: {
        userId: request.user.id,
        targetPersonId: targetFamilyMemberId,
        date: { gte: subDays(new Date(), 30) },
        heartSutraCount: { gte: 7 }
      }
    });
    
    if (meritDays < 30) {
      throw new ForbiddenException({
        message: "Chưa đủ điều kiện tiên quyết",
        code: "PREREQUISITE_NOT_MET"
      });
    }
    
    return true;
  }
}
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Đơn Khuyến Đạo
- **Q&A Huyền học:** Điều kiện tiên quyết
- **Hướng dẫn thực hành:** Cách tích lũy công đức

---

## 🏷️ Tags
`#phase-33` `#sacred-forms` `#prerequisite-gate` `#family-enlightenment` `#merit-accumulation`
