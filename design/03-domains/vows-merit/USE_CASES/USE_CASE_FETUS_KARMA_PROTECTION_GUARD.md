# USE CASE: Fetus Karma Protection Guard
**Module:** `vows-merit`, `identity`  
**Phase:** 28 - Ngũ Đại Pháp Bảo Enterprise Integration  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp Vụ

**Lễ Phật Đại Sám Hối Văn** kích hoạt nghiệp chướng để tiêu trừ. Đối với phụ nữ đang mang thai, quy tắc đặc biệt:

### ⚠️ NGUY HIỂM SINH MỆNH THAI NHI:
- Phụ nữ mang thai **TUYỆT ĐỐI KHÔNG ĐƯỢC** niệm Lễ Phật quá nhiều
- **Giới hạn nghiêm ngặt: 1-3 biến/ngày tối đa**

### Lý Do:
Khi niệm Lễ Phật, nghiệp chướng trên người mẹ bị kích hoạt. Nếu niệm quá nhiều:
- ❌ Nghiệp chướng không có đường thoát
- ❌ Sẽ **trực tiếp tấn công thai nhi** trong bụng
- ❌ Gây sảy thai, thai chết lưu
- ❌ Hoặc thai nhi sinh ra bị bệnh tật

### ✅ An Toàn:
- 1-3 biến Lễ Phật/ngày → Thai nhi an toàn
- Tập trung vào Chú Đại Bi (bảo hộ mẹ và con)
- Tâm Kinh (trí tuệ)
- Công đức hồi hướng cho thai nhi

---

## 🎯 Acceptance Criteria

### AC1: Pregnancy Status In User Profile
**GIVEN** user cập nhật profile  
**WHEN** họ vào phần health information  
**THEN** 
- Cung cấp field:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  👶 THÔNG TIN THAI KỲ
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  ○ Không mang thai
  ○ Đang mang thai
  
  Nếu đang mang thai:
  Ngày dự sinh: [Chọn ngày]
  
  ℹ️  Thông tin này giúp hệ thống điều chỉnh 
     phác đồ tu tập an toàn cho mẹ và con.
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC2: Hard-Lock Repentance Limit For Pregnant Users
**GIVEN** `user.profile.isPregnant = true`  
**WHEN** user thiết lập Daily Recitation Prescription  
**THEN** 
- `RecitationGuard` hard-code (khóa cứng):
  ```typescript
  if (user.profile.isPregnant) {
    MAX_REPENTANCE_COUNT = 3; // Override normal limit
  }
  ```

### AC3: Frontend Visual Limit Indicator
**GIVEN** pregnant user đang điều chỉnh số lượng Lễ Phật  
**WHEN** counter hiển thị  
**THEN** 
- Hiển thị với visual warning:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  👶 CHẾ ĐỘ BẢO VỆ THAI NHI
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Lễ Phật Đại Sám Hối Văn:
  
  ┌─────────────────────────────┐
  │  [-]    2 biến    [+]       │
  ├─────────────────────────────┤
  │  ████░░░░░░  (2/3 MAX)      │
  └─────────────────────────────┘
  
  ⚠️  Giới hạn cho phụ nữ mang thai: 3 biến
  
  Lý do: Bảo vệ sinh mệnh thai nhi
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC4: Block Override Attempts
**GIVEN** pregnant user cố vặn counter lên 4  
**WHEN** họ bấm nút [+]  
**THEN** 
- Counter không tăng
- Màn hình flash đỏ
- Hiển thị CRITICAL alert:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🚨 CẢNH BÁO SINH MỆNH
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  TUYỆT ĐỐI KHÔNG VƯỢT QUÁ 3 BIẾN!
  
  Phụ nữ mang thai cấm tụng Lễ Phật quá 3 biến.
  
  Nghiệp chướng kích hoạt sẽ trực tiếp làm 
  tổn thương thai nhi, gây:
  
  • Sảy thai
  • Thai chết lưu
  • Thai nhi sinh ra bị bệnh
  
  Vui lòng tập trung vào:
  ✅ Chú Đại Bi (21-49 biến)
  ✅ Tâm Kinh (7-21 biến)
  ✅ Kinh A Di Đà (1-3 biến)
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  [Đã Hiểu]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC5: API-Level Protection
**GIVEN** pregnant user (hoặc client bypass) gửi request với Lễ Phật > 3  
**WHEN** API validate  
**THEN** 
- Trả về `403 Forbidden`:
  ```json
  {
    "statusCode": 403,
    "error": "Forbidden",
    "message": "CẢNH BÁO SINH MỆNH: Phụ nữ mang thai tuyệt đối cấm tụng Lễ Phật quá 3 biến. Nghiệp chướng kích hoạt sẽ trực tiếp làm tổn thương thai nhi.",
    "code": "FETUS_PROTECTION_VIOLATION",
    "isPregnant": true,
    "maxAllowed": 3,
    "attempted": 5,
    "safePractices": [
      "Chú Đại Bi: 21-49 biến",
      "Tâm Kinh: 7-21 biến",
      "Kinh A Di Đà: 1-3 biến"
    ]
  }
  ```

