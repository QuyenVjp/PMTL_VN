# Chế Độ Đi Xa & Quy Tắc Chụp Ảnh Bàn Thờ — Travel Mode Altar Photo Rule

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Introduction to Guan Yin Citta
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi người tu đi công tác hoặc du lịch xa nhà, họ có thể chụp ảnh bàn thờ ở nhà và mang theo điện thoại để thắp **Tâm Hương** (thay thế bàn thờ thật).

Quy tắc cứng: **Bức ảnh bàn thờ mang theo PHẢI được chụp khi BÀN THỜ KHÔNG CÓ HƯƠNG ĐANG CHÁY.**

Lý do: Hương đang cháy trên bàn thờ thu hút sự hiện diện của thế giới tâm linh. Mang ảnh có hương cháy đi xa nhà sẽ kéo năng lượng đó ra khỏi bàn thờ và có thể gây rối loạn.

---

## Owner module

`vows-merit` — TravelMode / HeartIncenseSession
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — bật Travel Mode và upload/chụp ảnh bàn thờ
- `system` — hiển thị hard blocker warning trước khi cho phép upload

---

## Trigger

User bật **[Chế độ Đi Xa / Travel Mode]** và được hướng dẫn chụp ảnh bàn thờ.

---

## Business Rule

| Điều kiện ảnh | Allowed | Hành động |
|---|---|---|
| Chụp khi bàn thờ không có hương cháy | ✅ YES | Proceed |
| Chụp khi đang có hương cháy | ❌ NO | **Hard blocker** — user phải xác nhận đã tắt hương |

Hệ thống **không thể tự detect** hương đang cháy trong ảnh (không có CV/AI ở Phase 1).
Do đó: enforce bằng **mandatory self-declaration checkbox** trước khi cho phép upload.

---

## Write Path

```
POST /api/vows-merit/travel-mode/altar-photo
─────────────────────────────────────────────
Body: {
  photoBase64 | photoUrl,
  noIncenseBurningConfirmed: boolean   // BẮT BUỘC = true
}

1. Validate noIncenseBurningConfirmed === true.
   - Nếu false hoặc missing → throw 422 {
       error:   "incense_burning_photo_forbidden",
       message: "Ảnh bàn thờ mang theo phải được chụp khi KHÔNG CÓ hương đang cháy.",
       severity: "SPIRITUAL_BLOCK"
     }
2. Upload ảnh vào MediaAsset (private, user-scoped).
3. Gắn vào TravelModeProfile:
   {
     userId,
     altarPhotoId: mediaAsset.id,
     photoConfirmedNoIncense: true,
     photoUploadedAt: now()
   }
4. Audit: travel-mode.altar-photo.uploaded.
```

---

## FE Behavior

### Luồng Travel Mode Setup

```
Step 1: Bật Travel Mode
  → Giải thích: "Khi đi xa, bạn có thể dùng ảnh bàn thờ ở nhà để thắp Tâm Hương."

Step 2: Hướng dẫn chụp ảnh
  ┌──────────────────────────────────────────────────────────┐
  │  📸  Hướng Dẫn Chụp Ảnh Bàn Thờ                        │
  │                                                          │
  │  🚨 CẢNH BÁO TỐI CAO                                    │
  │                                                          │
  │  Bức ảnh mang theo BẮT BUỘC phải được chụp             │
  │  khi BÀN THỜ KHÔNG THẮP HƯƠNG.                         │
  │                                                          │
  │  Hãy chờ hương tàn hẳn, sau đó mới chụp.              │
  │                                                          │
  │  (Mang ảnh có hương đang cháy sẽ kéo năng              │
  │  lượng tâm linh ra khỏi nhà.)                          │
  │                                                          │
  │  [_] Tôi xác nhận bàn thờ KHÔNG có hương               │
  │      đang cháy tại thời điểm chụp ảnh này.             │
  │                                                          │
  │  [Chụp ảnh / Chọn ảnh từ thư viện]                     │
  │  ← disabled cho đến khi tích checkbox                   │
  └──────────────────────────────────────────────────────────┘

Step 3: Preview ảnh và xác nhận lần cuối
  → Hiện ảnh preview + reminder nhỏ: "Ảnh này sẽ được dùng để thắp Tâm Hương khi đi xa."
```

### Warning Style

- Banner cảnh báo màu **đỏ đậm** (`bg-red-600 text-white`), không phải vàng.
- Text "CẢNH BÁO TỐI CAO" in đậm, cỡ chữ lớn hơn bình thường.
- Checkbox bắt buộc tích trước — button disabled hoàn toàn.

### Khi dùng ảnh để thắp Tâm Hương (trong chuyến đi)

- Màn hình Tâm Hương hiển thị ảnh bàn thờ thay cho hình placeholder.
- Góc trên phải: badge `"Đang đi xa"`.
- Không cần re-confirm khi dùng — chỉ confirm 1 lần lúc upload.

---

## Schema Notes

```prisma
model TravelModeProfile {
  id                        String    @id @default(cuid())
  userId                    String    @unique
  isActive                  Boolean   @default(false)
  altarPhotoId              String?   // FK to MediaAsset
  photoConfirmedNoIncense   Boolean   @default(false)
  photoUploadedAt           DateTime?
  activatedAt               DateTime?
  deactivatedAt             DateTime?

  user                      User      @relation(fields: [userId], references: [id])
  altarPhoto                MediaAsset? @relation(fields: [altarPhotoId], references: [id])
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `travel-mode.activated` | User bật Travel Mode |
| `travel-mode.altar-photo.uploaded` | Ảnh được upload thành công |
| `travel-mode.altar-photo.rejected` | Confirm checkbox = false (FE block hoặc API reject) |
| `travel-mode.deactivated` | User tắt Travel Mode khi về nhà |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| `noIncenseBurningConfirmed = false` | `incense_burning_photo_forbidden` | 422 |
| File ảnh quá lớn (> 10MB) | `file_too_large` | 413 |
| Không phải ảnh (wrong MIME type) | `invalid_file_type` | 400 |
| Chưa đăng nhập | `unauthorized` | 401 |

---

## Notes for AI/codegen

- Ảnh bàn thờ là **private** — phải lưu với access control per-user, không public URL.
- Phase 2+: nếu có Camera API trên mobile, có thể add timestamp EXIF check để verify ảnh không phải ảnh cũ (chụp từ lần hương trước).
- `TravelModeProfile` là 1-1 với User (`@unique`) — mỗi user chỉ có một travel profile.
- Khi user deactivate Travel Mode (về nhà), không xóa ảnh — giữ để dùng lại lần sau.

---

## Related

- [heart-incense-diet-counter.md](./heart-incense-diet-counter.md) — Tâm Hương session flow
- [validate-altar-oil-and-water.md](./validate-altar-oil-and-water.md) — Altar offering rules
- [altar-profile-spatial-validation.md](./altar-profile-spatial-validation.md) — Altar spatial checks
