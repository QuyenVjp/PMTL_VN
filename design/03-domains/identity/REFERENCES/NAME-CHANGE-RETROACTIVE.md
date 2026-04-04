# NAME-CHANGE-RETROACTIVE

## Owner
- `identity` (Sacred Forms) + `engagement` (Little House)

## Purpose
Kích hoạt Hồi tố cho Đơn Đổi Tên (Retroactive Name Activation)

---

## Business Rule

### Rule - Past LH Activates When Name Change Succeeds
**Nghiệp vụ [Nguồn 420-421]:**
- Làm *Đơn Đổi Tên* lần 1 thất bại (chưa linh ứng)
- Đã lỡ đốt TPT bằng tên mới → Những tờ TPT đó KHÔNG bị mất
- Khi làm đơn lại lần 2, 3 và **thành công**
- Toàn bộ số TPT đã đốt trước đó sẽ lập tức **được kích hoạt (effective)**

---

## Schema Hints

```prisma
enum LittleHouseStatus {
  DRAFT
  SIGNED
  CHANTED
  BURNED
  PENDING_ACTIVATION    // Burned under unverified new name
  EFFECTIVE             // Retroactively activated
  INVALIDATED
}

model NameChangeApplication {
  id              String   @id
  userId          String
  oldName         String
  newName         String
  attemptNumber   Int      @default(1)
  status          String   // PENDING, SUCCESSFUL, FAILED
  activationDate  DateTime?
  createdAt       DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
  @@map("name_change_applications")
}

model LittleHouse {
  // ... existing
  status                LittleHouseStatus
  nameChangeAppId       String? // Link to NameChangeApplication
  retroactivelyActivated Boolean @default(false)
}
```

---

## Service Logic

```typescript
export class NameChangeRetroactiveService {
  async markNameChangeSuccessful(appId: string) {
    const app = await this.prisma.nameChangeApplication.update({
      where: { id: appId },
      data: {
        status: 'SUCCESSFUL',
        activationDate: new Date(),
      },
    });

    // Retroactively activate all pending LHs burned under this new name
    const result = await this.prisma.littleHouse.updateMany({
      where: {
        userId: app.userId,
        offerFrom: app.newName,
        status: LittleHouseStatus.PENDING_ACTIVATION,
      },
      data: {
        status: LittleHouseStatus.EFFECTIVE,
        retroactivelyActivated: true,
      },
    });

    // Notify user
    await this.notificationService.send(app.userId, {
      title: 'Tên mới đã kích hoạt!',
      body: `${result.count} TPT đã đốt trước đây đã được kích hoạt hiệu lực.`,
    });

    return { app, activatedLH: result.count };
  }
}
```

---

## UI Components

```
┌────────────────────────────────────────────┐
│  ✅ Tên mới đã kích hoạt!                 │
├────────────────────────────────────────────┤
│  Tên mới: Nguyễn Văn B                    │
│  Ngày kích hoạt: 2026-04-04               │
│                                            │
│  RETROACTIVE ACTIVATION:                   │
│  15 TPT đã đốt trước đây với tên mới      │
│  nay đã CHÍNH THỨC CÓ HIỆU LỰC.           │
│                                            │
│  Những tờ này KHÔNG bị mất!               │
│                                            │
│  [Xem danh sách TPT] [OK]                 │
└────────────────────────────────────────────┘
```

---

## References
- Sources 420-421: Name change retroactive activation

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 10 Logic 4
