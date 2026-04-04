# Triệu Chứng "Khát Nước" Khi Niệm NNN — Recitation Limit Breaker Defense

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-04

---

## Purpose

Nếu người tu vì quá nóng lòng mà dốc mạng niệm NNN ngày đêm, đến mức miệng lở loét hoặc nổi bọng nước, đó không phải bệnh nhiệt miệng thông thường mà là dấu hiệu **vượt quá giới hạn năng lượng sinh học**. Hệ thống phải tự động khóa chức năng để bảo vệ.

---

## Owner module

`wisdom-qa` — RecitationLimitService / HealthDefenseEngine

---

## Trigger Keywords

```
- Lở miệng
- Nổi bọng nước (sores, blisters)
- Kiệt quệ / Quá mệt mỏi
- Miệng chảy máu
- Không ăn được / Khó nuốt
```

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User logs health symptom = trigger keyword | ✅ Detect overstrain |
| System analyzes NNN count (past 7 days) | ✅ Check if excessive |
| Excessive count confirmed | ❌ LOCK NNN logging for 24h |
| Show recovery protocol | ✅ Recommend only Great Compassion |
| 24h cooldown complete | ✅ Re-enable NNN logging |

---

## FE Behavior

```
[Ghi Nhật Ký Sức Khỏe]

Triệu chứng:
[_____________]
(Scan for keywords: lở miệm, bọng nước...)

After submitting "lở miệng":

🚨 CẢNH BÁO TỐI CAO

Bạn đang vượt quá giới hạn năng lượng
của bản thân, điều này vi phạm luật
tu tập.

⛔ LỆNH: Dừng niệm NNN ngay

Thời gian khóa: 24 giờ (tính từ bây giờ)

---

💡 Phác đồ Phục Hồi:

CHUYỂN SANG CHỈ NIỆM:
• Chú Đại Bi (Great Compassion)
  để phục hồi công lực

KHÔNG NIỆM:
• Lễ Phật Đại Sám Hối Văn
• Chú Vãng Sanh
• NNN

Hãy để cơ thể phục hồi hoàn toàn.
Mục tiêu tu tập quan trọng hơn sức khỏe.
```

---

## Cooldown Lock

```prisma
model RecitationCooldown {
  id            String @id @default(cuid())
  userId        String
  triggeredAt    DateTime
  expiresAt      DateTime  // 24h from triggered
  reason         String    // Health symptom keyword
  status         String @default("ACTIVE")

  user          User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `recitation.overstrain_detected` | Health symptom logged |
| `recitation.nnn_logging_locked` | 24h cooldown activated |
| `recitation.great_compassion_only` | Recovery protocol suggested |
| `recitation.cooldown_expired` | 24h passed, lock removed |

---

## Notes

Hard protection mechanism prevents permanent physical damage from excessive recitation practice.