# Giao thức Miễn trừ Gánh Nghiệp khi Phóng Sinh Thay — Proxy Liberation Karma Shield

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-04

---

## Purpose

Dùng tiền của mình đi phóng sinh thay cho một người đang bệnh nặng để trị bệnh hoặc vượt qua kiếp nạn. Tuy nhiên, nghiệp chướng của người đó rất dễ "bám sang" người đi thả cá. Phải có bộ khấn bảo vệ cụ thể để cắt đứt sự lây lan này.

---

## Owner module

`engagement` — LifeLiberationService / ProxyKarmaShield

---

## Trigger

User creates Life Liberation event with `isProxy = true` (phóng sinh thay người khác).

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| isProxy = true | ✅ Generate protective chant (mẫu cố định) |
| Show modal: Chant text + Audio option | ✅ Display for user to read/listen |
| User confirms "Tôi đã khấn câu này" | ✅ Enable save button |
| User NOT confirmed | ❌ Block save submission |
| After save | ✅ Record shield activation in DB |

---

## Protective Chant Template

```
"Cầu xin Đại Từ Đại Bi Quán Thế Âm Bồ Tát
gia hộ cho con không phải gánh nghiệp của
[Tên người được phóng sinh],
mong cho việc phóng sinh của
[Tên người được phóng sinh]
có thể tiêu trừ nghiệp chướng của họ."
```

---

## FE Behavior

```
[Thả Cá] → Life Liberation Form

Step 1: isProxy option
  [ ] Phóng sinh thay người khác

Step 2: After checking isProxy

  Input: Người được phóng sinh
  [________________]

Step 3: Auto-generate protection chant

  🛡️ BẢO VỆ NGHIỆP LỰC

  "Cầu xin Đại Từ Đại Bi Quán Thế Âm Bồ Tát
   gia hộ cho con không phải gánh nghiệp của
   [Người được phóng sinh],
   mong cho việc phóng sinh của
   [Người được phóng sinh]
   có thể tiêu trừ nghiệp chướng của họ."

  [🔊 Nghe] (audio option)

  [ ] Tôi đã khấn câu này

  [Quay lại]  [Lưu] (disabled until checked)
```

---

## Input Contract

```typescript
interface ProxyLiberationInput {
  userId: string;
  beneficiaryName: string;
  isProxy: true;
  protectiveChantRecited: boolean;  // REQUIRED
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `liberation.proxy_detected` | isProxy = true |
| `liberation.shield_generated` | Chant template created |
| `liberation.shield_confirmed` | User confirm recited |
| `liberation.saved_with_shield` | Proxy liberation recorded |

---

## Notes

Mandatory karma shield for proxy liberations. Prevents user from absorbing beneficiary's karma through lack of protection.