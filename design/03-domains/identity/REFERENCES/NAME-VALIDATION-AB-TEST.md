# NAME-VALIDATION-AB-TEST

## Owner
- `identity` (Sacred Forms) + `engagement`

## Purpose
Flow Kiểm chứng Độ Linh Ứng của Tên (Name Validation A/B Testing)

---

## Business Rule

### Rule - Test with 3-5 LH, Check Symptoms
**Nghiệp vụ [Nguồn: Intro to Guan Yin Citta - Name Change]:**
- Đốt 3-5 TPT bằng tên mới
- Nếu ác mộng/mệt mỏi giảm → Tên mới đã linh ứng
- Chứng tỏ kết nối được với sổ Nam Tào/Địa phủ

---

## Schema Hints

```prisma
model NameChangeApplication {
  // ... existing
  status              String   // PENDING, AB_TESTING, SPIRITUALLY_ACTIVE
  testStartDate       DateTime?
  testLHCount         Int      @default(0)
}
```

---

## Service Logic

```typescript
export class NameValidationService {
  async scheduleABTest(appId: string) {
    const app = await this.prisma.nameChangeApplication.update({
      where: { id: appId },
      data: { 
        status: 'AB_TESTING',
        testStartDate: new Date(),
      },
    });

    // Schedule follow-up after 3 days
    await this.schedulerService.schedule({
      jobName: `name-ab-test-${appId}`,
      runAt: addDays(new Date(), 3),
      handler: () => this.sendABTestSurvey(app.userId, appId),
    });
  }

  async sendABTestSurvey(userId: string, appId: string) {
    await this.notificationService.send(userId, {
      title: 'Kiểm chứng tên mới',
      body: 'Triệu chứng ác mộng/mệt mỏi có giảm không?',
      actionType: 'NAME_AB_TEST_SURVEY',
      data: { appId },
    });
  }

  async processABTestResult(appId: string, symptomsImproved: boolean) {
    if (symptomsImproved) {
      await this.prisma.nameChangeApplication.update({
        where: { id: appId },
        data: { status: 'SPIRITUALLY_ACTIVE' },
      });
    }
  }
}
```

---

## UI Component

```
┌────────────────────────────────────────────┐
│  🧪 Kiểm chứng Tên Mới                    │
├────────────────────────────────────────────┤
│  Tên mới: Nguyễn Hạnh Phúc                │
│  TPT đã đốt: 5                            │
│                                            │
│  Sau khi đốt TPT với tên mới, triệu chứng│
│  ác mộng/mệt mỏi của bạn có giảm không?  │
│                                            │
│  ( ) Có giảm rõ rệt                       │
│  ( ) Giảm một chút                        │
│  ( ) Không thay đổi                       │
│  ( ) Tệ hơn                               │
│                                            │
│  [Gửi kết quả]                            │
└────────────────────────────────────────────┘
```

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 11 Logic 7
