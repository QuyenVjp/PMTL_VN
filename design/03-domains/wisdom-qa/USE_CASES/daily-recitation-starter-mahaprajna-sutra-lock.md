# Ràng Buộc "Khởi Động" Thời Khóa Hằng Ngày — Daily Recitation Starter Mahaprajna Sutra Lock

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Thứ Tự Niệm Kinh Chuẩn Mực
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi bắt đầu ngồi xuống làm bài tập hằng ngày (Daily Recitation), **bài kinh đầu tiên phát ra từ miệng bắt buộc phải là Chú Đại Bi** (Great Compassion Mantra hoặc Mahaprajna Sutra) để thiết lập màng bảo vệ năng lượng toàn thân, gia tăng công lực, và chuẩn bị tâm trí. Các kinh văn khác (Tâm Kinh, Lễ Phật, Chú Vãng Sanh, v.v.) sau đó muốn niệm thứ tự nào cũng được, nhưng **bắt buộc không được bỏ qua bước Chú Đại Bi đầu tiên**.

---

## Owner module

`wisdom-qa` — DailyRecitationService / RecitationStarterGatekeeper
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User mở Daily Recitation app | ✅ Display all recitations, but disable non-Mahaprajna buttons |
| User clicks [Bắt đầu] button on non-Mahaprajna sutra | ❌ DISABLED (grayed out) |
| User reads ≥ 1 Chú Đại Bi in today's session | ✅ Unlock other recitations |
| Other recitations become clickable | ✅ Enable buttons for Tam Kinh, Lễ Phật, etc. |

---

## Notes

Ensures energy protection is always activated before other recitations. System tracks daily completion per user.