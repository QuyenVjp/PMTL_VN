# Bảo Vệ Sức Khỏe Âm Thanh Tâm Linh — Vocal Resonance Health Guard

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Đọc niệm kinh không phải là hoàn toàn thầm trong bụng, cũng không phải đọc to như diễn thuyết. Âm thanh tối ưu là **nhép miệng phát ra âm thanh nhỏ** (whisper, 30-50 dB) để duy trì lưu thông năng lượng khí huyết mà không làm tổn thương độ liêm trang.

Hệ thống phải:
- **Cảnh báo vàng** khi user đọc **hoàn toàn thầm** (0 dB) > 1 phút → nguy hiểm gây đình trệ lưu thông (Tổn Huyết).
- **Cảnh báo đỏ** khi user đọc **quá to** (> 60 dB) → tổn thương năng lượng (Tổn Khí).
- **Ghi nhận optimal** khi trong dải 30-50 dB (detected whisper).

Cảnh báo là **advisory only** — không chặn người dùng, chỉ nhắc nhở real-time.

---

## Owner module

`content` — VocalResonanceHealthGuard / AudioMonitoringService
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — đang đọc kinh sử dụng E-Reader
- `system` — Web Audio API monitor volume, display warnings

---

## Triggers

1. User bấm `[Bắt Đầu Đọc Kinh]` / `POST /api/content/sutras/start-session` với `enableAudioMonitoring: true`.
2. App continuously monitors microphone input volume (in decibels).
3. Thresholding logic triggers warnings when volume outside 30-50 dB range.

---

## Business Rules

| Volume Range | Status | Action | Icon | Color |
|---|---|---|---|---|
| **0 dB** (completely silent) for **> 1 min** | 🟡 Too Silent | Yellow border flash + warning | ⚠️ | amber/yellow |
| **1-29 dB** (mostly silent) | 🟡 Too Silent | Advisory warning | ⚠️ | amber |
| **30-50 dB** (whisper, optimal) | 🟢 Optimal | No warning, subtle feedback | ✅ | green |
| **51-60 dB** (normal speech, borderline) | 🟠 Slightly Loud | Light advisory | ⚠️ | orange |
| **> 60 dB** (loud reading) | 🔴 Too Loud | Red border flash + warning | 🚨 | red |

---

## Volume Monitoring Logic

### Decibel Thresholds

```typescript
const AUDIO_THRESHOLDS = {
  COMPLETELY_SILENT: 0,      // 0 dB
  SILENT_DURATION_MS: 60000,  // 1 minute
  OPTIMAL_MIN: 30,           // dB
  OPTIMAL_MAX: 50,           // dB
  TOO_LOUD: 60,              // dB
}

// Real-time volume calculation (Web Audio API)
function getAverageDecibels(analyser: AnalyserNode): number {
  const dataArray = new Uint8Array(analyser.frequencyBinCount)
  analyser.getByteFrequencyData(dataArray)

  const sum = dataArray.reduce((a, b) => a + b, 0)
  const average = sum / dataArray.length

  // Convert 0-255 range to 0-100 dB scale (approximate)
  return Math.round((average / 255) * 100)
}

// Track silent duration
let silentDurationMs = 0
let lastAudioLevelWarningTime = 0

function monitorVocalResonance(currentDb: number): void {
  if (currentDb === 0) {
    silentDurationMs += 100  // polling interval
    if (silentDurationMs > AUDIO_THRESHOLDS.SILENT_DURATION_MS) {
      triggerTooSilentWarning()
    }
  } else {
    silentDurationMs = 0  // reset on any sound
  }

  if (currentDb > AUDIO_THRESHOLDS.TOO_LOUD) {
    triggerTooLoudWarning()
  }

  if (
    currentDb >= AUDIO_THRESHOLDS.OPTIMAL_MIN &&
    currentDb <= AUDIO_THRESHOLDS.OPTIMAL_MAX
  ) {
    maintainOptimalFeedback()
  }
}
```

---

## Warning Modal Spec

### Too Silent Warning (Yellow)

Triggers after **> 1 minute of 0 dB**:

```
┌────────────────────────────────────────────────┐
│ ⚠️  CẢNH BÁO: Âm Thanh Quá Nhỏ                │
│                                                │
│ Không được đọc thầm hoàn toàn trong bụng,     │
│ sẽ gây đình trệ lưu thông máu (Tổn Huyết).   │
│                                                │
│ Hãy nhép miệng phát ra âm thanh nhỏ            │
│ mức vừa đủ tai mình nghe!                      │
│                                                │
│ ✅ Hiểu rồi, tôi sẽ nhép miệng đọc            │
│ 🔇 Tắt cảnh báo âm thanh                       │
└────────────────────────────────────────────────┘

Border: amber-300 / background: amber-50
Duration: Persist until user acknowledges OR volume > 20 dB sustained
```

