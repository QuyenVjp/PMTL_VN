# DIGITAL-WORSHIP-BAN

## Owner
- `vows-merit` (Heart Incense / Tâm Hương)

## Purpose
Cấm kỵ Màn hình Ảo (Digital Screen Worship Ban) - Bảo vệ người tu khỏi rước linh tính lạ

---

## Business Rule

### Rule - STRICTLY FORBIDDEN: Physical worship to digital screens
**Nghiệp vụ [Nguồn: Intro to Guan Yin Citta]:**
- Nếu **KHÔNG CÓ bàn thờ thật** tại nhà
- **TUYỆT ĐỐI CẤM:**
  - Thắp hương thật lạy vào hình Bồ Tát trên màn hình máy tính/điện thoại
  - Dâng lễ vật vào màn hình điện tử
  - Quỳ lạy vào hình ảnh số (digital image)

**Lý do:**
- Màn hình ảo KHÔNG CÓ khí trường của Bồ Tát
- Lạy vào đó = đang lạy đất trời
- Sẽ rước linh tính lạ (ngạ quỷ) đến nhận lễ
- Cực kỳ nguy hiểm cho người tu

**Được phép:**
- ✅ Ngồi niệm kinh bình thường trước màn hình (không thắp hương thật)
- ✅ Xem video giảng pháp
- ✅ Đọc kinh văn trên thiết bị số

---

## Schema Hints

```prisma
model UserProfile {
  // ... existing fields
  hasPhysicalAltar  Boolean @default(false) @map("has_physical_altar")
  altarSetupDate    DateTime? @map("altar_setup_date")
  
  // Warning acknowledgment
  digitalWorshipWarningAcknowledged Boolean @default(false)
}
```

---

## Service Logic

```typescript
export class HeartIncenseGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const profile = await this.prisma.userProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile?.hasPhysicalAltar) {
      throw new ForbiddenException({
        code: 'DIGITAL_WORSHIP_FORBIDDEN',
        message:
          'CẢNH BÁO TỐI CAO: Tuyệt đối không thắp hương thật hoặc lạy vào hình Bồ Tát trên thiết bị số. Chỉ được phép ngồi niệm kinh bình thường.',
        severity: 'CRITICAL',
      });
    }

    return true;
  }
}

@Controller('vows-merit/heart-incense')
export class HeartIncenseController {
  @Post()
  @UseGuards(HeartIncenseGuard)
  async offerHeartIncense(@User() user, @Body() dto: OfferHeartIncenseDto) {
    // Only accessible if hasPhysicalAltar = true
    return this.heartIncenseService.create(user.id, dto);
  }
}
```

---

## UI Components

### Critical Warning (Full Screen Blocker)
```
┌────────────────────────────────────────────┐
│  🚫 CẢNH BÁO TỐI CAO                      │
├────────────────────────────────────────────┤
│                                            │
│  Bạn chưa có bàn thờ thật tại nhà.        │
│                                            │
│  TUYỆT ĐỐI CẤM:                           │
│  ❌ Thắp hương thật lạy vào màn hình      │
│  ❌ Dâng lễ vật vào hình ảnh số           │
│  ❌ Quỳ lạy trước thiết bị điện tử        │
│                                            │
│  LÝ DO:                                   │
│  Màn hình ảo KHÔNG CÓ khí trường Bồ Tát. │
│  Lạy vào đó = lạy đất trời.               │
│  SẼ RƯỚC LINH TÍNH LẠ (ngạ quỷ) vào nhà! │
│                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                            │
│  BẠN ĐƯỢC PHÉP:                           │
│  ✅ Ngồi niệm kinh bình thường            │
│  ✅ Xem video giảng pháp                  │
│  ✅ Đọc kinh văn trên app                 │
│     (KHÔNG thắp hương thật)               │
│                                            │
│  [Tôi đã hiểu]                            │
└────────────────────────────────────────────┘
```

### Profile Setup Reminder
```
┌────────────────────────────────────────────┐
│  🏠 Thiết lập Phật đài                    │
├────────────────────────────────────────────┤
│  Bạn có bàn thờ thật tại nhà không?       │
│                                            │
│  ( ) Có - Tôi đã lập bàn thờ             │
│  (●) Chưa - Tôi đang tu tại nhà không     │
│      có bàn thờ                            │
│                                            │
│  ⚠️ LƯU Ý QUAN TRỌNG:                     │
│  Nếu chưa có bàn thờ, bạn TUYỆT ĐỐI      │
│  KHÔNG được thắp hương thật hoặc lạy vào │
│  hình Bồ Tát trên màn hình điện thoại.   │
│                                            │
│  Hãy đọc kỹ hướng dẫn "Lập bàn thờ tại   │
│  nhà" trước khi bắt đầu.                  │
│                                            │
│  [Đọc hướng dẫn] [Tiếp tục]              │
└────────────────────────────────────────────┘
```

### Feature Blocker (Soft)
```
┌────────────────────────────────────────────┐
│  🔒 Tính năng Tâm Hương                   │
├────────────────────────────────────────────┤
│  Tính năng này chỉ dành cho người đã lập │
│  bàn thờ thật tại nhà.                    │
│                                            │
│  Bạn có thể:                              │
│  ✅ Niệm kinh thông thường                │
│  ✅ Ghi nhật ký tu hành                   │
│  ✅ Theo dõi công khóa hằng ngày          │
│                                            │
│  Khi nào có bàn thờ thật, bạn có thể cập │
│  nhật trong [Cài đặt Profile] để mở khóa │
│  tính năng này.                           │
│                                            │
│  [Về trang chủ] [Cài đặt Profile]        │
└────────────────────────────────────────────┘
```

---

## References
- Source: Intro to Guan Yin Citta - Digital worship warnings
- `design/03-domains/vows-merit/REFERENCES/PHAT-DAI-BAO-DUONG.md`

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 9 Logic 3
