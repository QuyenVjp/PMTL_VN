# USE CASE: End-of-Session Perfection Buffer
**Module:** `content`, `vows-merit`  
**Phase:** 34 - Tầng Kiểm Soát Vật Lý & Chống Trục Lợi Pháp Bảo  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

Sau khi hoàn thành toàn bộ bài tập niệm Kinh hằng ngày, **PHẢI niệm 2 loại Chân Ngôn cuối**:

1. **Bổ Khuyết Chân Ngôn** (3 hoặc 7 biến) — bù đắp lỗi phát âm, sót chữ
2. **Thất Phật Diệt Tội Chân Ngôn** (3 biến) — tiêu trừ nghiệp chướng nhỏ trong ngày (KHÔNG cần khấn nguyện)

### ⚠️ TẠI SAO?
Nếu không niệm → công đức sẽ bị "hố" lỗi, không hoàn toàn.

---

## 🎯 Acceptance Criteria

### AC1: Auto-Trigger At 100%
**GIVEN** user hoàn thành tất cả Kinh văn trong ngày  
**WHEN** progress bar = 100%  
**THEN** 
- System auto-popup 2 **mandatory closing tasks**:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔐 HOÀN THIỆN CÔNG KHÓA
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Để hoàn thành công khóa hôm nay, 
  bạn cần niệm 2 Chân Ngôn cuối:
  
  📿 TASK 1: Bổ Khuyết Chân Ngôn
  Chọn số biến: [○ 3 biến] [○ 7 biến]
  
  📿 TASK 2: Thất Phật Diệt Tội Chân Ngôn (3 biến)
  Khấn nguyện: KHÔNG CẦN
  
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  [Bắt Đầu]
  ```

### AC2: Lock Main Dashboard
**GIVEN** popup showing  
**WHEN** user try to navigate away  
**THEN** 
- Dashboard bị lock
- Modal không dismiss được (no X button)
- Only allow task completion or "Tạm Hoãn" (reschedule for later)

### AC3: Sequential Task Flow
**GIVEN** user select 3 or 7 for Bổ Khuyết  
**WHEN** click "Bắt Đầu"  
**THEN** 
1. Display Task 1 counter:
   ```
   🔵 TASK 1: Bổ Khuyết Chân Ngôn (3 biến)
   [  +  0  -  ]
   ```
2. When complete, auto-advance to Task 2:
   ```
   🟢 TASK 2: Thất Phật Diệt Tội Chân Ngôn (3 biến)
   [  +  0  -  ]
   ```

### AC4: Only After Both Complete
**GIVEN** user finish 2 tasks  
**WHEN** both counters = target  
**THEN** 
- Nút "Đóng Công Khóa" unlock:
  ```
  ✅ CÔNG KHÓA HÔM NAY ĐÃ HOÀN THÀNH
  
  🙏 Bổ Khuyết: 3 biến ✓
  🙏 Thất Phật Diệt Tội: 3 biến ✓
  
  [Đóng Công Khóa & Hoàn Thành Ngày]
  ```

### AC5: Mark Session As Closed
**GIVEN** user click "Đóng Công Khóa"  
**WHEN** trigger save  
**THEN** 
- Update DB:
  ```typescript
  {
    dailySessionId: <uuid>,
    status: 'COMPLETED',
    closedWith: {
      boKhuyet: {
        count: 3 || 7,
        completedAt: now()
      },
      thatPhat: {
        count: 3,
        completedAt: now()
      }
    },
    sessionClosedAt: now()
  }
  ```

### AC6: Prevent Double Close
**GIVEN** session already closed  
**WHEN** user try to open app next day  
**THEN** 
- Don't show modal again
- Display: *"Công khóa hôm qua đã đóng thành công"*

---

## 🔧 Technical Notes

### Daily Session Tracker
```typescript
// Location: apps/api/src/vows-merit/services/daily-session-tracker.service.ts

@Injectable()
export class DailySessionTrackerService {
  async checkDailyCompletion(userId: string): Promise<boolean> {
    const today = startOfDay(new Date());
    
    const session = await this.prisma.dailyRecitationSession.findFirst({
      where: {
        userId,
        createdAt: { gte: today }
      }
    });
    
    if (!session) return false;
    
    // Check if all main mantras are done
    const allMainComplete = session.mainMantras.every(m => m.completed);
    
    return allMainComplete;
  }
  
  async completeSession(userId: string, boKhuyet: number) {
    const session = await this.getCurrentSession(userId);
    
    return this.prisma.dailyRecitationSession.update({
      where: { id: session.id },
      data: {
        status: 'COMPLETED',
        closedWith: {
          boKhuyet,
          thatPhat: 3,
          closedAt: new Date()
        }
      }
    });
  }
}
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Bổ Khuyết & Thất Phật
- **Q&A Huyền học:** Lý do phải niệm 2 Chân Ngôn cuối
- **Hướng dẫn thực hành:** Cách hoàn thiện công khóa

---

## 🏷️ Tags
`#phase-34` `#content` `#session-closing` `#perfection-buffer` `#dharma-completeness`
