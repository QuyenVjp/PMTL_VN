# Trình Tự Bốc Bát Hương / Chuyển Nhà — Relocation Extinguisher & Chanting Formula

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi chuyển nhà, không được phép bưng tượng Bồ Tát đi ngay. Phải đợi nhang cháy hết hoàn toàn, sau đó niệm bộ Kinh văn bảo vệ gồm đúng 7 Đại Bi + 7 Tâm Kinh + 7 Lễ Phật Đại Sám Hối Văn. Chỉ khi hoàn thành đủ bộ 3 này, mới được phép lấy vải đỏ bọc tôn tượng.

---

## Owner module

`vows-merit` — RelocationService / RelocationCheckpoint

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User initiate [Chuyển Nhà Flow] | ✅ Show multi-stage checklist |
| **Checkpoint 1:** Incense fully burned | ⚠️ Require user confirm |
| **Checkpoint 2:** Complete chanting formula | ⚠️ Track: 7 Great Compassion + 7 Heart Sutra + 7 Ceremony of Repentance |
| All checkpoints passed | ✅ Unlock [Wrap Buddha Statue] button |

---

## Input Contract

```typescript
interface RelocationCheckpoint {
  checkpoint1_incense_burned: boolean;
  checkpoint2_chanting: {
    great_compassion_count: number;    // Must be 7
    heart_sutra_count: number;         // Must be 7
    ceremony_repentance_count: number; // Must be 7
  };
}
```

---

## FE Workflow

```
[Chuyển Nhà] button

Step 1: Show modal
  "Bạn đã đợi nhang cháy hết hoàn toàn?"
  [ ] Tôi đã đợi nhang cháy hết
  [Tiếp theo]  (disabled until checked)

Step 2: Chanting tracking
  "Hoàn thành đúng 7 lần mỗi bài:"
  - Great Compassion: 0/7
  - Heart Sutra: 0/7
  - Ceremony of Repentance: 0/7

  [Log Recitations]

  (System tracks daily logs until all 7/7 reached)

Step 3: Unlock
  "✅ Đủ chanting formula"
  [Tiếp tục: Bọc tôn tượng]
```

---

## Audit

| Action | Trigger |
|---|---|
| `relocation.checkpoint1_confirmed` | Incense burned |
| `relocation.chanting_logged` | Each recitation tracked |
| `relocation.checkpoint2_completed` | All 7/7/7 reached |
| `relocation.ready_to_wrap_statue` | All checkpoints passed |

---

## Notes

Multi-checkpoint protection during relocation to maintain Buddha statue spiritual integrity.