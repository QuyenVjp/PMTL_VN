# Thẻ Tên Người Bệnh Khi Phóng Sinh Thay — Proxy Name Card Generator

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi phóng sinh thay cho người bệnh, user **TUYỆT ĐỐI KHÔNG ĐƯỢC NHẮC TÊN MÌNH** — chỉ đọc tên người thụ hưởng. Nếu nhắc nhầm tên bản thân, công đức chạy ngược về user thay vì người bệnh. Hệ thống sinh ra **Name Card toàn màn hình** hiển thị tên người bệnh để user đọc đúng.

---

## Owner module

`vows-merit` — ProxyLifeService / NameCardEngine
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người thực hiện phóng sinh thay (proxy)
- `system` — generate Name Card, khóa tương tác app trong lúc phóng sinh

---

## Trigger

Khi user chọn chế độ `[Phóng Sinh Thay]` trong Life Liberation flow và xác nhận thông tin người thụ hưởng.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User chọn `[Phóng Sinh Thay]` | ✅ Load form thông tin người bệnh |
| Nhập tên + số lượng sinh vật | ✅ Generate Name Card full-screen |
| Name Card xuất hiện | ✅ Lock mọi tương tác khác |
| Name Card hiển thị màu vàng/đỏ nổi bật | ✅ Tên người bệnh in đậm, cỡ lớn |
| User đọc xong, bấm xác nhận | ✅ Mở khóa flow, log sự kiện |
| Bấm back / chuyển app | ❌ Cảnh báo: "Đang phóng sinh thay, không được rời màn hình" |

---

## Input Contract

```typescript
interface ProxyLifeReleaseDto {
  beneficiaryName: string   // Tên người bệnh — bắt buộc
  beneficiaryCondition: string // Mô tả bệnh/hoàn cảnh
  animalType: string        // Loại sinh vật
  animalCount: number       // Số lượng
  acknowledgedNameCard: boolean // Phải = true
}
```

---

## Write Path

```
POST /api/vows-merit/life-release/proxy
1. Validate beneficiaryName không trống
2. Validate acknowledgedNameCard = true (server-side)
3. Generate name card payload (stateless — không persist card)
4. Return: { nameCard: NameCardDto, releaseId: string }
5. On acknowledgment: POST /api/vows-merit/life-release/proxy/confirm
   → Create ProxyLifeReleaseEvent với beneficiary info
```

---

## FE Behavior

```
Full-screen Name Card (màu vàng nền, chữ đen):

═══════════════════════════════════════════
            🙏 PHÓNG SINH THAY 🙏
═══════════════════════════════════════════

Hôm nay [TÊN NGƯỜI BỆNH]
đã mua [SỐ LƯỢNG] con [LOẠI SINH VẬT]
để cầu bình an / trường thọ...

Xin Bồ Tát phù hộ cho [TÊN NGƯỜI BỆNH]
sớm bình phục, trường thọ.

═══════════════════════════════════════════

⚠️ CHỈ ĐƯỢC ĐỌC CHỮ TRÊN MÀN HÌNH NÀY ⚠️
CẤM NHẮC TÊN CỦA BẠN BẰNG MIỆNG!
Nếu không công đức sẽ chạy ngược về bạn.

[ ] Tôi đã đọc đúng tên người bệnh
[Đã Hiểu, Tiếp Tục Phóng Sinh]  ← disabled until checkbox
```

---

## Schema Notes

```prisma
model ProxyLifeReleaseEvent {
  id                  String   @id @default(cuid())
  userId              String   // Người thực hiện
  beneficiaryName     String   // Tên người thụ hưởng
  beneficiaryCondition String?
  animalType          String
  animalCount         Int
  acknowledgedAt      DateTime // Khi user confirm name card
  completedAt         DateTime?
  // ... existing fields ...
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `proxy_release.initiated` | User chọn chế độ phóng sinh thay |
| `name_card.generated` | Thông tin người bệnh xác nhận |
| `name_card.acknowledged` | User bấm xác nhận đã đọc |
| `proxy_release.completed` | Phóng sinh logged |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| beneficiaryName trống | `beneficiary_name_required` | 422 |
| acknowledgedNameCard = false | `name_card_not_acknowledged` | 400 |

---

## Related

- [birthday-longevity-life-release-trigger.md](./birthday-longevity-life-release-trigger.md) — trigger phóng sinh nhân sinh nhật
- [log-life-release.md](./log-life-release.md) — logging flow
- [validate-proxy-ecological-life-release.md](./validate-proxy-ecological-life-release.md) — ecological validation
