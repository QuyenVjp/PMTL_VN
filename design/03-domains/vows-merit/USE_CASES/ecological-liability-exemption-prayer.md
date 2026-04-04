# Lời Khấn Miễn Trừ Trách Nhiệm Sinh Thái — Ecological Liability Exemption Prayer

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Thả sinh vật vào môi trường ô nhiễm hoặc không phù hợp có thể gây chết nhanh và tạo ra nghiệp xấu. User phải đọc lời khấn miễn trừ trách nhiệm sinh thái và xác nhận trước khi ghi nhận sự kiện phóng sinh là hợp lệ. Nếu môi trường có vấn đề, Bồ Tát và Hộ Pháp sẽ chịu thay vì hồi đầu về phía user.

---

## Owner module

`vows-merit` — LifeLiberationService / EcologyValidator
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — khởi tạo sự kiện phóng sinh
- `system` — hiển thị lời khấn, yêu cầu xác nhận trước khi ghi nhận

---

## Trigger

Khi user nhập chi tiết phóng sinh và chuẩn bị submit (bước cuối trước khi lưu sự kiện).

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User điền chi tiết phóng sinh | ✅ Hiển thị lời khấn sinh thái |
| Lời khấn hiển thị | ✅ Checkbox "Tôi đã đọc và cam kết" |
| Checkbox chưa checked | ❌ Nút [Ghi nhận đã thả] disabled |
| Checkbox checked | ✅ Nút [Ghi nhận đã thả] enabled |
| Submit successful | ✅ Log exemptionPrayerRecited = true |

---

## The Exemption Prayer

```
"Nếu việc phóng sinh này gây ra vấn đề ô nhiễm,
hoặc sinh vật không hợp môi trường sống dẫn đến chết mau,
xin Bồ Tát và Hộ Pháp tha thứ cho con.
Con xin chuyên chở toàn bộ ác nghiệp đó
để người thả thay con chịu hậu quả."
```

---

## Input Contract

```typescript
interface LifeReleaseSubmitDto {
  // ... other fields from log-life-release.md
  exemptionPrayerRecited: boolean  // must be true to submit
}
```

---

## Write Path

```
POST /api/vows-merit/life-release
1. Validate dto.exemptionPrayerRecited = true
2. If false:
   → return 400 { code: 'exemption_prayer_required' }
3. If true:
   → Persist LifeReleaseEvent with exemptionPrayerRecited = true
   → Audit: release.ecology_prayer_acknowledged
```

---

## FE Behavior

```
Phóng Sinh Tại Địa Điểm:

Địa điểm: [Sông Sài Gòn]
Loài vật: [Cá chép] x 100

─────────────────────────────────────

🧘 XÁC NHẬN TRÁCH NHIỆM SINH THÁI

Hãy đọc lời khấn:

"Nếu việc phóng sinh này gây ra vấn đề
ô nhiễm, hoặc sinh vật không hợp môi
trường dẫn đến chết mau, xin Bồ Tát
và Hộ Pháp tha thứ cho con..."

[ ] Tôi đã đọc và cam kết lời khấn này

─────────────────────────────────────

[Ghi nhận đã thả]
(disabled until checkbox checked)
```

---

## Audit

| Action | Trigger |
|---|---|
| `release.exemption_prayer_displayed` | Release submit triggered |
| `release.ecology_prayer_acknowledged` | Checkbox confirmed |
| `release.logged_with_exemption` | Event persisted |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Checkbox not checked on submit | `exemption_prayer_required` | 400 |

---

## Notes for AI/codegen

- Lời khấn phải hiển thị đầy đủ trên màn hình (không ẩn đằng sau scroll), user phải thấy toàn bộ trước khi check.
- `exemptionPrayerRecited` là required field server-side — không chỉ FE validation.

---

## Related

- [ecological-speech-to-text-guard.md](./ecological-speech-to-text-guard.md) — voice pledge recording (different mechanism)
- [log-life-release.md](./log-life-release.md) — base logging flow
- [anti-financial-attachment-regex.md](./anti-financial-attachment-regex.md) — notes field filter
