# Cảnh báo Nghiệp Sát theo Nghề nghiệp Đặc thù — Occupational Karma Hazard Engine

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-04

---

## Purpose

Bất kỳ ai làm những nghề nghiệp liên quan trực tiếp hoặc gián tiếp đến sinh mạng đều đang tích lũy Nghiệp Sát rất nặng. Hệ thống phải tự động phát hiện và áp dụng yêu cầu tu tập bổ sung để tiêu trừ ác nghiệp.

---

## Owner module

`identity` / `vows-merit` — OccupationalKarmaService / HazardDetector

---

## Blacklisted Occupations

```
- Nhân viên nhà bếp / Đầu bếp
- Bác sĩ phẫu thuật / Bác sĩ phá thai
- Nhân viên tang lễ
- Công nhân tiêu diệt côn trùng
- Công nhân lò mổ
- Cảnh sát hình sự
- Bác sĩ pháp y
- Các nghề liên quan trực tiếp đến sinh mạng khác
```

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User chọn nghề từ Blacklist | ✅ Set flag: OCCUPATIONAL_KARMA_HAZARD |
| Flag activated | ✅ Auto-append 49-108 biến Chú Vãng Sanh vào Daily Recitation |
| Mandatory recitation | ✅ Permanent addition (không thể huỷ) |
| Show warning banner | ✅ Red popup on app open |

---

## Warning Message

```
CẢNH BÁO TÂM LINH: Nghề nghiệp của bạn
đang tạo ra Nghiệp Sát rất nặng.

Hệ thống yêu cầu bạn phải liên tục
niệm Chú Vãng Sanh và tăng cường
Phóng sinh để tiêu trừ ác nghiệp.

Nếu có thể, tốt nhất hãy chuyển nghề.
```

---

## Schema Notes

```prisma
model UserOccupation {
  id            String @id @default(cuid())
  userId        String @unique
  occupationCode String
  hasKarmaHazard Boolean @default(false)
  hazardDetectedAt DateTime?

  user          User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `identity.occupational_karma_detected` | User selected blacklisted occupation |
| `recitation.hazard_mantra_appended` | Vãng Sanh auto-added to daily |

---

## Notes

Permanent flag. No exception path to disable mandatory Vãng Sanh recitations once triggered.