# Bảo Vệ Linh Hồn Khi Niệm Thay — Proxy Recitation Spirit Defense

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi user niệm Tiểu Phương Tử (Little House) **thay cho người khác** (đặc biệt người bệnh nặng), linh tính của người đó có thể "nhảy sang" người niệm nếu không có lời khấn bảo vệ. Hệ thống phải **bắt buộc** user đọc và xác nhận Lời Khấn Bảo Vệ trước khi được bắt đầu đếm.

---

## Owner module

`vows-merit` — [xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người đứng niệm thay (proxy reciter)
- `system` — enforce disclaimer, ghi log

---

## Trigger

User tạo hoặc bắt đầu một `LittleHouse` record với `isProxy = true`.

---

## Business Rule

| Điều kiện | Hành động bắt buộc |
|---|---|
| `isProxy = true` | Hiển thị Lời Khấn Bảo Vệ, yêu cầu xác nhận trước khi đếm số |
| `hasReadProxyDisclaimer = false` hoặc missing | API trả về `400 BadRequest` |
| `beneficiaryName` empty khi `isProxy = true` | API trả về `400 BadRequest` |

---

## Lời Khấn Bảo Vệ (Mandatory Proxy Defense Prayer)

> *"Nam mô Đại Từ Đại Bi Cứu Khổ Cứu Nạn Quán Thế Âm Bồ Tát.*
> *Con tên là [Tên người niệm], hôm nay con thay cho [Tên người bệnh/người được hồi hướng] niệm Tiểu Phương Tử.*
> *Xin Quán Thế Âm Bồ Tát bảo hộ cho con trong suốt quá trình niệm, không để bất kỳ oan gia trái chủ nào của [Tên người bệnh] xâm nhập vào thân tâm của con.*
> *Mọi oan gia trái chủ của [Tên người bệnh], xin hãy theo dõi và tìm [Tên người bệnh] để nhận phần hồi hướng này, không tìm con."*

- **Tên người niệm** và **Tên người bệnh** được điền tự động từ `actorUser.displayName` và `beneficiaryName`.
- User phải **đọc to hoặc trong đầu** rồi bấm **[Đã Khấn — Bắt đầu niệm]**.

---

## Input Contract

```
LittleHouseCreateDto {
  // ... existing fields ...
  isProxy:                  boolean
  beneficiaryName?:         string   // bắt buộc khi isProxy = true
  beneficiaryRelationship?: string   // quan hệ: "con", "cha", "vợ"...
  hasReadProxyDisclaimer?:  boolean  // bắt buộc true khi isProxy = true
}
```

---

## Write Path

```
POST /api/vows-merit/little-houses
────────────────────────────────────
1. Parse và validate Zod schema.
2. Nếu isProxy = true:
   a. Validate beneficiaryName: required, non-empty.
   b. Validate hasReadProxyDisclaimer === true.
      → Nếu false hoặc missing: throw 400 BadRequest {
          error: "proxy_disclaimer_required",
          message: "Phải đọc và xác nhận Lời Khấn Bảo Vệ trước khi niệm thay."
        }
3. Tạo LittleHouse record với:
   {
     isProxy: true,
     beneficiaryName,
     beneficiaryRelationship,
     proxyDisclaimerConfirmedAt: now()
   }
4. Audit: little-house.proxy.started.
```

---

## FE Behavior

### Khi user toggle `isProxy = true`:

1. Form hiện thêm field **[Tên người được hồi hướng]** (required).
2. **Trước khi** cho phép submit, hiện modal toàn màn hình:

```
┌─────────────────────────────────────────────────┐
│  ⚠️  LỜI KHẤN BẢO VỆ — Bắt buộc đọc trước     │
├─────────────────────────────────────────────────┤
│                                                 │
│  "Nam mô Đại Từ Đại Bi Cứu Khổ Cứu Nạn        │
│  Quán Thế Âm Bồ Tát.                          │
│                                                 │
│  Con tên là [Tên user], hôm nay con thay       │
│  cho [Tên người bệnh] niệm Tiểu Phương Tử.    │
│                                                 │
│  Xin Bồ Tát bảo hộ cho con, không để oan gia  │
│  trái chủ của [Tên người bệnh] xâm nhập..."   │
│                                                 │
│  [Đọc đầy đủ ↓]                                │
│                                                 │
│  [_] Tôi đã đọc và khấn xong lời bảo vệ này.  │
│                                                 │
│         [Đã Khấn — Bắt đầu niệm thay]         │
│         (disabled cho đến khi tích checkbox)   │
└─────────────────────────────────────────────────┘
```

3. User **không thể dismiss** modal bằng cách nhấn ra ngoài hoặc bấm X.
4. Modal có scroll — nút [Đã Khấn] chỉ hiện sau khi scroll đến cuối (Phase 2+).

### Trong suốt session niệm thay:

- Header của màn hình niệm hiển thị: `"Đang niệm thay cho: [Tên người bệnh]"`
- Màu header khác (VD: tím nhạt) để phân biệt với niệm cho bản thân.

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| `isProxy = true` nhưng `hasReadProxyDisclaimer` missing/false | `proxy_disclaimer_required` | 400 |
| `isProxy = true` nhưng `beneficiaryName` empty | `beneficiary_name_required` | 400 |
| Chưa đăng nhập | `unauthorized` | 401 |

---

## Audit

| Action | Trigger |
|---|---|
| `little-house.proxy.disclaimer.shown` | FE hiển thị modal |
| `little-house.proxy.disclaimer.confirmed` | User bấm [Đã Khấn] |
| `little-house.proxy.started` | Record được tạo thành công |

---

## Schema Notes for AI/codegen

```prisma
model LittleHouse {
  // ... existing fields ...
  isProxy                      Boolean   @default(false)
  beneficiaryName              String?
  beneficiaryRelationship      String?
  proxyDisclaimerConfirmedAt   DateTime?
}
```

- `proxyDisclaimerConfirmedAt` là bằng chứng audit rằng user đã xác nhận — không dùng boolean flag vì mất timestamp.
- Backend KHÔNG được tự động set `proxyDisclaimerConfirmedAt = now()` — phải nhận từ DTO để tránh bypass.
- FE phải enforce disclaimer ở client trước, backend là lớp bảo vệ thứ hai.

---

## Part B: Lời Khấn Chuyển Hướng Đặc Biệt Cho Người Bệnh Nặng

> **Nguồn bổ sung:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 317, 318, 794)

