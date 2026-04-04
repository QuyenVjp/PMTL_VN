# Ràng Buộc Vị Trí Xếp Chồng Kinh Sách Vật Lý — Sutra Physical Z-Index Rule

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Luật Kính Sách Pháp Bảo
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Kinh Phật là Pháp bảo, là vô giá báu vật của Phật Pháp. Khi in file PDF Kinh Văn từ App ra giấy, **tuyệt đối không được để các loại sách báo thế tục khác (tạp chí, báo, truyện tranh, sách học) đè lên trên cuốn Kinh**. Kinh sách phải luôn nằm ở vị trí cao nhất (物理层级), tương trưng cho sự tôn kính. Nếu vi phạm, người tu sẽ tạo vô minh và khí âm bao phủ Kinh sách.

Hệ thống cần chặn luồng download PDF nếu user không cam kết sẽ tuân thủ quy tắc này.

---

## Owner module

`content` — EReaderService / PDFExportService
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — Người dùng tải xuống PDF Kinh Văn để in ra giấy
- `system` — Chặn download nếu user không xác nhận cam kết

---

## Trigger

User bấm nút `[Tải xuống PDF]` hoặc `[In]` trên bất kỳ cuốn Kinh nào trong E-reader module.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User bấm [Tải xuống PDF] | ⚠️ Show download gate modal |
| Modal hiển thị checkbox xác nhận | ✅ Require explicit check |
| User check: "Tôi cam kết khi in ra giấy, luôn đặt Kinh sách ở lớp trên cùng..." | ✅ Enable download button |
| User không check | ❌ Download button remains DISABLED |
| User bấm [Tải xuống] sau khi check | ✅ Proceed with PDF generation + download |
| User dismiss modal → không check | ❌ Download flow aborted |

---

## Input Contract

```typescript
// PDF Download Request
interface PDFDownloadRequest {
  userId: string;
  sutraId: string;           // ID của kinh văn
  format: "PDF" | "TXT";
  acknowledgeSutraHierarchy?: boolean;  // User must check this
}

// Download Gate Response
interface DownloadGateResponse {
  gateRequired: boolean;
  message: string;
  checkboxLabel: string;
  confirmationRequired: boolean;
}
```

---

## Write Path

```
POST /api/content/ereader/{sutraId}/download-pdf

1. Load sutra metadata (title, pages, size)
2. Check if sutra is "SACRED_SCRIPTURE" category
3. If yes:
     → Return DownloadGateResponse { gateRequired: true }
     → FE shows modal with checkbox
4. Wait for user interaction:
     a. If user checks checkbox AND clicks [Tải xuống]:
        - Validate payload.acknowledgeSutraHierarchy === true
        - If false → return 400 { error: "sutra_hierarchy_not_acknowledged" }
        - Generate PDF file
        - Log audit event: "pdf.download_with_gate_accepted"
        - Return download stream
     b. If user dismisses modal:
        - Log audit event: "pdf.download_gate_dismissed"
        - Return 200 { cancelled: true }
5. On successful download:
     - Record to UserPDFDownloadLog
     - Update contentMetrics (for analytics)
```

---

## FE Behavior

```
USER CLICKS [Tải xuống PDF]

⬇️ Gate Modal appears ⬇️

┌────────────────────────────────────────────┐
│  📖 Tải Xuống Kinh Văn                    │
├────────────────────────────────────────────┤
│                                            │
│  Khi in Kinh Văn ra giấy, bạn PHẢI      │
│  tuân thủ quy tắc:                       │
│                                            │
│  ⚠️  TUYỆT ĐỐI KHÔNG đặt kinh sách ở    │
│      dưới các loại tạp chí, báo, hay     │
│      sách thế tục khác.                  │
│                                            │
│  📏  Kinh sách phải luôn ở LỚPTOP      │
│      cùng (vị trí cao nhất) để tôn      │
│      kính Pháp bảo.                      │
│                                            │
│  ☐ Tôi cam kết khi in ra giấy, luôn    │
│    đặt Kinh sách ở lớp trên cùng.       │
│    TUYỆT ĐỐI KHÔNG để tạp chí, báo,    │
│    hay sách thế tục đè lên Pháp bảo.    │
│                                            │
│  [Huỷ]  [Tải xuống]  (disabled)         │
└────────────────────────────────────────────┘

⬇️ User checks checkbox ⬇️

[Tải xuống] becomes ENABLED ✅

⬇️ User clicks [Tải xuống] ⬇️

Download starts + modal closes
```

---

## Schema Notes

```prisma
// Extend Content/Sutra model if needed
model Sutra {
  // ... existing fields ...
  isSacredScripture  Boolean @default(true)
  requiresDownloadGate Boolean @default(true)
  // Migration: ALTER TABLE "Sutra" ADD COLUMN "requiresDownloadGate" BOOLEAN DEFAULT true

  // ... relations ...
}

// Optional: Track download acknowledgments for analytics
model UserPDFDownloadLog {
  id              String @id @default(cuid())
  userId          String
  sutraId         String
  acknowledged    Boolean @default(false)
  downloadedAt    DateTime @default(now())

  user            User @relation(fields: [userId], references: [id], onDelete: Cascade)
  sutra           Sutra @relation(fields: [sutraId], references: [id], onDelete: Cascade)

  @@index([userId, sutraId])
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `pdf.download_gate_shown` | User bấm [Tải xuống] |
| `pdf.download_gate_accepted` | User check + download success |
| `pdf.download_gate_dismissed` | User close modal mà không check |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Gate not acknowledged | sutra_hierarchy_not_acknowledged | 400 |
| Missing sutra ID | sutra_not_found | 404 |
| PDF generation failed | pdf_generation_error | 500 |

---

## Notes for AI/codegen

- Gate là hard blocker (user PHẢI check trước khi download).
- Chỉ áp dụng cho category "SACRED_SCRIPTURE", không áp dụng cho sách không phải kinh (bài viết, hướng dẫn, v.v.).
- Có thể mở rộng: Thêm checkbox khác cho các quy tắc khác (e.g., "Không để ở nơi không sạch").
- PDF metadata nên include disclaimer: "Kinh sách phải được cất giữ trên cao, tôn trọng."
- Tương lai: Integrate với print service để auto-insert disclaimer header vào PDF.

---

## Related

- [bhff-reading-merit-transfer-engine.md](./bhff-reading-merit-transfer-engine.md) — Merit transfer from reading
