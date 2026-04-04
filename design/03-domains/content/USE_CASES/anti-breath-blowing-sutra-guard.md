# Cấm Thổi Bụi Miệng Lên Pháp Bảo — Anti-Breath Blowing Sutra Guard

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 23, 24)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Dùng miệng thổi bụi lên sách Kinh hoặc bàn thờ là hành vi phạm kính nghiêm trọng. Trước khi user lần đầu tiên tải xuống hoặc lưu bất kỳ Kinh văn PDF nào, hệ thống yêu cầu cam kết một lần duy nhất trong vòng đời tài khoản. Sau khi đã cam kết, không hiển thị lại popup.

---

## Owner module

`content` — SutraAssetService / PdfDownloadGuard
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — yêu cầu tải xuống / lưu Kinh văn PDF
- `system` — kiểm tra `sutraCleaningPledgeAt`, hiển thị popup cam kết nếu chưa có, chặn download nếu từ chối

---

## Trigger

Khi user bấm nút tải xuống hoặc lưu bất kỳ Kinh văn PDF nào (lần đầu tiên trong tài khoản).

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| `sutraCleaningPledgeAt IS NULL` | ✅ Hiển thị popup cam kết trước khi cho phép download |
| `pledgeAccepted = false` | ❌ 400 `sutra_care_pledge_required` — không tải xuống được |
| `pledgeAccepted = true` | ✅ Lưu `sutraCleaningPledgeAt = now()`, cho phép download tiến hành |
| `sutraCleaningPledgeAt IS NOT NULL` | ✅ Bỏ qua popup, download trực tiếp |
| User đóng popup mà không tick | ❌ Download bị hủy — phải mở lại và cam kết |

Cam kết chỉ hiển thị **MỘT LẦN** trong suốt vòng đời tài khoản — không nhắc lại ở các lần tải sau.

---

## Input Contract

```typescript
interface AcknowledgeSutraCarePledgeDto {
  pledgeAccepted: boolean
}

interface SutraDownloadRequestDto {
  sutraAssetId: string
  format?: 'PDF' | 'EPUB'
}

interface SutraDownloadResponse {
  downloadUrl: string
  pledgeRequired: false
  pledgedAt: string   // ISO 8601 datetime
}

interface SutraDownloadPledgeRequiredResponse {
  pledgeRequired: true
  pledgeText: string  // nội dung cam kết để hiển thị trong popup
}
```

---

## Write Path

```
GET /api/content/sutra-assets/:assetId/download
1. Validate assetId exists
2. Validate user authenticated
3. Check user.sutraCleaningPledgeAt:
   → IS NOT NULL: proceed to step 5
   → IS NULL:     return 200 { pledgeRequired: true, pledgeText: "..." }

POST /api/content/sutra-assets/acknowledge-care-pledge
1. Validate pledgeAccepted
2. If pledgeAccepted = false:
   → Throw 400 sutra_care_pledge_required
3. Update UserProfile.sutraCleaningPledgeAt = now()
4. Audit: content.sutra-care-pledge.acknowledged
5. Return 200 { success: true, pledgedAt: now() }

[Step 5 — sau khi pledge confirmed:]
→ Generate signed download URL cho sutraAssetId
→ Return 200 { downloadUrl, pledgeRequired: false, pledgedAt }
```

---

## FE Behavior

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [Tải Xuống Kinh Văn PDF]  ← user bấm nút
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Lần đầu tiên → hiện modal cam kết:

  ┌───────────────────────────────────────────┐
  │  📿 CAM KẾT CUNG KÍNH PHÁP BẢO           │
  │  ─────────────────────────────────────── │
  │                                           │
  │  Trước khi tải Kinh văn về máy,          │
  │  quý vị cần xác nhận cam kết sau:        │
  │                                           │
  │  ┌─────────────────────────────────────┐  │
  │  │                                     │  │
  │  │  Khi vệ sinh sách Kinh hoặc bàn    │  │
  │  │  thờ, TUYỆT ĐỐI KHÔNG dùng miệng  │  │
  │  │  để thổi bụi.                       │  │
  │  │                                     │  │
  │  │  Thay vào đó, hãy dùng:            │  │
  │  │   • Khăn sạch chuyên dụng để lau   │  │
  │  │   • Cọ/chổi nhỏ mềm sạch           │  │
  │  │                                     │  │
  │  │  Lý do: Hơi thở từ miệng chứa     │  │
  │  │  trọc khí, phạm kính Pháp Bảo.    │  │
  │  │                                     │  │
  │  └─────────────────────────────────────┘  │
  │                                           │
  │  [ ] Tôi cam kết khi vệ sinh sách Kinh/  │  ← checkbox
  │      Bàn thờ, tuyệt đối KHÔNG dùng miệng │
  │      để thổi bụi, mà sẽ dùng khăn sạch  │
  │      chuyên dụng để lau.                  │
  │                                           │
  │  ─────────────────────────────────────── │
  │                                           │
  │  [Hủy]           [Xác Nhận & Tải Xuống]  │
  │                   ← disabled khi chưa tick│
  │                   ← enabled  khi đã tick  │
  └───────────────────────────────────────────┘

  Ghi chú:
  ⓘ Cam kết này chỉ hiển thị một lần duy nhất.
    Các lần tải tiếp theo sẽ không hỏi lại.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Từ lần tải thứ hai trở đi:
→ Popup KHÔNG hiện → download bắt đầu ngay

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nếu user đóng popup mà không tick:
  ┌───────────────────────────────────────────┐
  │ ⚠️  Tải xuống bị hủy                     │
  │  Vui lòng xác nhận cam kết để tải        │
  │  Kinh văn về máy.                         │
  └───────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Schema Notes

```prisma
model UserProfile {
  // ... existing fields ...
  sutraCleaningPledgeAt DateTime?  // null = chưa cam kết, có giá trị = đã cam kết
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `content.sutra-care-pledge.acknowledged` | User lần đầu xác nhận cam kết cung kính Pháp Bảo |

---

## Errors

| Điều kiện | Mã lỗi | HTTP | Phục hồi |
|---|---|---|---|
| `pledgeAccepted = false` | `sutra_care_pledge_required` | 400 | Tick checkbox xác nhận cam kết |
| `assetId` không tồn tại | `sutra_asset_not_found` | 404 | Kiểm tra lại ID tài nguyên |
| Chưa đăng nhập | `unauthorized` | 401 | — |

---

## Notes for AI/codegen

- `sutraCleaningPledgeAt` trên `UserProfile` là **single lifetime gate** — một khi đã set, không bao giờ reset (trừ admin override).
- Flow tải xuống là 2 bước nếu cần pledge: (1) check pledge → (2) nếu cần, show popup → confirm → sau đó mới phát URL.
- Không lưu `pledgeAccepted = false` vào database — chỉ lưu khi `= true` (lúc đó set timestamp).
- Áp dụng cho cả tải xuống trực tiếp lẫn "lưu vào thư viện" / offline reading requests.
- Yêu cầu sách Kinh vật lý (physical book request) cũng phải qua gate này nếu `sutraCleaningPledgeAt IS NULL`.

---

## Related

- [transit-wilderness-recitation-guard.md](./transit-wilderness-recitation-guard.md) — guard khi di chuyển
- [yin-time-anti-spoofing-guard.md](./yin-time-anti-spoofing-guard.md) — guard thời gian âm
- [hardware-posture-enforcer.md](./hardware-posture-enforcer.md) — enforce tư thế thiết bị
