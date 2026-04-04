# PROXY-NOTIFICATION-GUARD

## Owner
- `vows-merit` (Life Liberation) + `notifications`

## Purpose
Khóa Thông Báo Ủy Thác Phóng Sinh (Proxy Notification Guard) - Protect from speech karma

---

## Business Rule

### Rule - Do NOT Notify if Recipient is Against Buddhism
**Nghiệp vụ [Nguồn 348-349]:**
- Phóng sinh thay cho người nhà
- Nếu người đó **hoàn toàn phản đối** (completely against) Phật pháp/phóng sinh
- **TUYỆT ĐỐI KHÔNG KỂ CHO HỌ NGHE**
- Tránh việc họ buông lời phỉ báng (tạo Khẩu nghiệp)

---

## Schema Hints

```prisma
model LifeReleaseJournal {
  // ... existing
  isProxy                Boolean @default(false)
  recipientAttitude      String? // SUPPORTIVE, NEUTRAL, AGAINST
  notificationBlocked    Boolean @default(false)
}
```

---

## Service Logic

```typescript
export class ProxyLiberationGuard {
  canNotifyRecipient(journal: LifeReleaseJournal): boolean {
    if (journal.recipientAttitude === 'AGAINST') {
      return false; // Block notification
    }
    return true;
  }
}
```

---

## UI Component

```
┌────────────────────────────────────────────┐
│  🔒 Thông báo bị khóa                     │
├────────────────────────────────────────────┤
│  Người nhận: Bố                           │
│  Thái độ: Phản đối Phật pháp              │
│                                            │
│  KHÔNG được thông báo cho họ biết để     │
│  bảo vệ họ khỏi tạo Khẩu nghiệp.          │
│                                            │
│  [Tôi hiểu]                               │
└────────────────────────────────────────────┘
```

---

## References
- Sources 348-349: Proxy notification guard

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 10 Logic 8
