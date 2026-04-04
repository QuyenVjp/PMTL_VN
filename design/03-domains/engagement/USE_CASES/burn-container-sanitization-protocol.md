# Giao thức Thanh tẩy Dụng cụ Hóa NNN — Burn Container Sanitization Protocol

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-04

---

## Purpose

Chiếc đĩa sứ sau khi hóa NNN xong sẽ dính tro tàn (năng lượng cõi âm). Bắt buộc phải rửa sạch sẽ trước khi cất đi để tái sử dụng. Tuyệt đối không được để nguyên đĩa dính bụi tro đen.

---

## Owner module

`engagement` — BurnContainerService / SanitizationReminder

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| NNN burn session ends | ✅ Post-burn workflow triggered |
| User wraps ash | ✅ Show sanitization reminder |
| Reminder: Wash container immediately | ✅ Display prominent message |
| Acknowledge | ✅ Complete session |

---

## Reminder Message

```
🧼 GHI NHỚ THANH TẨY DỤNG CỤ

Hãy mang chiếc đĩa sứ đi rửa thật
sạch sẽ bằng nước ngay bây giờ để
loại bỏ hoàn toàn âm khí, sau đó
lau khô và cất đi cho lần sử dụng sau.

[ ] Tôi đã rửa sạch dụng cụ
[ ] Tôi sẽ rửa sau (không khuyến khích)

[Hoàn thành]
```

---

## Audit

| Action | Trigger |
|---|---|
| `nnn.post_burn_sanitization_reminder` | Burn session completed |
| `nnn.container_sanitization_acknowledged` | User confirmed cleaning |

---

## Notes

Sanitization prevents residual Yin energy accumulation in burn container for next use.