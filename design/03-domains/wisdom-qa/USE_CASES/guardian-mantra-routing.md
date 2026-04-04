# Định Tuyến Thần Chú Hộ Pháp & Phân Tầng Tuổi — Guardian Mantra Routing & Age-Based Routing

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Hướng dẫn sử dụng thần chú nâng cao
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Định nghĩa 2 routing rules cho thần chú đặc biệt:

1. **Guan Yin Ling Gan Zhen Yan Hard Block** — chặn sử dụng thần chú Quán Âm Linh Cảm Chân Ngôn nếu user chưa có Totem Reading từ Thầy Lư.
2. **Gong De Bao Shan Shen Zhou Age Routing** — tự động gợi ý thần chú Công Đức Bảo Sơn Thần Chú cho trẻ sơ sinh và thai nhi.

---

## Owner module

`wisdom-qa` — recommendation engine, mantra guidance.

---

## Actors

- `member` — truy cập hướng dẫn thần chú
- `admin` — xem audit log
- `system` — routing logic, block enforcement

---

## Part 1: Guan Yin Ling Gan Zhen Yan Hard Block

### Business rule

**Quán Âm Linh Cảm Chân Ngôn** (Guan Yin Ling Gan Zhen Yan) là thần chú cấp cao chỉ dành cho người đã có **Totem Reading** (bản đọc totem 12 con giáp) từ Thầy Lư hoặc hệ thống được Thầy ủy quyền. Sử dụng sai có thể phản tác dụng.

### Flag check

```typescript
interface UserMantrasContext {
  userId:                string
  hasMasterLuTotemReading: boolean   // từ identity/TotemProfile
}

function canAccessGuanYinLingGan(ctx: UserMantrasContext): AccessResult {
  if (!ctx.hasMasterLuTotemReading) {
    return {
      allowed: false,
      reason: "Quán Âm Linh Cảm Chân Ngôn chỉ dành cho người đã có bản đọc Totem từ Thầy Lư. "
            + "Vui lòng hoàn thành hồ sơ Totem của bạn trước.",
      action: "REDIRECT_TO_TOTEM_PROFILE"
    }
  }
  return { allowed: true }
}
```

### FE Behavior

Khi user tìm kiếm hoặc navigate đến trang Quán Âm Linh Cảm Chân Ngôn:

1. Hệ thống check `hasMasterLuTotemReading` từ user profile.
2. Nếu `false` → hiển thị **HARD BLOCK** overlay:

```
🔒 Nội dung bị khóa

Quán Âm Linh Cảm Chân Ngôn là thần chú cấp cao
chỉ dành cho người đã có bản đọc Totem từ Thầy Lư.

Để mở khóa, vui lòng:
1. Hoàn thiện hồ sơ Totem (năm sinh, con giáp, giới tính)
2. Liên hệ hệ thống để nhận bản đọc Totem

[Đến trang Hồ Sơ Totem]  [Tìm hiểu thêm]
```

3. Nếu `true` → cho phép truy cập bình thường.

### API gate

```
GET /api/wisdom/mantras/guan-yin-ling-gan
  → checkTotemReading(userId)
  → 403 Forbidden nếu chưa có totem reading
  → 200 OK với nội dung nếu đã có
```

---

## Part 2: Gong De Bao Shan Shen Zhou Age Routing

### Business rule

**Công Đức Bảo Sơn Thần Chú** (Gong De Bao Shan Shen Zhou) đặc biệt hiệu quả cho:
- Trẻ sơ sinh và trẻ nhỏ dưới 5 tuổi — chưa đủ trưởng thành để tự niệm kinh.
- Thai nhi (UNBORN) — mẹ niệm thay để hồi hướng công đức.

Hệ thống **tự động gợi ý** thần chú này khi user đang tạo recitation plan cho đối tượng thuộc 2 nhóm trên.

### Age Routing Logic

```typescript
type RecitationTarget = {
  targetType:  "SELF" | "OTHER_PERSON" | "UNBORN"
  targetAge?:  number   // tuổi dương lịch, undefined nếu UNBORN
}

function suggestMantras(target: RecitationTarget): MantraSuggestion[] {
  const suggestions: MantraSuggestion[] = []

  if (target.targetType === "UNBORN") {
    suggestions.push({
      mantraId: "GONG_DE_BAO_SHAN",
      priority: "PRIMARY",
      reason:   "Thai nhi chưa thể tự niệm kinh — mẹ niệm Công Đức Bảo Sơn Thần Chú hồi hướng.",
    })
  }

  if (target.targetAge !== undefined && target.targetAge < 5) {
    suggestions.push({
      mantraId: "GONG_DE_BAO_SHAN",
      priority: "PRIMARY",
      reason:   `Trẻ ${target.targetAge} tuổi chưa đủ trưởng thành để tự trì chú. `
              + "Người thân niệm Công Đức Bảo Sơn Thần Chú hồi hướng sẽ hiệu quả hơn.",
    })
  }

  return suggestions
}
```

### FE Behavior — Daily Recitation Plan

Khi user tạo plan cho người khác và chọn tuổi dưới 5 hoặc UNBORN:

```
💡 Gợi ý tự động

Với [thai nhi / trẻ dưới 5 tuổi], Pháp Môn khuyên nên niệm:

📿 Công Đức Bảo Sơn Thần Chú
"Nam Mô Công Đức Bảo Sơn Thần Chú..."

Lý do: Trẻ nhỏ và thai nhi chưa thể tự trì chú.
        Người thân niệm thay và hồi hướng sẽ mang lại phước báo cho con.

[+ Thêm vào kế hoạch niệm kinh]  [Bỏ qua]
```

### Mantra Data (hardcoded for routing logic)

```typescript
export const MANTRA_ROUTING_RULES = {
  GONG_DE_BAO_SHAN: {
    id:          "GONG_DE_BAO_SHAN",
    displayName: "Công Đức Bảo Sơn Thần Chú",
    triggers:    ["AGE_UNDER_5", "UNBORN"],
    accessLevel: "PUBLIC",   // không cần totem reading
  },
  GUAN_YIN_LING_GAN: {
    id:          "GUAN_YIN_LING_GAN",
    displayName: "Quán Âm Linh Cảm Chân Ngôn",
    triggers:    [],         // không tự gợi ý — chỉ khi user chủ động tìm
    accessLevel: "TOTEM_REQUIRED",
  },
} as const
```

---

## Errors

| Condition | Error code | HTTP | Recovery |
|---|---|---|---|
| Chưa có totem reading | `totem_reading_required` | 403 | Hoàn thiện hồ sơ Totem |
| Chưa đăng nhập | `unauthorized` | 401 | — |

---

## Audit

| Action | Trigger |
|---|---|
| `wisdom.mantra.access-blocked.totem-required` | User bị chặn vì thiếu totem |
| `wisdom.mantra.gong-de-auto-suggested` | Hệ thống gợi ý Công Đức Bảo Sơn |
| `wisdom.mantra.gong-de-accepted` | User chấp nhận gợi ý |

---

## Notes for AI/codegen

- `hasMasterLuTotemReading` là derived field từ `identity/TotemProfile` — cần join hoặc denormalize vào user session context.
- `GONG_DE_BAO_SHAN` auto-suggest là **non-blocking** — user có thể dismiss.
- `GUAN_YIN_LING_GAN` block là **hard block** — không có bypass dù user là admin (chỉ super-admin có thể override với audit reason).
- Age routing check nên chạy client-side để UX nhanh, nhưng access gate phải enforce server-side.
- Routing rules là **hardcoded constant** — không phải CMS config. Admin không được thay đổi điều kiện trigger.
