# Phân Loại Màu Mực Tổng Thể — Little House Physical Ink Color Segregation

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-05

## Purpose

When a practitioner uploads a Little House (NNN) photo for digital record-keeping, the system uses AI vision to validate that handwritten elements conform to strict ink color rules. Any violation immediately triggers a user-friendly error with precise Vietnamese guidance.

## Owner module

`engagement` — Little House (NNN) photo validation and metadata extraction

## Actors

- **Practitioner (user):** Uploads a Little House photo
- **AI Vision Service:** Detects ink colors in the image
- **Engagement API:** Enforces color segregation rules
- **Frontend:** Displays validation error and remediation guidance

## Trigger

1. User navigates to Little House photo upload form
2. User selects and submits a JPG/PNG photo of a completed Little House
3. Backend receives `POST /engagement/little-house/upload` with multipart image data
4. System queues AI vision analysis before persisting metadata

## Business Rules

| Rule | Condition | Result | Status |
|------|-----------|--------|--------|
| **Name/Date Ink** | Handwritten names or dates present | MUST be BLUE or BLACK ink only | ✅ |
| **Recitation Marks Ink** | Circles/dots marking each recitation present | MUST be RED ink ONLY | ✅ |
| **Mixed Violations** | Any handwritten text in RED; any mark in BLUE/BLACK | Return 422 Unprocessable Entity | ⚠️ |
| **Blank/Unclear Photo** | Image too dark, blurry, or no ink detected | Return 400 Bad Request with retry guidance | ✅ |
| **Multiple Instances** | Photo contains multiple Little Houses | Process first/largest instance only | ⚠️ |

## Input Contract (TypeScript DTOs)

```typescript
// Frontend → API
interface LittleHouseUploadRequest {
  imageFile: File; // multipart/form-data, JPEG or PNG
  metadata?: {
    uploadedAt: ISO8601Timestamp;
    userNote?: string; // optional practitioner comment
  };
}

// AI Vision Response
interface InkColorAnalysisResult {
  imageId: string;
  detectedInkColors: {
    names_and_dates: Array<{
      text: string;
      confidence: number; // 0–1
      colors: ('BLUE' | 'BLACK' | 'RED' | 'OTHER')[];
    }>;
    recitation_marks: Array<{
      position: { x: number; y: number };
      color: ('BLUE' | 'BLACK' | 'RED' | 'OTHER');
      confidence: number;
    }>;
  };
  validationResult: {
    isValid: boolean;
    violations: string[];
  };
}

// API Response (Success)
interface LittleHouseUploadResponse {
  success: true;
  littleHouseId: string;
  metadata: {
    uploadedAt: ISO8601Timestamp;
    photoUrl: string;
    inkValidation: {
      status: 'VALID' | 'INVALID';
      message: string;
    };
  };
}

// API Response (Validation Error)
interface LittleHouseUploadError {
  success: false;
  statusCode: 422;
  error: {
    code: 'INK_COLOR_VIOLATION';
    message: 'Tên người và ngày tháng bắt buộc phải viết bằng bút Xanh hoặc Đen! / Chấm tròn bắt buộc phải dùng bút lông màu Đỏ!';
    violations: Array<{
      type: 'NAME_DATE_WRONG_COLOR' | 'MARK_WRONG_COLOR';
      detail: string; // e.g., "Handwritten date detected in RED ink (confidence: 0.92)"
    }>;
    retryGuidance: 'Please check your Little House photo and ensure names/dates are in BLUE or BLACK, and all recitation marks are in RED.';
  };
}
```

## Write Path (pseudocode API)

```pseudocode
POST /engagement/little-house/upload

1. Validate image file:
   - Size <= 10 MB
   - Format in [JPEG, PNG]
   - Dimensions at least 400×400 px

2. Upload image to blob storage:
   - Generate unique imageId
   - Store with practitionerId reference

3. Queue AI vision job:
   - Pass imageId + image URL to vision service
   - Set timeout: 30 seconds
   - If timeout → return 408 with "Photo analysis in progress, retry in 10s"

4. Receive ink color analysis:
   - Parse detectedInkColors object
   - For each name/date: check if color in [BLUE, BLACK]
   - For each recitation mark: check if color == RED
   - Aggregate violations

5. Validation decision:
   if (violations.length > 0) {
     return 422({
       code: 'INK_COLOR_VIOLATION',
       message: 'Tên người và ngày tháng bắt buộc phải viết bằng bút Xanh hoặc Đen! / Chấm tròn bắt buộc phải dùng bút lông màu Đỏ!',
       violations: [...violations]
     })
   }

6. Persist metadata:
   - Create LittleHouseRecord in DB
   - Link photoUrl + validation metadata
   - Log audit event: LITTLE_HOUSE_UPLOADED

7. Return 200 success with littleHouseId
```