### Too Loud Warning (Red)

Triggers when **volume > 60 dB detected**:

```
┌────────────────────────────────────────────────┐
│ 🚨 CẢNH BÁO: Âm Thanh Quá To                  │
│                                                │
│ Đọc Kinh quá to sẽ làm tổn thương năng lượng  │
│ (Tổn Khí). Hãy hạ giọng xuống mức vừa đủ     │
│ tai mình nghe!                                 │
│                                                │
│ ✅ Hiểu rồi, tôi sẽ hạ giọng                  │
│ 🔇 Tắt cảnh báo âm thanh                       │
└────────────────────────────────────────────────┘

Border: red-400 / background: red-50
Duration: Persist until user acknowledges OR volume < 50 dB sustained
```

### Optimal Feedback (Green, Subtle)

When **30-50 dB maintained** for > 10 seconds:

```
┌─────────────────────────────────┐
│ ✅ Âm thanh tối ưu - Tiếp tục   │
└─────────────────────────────────┘

Border: green-300 / background: green-50
Duration: Auto-dismiss after 3 seconds (non-blocking)
```

---

## FE Real-Time Monitoring

### Audio Context Setup

```typescript
interface AudioMonitoringState {
  isMonitoring: boolean
  currentDecibels: number
  averageDecibels: number
  warningActive: 'SILENT' | 'LOUD' | 'OPTIMAL' | null
  silentDurationMs: number
}

async function initializeAudioMonitoring(
  enableAudioMonitoring: boolean
): Promise<void> {
  if (!enableAudioMonitoring) return

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()
    const source = audioContext.createMediaStreamSource(stream)

    source.connect(analyser)
    analyser.fftSize = 2048

    const poll = setInterval(() => {
      const db = getAverageDecibels(analyser)
      monitorVocalResonance(db)
      updateUI(db)
    }, 100)  // polling every 100ms

    return () => {
      clearInterval(poll)
      stream.getTracks().forEach((track) => track.stop())
      audioContext.close()
    }
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      logAudit('content.audio_monitoring_permission_denied')
      // User denied microphone access — gracefully degrade
    }
  }
}
```

### UI Border Flash

```tsx
interface AudioLevelIndicatorProps {
  currentDb: number
  warningType: 'SILENT' | 'LOUD' | 'OPTIMAL' | null
}

export function AudioLevelIndicator({
  currentDb,
  warningType,
}: AudioLevelIndicatorProps) {
  const borderColor = {
    SILENT: 'border-amber-300',
    LOUD: 'border-red-400',
    OPTIMAL: 'border-green-300',
    null: 'border-neutral-200',
  }[warningType]

  const bgColor = {
    SILENT: 'bg-amber-50',
    LOUD: 'bg-red-50',
    OPTIMAL: 'bg-green-50',
    null: 'bg-white',
  }[warningType]

  return (
    <div className={`border-4 ${borderColor} ${bgColor} p-4 rounded-lg`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Âm thanh: {currentDb} dB</span>
        <VolumeVisualizer decibels={currentDb} />
      </div>
      {warningType && <WarningModal type={warningType} />}
    </div>
  )
}
```

---

## Data Model

```prisma
model SutraSession {
  id                       String    @id @default(cuid())
  userId                   String
  sutraId                  String

  // Audio monitoring
  audioLevelMonitored      Boolean   @default(false)
  avgDecibelsRecorded      Int?
  maxDecibelsRecorded      Int?
  silentAlertTriggered     Boolean   @default(false)
  loudAlertTriggered       Boolean   @default(false)

  // Volume statistics (Phase 2+)
  optimalDurationMs        Int       @default(0)  // time spent in 30-50 dB
  silentDurationMs         Int       @default(0)  // time spent at 0 dB
  loudDurationMs           Int       @default(0)  // time spent > 60 dB

  // Session metadata
  startedAt                DateTime  @default(now())
  completedAt              DateTime?
  updatedAt                DateTime  @updatedAt

  user                     User      @relation(fields: [userId], references: [id])
  sutra                    Sutra     @relation(fields: [sutraId], references: [id])

  @@index([userId, audioLevelMonitored])
}
```

---

## API Endpoints

### Start Session with Audio Monitoring

```
POST /api/content/sutras/:sutraId/start-session
Content-Type: application/json

Body:
{
  "enableAudioMonitoring": true
}

Response 200:
{
  "sessionId": "session_xxx",
  "status": "ACTIVE",
  "audioMonitoringEnabled": true,
  "audioThresholds": {
    "optimalMin": 30,
    "optimalMax": 50,
    "tooLoud": 60,
    "silentDurationMs": 60000
  },
  "currentLineIndex": 0,
  "totalLines": 150
}

Response 403:
{
  "code": "audio_permission_denied",
  "message": "Microphone access denied. Audio monitoring unavailable."
}
```

