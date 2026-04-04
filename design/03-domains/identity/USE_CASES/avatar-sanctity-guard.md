# Avatar Sanctity Guard — Sacred Image Prohibition (Bảo Vệ Tôn Ảnh Hồ Sơ)

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Quy tắc sử dụng tôn ảnh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Ngăn chặn user sử dụng hình ảnh tôn ảnh (Buddha, Bodhisattva, Lư Đài Trưởng) làm avatar/ảnh hồ sơ cá nhân.
Theo khai thị pháp môn, tôn ảnh không nên được dùng như ảnh đại diện cá nhân để tránh mang tội bất kính.

Hệ thống sử dụng:
- **Hard block** (confidence > 70%): Từ chối upload ngay, require explicit waiver.
- **Soft warning** (confidence 40-70%): Advisory với confirm flow.
- **Image hashing**: So sánh hash ảnh tải lên với database các tôn ảnh nổi tiếng.

---

## Owner module

`identity` (primary) với integration `community`

Module chịu trách nhiệm:
- Validate avatar upload
- Manage sanctity waiver acceptance
- Maintain blessed-images registry

---

## Actors

- `member`: tải lên ảnh đại diện cá nhân
- `system`: kiểm tra nội dung ảnh theo AI model + image hash

---

## Trigger

User tải lên ảnh đại diện từ màn hình profile:

```
POST /api/identity/profile/upload-avatar
```

---

## Preconditions

- Có session hợp lệ
- File upload hợp lệ (image format, size < 5MB)
- Content-Type là `image/*`

---

## Input contract

```typescript
UploadAvatarDto {
  imageFile:              File          // multipart/form-data
  sanctityWaiverAccepted: boolean       // true = user xác nhận đọc hiểu warning
}
```

**Waiver text (Vietnamese):**
```
[x] Tôi cam kết hình ảnh tải lên KHÔNG PHẢI là tôn ảnh của chư Phật,
    Bồ Tát hay Lư Đài Trưởng để tránh mang tội bất kính.
```

---

## Read set

- session + actor (user identity)
- `UserProfile` record
- blessed-images database (tiền-tính hash của các tôn ảnh nổi tiếng)
- AI model weights (for sacred image detection)

---

## Write path — Multi-Gate Sanctity Validation

### Gate 1: File Validation

1. Load file upload từ request.
2. Verify format ∈ {jpg, jpeg, png, webp}. Nếu không → `400 invalid_image_format`.
3. Verify size ≤ 5MB. Nếu không → `400 image_too_large`.
4. Hash ảnh: compute SHA-256 hoặc perceptual hash.

### Gate 2: Blessed Images Registry Check (Hash Matching)

5. So sánh ảnh hash với database tôn ảnh nổi tiếng:
   - Buddha statues (commonly photographed)
   - Bodhisattva portraits (Avalokiteshvara, Manjushri, etc.)
   - Temple masters (nổi tiếng Lư Đài Trưởng)
6. Nếu **exact match hoặc very high similarity (> 95%)** → proceed to Gate 3 (hard block path).
7. Nếu không có match → proceed to Gate 3 (AI model path).

### Gate 3: AI Model Sacred Image Detection

8. Gọi AI vision model để detect sacred images:
   - Input: uploaded image
   - Output: `{ detected: boolean, confidence: float, className: string }`
   - Classes: `BUDDHA`, `BODHISATTVA`, `TEMPLE_MASTER`, `ALTAR_SHRINE`, `NOT_SACRED`
9. Classification confidence thresholds:
   - **> 70%**: Hard block. Yêu cầu explicit waiver.
   - **40-70%**: Soft warning. Require user confirmation.
   - **< 40%**: Allow upload (assume safe).

### Gate 4: Waiver & User Confirmation

10. **If confidence > 70% (HARD BLOCK):**
    - Kiểm tra `sanctityWaiverAccepted = true` trong request.
    - Nếu `false` → `400 avatar_contains_sacred_image` với message:
      ```
      "Hình ảnh này có vẻ là tôn ảnh của chư Phật/Bồ Tát/Lư Đài Trưởng.
       Theo khai thị pháp môn, tôn ảnh không nên dùng làm ảnh đại diện cá nhân.
       Vui lòng chọn ảnh khác."
      ```
    - Gợi ý: *"Nếu bạn chắc chắn hình ảnh này KHÔNG PHẢI là tôn ảnh, vui lòng tích vào checkbox dưới."*
    - Frontend render checkbox waiver text (như trên).
    - Nếu `true` → record `sanctityWaiverAcceptedAt = now()` và tiếp tục.

