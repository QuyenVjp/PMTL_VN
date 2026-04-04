# Chống Cướp Công Đức Khi Phóng Sinh Thay — Life Release Merit-Stealing Guard

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi user dùng **tiền của mình** mua cá/chim đi phóng sinh **thay cho người khác** (người bệnh, người thân),
nếu lỡ nhắc đến tên bản thân tại hồ/địa điểm thả, **toàn bộ công đức sẽ về người niệm thay** — người bệnh không nhận được.

Hệ thống phải sinh ra checklist 2 bước có cảnh báo đỏ để bảo vệ luồng công đức đúng hướng.

---

## Owner module

`vows-merit` — LifeReleaseJournal flow
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người bỏ tiền và đi phóng sinh thay
- `system` — inject checklist, hiển thị cảnh báo, ghi audit

---

## Trigger

User tạo `LifeReleaseJournal` với:
- `fundedByMe = true` **VÀ**
- `releasedFor = "OTHER"` (hồi hướng cho người khác, không phải bản thân)

---

## Business Rule

| Điều kiện | Hành động bắt buộc |
|---|---|
| `fundedByMe = true` AND `releasedFor = OTHER` | Inject 2-step merit checklist |
| Step 1 chưa confirm | Block submit LifeReleaseJournal |
| Step 2 reminder chưa được FE acknowledge | Hiển thị banner đỏ nhấp nháy tại địa điểm thả |

---

## Hai Bước Checklist

### Bước 1 — Tại Nhà (Trước Khi Đi)

Trước khi rời nhà, user phải khấn báo cáo Bồ Tát:

> *"Nam mô Quán Thế Âm Bồ Tát, con tên là [Tên user] hôm nay dùng tiền của con để mua [loại vật] phóng sinh hồi hướng cho [Tên người được hồi hướng]. Xin Bồ Tát chứng minh và hộ trì để toàn bộ công đức này về đến [Tên người được hồi hướng]."*

- Tên, loại vật, và tên người được hồi hướng được tự động điền từ record.
- User xác nhận bằng checkbox: `[x] Tôi đã khấn xong tại nhà trước khi đi.`

### Bước 2 — Tại Hồ/Địa Điểm Thả (Critical Warning)

Khi user bấm **[Đã đến nơi thả]** hoặc mở màn hình ghi lại phóng sinh:

UI hiển thị **banner đỏ nhấp nháy** (không thể tắt trong 5 giây):

```
┌─────────────────────────────────────────────────────┐
│  🚨  CẢNH BÁO QUAN TRỌNG — ĐỌC TRƯỚC KHI THẢ      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  TUYỆT ĐỐI KHÔNG nhắc đến tên của bạn              │
│  tại đây!                                           │
│                                                     │
│  Nếu bạn nói tên mình khi đang thả [loại vật],     │
│  toàn bộ công đức sẽ chuyển về bạn —               │
│  [Tên người bệnh] sẽ không nhận được gì.           │
│                                                     │
│  Chỉ khấn tên: [Tên người được hồi hướng]          │
│                                                     │
│  (Tự động tắt sau 5 giây)    [Tôi đã hiểu]         │
└─────────────────────────────────────────────────────┘
```

---

## Input Contract

```
LifeReleaseJournalCreateDto {
  // ... existing fields ...
  fundedByMe:               boolean
  releasedFor:              "SELF" | "OTHER"
  beneficiaryName?:         string   // required khi releasedFor = OTHER
  meritChecklistStep1:      boolean  // required khi fundedByMe=true AND releasedFor=OTHER
}
```

---

## Write Path

```
POST /api/vows-merit/life-release-journals
────────────────────────────────────────────
1. Parse và validate Zod schema.
2. Nếu fundedByMe = true AND releasedFor = "OTHER":
   a. Validate beneficiaryName: required, non-empty.
   b. Validate meritChecklistStep1 === true.
      → Nếu false/missing: throw 400 {
          error: "merit_checklist_step1_required",
          message: "Phải khấn báo cáo tại nhà trước khi đi. Tích checkbox xác nhận."
        }
3. Tạo LifeReleaseJournal record.
4. Tạo pending reminder: khi user mở màn hình "Ghi lại tại nơi thả", inject Step 2 warning payload vào response.
5. Audit: life-release.merit-guard.checklist-confirmed.
```

---

## Response Payload (cho FE hiển thị Step 2)

Khi user navigate đến màn hình "Đang thả" hoặc "Hoàn thành phóng sinh":

```json
{
  "meritGuard": {
    "active": true,
    "beneficiaryName": "[Tên người được hồi hướng]",
    "species": "[Loại vật]",
    "warningMessage": "TUYỆT ĐỐI KHÔNG nhắc tên bạn tại đây. Công đức sẽ về [Tên người được hồi hướng].",
    "warningLevel": "CRITICAL",
    "autoHideAfterMs": 5000,
    "requireAcknowledge": true
  }
}
```

FE dùng payload này để render Step 2 banner — không hardcode text trong FE.

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Step 1 checkbox missing/false | `merit_checklist_step1_required` | 400 |
| `beneficiaryName` missing khi releasedFor = OTHER | `beneficiary_name_required` | 400 |
| Chưa đăng nhập | `unauthorized` | 401 |

---

## Audit

| Action | Trigger |
|---|---|
| `life-release.merit-guard.step1-confirmed` | User xác nhận đã khấn tại nhà |
| `life-release.merit-guard.step2-shown` | FE render banner đỏ tại nơi thả |
| `life-release.merit-guard.step2-acknowledged` | User bấm [Tôi đã hiểu] |
| `life-release.completed` | User hoàn thành ghi record |

---

## Schema Notes for AI/codegen

```prisma
model LifeReleaseJournal {
  // ... existing fields ...
  fundedByMe              Boolean   @default(true)
  releasedFor             LifeReleaseTarget @default(SELF)
  beneficiaryName         String?
  meritStep1ConfirmedAt   DateTime?  // khấn tại nhà
  meritStep2ShownAt       DateTime?  // banner đỏ đã hiển thị
  meritStep2AcknowledgedAt DateTime? // user đã bấm [Tôi đã hiểu]
}

enum LifeReleaseTarget {
  SELF
  OTHER
}
```

- Ba timestamp audit fields quan trọng hơn boolean — cung cấp evidence timeline.
- `meritStep2ShownAt` được set bởi backend khi GET record trong màn hình "tại nơi thả".
- Checklist text nên lấy từ `beneficiaryName` trong record, không hardcode.

---

## Related

- [log-life-release.md](./log-life-release.md) — Core life release journal flow
- [create-assisted-life-release-entry.md](./create-assisted-life-release-entry.md) — Admin-assisted entry
- [guide-life-release-interactive-flow.md](./guide-life-release-interactive-flow.md) — UX wizard flow
