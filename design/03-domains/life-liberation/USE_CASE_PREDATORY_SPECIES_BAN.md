# USE CASE: Predatory Species Ban
**Module:** `life-liberation`, `moderation`  
**Phase:** 28 - Ngũ Đại Pháp Bảo Enterprise Integration  
**Source:** Buddhism in Plain Terms [Nguồn 54, 55], Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp Vụ

Phóng sinh là **cứu mạng**, NHƯNG có một quy tắc sinh thái cực kỳ quan trọng:

### ⚠️ TUYỆT ĐỐI CẤM:
Mua các loài cá ăn thịt hung dữ và thả chung vào hồ có cá nhỏ:
- ❌ Cá lóc (Snakehead)
- ❌ Cá trê hung dữ (Catfish predator)
- ❌ Cá trê lai hung dữ
- ❌ Ba ba hung dữ

### Hậu Quả:
Nếu bạn thả chúng vào hồ chung với cá nhỏ:
- ❌ Tạo ra **1 lò sát sinh dưới nước**
- ❌ Những con cá nhỏ bị ăn thịt hang ngày
- ❌ Bồ Tát **KHÔNG ghi nhận công đức**
- ❌ Hộ Pháp sẽ **trừng phạt** tội sát sinh

### ✅ Giải Pháp An Toàn:
- ✅ Tìm vùng nước **cực lớn, sâu**, không có cá nhỏ
- ✅ Thả riêng biệt, không trộn lẫn
- ✅ Hoặc chọn loài cá ôn hòa, không ăn thịt

---

## 🎯 Acceptance Criteria

### AC1: Predatory Species Database
**GIVEN** system quản lý danh sách loài cá  
**WHEN** import/setup species data  
**THEN** 
- Đánh dấu các loài hung dữ với flag:
  ```typescript
  interface Species {
    id: string;
    name: string;
    isPredatory: boolean;  // true for dangerous species
    predatoryLevel: 'high' | 'medium'; // severity
    dangerousCompanions: string[]; // IDs of species they hunt
    safeHabitat: string; // Description of safe environment
  }
  ```

### AC2: Warning When Selecting Predatory Species
**GIVEN** user chọn loài cá trong Life Release form  
**WHEN** họ chọn "Cá Lóc" hoặc loài hung dữ khác  
**THEN** 
- Hiển thị ngay lập tức RED WARNING:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🚨 LOÀI VẬT ĂN THỊT HUNG DỮ
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Cá Lóc là loài ăn thịt cực hung dữ.
  
  ⚠️  TUYỆT ĐỐI KHÔNG ĐƯỢC thả vào hồ 
     có cá nhỏ!
  
  ❌ NẾU VI PHẠM:
  • Tạo ra lò sát sinh dưới nước
  • Cá nhỏ bị ăn thịt hang ngày
  • CÔNG ĐỨC = KHÔNG
  • Hộ Pháp sẽ trừng phạt tội sát sinh
  
  ✅ GIẢI PHÁP AN TOÀN:
  
  Bắt buộc phải:
  1. Tìm vùng nước CCART LỚN, sâu
  2. Không có cá nhỏ
  3. Thả riêng biệt
  
  ➤ Bạn xác nhận sẽ thả đúng cách?
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC3: Habitat Verification Required
**GIVEN** user xác nhận sẽ thả đúng cách  
**WHEN** form tiếp tục  
**THEN** 
- Bắt buộc nhập thêm thông tin:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📍 XÁC NHẬN VỊ TRÍ THẢI AN TOÀN
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Bạn sẽ thả cá lóc vào đâu?
  
  [ ] Hồ nuôi trồng riêng (không có cá khác)
  [ ] Sông/suối cực lớn, sâu
  [ ] Ao nước rộng lớn (tối thiểu 1 mẫu)
  [ ] Vùng nước khác: ________
  
  Địa điểm cụ thể:
  [_________________________]
  
  Xác nhận bạn đã khảo sát kỹ và chắc chắn 
  không có cá nhỏ bị ăn thịt?
  
  ☐ Tôi xác nhận vùng nước này cực lớn, 
    sâu, không có cá nhỏ bị cá lóc ăn thịt
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC4: Hard-Block If Insufficient Habitat
**GIVEN** user chọn habitat không phù hợp  
**WHEN** họ chọn "Hồ nhỏ" hoặc "ao có cá khác"  
**THEN** 
- Nút "Bắt Đầu Phóng Sinh" bị **khóa**
- Hiển thị error:
  ```
  ❌ VỊ TRÍ KHÔNG AN TOÀN
  
  Habitat bạn chọn không đủ điều kiện 
  để thả cá lóc an toàn.
  
  Vui lòng chọn:
  • Hồ riêng (không có cá khác)
  • Hoặc Sông/suối cực lớn
  
  Nếu bạn thả vào hồ nhỏ có cá khác,
  bạn sẽ mắc tội sát sinh.
  ```

