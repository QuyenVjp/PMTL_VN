# AGE-GATE-AMITABHA

## Owner
- `wisdom-qa` (Prescription Engine) + `vows-merit`

## Purpose
Ràng buộc Tuổi tác cho Kinh A Di Đà (Age-Gated Sutra Rule) - Protect young practitioners

---

## Business Rule

### Rule - Amitabha Sutra Only for 60+ Years Old
**Nghiệp vụ [Nguồn 267]:**
- *A Di Đà Kinh* (Amitabha Sutra) dùng để cầu vãng sinh về Tây Phương Cực Lạc
- Năng lượng này hướng về việc **rời bỏ trần thế** (ascending to Pure Land)
- **Người trẻ tuổi TUYỆT ĐỐI KHÔNG NÊN** đưa vào thời khóa hằng ngày
- **Chỉ được khuyến nghị niệm khi đã qua 60 hoặc 70 tuổi**

---

## Schema Hints

```prisma
enum SutraType {
  DA_BEI_ZHOU
  XIN_JING
  AMITABHA_SUTRA    // Age-gated (60+)
  DI_CANG_JING
  WANG_SHENG_ZHOU
  QI_YUAN_ZHEN_YAN
  XIAO_ZAI_JI_XIANG
}

model DailyRecitation {
  id              String     @id
  userId          String
  sutraType       SutraType
  count           Int
  ageOverride     Boolean    @default(false) // For special cases with master's guidance
  createdAt       DateTime   @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@map("daily_recitations")
}
```

---

## Service Logic

```typescript
export class RecitationPrescriptionEngine {
  private readonly AGE_GATED_SUTRAS = {
    AMITABHA_SUTRA: {
      minimumAge: 60,
      reason: 'Pure Land focus - not suitable for young practitioners',
    },
  };

  async addDailyRecitation(userId: string, dto: AddRecitationDto) {
    // Check age gate for Amitabha Sutra
    if (dto.sutraType === SutraType.AMITABHA_SUTRA) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { dateOfBirth: true },
      });

      if (!user.dateOfBirth) {
        throw new BadRequestException('Date of birth required for age-gated sutras');
      }

      const age = this.calculateAge(user.dateOfBirth);
      const minAge = this.AGE_GATED_SUTRAS.AMITABHA_SUTRA.minimumAge;

      if (age < minAge && !dto.ageOverride) {
        throw new ForbiddenException({
          code: 'AGE_GATE_VIOLATION',
          message: `CẢNH BÁO: Kinh này dùng để cầu vãng sinh, chỉ khuyến nghị cho đồng tu trên ${minAge} tuổi. Người trẻ tuổi xin hãy tập trung niệm Đại Bi và Tâm Kinh.`,
          currentAge: age,
          requiredAge: minAge,
          sutra: 'Amitabha Sutra',
        });
      }
    }

    return this.prisma.dailyRecitation.create({
      data: {
        userId,
        sutraType: dto.sutraType,
        count: dto.count,
        ageOverride: dto.ageOverride,
      },
    });
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}
```

---

## UI Components

### Age Gate Warning (Hard Block)
```
┌────────────────────────────────────────────┐
│  🚫 CẢNH BÁO TUỔI TÁC                     │
├────────────────────────────────────────────┤
│  Kinh: A Di Đà Kinh                       │
│  Tuổi của bạn: 35                         │
│  Tuổi yêu cầu: 60+                        │
│                                            │
│  LÝ DO:                                   │
│  Kinh A Di Đà dùng để cầu vãng sinh về    │
│  Tây Phương Cực Lạc.                      │
│                                            │
│  Năng lượng này hướng về việc RỜI BỎ     │
│  TRẦN THẾ, KHÔNG phù hợp cho người trẻ   │
│  tuổi đang xây dựng cuộc sống.            │
│                                            │
│  KHUYẾN NGHỊ:                             │
│  Hãy tập trung niệm:                      │
│  • Chú Đại Bi (cầu sức khỏe, năng lượng) │
│  • Tâm Kinh (cầu trí tuệ, giải quyết vấn │
│    đề trần thế)                           │
│                                            │
│  [Tôi hiểu] [Chọn kinh khác]             │
└────────────────────────────────────────────┘
```

### Sutra Selection with Age Indicator
```
┌────────────────────────────────────────────┐
│  📖 Chọn Kinh Văn Hằng Ngày               │
├────────────────────────────────────────────┤
│  ✅ Chú Đại Bi (Đại Bi Chú)              │
│     Phù hợp: Mọi lứa tuổi                 │
│                                            │
│  ✅ Tâm Kinh (Heart Sutra)                │
│     Phù hợp: Mọi lứa tuổi                 │
│                                            │
│  ✅ Vãng Sinh Chú                         │
│     Phù hợp: Mọi lứa tuổi                 │
│                                            │
│  🔒 A Di Đà Kinh (Amitabha Sutra)        │
│     ⚠️ Chỉ dành cho 60+ tuổi             │
│     Tuổi của bạn: 35                      │
│     [Tại sao?]                            │
│                                            │
│  [Tiếp tục]                               │
└────────────────────────────────────────────┘
```

### Override Request (Special Cases)
```
┌────────────────────────────────────────────┐
│  ⚠️ Yêu cầu ngoại lệ                      │
├────────────────────────────────────────────┤
│  Bạn đang yêu cầu thêm A Di Đà Kinh vào  │
│  thời khóa dù chưa đủ 60 tuổi.           │
│                                            │
│  Điều này CHỈ được phép trong trường hợp: │
│  • Có hướng dẫn trực tiếp từ Sư phụ      │
│  • Trường hợp đặc biệt (bệnh nan y)       │
│                                            │
│  Bạn có chắc muốn tiếp tục?               │
│  [ ] Tôi đã nhận hướng dẫn từ Sư phụ     │
│                                            │
│  [Hủy] [Xác nhận ngoại lệ]               │
└────────────────────────────────────────────┘
```

---

## References
- Source 267: Amitabha Sutra age restrictions
- `design/03-domains/wisdom-qa/REFERENCES/MERIT-GATED-MANTRAS.md`

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 10 Logic 1
