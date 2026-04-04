# Phân Tách Nghe Thụ Động & Tụng Chủ Động — Passive Listening vs Active Chanting

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Nghe kinh qua ghi âm **KHÔNG** tạo ra công đức. Chỉ tụng chủ động (hít thở, cử động miệng, thanh đới rung) mới tạo năng lượng tâm linh. Hệ thống ngăn auto-count khi audio đang phát và giáo dục user.

---

## Owner module

`content` — RecitationService / ListeningGuard
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — có thể vừa nghe vừa tụng, hoặc chỉ nghe
- `system` — theo dõi audio state, hiển thị tooltip cảnh báo, không auto-increment

---

## Trigger

Khi user click nút counter tụng niệm trong lúc audio player đang phát.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Audio đang phát | ✅ Hiển thị counter với tooltip cảnh báo vàng cam |
| User click counter trong lúc audio phát | ⚠️ Increment nhưng hiển thị tooltip giải thích |
| Audio kết thúc | ✅ Tooltip biến mất, counter sạch |
| Audio auto-complete | ❌ KHÔNG tự động increment counter |
| User click counter sau khi audio kết thúc | ✅ Increment bình thường, không warning |

---

## Input Contract

```typescript
// Không có API riêng — logic chỉ ở FE state
interface AudioPlayerState {
  isPlaying: boolean
  isCompleted: boolean
  currentTime: number
  duration: number
}

function getCounterTooltip(state: AudioPlayerState): string | null {
  if (state.isPlaying) {
    return '🎧 Nghe ghi âm không tạo công đức. Bạn BẮT BUỘC phải tự nhép miệng, phát ra âm thanh thì mới được tính.'
  }
  return null
}
```

---

## Write Path

```
// FE-only logic — không có server validation cho passive/active distinction
// Counter increment vẫn gọi POST /api/wisdom-qa/recitation/log bình thường
// Chỉ là UX/education — không block

// Server NEVER auto-increments counter from audio completion event
// Audio progress tracking và recitation counter là 2 independent tracks
```

---

## FE Behavior

```
E-Reader: Tiêu Tai Cát Tường Thần Chú

┌─ AUDIO PLAYER ────────────────────┐
│ [🎧] [▶ Play] [⏸] [×]           │
│ Progress: ████████░░░ 2:34 / 5:20 │
└────────────────────────────────────┘

KINH VĂN:
Namo Đại Từ Đại Bi Quán Thế Âm...

COUNTER (khi audio đang phát):
[+1]
💬 "🎧 Nghe ghi âm không tạo công đức..."
    (tooltip màu vàng cam)

──────────────────────────────────────

COUNTER (sau khi audio kết thúc):
[+1] ← Tooltip biến mất ✅ bình thường
```

---

## Audit

| Action | Trigger |
|---|---|
| `audio.playback_started` | User play ghi âm |
| `counter.click_with_audio_playing` | Warning hiển thị |
| `counter.click_audio_complete` | No warning, normal |

---

## Notes for AI/codegen

- **Không block** counter click — chỉ educate. User vẫn increment được.
- Audio completion NEVER triggers auto-increment — design constraint, không phải validation.
- Tooltip phải disappear ngay khi `isPlaying = false`.

---

## Related

- [recitation-economy-segregation.md](../../wisdom-qa/USE_CASES/recitation-economy-segregation.md) — counter segregation
- [daily-recitation-system.md](../../wisdom-qa/USE_CASES/daily-recitation-system.md) — core recitation system
