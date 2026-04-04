# Hồ Sơ Totem & Yêu Cầu Trước Khi Gửi Phiếu Hỗ Trợ — Totem Profile & Support Ticket Prerequisites

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Quy trình hỗ trợ đồng tu
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Định nghĩa **Totem Profile** — hồ sơ con giáp của user — và enforce rằng user phải hoàn thiện hồ sơ này trước khi gửi phiếu hỗ trợ lên ban thư ký (secretariat support tickets). Totem Profile cũng là prerequisite cho một số nội dung cao cấp (VD: Quán Âm Linh Cảm Chân Ngôn).

---

## Owner module

`identity` — [xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — hoàn thiện hồ sơ Totem
- `admin` / `secretariat` — xem hồ sơ khi xử lý phiếu hỗ trợ

---

## Totem Profile Entity

```prisma
model TotemProfile {
  id                     String    @id @default(cuid())
  userId                 String    @unique

  // Required fields (bắt buộc trước khi gửi phiếu)
  birthYear              Int       // năm sinh dương lịch
  chineseZodiac          ChineseZodiacEnum
  gender                 Gender

  // Optional fields
  birthMonth?            Int       // tháng sinh (1–12)
  birthDay?              Int       // ngày sinh (1–31)
  phaapDanh?             String    // pháp danh nếu có
  totemReadingReceivedAt DateTime? // ngày nhận bản đọc từ Thầy Lư

  // Derived flag (computed, not stored)
  // hasMasterLuTotemReading = totemReadingReceivedAt IS NOT NULL

  createdAt              DateTime  @default(now())
  updatedAt              DateTime  @updatedAt
}

enum ChineseZodiacEnum {
  RAT       // Tý
  OX        // Sửu
  TIGER     // Dần
  RABBIT    // Mão
  DRAGON    // Thìn
  SNAKE     // Tỵ
  HORSE     // Ngọ
  GOAT      // Mùi
  MONKEY    // Thân
  ROOSTER   // Dậu
  DOG       // Tuất
  PIG       // Hợi
}

enum Gender {
  MALE
  FEMALE
  // Note: Pháp Môn sử dụng nhị nguyên giới tính cho mục đích nghi thức
}
```

---

## Chinese Zodiac Auto-Calculation

Năm sinh → con giáp có thể tự động tính, nhưng **cần xử lý biên âm lịch** (người sinh tháng 1–2 dương có thể thuộc năm âm lịch trước):

```typescript
function calculateChineseZodiac(birthYear: number, birthMonth: number, birthDay: number): ChineseZodiacEnum {
  // Approximate: Chinese New Year falls between Jan 21 – Feb 20
  // If born before CNY in that year, subtract 1 from zodiac year
  const CNY_APPROX_CUTOFF = { month: 2, day: 10 } // conservative fallback
  const lunarYearOffset = (birthMonth < CNY_APPROX_CUTOFF.month ||
    (birthMonth === CNY_APPROX_CUTOFF.month && birthDay < CNY_APPROX_CUTOFF.day)) ? -1 : 0
  const zodiacYear = birthYear + lunarYearOffset

  const ZODIAC_CYCLE = [
    "RAT","OX","TIGER","RABBIT","DRAGON","SNAKE",
    "HORSE","GOAT","MONKEY","ROOSTER","DOG","PIG"
  ]
  return ZODIAC_CYCLE[((zodiacYear - 1900) % 12 + 12) % 12] as ChineseZodiacEnum
}
```

FE hiển thị auto-calculated zodiac với note:
> *"Kết quả tính tự động — vui lòng xác nhận lại nếu bạn sinh vào tháng 1 hoặc đầu tháng 2."*

---

## Support Ticket Prerequisite Gate

### Trigger

User navigate đến "Gửi phiếu hỗ trợ ban thư ký" hoặc `POST /api/support/tickets`.

### Prerequisite check

```typescript
function checkTotemProfileComplete(user: UserWithTotem): PrerequisiteResult {
  const profile = user.totemProfile

  if (!profile) {
    return { complete: false, missing: ["totemProfile"], redirect: "/profile/totem" }
  }

  const missing: string[] = []
  if (!profile.birthYear) missing.push("birthYear")
  if (!profile.chineseZodiac) missing.push("chineseZodiac")
  if (!profile.gender) missing.push("gender")

  if (missing.length > 0) {
    return { complete: false, missing, redirect: "/profile/totem" }
  }

  return { complete: true }
}
```

### FE Behavior

Khi user cố gửi phiếu mà chưa có totem profile đầy đủ:

```
⚠️ Hoàn Thiện Hồ Sơ Trước

Để ban thư ký hỗ trợ bạn chính xác, vui lòng hoàn thiện
hồ sơ Totem (năm sinh, con giáp, giới tính) trước khi gửi phiếu.

[Hoàn thiện hồ sơ Totem →]
```

### API gate

```
POST /api/support/tickets
  → checkTotemProfileComplete(req.user)
  → 400 prerequisite_incomplete nếu thiếu
  → proceed nếu đầy đủ
```

---

## Update Profile Flow

### Input

```typescript
interface UpdateTotemProfileInput {
  birthYear:     number            // 1900–2026
  chineseZodiac: ChineseZodiacEnum // có thể override auto-calc
  gender:        "MALE" | "FEMALE"
  birthMonth?:   number
  birthDay?:     number
  phaapDanh?:    string
}
```

### Validation

```typescript
// birthYear validation
if (birthYear < 1900 || birthYear > new Date().getFullYear()) throw "invalid_birth_year"

// birthMonth optional but if provided must be valid
if (birthMonth && (birthMonth < 1 || birthMonth > 12)) throw "invalid_birth_month"

// Zodiac cross-validation (Phase 30 Logic 7)
// When birthYear + birthMonth + birthDay + chineseZodiac ALL provided:
// Cross-check that provided chineseZodiac matches calculated zodiac from birthYear
if (birthYear && birthMonth && birthDay && chineseZodiac) {
  const calculatedZodiac = calculateChineseZodiac(birthYear, birthMonth, birthDay)
  if (calculatedZodiac !== chineseZodiac) {
    // Không block cứng — return strong warning để user confirm
    return {
      warning: 'zodiac_birth_year_mismatch',
      calculatedZodiac,
      providedZodiac: chineseZodiac,
      message: `Con giáp bạn nhập (${chineseZodiac}) không khớp với năm sinh ${birthYear} (hệ thống tính: ${calculatedZodiac}). Vui lòng xác nhận lại — nếu bạn sinh vào tháng 1/2 dương, con giáp có thể thuộc năm âm lịch trước.`
    }
  }
}
```

**Lý do cần cross-validate:** Theo Pháp Môn Tâm Linh, con giáp phải chính xác để hệ thống tìm đúng hồ sơ trên thiên giới khi xem Đồ Đằng. Con giáp sai sẽ tra cứu nhầm đối tượng.

**FE Behavior khi mismatch:**

```
┌──────────────────────────────────────────────────────┐
│ ⚠️  Kiểm Tra Lại Con Giáp                             │
│──────────────────────────────────────────────────────│
│ Hệ thống tính: Năm 1985 → Con Trâu (Sửu)            │
│ Bạn nhập:      Con Chuột (Tý)                        │
│                                                      │
│ Hai kết quả không khớp. Nếu bạn sinh vào tháng 1    │
│ hoặc đầu tháng 2, bạn có thể thuộc năm âm lịch      │
│ trước (Năm Tý 1984 → Con Chuột).                    │
│                                                      │
│   [✅ Giữ Con Chuột (tôi biết chắc)]                 │
│   [Đổi sang Con Trâu (theo tính toán)]               │
└──────────────────────────────────────────────────────┘
```

Cả hai lựa chọn đều được chấp nhận — đây là **advisory warning**, không phải hard block.

### Write path

1. Upsert `TotemProfile` for `userId`.
2. If `birthYear` + `birthMonth` + `birthDay` provided → auto-calculate `chineseZodiac` and suggest to user (not override if user manually selected).
3. Audit: `identity.totem-profile.updated`.

---

## Errors

| Condition | Error code | HTTP | Recovery |
|---|---|---|---|
| Thiếu totem profile khi gửi phiếu | `prerequisite_incomplete` | 400 | Hoàn thiện hồ sơ |
| `birthYear` ngoài khoảng hợp lệ | `invalid_birth_year` | 422 | Nhập năm sinh đúng |
| Chưa đăng nhập | `unauthorized` | 401 | — |

---

## Audit

| Action | Trigger |
|---|---|
| `identity.totem-profile.created` | Tạo hồ sơ Totem lần đầu |
| `identity.totem-profile.updated` | Cập nhật hồ sơ |
| `identity.totem-profile.gate-blocked` | User bị chặn vì chưa có hồ sơ |
| `identity.totem-reading.received` | Ghi nhận ngày nhận bản đọc từ Thầy Lư |

---

## Notes for AI/codegen

- `hasMasterLuTotemReading` là **computed flag** từ `totemReadingReceivedAt IS NOT NULL` — không lưu riêng boolean field.
- Chinese zodiac auto-calc chỉ là **gợi ý** — user có thể override nếu biết chắc con giáp âm lịch của mình.
- `TotemProfile` là `@unique` per user — 1 user chỉ có 1 profile, dùng upsert không create.
- Support ticket gate check xảy ra ở cả FE (UX) và API (enforcement) — không chỉ client-side.
- Pháp danh (`phaapDanh`) là optional — không block nếu chưa có.
