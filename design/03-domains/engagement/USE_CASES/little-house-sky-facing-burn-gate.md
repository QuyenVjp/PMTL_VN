# Cổng Xác Nhận Hướng Bầu Trời Khi Đốt NNN Không Bàn Thờ — Sky-Facing Burn Gate

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 316, 812)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Nếu không có bàn thờ mà phải đốt Ngôi Nhà Nhỏ (NNN) ở ban công, cửa sổ, hoặc sân sau nhà — trước khi đốt, người tu phải nâng NNN lên trán và **hướng mặt về phía có thể nhìn thấy Bầu Trời** để bái lạy 3 lần. Đây là cách thay thế hướng về bàn thờ khi không có bàn thờ tại chỗ — Bầu Trời là đại diện cho Thiên giới.

---

## Owner module

`engagement` — LittleHouse / BurnSession
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — đốt NNN tại địa điểm không có bàn thờ
- `system` — detect `hasHomeAltar = false`, inject sky-facing gate trước khi enable nút đốt

---

## Trigger

User bắt đầu flow **[Đốt NNN]** và `user.hasHomeAltar = false` (hoặc user chọn `[Đốt tại địa điểm khác — không có bàn thờ]`).

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| `hasHomeAltar = true` | Skip gate này — đốt tại bàn thờ bình thường |
| `hasHomeAltar = false` + `isFacingSkyDirection = true` | ✅ ALLOWED — tiếp tục đốt |
| `hasHomeAltar = false` + `isFacingSkyDirection` chưa confirm | ❌ BLOCKED — không enable nút đốt |
| Đốt trong phòng kín không thấy bầu trời | ⚠️ WARNING — nhưng không hard block |

---

## Input Contract

```
BurnLittleHouseNoAltarDto {
  sheetId:                  string
  isFacingSkyVisibleDirection: boolean   // BẮT BUỘC true nếu hasHomeAltar = false
  bowedThreeTimes:          boolean      // BẮT BUỘC true
}
```

---

## Write Path

```
POST /api/engagement/little-house-sheets/:id/burn-no-altar
────────────────────────────────────────────────────────────
1. Check user.hasHomeAltar (từ AltarProfile).
   - Nếu hasHomeAltar = true → redirect sang flow burn thông thường.

2. Validate isFacingSkyVisibleDirection = true.
   - Nếu false → HTTP 422:
     {
       error:   "sky_direction_required",
       message: "Khi không có bàn thờ, phải hướng mặt về phía nhìn thấy Bầu Trời và bái lạy 3 lần trước khi đốt NNN."
     }

3. Validate bowedThreeTimes = true.

4. Proceed với burn flow thông thường (snapshot offeredByName, set status = BURNED).
5. Audit: little-house.sheet.burned.no-altar
```

---

## FE Behavior

### Action Gate trước khi đốt (khi không có bàn thờ)

```
┌──────────────────────────────────────────────────────────┐
│  🌤️  Đốt NNN Không Có Bàn Thờ                          │
│                                                          │
│  Khi không có bàn thờ, Bầu Trời là đại diện           │
│  cho Thiên giới để tiếp nhận NNN của bạn.              │
│                                                          │
│  Trước khi đốt:                                        │
│  1. Nâng tờ NNN lên ngang trán                        │
│  2. Hướng mặt về phía CÓ THỂ NHÌN THẤY BẦU TRỜI      │
│     (ban công, cửa sổ, sân sau...)                    │
│  3. Bái lạy 3 lần thành tâm                          │
│                                                          │
│  [_] Tôi đang hướng mặt về phía nhìn thấy Bầu Trời.  │
│  [_] Tôi đã bái lạy 3 lần.                           │
│                                                          │
│  [Bắt Đầu Đốt]   ← enable khi đủ 2 checkbox           │
└──────────────────────────────────────────────────────────┘
```

---

## Schema Notes

Bổ sung vào `LittleHouseBurnSession` (model hiện có):

```prisma
model LittleHouseBurnSession {
  // ... existing fields ...
  hasHomeAltar                 Boolean  @default(true)
  isFacingSkyVisibleDirection  Boolean?  // null nếu hasHomeAltar = true
  bowedThreeTimes              Boolean?
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `little-house.sheet.burned.no-altar` | Đốt thành công khi không có bàn thờ |
| `little-house.sky-gate.rejected` | `isFacingSkyVisibleDirection = false` |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| `isFacingSkyVisibleDirection` = false | `sky_direction_required` | 422 |
| `bowedThreeTimes` = false | `bow_required` | 422 |
| Sheet không thuộc về user | `forbidden` | 403 |
| Chưa đăng nhập | `unauthorized` | 401 |

---

## Related

- [little-house-chanter-identity-lock.md](./little-house-chanter-identity-lock.md) — offeredByName lock
- [little-house-burn-physical-checks.md](./little-house-burn-physical-checks.md) — Pre/post burn checks (Phase 13)
- [name-change-temple-lodge-workflow.md](../../identity/USE_CASES/name-change-temple-lodge-workflow.md) — Đốt đơn tại Chùa khi không có bàn thờ
