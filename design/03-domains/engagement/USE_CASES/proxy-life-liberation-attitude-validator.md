# Ràng Buộc Thái Độ Của Người Nhận Đối Với Việc Phóng Sinh Thay — Proxy Life Liberation Attitude Validator

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Luật Phóng Sinh Đại Từ
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi dùng tiền túi phóng sinh giùm người nhà (để trị bệnh, cầu bình an) mà không báo cho họ biết, thì hoàn toàn tốt và an toàn — công đức sẽ lặng lẽ tích lũy. Tuy nhiên, **nếu thông báo cho họ biết**, người đó cần phải có **thái độ ủng hộ, hoan hỉ** Phật pháp. Nếu họ **buông lời báng bổ hay phản đối gay gắt** Phật Pháp, thì họ sẽ tạo khẩu nghiệp cực nặng và sẽ **đánh mất hoàn toàn** công đức vừa thả cá cho họ. Hệ thống phải **ẩn tính năng chia sẻ** nếu user báo rằng người nhận là người phản đối.

---

## Owner module

`engagement` — LifeLiberationService / ProxyLiberationValidator
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| isProxy = false (phóng sinh không báo) | ✅ Allow, no restrictions |
| isProxy = true + attitude = "SUPPORTIVE" | ✅ Allow share/notify |
| isProxy = true + attitude = "OPPOSED" | ❌ BLOCK share/notify button |
| Show warning when "OPPOSED" selected | ⚠️ Tooltip explains khẩu nghiệp risk |

---

## Notes

Protects against karmic accumulation when recipients might create negative speech karma against Buddha-dharma.