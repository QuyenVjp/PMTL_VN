# Trình Tự Phát Nguyện 6 Bồ Tát & 7 Lạy Kết Thúc — Six-Bodhisattva Vow Sequence

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Nghi thức phát nguyện chuẩn
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Enforce trình tự phát nguyện theo đúng 6 vị Bồ Tát, và buộc user thực hiện 7 lạy kết thúc trước khi vow được lưu vào hệ thống. Vi phạm trình tự = nguyện chưa thành lập.

---

## Owner module

`vows-merit` — [xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — phát nguyện
- `system` — enforce sequence + 7 bows

---

## The 6-Bodhisattva Sequence

Khi phát nguyện lớn (major vow), user phải tuyên đọc trước 6 vị Bồ Tát theo thứ tự:

```typescript
export const VOW_BODHISATTVA_SEQUENCE = [
  { order: 1, name: "Nam Mô Bổn Sư Thích Ca Mâu Ni Phật",       id: "SHAKYAMUNI" },
  { order: 2, name: "Nam Mô A Di Đà Phật",                        id: "AMITABHA" },
  { order: 3, name: "Nam Mô Đại Bi Quán Thế Âm Bồ Tát",         id: "GUAN_YIN" },
  { order: 4, name: "Nam Mô Đại Thế Chí Bồ Tát",                 id: "MAHASTHAMAPRAPTA" },
  { order: 5, name: "Nam Mô Địa Tạng Vương Bồ Tát",              id: "KSITIGARBHA" },
  { order: 6, name: "Nam Mô Hộ Pháp Vi Đà Tôn Thiên Bồ Tát",   id: "WEITUO" },
] as const
```

Thứ tự **bắt buộc** — không được hoán đổi.

---

## Vow Creation Flow (extension of create-vow.md)

### Phase 1: Vow Content Input

User nhập nội dung nguyện (giống create-vow.md hiện tại).

### Phase 2: Bodhisattva Attestation Stepper

Sau khi nhập nội dung, trước khi lưu, hệ thống hiển thị **6-step stepper**:

```
Bước 1/6: Nam Mô Bổn Sư Thích Ca Mâu Ni Phật
[Đã tuyên đọc ✓] → tiến sang bước 2

Bước 2/6: Nam Mô A Di Đà Phật
[Đã tuyên đọc ✓] → tiến sang bước 3

...

Bước 6/6: Nam Mô Hộ Pháp Vi Đà Tôn Thiên Bồ Tát
[Đã tuyên đọc ✓] → tiến sang bước 7
```

Mỗi nút **[Đã tuyên đọc]** chỉ active sau khi user dừng tối thiểu **3 giây** tại bước đó (anti-skip timer).

### Phase 3: 7 Closing Bows Enforcer

Sau khi hoàn thành 6 bước Bồ Tát, hiển thị **7-bow counter**:

```
╔══════════════════════════════════╗
║  7 Lạy Kết Thúc Phát Nguyện     ║
║                                  ║
║  Số lạy: [0] / 7                ║
║                                  ║
║  [+ 1 Lạy]                      ║
╚══════════════════════════════════╝

Nút [Hoàn thành phát nguyện] chỉ active sau đủ 7 lạy.
```

### Phase 4: Vow Saved

Chỉ sau khi hoàn thành Phase 2 + Phase 3:
```
POST /api/vows
{
  ...vowContent,
  bodhisattvaAttestationCompleted: true,
  closingBowsCompleted:            true,
  attestationSequence: ["SHAKYAMUNI","AMITABHA","GUAN_YIN","MAHASTHAMAPRAPTA","KSITIGARBHA","WEITUO"],
  closingBowCount: 7
}
```

---

## Input Contract

```typescript
interface CreateVowWithSequenceInput {
  // Fields from create-vow.md
  vowType:     string
  intention:   string
  targetDate?: Date

  // New enforcement fields
  bodhisattvaAttestationCompleted: boolean  // must be true
  attestationSequence: BodhisattvaId[]      // must match VOW_BODHISATTVA_SEQUENCE order
  closingBowsCompleted:            boolean  // must be true
  closingBowCount:                 number   // must be 7
}
```

---

## Validation

```typescript
function validateVowSequence(input: CreateVowWithSequenceInput): ValidationResult {
  const expected = VOW_BODHISATTVA_SEQUENCE.map(b => b.id)

  if (!input.bodhisattvaAttestationCompleted) {
    return { ok: false, error: "attestation_incomplete" }
  }

  for (let i = 0; i < expected.length; i++) {
    if (input.attestationSequence[i] !== expected[i]) {
      return { ok: false, error: "attestation_wrong_sequence",
        message: `Vị trí ${i+1} phải là ${expected[i]}, nhận được ${input.attestationSequence[i]}` }
    }
  }

  if (!input.closingBowsCompleted || input.closingBowCount !== 7) {
    return { ok: false, error: "closing_bows_incomplete",
      message: "Phải lạy đủ 7 lần trước khi hoàn thành phát nguyện." }
  }

  return { ok: true }
}
```

---

## Scope: Major Vows Only

Sequence enforcer áp dụng cho **major vows** — không bắt buộc cho micro-commitments (VD: nguyện ăn chay 1 ngày).

```typescript
const MAJOR_VOW_TYPES = [
  "VEGETARIAN_1_AND_15",
  "VEGETARIAN_FLEXIBLE_2_DAYS",
  "LIFE_RELEASE_COMMITMENT",
  "SUTRA_RECITATION_MONTHLY",
  "CUSTOM_MAJOR"
]

const requiresSequence = MAJOR_VOW_TYPES.includes(input.vowType)
```

---

## Errors

| Condition | Error code | HTTP | Recovery |
|---|---|---|---|
| Attestation chưa hoàn thành | `attestation_incomplete` | 400 | Hoàn thành 6 bước Bồ Tát |
| Sai thứ tự Bồ Tát | `attestation_wrong_sequence` | 422 | Tuyên đọc đúng thứ tự |
| Chưa đủ 7 lạy | `closing_bows_incomplete` | 400 | Lạy đủ 7 lần |
| Chưa đăng nhập | `unauthorized` | 401 | — |

---

## Audit

| Action | Trigger |
|---|---|
| `vows-merit.vow.attestation-completed` | Xong 6 bước Bồ Tát |
| `vows-merit.vow.closing-bows-completed` | Xong 7 lạy |
| `vows-merit.vow.created-with-sequence` | Vow lưu thành công sau đầy đủ nghi thức |

---

## Notes for AI/codegen

- `VOW_BODHISATTVA_SEQUENCE` là **hardcoded constant** — không phải CMS. Admin không được thay đổi thứ tự.
- Anti-skip timer 3s implement bằng `setTimeout` + `useState(canProceed)` — không phải backend gate.
- `closingBowCount` lưu vào `Vow` record để có thể hiển thị lại trong audit trail — không chỉ boolean.
- Major vow type check nên dùng Set lookup thay vì array `.includes()` cho performance.
- 7-bow counter KHÔNG có nút trừ/undo — chỉ cộng. Nếu user lạy nhầm, phải tạo vow mới.