### AC3: Meilisearch Index For Species Warnings
**GIVEN** user đang fill form  
**WHEN** họ type tên cá  
**THEN** 
- Meilisearch auto-complete:
  ```
  "Cá lo..." 
  
  🔴 Cá Lóc (NGUY HIỂM - Ăn thịt hung)
     ⚠️  Cần verify vị trí thả an toàn
  
  🟢 Cá Lóc vàng (Chưa xác định)
  
  🟡 Cá Lóc lai (Đối với loài không rõ)
  ```

### AC6: Audit Log For Predatory Species
**GIVEN** user successfully create Life Release event với loài hung dữ  
**WHEN** event được lưu  
**THEN** 
- Ghi audit log đặc biệt:
  ```typescript
  {
    eventType: "LIFE_RELEASE_PREDATORY_SPECIES",
    speciesId: "SNAKEHEAD_FISH",
    speciesName: "Cá Lóc",
    isPredatory: true,
    habitatType: "LARGE_RIVER",
    habitatVerified: true,
    userId: <user_id>,
    timestamp: <timestamp>,
    riskLevel: "HIGH"
  }
  ```

### AC7: Follow-Up Check After 30 Days
**GIVEN** user phóng sinh cá lóc 30 ngày trước  
**WHEN** system trigger follow-up  
**THEN** 
- Gửi check-in notification:
  ```
  📋 KIỂM TRA SAU PHÓNG SINH
  
  Cách đây 30 ngày bạn đã phóng sinh 
  Cá Lóc vào [Vị trí].
  
  Để đảm bảo công đức được ghi nhận:
  
  ❓ Cá lóc có khỏe mạnh không?
  ❓ Có cá nhỏ bị ăn thịt không?
  ❓ Vị trí có phù hợp không?
  
  Vui lòng cập nhật tình hình để Hộ Pháp 
  xác nhận công đức.
  
  [Cập Nhật Ngay]
  ```

---

## 🔧 Technical Notes

### Database Schema
```prisma
model Species {
  id                String   @id @default(cuid())
  name              String
  scientificName    String?
  
  // Predatory flags
  isPredatory       Boolean  @default(false)
  predatoryLevel    String?  // 'high', 'medium'
  predatorDescription String?
  
  // Habitat requirements
  minHabitatSize    Int?     // in square meters
  preferredWater    String?
  incompatibleSpecies String[]
  safeHabitatGuide  String?
  
  @@index([isPredatory])
}

model LifeReleaseEvent {
  id                String   @id @default(cuid())
  userId            String
  species           String[]
  location          String
  habitatType       String   // USER_CHOICE
  habitatVerified   Boolean  @default(false)
  
  // Audit
  hasPredatorySpecies Boolean @default(false)
  riskLevel         String?
  
  createdAt         DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id])
  
  @@index([userId, createdAt])
  @@index([hasPredatorySpecies])
}

model SpeciesReleaseFollowUp {
  id                String   @id @default(cuid())
  releaseEventId    String
  checkInDate       DateTime
  habitatCondition  String?
  speciesHealth     String?
  hasNegativeImpact Boolean?
  notes             String?
  
  @@index([releaseEventId])
}
```

### Validation Guard
```typescript
// Guard: PredatorySpeciesGuard
// Location: apps/api/src/life-liberation/guards/

@Injectable()
export class PredatorySpeciesGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const dto = request.body;
    
    // Check if any predatory species
    const speciesWithCheck = await Promise.all(
      dto.species.map(speciesId =>
        this.prisma.species.findUnique({ where: { id: speciesId } })
      )
    );
    
    const hasPredatory = speciesWithCheck.some(s => s?.isPredatory);
    
    if (!hasPredatory) return true;
    
    // Verify habitat if predatory
    if (!dto.habitatType || !dto.habitatVerified) {
      throw new BadRequestException({
        message: "Phóng sinh loài hung dữ bắt buộc phải xác nhận vị trí an toàn",
        code: "PREDATORY_HABITAT_VERIFICATION_REQUIRED"
      });
    }
    
    return true;
  }
}
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms [Nguồn 54, 55]
- **Q&A Huyền học:** Nguyên tắc sinh thái khi phóng sinh
- **Hướng dẫn thực hành:** Lựa chọn loài vật và vị trí phóng sinh an toàn

---

## 🏷️ Tags
`#phase-28` `#ngu-dai-phap-bao` `#predatory-species` `#ecological-impact` `#life-liberation` `#moderation`