### AC6: Alternative Prescription Suggestion
**GIVEN** pregnant user mở Daily Recitation setup  
**WHEN** page load  
**THEN** 
- Hiển thị pregnancy-safe template:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  👶 PHÁC ĐỒ AN TOÀN CHO THAI KỲ
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Khuyến nghị cho phụ nữ mang thai:
  
  ✅ Chú Đại Bi: 49 biến
     (Bảo hộ mẹ và con)
  
  ✅ Tâm Kinh: 7 biến
     (Trí tuệ, bình an)
  
  ✅ Lễ Phật: 1-3 biến
     (Tiêu nghiệp nhẹ nhàng)
  
  ✅ Kinh A Di Đà: 1 biến
     (Cầu phúc cho thai nhi)
  
  [Áp Dụng Phác Đồ]  [Tự Thiết Lập]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC7: Auto-Adjust After Birth
**GIVEN** user đã đánh dấu `isPregnant = true` với `dueDate`  
**WHEN** `today > dueDate + 7 days`  
**THEN** 
- Gửi notification nhắc update:
  ```
  👶 CẬP NHẬT THÔNG TIN THAI KỲ
  
  Ngày dự sinh của bạn đã qua.
  
  Vui lòng cập nhật:
  ○ Đã sinh con, cần điều chỉnh phác đồ
  ○ Vẫn đang mang thai (dời ngày dự sinh)
  
  [Cập Nhật Ngay]
  ```

### AC8: Educational Resources
**GIVEN** user click vào "Tại sao?" bên cạnh giới hạn  
**WHEN** modal mở  
**THEN** 
- Hiển thị giáo dục chi tiết:
  ```
  ℹ️  TẠI SAO CÓ GIỚI HẠN ĐẶC BIỆT?
  
  🤰 THAI KỲ VÀ NGHIỆP CHƯỚNG:
  
  Lễ Phật Đại Sám Hối Văn kích hoạt nghiệp 
  chướng để tiêu trừ. Đây là quá trình mạnh.
  
  Với phụ nữ mang thai:
  
  1️⃣ Nghiệp của mẹ bị kích hoạt
  2️⃣ Nhưng thai nhi rất yếu, chưa có thể lực
  3️⃣ Nghiệp tìm "đường thoát" dễ nhất
  4️⃣ → Tấn công thai nhi thay vì mẹ
  5️⃣ → Gây sảy thai hoặc bệnh tật
  
  ✅ GIẢI PHÁP AN TOÀN:
  
  • Lễ Phật: Chỉ 1-3 biến (nhẹ nhàng)
  • Chú Đại Bi: 21-49 biến (bảo hộ)
  • Tâm Kinh: 7-21 biến (trí tuệ)
  
  Sau khi sinh, bạn sẽ được mở khóa giới hạn.
  ```

---

## 🔧 Technical Notes

### Database Schema
```prisma
model UserProfile {
  id              String   @id @default(cuid())
  userId          String   @unique
  
  // Pregnancy tracking
  isPregnant      Boolean  @default(false)
  dueDate         DateTime?
  pregnancyStartDate DateTime?
  
  user User @relation(fields: [userId], references: [id])
}
```

### NestJS Guard
```typescript
// Guard: PregnancyRepentanceGuard
// Location: apps/api/src/vows-merit/guards/

@Injectable()
export class PregnancyRepentanceGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const dto = request.body;
    
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId: user.id }
    });
    
    if (!profile?.isPregnant) {
      return true; // Not pregnant, no restriction
    }
    
    const repentanceCount = dto.mantras?.find(
      m => m.mantraCode === 'REPENTANCE_TEXT'
    )?.count || 0;
    
    if (repentanceCount > 3) {
      throw new ForbiddenException({
        message: "CẢNH BÁO SINH MỆNH: Phụ nữ mang thai cấm tụng Lễ Phật quá 3 biến",
        code: "FETUS_PROTECTION_VIOLATION",
        isPregnant: true,
        maxAllowed: 3,
        attempted: repentanceCount
      });
    }
    
    return true;
  }
}
```

### Frontend Hook
```typescript
// Location: apps/web/src/features/vows-merit/hooks/usePregnancyLimit.ts

export function usePregnancyLimit() {
  const { data: profile } = useUserProfile();
  
  return {
    isPregnant: profile?.isPregnant || false,
    maxRepentance: profile?.isPregnant ? 3 : 7,
    showPregnancyWarning: profile?.isPregnant
  };
}
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Chương về phụ nữ mang thai
- **Q&A Huyền học:** Nguy hiểm khi kích hoạt nghiệp trong thai kỳ
- **Hướng dẫn thực hành:** Phác đồ tu tập an toàn cho bà bầu

---

## 🏷️ Tags
`#phase-28` `#ngu-dai-phap-bao` `#pregnancy-protection` `#fetus-safety` `#repentance-limit` `#vows-merit` `#identity`