## FE Behavior (ASCII wireframe)

```
┌─────────────────────────────────────────┐
│ Upload Little House Photo               │
├─────────────────────────────────────────┤
│                                         │
│  [Drag photo here or click to browse]   │
│                                         │
│  File: my-little-house.jpg              │
│  Size: 2.3 MB ✓                         │
│  Format: JPEG ✓                         │
│                                         │
│  ⚠️  Analyzing ink colors...            │
│                                         │
└─────────────────────────────────────────┘

[After validation failure]

┌─────────────────────────────────────────┐
│ ❌ Ink Color Validation Failed          │
├─────────────────────────────────────────┤
│                                         │
│ Tên người và ngày tháng bắt buộc phải   │
│ viết bằng bút Xanh hoặc Đen!            │
│                                         │
│ Chấm tròn bắt buộc phải dùng bút lông   │
│ màu Đỏ!                                 │
│                                         │
│ Issues found:                           │
│ • Handwritten date in RED ink           │
│ • Recitation mark #3 in BLACK ink       │
│                                         │
│ [← Go Back] [⟳ Upload New Photo]        │
│                                         │
└─────────────────────────────────────────┘
```

## Schema Notes (Prisma snippet)

```prisma
model LittleHouseRecord {
  id                 String   @id @default(cuid())
  practitionerId     String
  practitioner       User     @relation(fields: [practitionerId], references: [id], onDelete: Cascade)

  photoUrl           String
  photoStorageKey    String   @unique

  inkValidation      InkValidation?

  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  @@index([practitionerId])
  @@index([createdAt])
}

model InkValidation {
  id                    String   @id @default(cuid())
  littleHouseRecordId   String   @unique
  littleHouseRecord     LittleHouseRecord @relation(fields: [littleHouseRecordId], references: [id], onDelete: Cascade)

  status                String   @db.Enum('VALID', 'INVALID', 'UNCHECKED')
  visionAnalysisId      String?
  detectedViolations    Json?    // Array<{ type: 'NAME_DATE_WRONG_COLOR' | 'MARK_WRONG_COLOR', detail: string }>

  checkedAt             DateTime?

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

## Audit

| Event | Logged Data | Sensitivity |
|-------|-------------|-------------|
| `LITTLE_HOUSE_UPLOADED` | photoId, practitionerId, uploadTimestamp, validationStatus | Internal |
| `INK_VALIDATION_FAILED` | photoId, violations (anonymized), retryCount | Internal |
| `INK_VALIDATION_PASSED` | photoId, littleHouseRecordId | Internal |
| `VISION_SERVICE_TIMEOUT` | photoId, timeoutMs | Debug |

## Errors

```typescript
// 400 Bad Request
{
  code: 'INVALID_IMAGE_FORMAT',
  message: 'Image must be JPEG or PNG, max 10 MB'
}

// 408 Request Timeout
{
  code: 'INK_ANALYSIS_TIMEOUT',
  message: 'Ink color analysis took too long. Please retry or contact support.'
}

// 422 Unprocessable Entity
{
  code: 'INK_COLOR_VIOLATION',
  message: 'Tên người và ngày tháng bắt buộc phải viết bằng bút Xanh hoặc Đen! / Chấm tròn bắt buộc phải dùng bút lông màu Đỏ!',
  violations: [
    {
      type: 'NAME_DATE_WRONG_COLOR',
      detail: 'Handwritten date detected in RED ink (confidence: 0.92)'
    },
    {
      type: 'MARK_WRONG_COLOR',
      detail: 'Recitation mark at position (x: 245, y: 310) detected in BLACK ink'
    }
  ]
}

// 500 Internal Server Error
{
  code: 'VISION_SERVICE_ERROR',
  message: 'Unable to analyze image at this time. Please try again later.'
}
```

## Notes for AI/codegen

- **Vision API integration:** Use Google Cloud Vision API or similar for color detection. Pre-prompt with ink color ontology to improve accuracy.
- **Confidence threshold:** Accept detections with confidence >= 0.85 to reduce false positives.
- **Caching:** Cache photo analysis results for 24 hours to avoid re-running vision on re-upload.
- **Fallback:** If vision service fails, return 408 and allow user to retry or manually confirm colors via checkbox.
- **Localization:** Error messages should be fully Vietnamese with proper diacritics. Provide English fallback for non-Vietnamese locales.
- **Progressive enhancement:** Show a preview with detected color zones highlighted before final validation.

## Related

- `little-house-recitation-tracking.md` — Tracks recitation progress tied to validated Little House photos
- `engagement-photo-metadata-extraction.md` — General photo upload and OCR for practitioner data
- `vision-service-integration.md` — Shared vision API integration details
