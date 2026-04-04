# Cấm kỵ Nguồn Lửa từ Đèn Dầu Bàn Thờ — Altar Oil Lamp Fire Prohibition

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi đốt Ngôi Nhà Nhỏ, **TUYỆT ĐỐI CẤM** dùng ngọn lửa từ đèn dầu Bàn thờ Phật, vì như vậy là phạm thượng. Phải dùng bật lửa hoặc quẹt diêm riêng.

---

## Owner module

`engagement` — LittleHouseService / FireSourceValidator

---

## Trigger

User tạo Burn Log với Location = "Có Bàn Thờ Phật Tại Gia"

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Burn Log + Bàn Thờ tại gia detected | ✅ Show safety checklist |
| Checklist: "Đang cầm bật lửa/quẹt diêm riêng" | ✅ Require checkbox ☑ |
| User không check | ❌ Block burn submission |
| User checked + confirmed | ✅ Allow save |

---

## FE Behavior

```
Before burn log submission:

[ ] Tôi đang cầm bật lửa/quẹt diêm RIÊNG.
    Tôi cam kết KHÔNG mồi lửa NNN từ
    đèn dầu của Bồ Tát. (REQUIRED)
```

---

## Audit

| Action | Trigger |
|---|---|
| `nnn.fire_source_checked` | User confirm fire source |
| `nnn.fire_source_rejected` | User skipped without checking |

---

## Notes

Hard blocker. Prevents karmic transgression at altar.