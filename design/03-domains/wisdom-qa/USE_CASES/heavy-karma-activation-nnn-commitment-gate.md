# Khóa Kích Hoạt Nghiệp Chướng Khẩn Cấp Bằng Lễ Phật — Heavy Karma Activation NNN Commitment Gate

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Cảnh Báo Mở Kích Nghiệp Chướng
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

*Lễ Phật Đại Sám Hối Văn* là kinh văn với sức mạnh lớn nhất để xin lỗi và sám hối. Tuy nhiên, nó cũng có khả năng kích hoạt/mở các khoá tất cả **khối lượng lớn các nghiệp chướng** bị chứa kỳ cụm lại. Nếu user niệm quá nhiều (ví dụ 5 biến/ngày) mà không có khả năng "chi trả" bằng cách đốt NNN (tối thiểu 5 tấm/tuần), cái ván nợ đó sẽ "rơi xuống" ngay lập tức, gây bệnh nặng hoặc kiếp nạn. Hệ thống phải chặn user không được phép niệm quá nhiều nếu không cam kết được đốt đủ NNN.

---

## Owner module

`wisdom-qa` — DailyRecitationService / HeavyKarmaGatekeeper
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — Người dùng muốn niệm Lễ Phật > 3 biến/ngày
- `system` — Check commitment + monitor quota, auto-downgrade if fail

---

## Trigger

User cố thay đổi Daily Recitation template: Set *Lễ Phật Đại Sám Hối Văn* count > 3 (ví dụ 5, 7, 9 biến/ngày).

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User set Lễ Phật ≤ 3 biến/ngày | ✅ ALLOWED |
| User set Lễ Phật > 3 biến/ngày | ⚠️ Trigger commitment gate |
| Gate: Show red warning + demand explicit commitment | ✅ Require user type "TÔI CAM KẾT" |
| User refuse commitment | ✅ Decline request, revert to previous |
| User accept commitment | ✅ Save new quota + create MonthlyQuotaTracker |
| Quota tracker: Monthly NNN target = 5 * number_of_heavy_recitations_per_week | ✅ Calculate |
| End of week: NNN burned < target | ⚠️ Auto-downgrade Lễ Phật back to 3 biến/ngày |
| Notification of auto-downgrade | ✅ Inform user |

---

## Notes

This is a hard gate requiring explicit commitment validation before allowing heavy karma recitations.