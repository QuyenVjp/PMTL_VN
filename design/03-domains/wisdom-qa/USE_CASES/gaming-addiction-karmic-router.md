# Định Tuyến Nghiệp Chướng Nghiện Game — Gaming Addiction Karmic Router

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn Phase 31)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Trẻ em nghiện game bạo lực, nhốt phòng, nổi loạn không chỉ là vấn đề tâm lý thông thường. Theo Pháp Môn Tâm Linh, các trò chơi sát sinh trong game chiêu cảm vong linh và tạo nghiệp chướng thực sự. Hệ thống chẩn đoán phải định tuyến đến phác đồ phù hợp và hỗ trợ người dùng tìm hướng giải quyết tâm linh đúng đắn.

---

## Owner module

`wisdom-qa` — SymptomCheckerService / KarmicRouter
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` (phụ huynh) — báo cáo triệu chứng của con
- `system` — phân tích tags, định tuyến phác đồ, gợi ý NNN cho con

---

## Trigger

Khi user (phụ huynh) mở công cụ chẩn đoán `SymptomChecker` và chọn các Tags liên quan đến con cái:
- `[Trẻ nghiện game]`
- `[Trẻ nổi loạn / Bạo lực]`
- `[Con khó bảo]`

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Tags chứa gaming/rebellion symptoms cho trẻ em | ✅ Tạo phác đồ cho đứa trẻ |
| Tags chứa gaming/rebellion symptoms | ✅ Gợi ý phác đồ NNN cho con |
| Bất kỳ tag nào kích hoạt | ✅ Hiển thị thông tin về game bạo lực + nghiệp chướng |

---

## Input Contract

```typescript
interface SymptomCheckerDto {
  subjectType:  'SELF' | 'CHILD' | 'FAMILY_MEMBER'
  subjectAge?:  number
  symptomTags:  string[]
  notes?:       string
}
```

---

## Write Path

```
POST /api/wisdom-qa/symptom-checker/submit

1. If subjectType == 'CHILD' AND symptomTags overlaps GAMING_ADDICTION_TAGS:
   GAMING_ADDICTION_TAGS = [
     'gaming_addiction', 'rebellion', 'violence', 'room_isolation',
     'tantrum', 'refuses_hygiene', 'aggressive_behavior'
   ]

2. Generate KarmicRemedyPlan for child:
   a. Primary remedy: NNN Ngôi Nhà Nhỏ cho con
      → Suggested count: 7-21 tấm
      → Recipient: Con của <Tên User>
   b. Secondary remedy: Chú Giải Kết cho gia đình
   c. Lifestyle guidance: Hạn chế game, thay bằng nghe Kinh

3. Return KarmicRemedyPlan + gaming_karma_educational_content
```

---

## FE Behavior

### Kết quả chẩn đoán:

```
┌──────────────────────────────────────────────────────────┐
│ 📊 Kết Quả Chẩn Đoán — Nghiệp Chướng Game Bạo Lực       │
│──────────────────────────────────────────────────────────│
│                                                          │
│ ℹ️  Theo Pháp Môn Tâm Linh:                              │
│ Các trò chơi bạo lực sẽ chiêu cảm vong linh và tạo      │
│ nghiệp lực thực sự cho người chơi.                       │
│                                                          │
│ 📋 Phác Đồ Được Đề Xuất:                                 │
│                                                          │
│ 1. 🏠 Niệm NNN cho con:                                  │
│    Tạo 7-21 tấm NNN (Kính tặng: Con của [Tên bạn])       │
│    → Giải oan nghiệp từ game bạo lực                     │
│                                                          │
│ 2. 📿 Niệm Chú Giải Kết cho gia đình                     │
│    → Hóa giải xung đột                                   │
│                                                          │
│ 3. 🎧 Cho con nghe Kinh thay vì chơi game                │
│    → Thay thế dần trường khí bạo lực                     │
│                                                          │
│  [Tạo NNN Cho Con Ngay]   [Xem Hướng Dẫn Chi Tiết]      │
└──────────────────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model KarmicRemedyPlan {
  // ... existing fields ...
  subjectType   String   // SELF, CHILD, FAMILY_MEMBER
  subjectAge    Int?
  symptomTags   String[] // array of tags
  planType      String   // GAMING_ADDICTION, HEALTH, RELATIONSHIP, etc.
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `wisdom_qa.gaming_karma.diagnosis_run` | Chẩn đoán nghiện game được thực hiện |
| `wisdom_qa.gaming_karma.nnn_task_created` | NNN cho con được tạo từ chẩn đoán |

---

## Errors

Không có error codes — đây là advisory/routing feature.

---

## Notes for AI/codegen

- Phác đồ này là gợi ý — không block bất kỳ hành động nào
- `GAMING_ADDICTION_TAGS` là config list, có thể mở rộng
- Tích hợp với `engagement` module để tạo NNN task trực tiếp từ kết quả chẩn đoán
- Privacy: không lưu thông tin cá nhân của người con — chỉ lưu tags và plan type
- Khi người dùng tap [Tạo NNN Cho Con Ngay]: pre-fill NNN form với `recipient = "Con của {user.name}"`

---

## Related

- [prescribe-karmic-remedy.md](./prescribe-karmic-remedy.md) — engine chẩn đoán tổng
- [manage-little-house-reserved-proxy.md](../../engagement/USE_CASES/manage-little-house-reserved-proxy.md) — NNN cho người khác
- [dream-to-debt-quantifier.md](../../engagement/USE_CASES/dream-to-debt-quantifier.md) — định lượng nợ nghiệp từ dấu hiệu
