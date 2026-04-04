# Bảo Vệ Sinh Thái Bằng Giọng Nói — Ecological Speech-to-Text Guard

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Phóng sinh phải kèm lời khấn chấp nhận trách nhiệm sinh thái: nếu sinh vật được thả gây hại hệ sinh thái hoặc chết ngay sau khi thả, người thả chịu hoàn toàn nghiệp chướng đó. Hệ thống ghi âm lời khấn bằng giọng nói (Speech-to-Text) để xác nhận.

---

## Owner module

`vows-merit` — LifeLiberationService / EcologicalValidator
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người phóng sinh tại thực địa
- `system` — record giọng nói, transcribe, xác nhận trước khi log

---

## Trigger

Khi user điền thông tin phóng sinh và chuẩn bị bấm `[Ghi nhận đã thả]`.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User điền địa điểm + loài vật | ✅ Hiển thị ecological liability pledge |
| User bấm nút Microphone | ⏳ Record voice pledge |
| Pledge được ghi âm | ✅ Hiển thị transcript (Speech-to-Text) |
| User xác nhận transcript | ✅ Enable `[Ghi nhận đã thả]` |
| Chưa ghi âm hoặc chưa xác nhận | ❌ Button locked |

---

## Ecological Liability Pledge

```
"Nếu việc phóng sinh này gây ra vấn đề sinh thái,
hoặc vật nuôi không hợp môi trường sống dẫn đến chết mau,
xin Bồ Tát và Hộ Pháp tha thứ cho con và
chuyên chở nghiệp chướng để người thả thay con chịu."
```

---

## Input Contract

```typescript
interface EcologicalPledgeDto {
  releaseId: string
  voicePledgeTranscript?: string  // từ Speech-to-Text
  pledgeAcknowledged: boolean      // Phải = true
  pledgeMethod: 'VOICE' | 'TEXT'  // User chọn
}
```

---

## Write Path

```
POST /api/vows-merit/life-release/:releaseId/ecological-pledge
1. Validate pledgeAcknowledged = true
2. If pledgeMethod = VOICE: store transcript (nullable if STT fails)
3. Update LifeReleaseEntry: ecologicalPledgeDone = true
4. Audit: release.pledge_confirmed
5. Return: { releaseUnlocked: true }
```

---

## FE Behavior

```
On-Site Release (Phóng Sinh Thực Địa):

Địa điểm: [Sông Sài Gòn]
Loài vật: [Cá chép] × 100 con

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ XÁC NHẬN TRÁCH NHIỆM SINH THÁI

Hãy đọc lời khấn:

"Nếu việc phóng sinh này gây ra
vấn đề sinh thái..."

[🎤 Ghi Âm Lời Khấn]
 hoặc
[ ] Tôi xác nhận đã khấn (text mode)

─────────────────────────────────
Transcript: ✅ "Nếu việc phóng sinh này..."

[ ] Tôi xác nhận đã khấn lời trên

[Ghi nhận đã thả]  ← enabled sau khi xác nhận
```

---

## Schema Notes

```prisma
model LifeReleaseEntry {
  // ... existing fields ...
  ecologicalPledgeDone      Boolean  @default(false)
  ecologicalPledgeTranscript String?
  // Migration: ALTER TABLE "LifeReleaseEntry" ADD COLUMN "ecologicalPledgeDone" BOOLEAN
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `release.on_site_initiated` | User mở form thực địa |
| `release.pledge_required` | Ecological pledge prompt hiển thị |
| `release.voice_pledge_recorded` | Audio captured |
| `release.pledge_confirmed` | User xác nhận |
| `release.logged` | Phóng sinh được ghi nhận |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| pledgeAcknowledged = false | `ecological_pledge_required` | 400 |

---

## Related

- [log-life-release.md](./log-life-release.md) — logging flow
- [validate-proxy-ecological-life-release.md](./validate-proxy-ecological-life-release.md) — proxy ecological validation
