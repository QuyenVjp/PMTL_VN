# Lệnh Phát Hiện Thổi Miệng — Anti-Mouth-Blowing Detection Guard

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 921, 922)
> **Trạng thái:** Verified source — AI vision + audio analysis
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi thắp Đại Hương, sau khi châm gỗ vào đèn dầu cho cháy, người tu **TUYỆT ĐỐI KHÔNG ĐƯỢC dùng miệng thổi** để tắt lửa. Chỉ được **phẩy tay** để tắt lửa tạo khói. Thổi bằng miệng sẽ phá vỡ linh thiêng của nghi thức. Hệ thống dùng **camera vision + audio detection** để cảnh báo nếu phát hiện thành viên dùng miệng thổi.

---

## Owner module

`altar-management` — AltarService / MouthBlowingGuard
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — thực hiện nghi thức Đại Hương
- `system` — camera monitoring + audio analysis, real-time alert

---

## Trigger

Trong 60 giây trước khi user confirm "đã phẩy tay 3 lần" checkbox, camera chạy background

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Phát hiện chuyển động miệng ngả hướng downward+upward | ⚠️ Flash alert |
| Audio detect breath/blow sound (dB spike) | ⚠️ Flash alert |
| No blowing detected | ✅ Clean pass |
| User confirm checkbox despite alert | ⚠️ Log warning, allow |

---

## Input Contract

```typescript
interface MouthBlowingDetectionDto {
  sessionId: string
  cameraPermissionGranted: boolean
  audioPermissionGranted: boolean
}

interface DetectionResult {
  blowingDetected: boolean
  confidence: number      // 0-100
  alertMessage?: string
  allowContinue: boolean
}
```

---

## Write Path

```
--- During Grand Incense Ritual (60-second window) ---
1. FE requests camera permission (if not already granted)
2. Start WebRTC session for real-time vision + audio
3. Run detection in background (non-blocking):
   a. Vision: detect mouth region, track opening/closing velocity
   b. Audio: sample microphone, check for breath/blow frequency (2–8 kHz spike)
4. If blowing detected (confidence > 75%):
   → Push real-time alert toast
   → Log detection event
   → Do NOT block submission (allow user to confirm despite warning)
5. On checkbox confirm:
   → Send final detection report to backend
   → Audit: altar.dai-huong.mouth-blowing-alert (if triggered)

```

---

## FE Behavior

### Permission Request Modal

```
┌────────────────────────────────────────────────────────┐
│ 📹 Yêu Cầu Quyền Truy Cập Camera                      │
│────────────────────────────────────────────────────────│
│ Để đảm bảo nghi thức được thực hiện đúng cách,        │
│ hệ thống cần quyền truy cập camera để phát hiện       │
│ nếu bạn dùng miệng thổi (thay vì phẩy tay).           │
│                                                        │
│ Quyền sẽ chỉ được sử dụng lúc thắp Đại Hương         │
│ và sẽ tự động tắt sau 60 giây.                        │
│                                                        │
│      [Cấp Quyền]    [Bỏ Qua]                          │
└────────────────────────────────────────────────────────┘
```

### Real-Time Blowing Detection Alert

```
🔴 [CẢNH BÁO — Đốt Đại Hương]
Hệ thống phát hiện bạn dùng miệng thổi (thay vì phẩy tay).

Nghi thức đốt Đại Hương yêu cầu TUYỆT ĐỐI dùng TAY PHẨY
để tắt lửa, không được thổi bằng miệng.

Vui lòng lặp lại nghi thức đúng cách!

[Hiểu Rồi]
```

### Ritual Checklist with Background Detection

```
┌────────────────────────────────────────────────────────┐
│ 🙏 Nghi Thức Đốt Gỗ Đàn Hương                         │
│────────────────────────────────────────────────────────│
│                                                        │
│ BƯỚC 1: Thắp Đèn Dầu + Nhang                          │
│ [ ] Đã thắp đèn dầu và nhang thường                   │
│                                                        │
│ BƯỚC 2: Đốt Gỗ (Lặp 3 lần, Phẩy Tay — CẤMI Thổi)    │
│ [ ] Châm gỗ vào đèn dầu rồi PHẨY TAY cho tắt lửa     │
│     (KHÔNG thổi bằng miệng!)                         │
│     Lặp lại 3 lần ở Thích Ca, 3 lần ở Quán Âm       │
│                                                        │
│ 📹 Camera đang giám sát (tắt tự động sau 60 giây)    │
│                                                        │
│ [ ] Tôi xác nhận đã hoàn thành đúng nghi thức        │
│                                                        │
│      [Huỷ]  [Xác Nhận]                               │
│      (disabled)  (enabled when all ticked)            │
└────────────────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model MouthBlowingDetectionLog {
  id              String   @id @default(cuid())
  userId          String
  sessionId       String
  detected        Boolean
  confidence      Int      // 0-100
  audioSpikeFreq  Int?     // Detected frequency in Hz
  visionMotion    Float?   // Mouth velocity (pixels/sec)
  timestamp       DateTime @default(now())

  @@index([userId, detected])
  @@index([sessionId])
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `altar.dai-huong.camera_permission_granted` | User cấp quyền camera |
| `altar.dai-huong.mouth-blowing-detected` | Real-time detection trigger |
| `altar.dai-huong.mouth-blowing-alert` | User notified |
| `altar.dai-huong.ritual-confirmed-despite-alert` | User confirmed despite warning |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Camera permission denied | `camera_permission_denied` | 403 |
| Audio permission denied | `audio_permission_denied` | 403 |

---

## Notes for AI/codegen

### Vision Detection
- Use face-api.js or MediaPipe for face/mouth detection
- Track mouth-opening velocity (delta pixels per frame)
- Threshold: ~50+ pixels/frame change = potential blow
- Confidence weighted by multiple frames (need 3+ frames of consistent blow-like motion)

### Audio Detection
- Web Audio API: sample microphone at 16kHz
- FFT analysis for frequency domain
- Blow/breath frequencies: 2–8 kHz (higher than speech)
- dB spike threshold: +10dB above baseline ambient = blow detected
- Confidence weighted by frequency match + spike magnitude

### Privacy & UX
- Camera only active for 60 seconds (auto-disable)
- Alert is WARNING, not BLOCKING — user can proceed despite
- Audio stream NOT stored, processed in real-time memory only
- Permissions are session-scoped, not persistent
- Clear toast messaging about camera usage

### Phase 2+
- Integrate with wearable sensors (posture detector) for hand position confirmation
- ML model training on sandalwood-blowing audio samples for better accuracy
- Cross-validate: mouth detection + audio + hand position for multi-layer certainty

---

## Related

- [grand-incense-state-machine.md](./grand-incense-state-machine.md) — Main 6-step ritual
- [pressed-sandalwood-incense-alternative-procedure.md](./pressed-sandalwood-incense-alternative-procedure.md) — No camera needed (no blowing)
- [sandalwood-residue-storage-tracker.md](./sandalwood-residue-storage-tracker.md) — Wood inventory