11. **If confidence 40-70% (SOFT WARNING):**
    - Hiển thị advisory dialog:
      ```
      "Không chắc chắn: Hình ảnh này có thể là tôn ảnh.
       Bạn có chắc muốn tiếp tục không?"
      ```
    - Frontend render 2 button: `[Hủy]` / `[Tiếp tục]`.
    - Nếu user click `[Tiếp tục]` → request gửi lại với flag `confirmLowConfidence = true`.
    - Nếu `true` → record `imageHashVerifiedAt = now()` và tiếp tục.

### Gate 5: Persist Avatar & Waiver Record

12. Upload file to blob storage (S3 / local):
    - Organize by userId: `/avatars/{userId}/{timestamp}-{random}.jpg`
    - Return signed URL (hoặc CDN URL)
13. Update `UserProfile`:
    ```sql
    UPDATE user_profiles
    SET avatarUrl = <url>,
        sanctityWaiverAcceptedAt = <timestamp if waiver>,
        imageHashVerifiedAt = <timestamp if verified>,
        updatedAt = now()
    WHERE userId = <actorUserId>
    ```
14. Append audit log.

---

## Async side-effects

- **Phase 1:** Avatar image processing là sync trong upload endpoint, không defer.
- **Phase 2+:** Nếu avatar changed → broadcast `community` integration để invalidate cached profile cards (outbox event `identity.profile.avatar-changed`).

---

## Success result

```typescript
{
  avatarUrl: string           // CDN URL or signed blob URL
  sanctityWaiverAccepted: boolean
  uploadedAt: ISO8601
}
```

User nhận xác nhận avatar đã cập nhật thành công.

---

## Errors

| Condition | Error code | HTTP | Message |
|---|---|---|---|
| File không phải image | `invalid_image_format` | 400 | Vui lòng tải lên ảnh JPG, PNG hoặc WebP |
| File quá lớn (> 5MB) | `image_too_large` | 400 | Ảnh phải nhỏ hơn 5MB |
| Confidence > 70%, waiver = false | `avatar_contains_sacred_image` | 400 | Hình ảnh này có vẻ là tôn ảnh. Vui lòng chọn ảnh khác. |
| Confidence 40-70%, không confirm | `sanctity_waiver_required` | 400 | Hình ảnh có thể là tôn ảnh. Vui lòng xác nhận hoặc chọn ảnh khác. |
| User không authenticated | `unauthorized` | 401 | Cần đăng nhập |
| Session không hợp lệ | `forbidden` | 403 | Session hết hạn |
| Blob storage fail | `upload_failed` | 500 | Lỗi hệ thống khi lưu ảnh |
| AI model timeout | `model_unavailable` | 503 | Dịch vụ kiểm tra ảnh tạm thời không khả dụng |

---

## Audit

| Action | Actor | Trigger |
|---|---|---|
| `identity.avatar.sanctity-waiver-required` | actorUserId | Confidence > 70%, user request waiver |
| `identity.avatar.sacred-image-rejected` | actorUserId | User từ chối upload sau warning |
| `identity.avatar.sanctity-confirmed` | actorUserId | User accept waiver, upload success |
| `identity.avatar.uploaded-successfully` | actorUserId | Avatar upload pass all gates |
| `identity.avatar.soft-warning-confirmed` | actorUserId | User confirm low-confidence upload |

---

## Rate-limit requirement

- Avatar upload: 5 request/hour per user (soft limit).
- Nếu exceed → `429 too_many_requests`.
- Reset hourly.

---

## Database Schema

### UserProfile extension

```sql
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS (
  avatarUrl VARCHAR(2048) NULL,
  sanctityWaiverAcceptedAt TIMESTAMP NULL,
  imageHashVerifiedAt TIMESTAMP NULL
);

CREATE INDEX idx_user_profile_avatar_waiver
  ON user_profiles(userId, sanctityWaiverAcceptedAt DESC);
```

### Blessed Images Registry