Khi niệm NNN **đặc biệt cho người đang bệnh nặng** (không chỉ hồi hướng thông thường), ngoài Lời Khấn Bảo Vệ ở trên, user cần đọc thêm câu chuyển hướng nợ để đảm bảo oan gia trái chủ đi đúng hướng:

> *"Bây giờ con niệm cho [Tên người bệnh] X tấm Ngôi Nhà Nhỏ. Phần còn lại xin oan gia trái chủ hãy tìm [Tên người bệnh] để đòi, xin đừng tìm con."*

### Trigger kích hoạt Part B

Khi user tạo proxy session với `beneficiaryHealthStatus = SERIOUSLY_ILL` hoặc user toggle flag `[Người này đang bệnh nặng]`.

### Input contract bổ sung

```typescript
interface LittleHouseCreateDto {
  // ... existing fields ...
  beneficiaryHealthStatus?: 'NORMAL' | 'SERIOUSLY_ILL'
  proxySafetyPledgeAccepted?: boolean  // bắt buộc true khi SERIOUSLY_ILL
}
```

### Business Rule bổ sung

| Điều kiện | Hành động |
|---|---|
| `beneficiaryHealthStatus = SERIOUSLY_ILL` | Hiển thị thêm Lời Khấn Chuyển Hướng (Part B) |
| `proxySafetyPledgeAccepted = false` khi SERIOUSLY_ILL | API trả về `400 BadRequest` |

### FE Behavior bổ sung

```
┌──────────────────────────────────────────────────────┐
│ ⚕️ Người Bệnh Nặng — Lời Khấn Chuyển Hướng Nợ       │
│──────────────────────────────────────────────────────│
│ "Bây giờ con niệm cho [TÊN NGƯỜI BỆNH] [X] tấm      │
│  Ngôi Nhà Nhỏ. Phần còn lại xin oan gia trái chủ    │
│  hãy tìm [TÊN NGƯỜI BỆNH] để đòi, xin đừng tìm     │
│  con."                                               │
│                                                      │
│ [x] Tôi đã đọc lời khấn chuyển hướng này            │
│                                                      │
│            [Xác Nhận — Bắt Đầu Niệm]                │
└──────────────────────────────────────────────────────┘
```

---

## Related

- [manage-ngoi-nha-nho-sheet.md](../../engagement/USE_CASES/manage-ngoi-nha-nho-sheet.md) — Core Little House flow
- [manage-little-house-reserved-proxy.md](../../engagement/USE_CASES/manage-little-house-reserved-proxy.md) — RESERVED status và proxy defense
- [ngu-dai-phap-bao-system.md](./ngu-dai-phap-bao-system.md) — Tiểu Phương Tử trong Ngũ Đại Pháp Bảo