### Log Audio Warning

```
POST /api/content/sutras/:sutraId/audio-warning
Content-Type: application/json

Body:
{
  "warningType": "SILENT" | "LOUD",
  "currentDecibels": 0,
  "duration": 65000
}

Response 200:
{
  "logged": true,
  "audit": "content.sutra.volume-too-silent-warning"
}
```

### Log Optimal Volume

```
POST /api/content/sutras/:sutraId/audio-optimal
Content-Type: application/json

Body:
{
  "averageDecibels": 42,
  "durationMs": 30000
}

Response 200:
{
  "logged": true,
  "audit": "content.sutra.optimal-volume-maintained"
}
```

---

## DTO Definitions

```typescript
// Start Session with Audio Monitoring
interface StartSutraSessionDto {
  sutraId: string
  enableAudioMonitoring: boolean
}

// Audio Warning Log
interface AudioWarningDto {
  warningType: 'SILENT' | 'LOUD'
  currentDecibels: number
  duration: number  // ms
}

// Optimal Volume Log
interface OptimalAudioDto {
  averageDecibels: number
  durationMs: number
}
```

---

## Audit

| Action | Trigger | Details |
|---|---|---|
| `content.sutra.volume-too-silent-warning` | 0 dB detected for > 1 min | duration logged |
| `content.sutra.volume-too-loud-warning` | > 60 dB detected | peak dB logged |
| `content.sutra.optimal-volume-maintained` | 30-50 dB sustained | duration logged |

---

## Permission Handling

### Microphone Access Request

When user starts session with `enableAudioMonitoring: true`:

```
┌──────────────────────────────────────────┐
│ PMTL cần quyền truy cập microphone       │
│                                          │
│ Để giám sát âm thanh đọc kinh tối ưu   │
│ (30-50 dB) và bảo vệ sức khỏe tâm       │
│ linh của bạn.                            │
│                                          │
│ [Không] [Cho Phép]                       │
└──────────────────────────────────────────┘
```

- If denied: Log `content.audio_monitoring_permission_denied` + disable monitoring gracefully.
- If allowed: Begin polling audio level in background.

---

## Error Handling

### Permission Errors

```typescript
enum AudioMonitoringErrorCode {
  AUDIO_PERMISSION_DENIED = 'audio_permission_denied',
  AUDIO_NOT_SUPPORTED = 'audio_not_supported',
  MICROPHONE_IN_USE = 'microphone_in_use',
}
```

---

## FE Component Spec

### SutraAudioMonitor Component

```tsx
interface SutraAudioMonitorProps {
  enabled: boolean
  onWarning: (type: 'SILENT' | 'LOUD') => void
  onOptimal: () => void
}

export function SutraAudioMonitor({
  enabled,
  onWarning,
  onOptimal,
}: SutraAudioMonitorProps) {
  // Initialize Web Audio API
  // Poll every 100ms
  // Trigger warnings based on thresholds
  // Log to backend audit trail
}
```

### Dismiss Warning

```
Both warnings have non-blocking dismiss:

[✅ Hiểu rồi]  [🔇 Tắt cảnh báo]

- "Hiểu rồi": Acknowledge, continue reading
- "Tắt cảnh báo": Disable monitoring for this session
```

---

## Notes for AI/codegen

- **Advisory Only:** No hard blocks, warnings only.
- **Graceful Degradation:** If microphone permission denied, disable monitoring without breaking session.
- **Polling Interval:** 100ms recommended for smooth real-time feedback.
- **Decibel Approximation:** Web Audio API frequency data (0-255 scale) approximated to dB (0-100 range).
- **Silent Duration Reset:** Any sound > 0 dB resets silent timer to 0.
- **Warning Persistence:** Warnings persist until user acknowledges or volume returns to optimal range.
- **Border Flash:** CSS animation `@keyframes border-flash` with 0.5s duration, repeating while warning active.
- **No Audio Recording:** Only microphone stream used for real-time level detection, NO audio is recorded or stored.
- **Privacy:** User must grant permission each session; permission does not persist to next session.
- **Audit Trail:** All warnings and optimal periods logged for wellness analytics.

---

## Related

- [long-sutra-interruption-recovery-gate.md](./long-sutra-interruption-recovery-gate.md) — Pause/resume with recovery chant
- [pause-mantra-seal.md](./pause-mantra-seal.md) — Core pause/resume logic
- [ereader-hand-hygiene-gate.md](./ereader-hand-hygiene-gate.md) — Hand washing before reading
- [ereader-anti-face-down.md](./ereader-anti-face-down.md) — Device orientation rules
- [vocal-volume-bio-energetics-guide.md](./vocal-volume-bio-energetics-guide.md) — Related volume guidance (Phase 23)