```sql
CREATE TABLE blessed_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imageHash VARCHAR(64) NOT NULL,          -- SHA-256 or perceptual hash
  imageCategory VARCHAR(50) NOT NULL,      -- 'BUDDHA', 'BODHISATTVA', 'TEMPLE_MASTER'
  displayName VARCHAR(255),                -- "Guanyin Statue at Potala Palace"
  sourceUrl VARCHAR(2048),
  confidence FLOAT DEFAULT 1.0,            -- expected match confidence
  createdAt TIMESTAMP DEFAULT now(),
  updatedAt TIMESTAMP DEFAULT now()
);

CREATE UNIQUE INDEX idx_blessed_images_hash ON blessed_images(imageHash);
CREATE INDEX idx_blessed_images_category ON blessed_images(imageCategory);
```

---

## Image Processing Pipeline

### Hashing Strategy

```
Input: File (image)

1. Read file buffer
2. Resize to standard dimension (224x224) for consistency
3. Compute perceptual hash (pHash or dHash for rotation/scale invariance)
4. Compute SHA-256 exact hash for database matching
5. Return { exactHash, perceptualHash }
```

### AI Model Detection

```
Input: image file

Model: Vision LLM or specialized CNN (e.g., YOLOv8 custom trained on sacred images)

Output JSON:
{
  detected: boolean,
  confidence: float (0.0 - 1.0),
  className: 'BUDDHA' | 'BODHISATTVA' | 'TEMPLE_MASTER' | 'ALTAR_SHRINE' | 'NOT_SACRED',
  boundingBoxes?: { x, y, width, height, class }[]
}

Fallback: Nếu model unavailable (timeout > 2s) → treat as confidence 0 (allow).
```

---

## Outbox event (Phase 2+)

- Event type: `identity.profile.avatar-changed`
- Payload: `{ userId, avatarUrl, sanctityWaiverAccepted }`
- Subscriber: `community` (invalidate cached profile cards)
- Ordering: causal (same userId, same order)

---

## Recovery path

- Nếu upload success nhưng blob persist fail → `500 upload_failed`, user retry sau.
- Nếu user dispute waiver decision → Admin review queue (manual override capability).
- Nếu AI model false positive cao → Retrain model, expand blessed-images dataset.

---

## DTO Definitions

```typescript
// Request
UploadAvatarDto {
  imageFile: File;              // multipart form-data
  sanctityWaiverAccepted: boolean;
  confirmLowConfidence?: boolean;  // for 40-70% case
}

// Response
AvatarUploadResultDto {
  avatarUrl: string;
  sanctityWaiverAccepted: boolean;
  uploadedAt: ISO8601;
}

// Internal: Sacred image detection result
SacredImageDetectionResult {
  detected: boolean;
  confidence: number;           // 0.0 - 1.0
  className: 'BUDDHA' | 'BODHISATTVA' | 'TEMPLE_MASTER' | 'ALTAR_SHRINE' | 'NOT_SACRED';
  hashMatch?: boolean;
  blessedImageId?: string;
}

// Internal: Image hash pair
ImageHashPair {
  exactHash: string;            // SHA-256
  perceptualHash: string;       // pHash for similarity
}
```

---

## Notes for AI/codegen

- **Blessed images database** nên được seed tại startup hoặc migration từ curated list các tôn ảnh nổi tiếng (available in reference docs).
- **AI model choice**: Sử dụng Vision LLM hoặc YOLOv8 fine-tuned trên sacred images dataset. Thời gian inference target < 2s.
- **Perceptual hash** (pHash) dùng để detect rotated/scaled version cùng tôn ảnh; exact hash (SHA-256) dùng để detect trùng hoàn toàn.
- **Waiver checkbox** phải render trên frontend, KHÔNG auto-accept. User phải tích manually.
- **Soft warning (40-70%)** sẽ có nhiều false positive → ensure UX là advisory, không quá invasive.
- **AI model fallback**: Nếu model timeout hoặc error → treat confidence = 0 (allow), log warning. KHÔNG block user.
- **Community integration**: Khi avatar changed, broadcast event để các profile card cache ở community feed được invalidate.
- `sanctityWaiverAcceptedAt` là proof user đã explicit nhận biết quy tắc, dùng trong audit trail.
- Avatar deletion: Khi user delete avatar, clear `avatarUrl`, reset `sanctityWaiverAcceptedAt` (lần tải lên tiếp theo phải waive lại).
