# Khóa Hiệu Chuẩn Tỷ Lệ In NNN — Print Hardware Calibration Lock

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Kích thước vật lý tấm Ngôi Nhà Nhỏ phải chính xác **9.1cm × 13.95cm**. In sai tỷ lệ (Fit to Page, Scale...) biến tờ thiêng thành tờ giấy vô dụng. Hệ thống bắt buộc hiệu chỉnh thước kỹ thuật số bằng thẻ tín dụng thật **trước khi** cho tải PDF.

---

## Owner module

`engagement` — LittleHouseService / PrintValidator
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người cần tải PDF NNN để in
- `system` — hiển thị calibration UI, chặn tải nếu chưa cam kết

---

## Trigger

Khi user click `[Tải PDF NNN]`.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User click tải PDF | ✅ Hiển thị calibration UI trước |
| Calibration mode active | ✅ Hiển thị thước kỹ thuật số + hướng dẫn |
| User dùng thẻ ATM thật so sánh | ✅ Kiểm tra khớp 8.56cm (độ dài thẻ chuẩn) |
| Tỷ lệ khớp 100% | ✅ Enable PDF download |
| Tỷ lệ sai (Fit to Page...) | ❌ Block download, hiển thị hướng dẫn sửa |
| User xác nhận cam kết | ✅ Log calibration check + release PDF |

---

## Input Contract

```typescript
interface PrintCalibrationAcknowledgeDto {
  cardMeasurementConfirmed: boolean  // User đã đo thẻ
  printModeCommitted: boolean        // Cam kết "Actual Size / 100%"
}
```

---

## Write Path

```
POST /api/engagement/little-house/pdf/calibrate-and-download
1. Validate cardMeasurementConfirmed = true
2. Validate printModeCommitted = true
3. Create PrintCalibrationLog: userId, confirmedAt
4. Generate signed PDF download URL (expires = 15 minutes)
5. Return: { downloadUrl, expiresAt }
```

---

## FE Behavior

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🖨️  Kiểm tra Tỷ lệ In NNN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Lấy thẻ ATM/tín dụng thật, áp vào màn hình.
Chiều dài chuẩn thẻ: 8.56cm

Nếu thẻ khớp đoạn dưới → tỷ lệ đúng ✅:
━━━━━━━━━━━━━━
(8.56cm visual ruler)

Nếu ngắn/dài hơn → tỷ lệ SAI ❌

────────────────────────────────────

Kích thước NNN: 📏 9.1cm × 13.95cm (PHẢI CHÍNH XÁC)

[ ] Thẻ ATM của tôi khớp với thước trên
[ ] Khi in tôi sẽ chọn: "Actual Size" / "100%"
    (KHÔNG chọn "Fit to Page" / "Scale")
[ ] Khi cắt giấy tôi sẽ:
    ✅ Bảo lưu lề trắng xung quanh viền đen
    ❌ KHÔNG cắt vào viền đen
    (Viền đen 9.1×13.95cm ±5mm là ranh giới thiêng — cắt vào = phá vỡ)

[Quay Lại]    [Đã Hiểu, Tải PDF]  ← disabled until ALL THREE checked
```

---

## Schema Notes

```prisma
model PrintCalibrationLog {
  id          String   @id @default(cuid())
  userId      String
  confirmedAt DateTime @default(now())
  // Migration: CREATE TABLE "PrintCalibrationLog" (...)
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `nnn.pdf_download_requested` | User click tải |
| `nnn.calibration_mode_shown` | Ruler UI hiển thị |
| `nnn.scale_verified` | User confirm 100% |
| `nnn.commitment_acknowledged` | Cả 2 checkbox đã check |
| `nnn.pdf_released` | Download URL cấp phát |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| cardMeasurementConfirmed = false | `card_measurement_not_confirmed` | 400 |
| printModeCommitted = false | `print_mode_not_committed` | 400 |

---

## Related

- [manage-ngoi-nha-nho-sheet.md](./manage-ngoi-nha-nho-sheet.md) — NNN sheet management
- [little-house-burn-physical-checks.md](./little-house-burn-physical-checks.md) — physical checks khi đốt
