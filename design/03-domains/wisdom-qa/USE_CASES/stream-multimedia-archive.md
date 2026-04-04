# Kho Đa Phương Tiện Bài Giảng — Stream Multimedia Archive

> **Nguồn:** Kho ghi âm chính thức Pháp Môn Tâm Linh (4,123+ file, 3,400+ giờ)
> **Trạng thái:** Design reference — implementation phụ thuộc vào licensing và hosting decision
> **Cập nhật:** 2026-04-04

---

## Purpose

Phục vụ kho lưu trữ audio/video bài giảng của Đài Trưởng Lư Quân Hoành qua ba chương trình
chính: **Xem Đồ Đằng** (Totem Reading), **Huyền Nghệ Vấn Đáp** (Q&A), **Bạch Thoại Phật Pháp**
(Buddhism in Plain Terms). Nghe ghi âm hàng ngày là thực hành trọng tâm — hệ thống phải cho phép
user vừa nghe vừa dùng các tính năng khác mà không bị ngắt audio.

---

## Owner module

`wisdom-qa` — [xem CONTRACTS.md](../CONTRACTS.md)
Global player state thuộc `apps/web` Root Layout (client-side only).

---

## Actors

- `guest` — xem catalog, preview (giới hạn)
- `member` — full access, offline download, progress tracking
- `admin` — ingest, tag, quản lý metadata

---

## Trigger

- User vào `/nghe-giang` → browse catalog → bấm Play.
- Hoặc tiếp tục từ `lastPlayedPosition` khi quay lại app.

---

## Preconditions

- Guest: không cần đăng nhập cho catalog browse và preview 5 phút đầu.
- Member: cần session cho full playback, progress save, offline download.

---

## Input contract — Catalog Browse (public)

```
GET /api/media/archive?category=<category>&page=<n>&limit=20&q=<search>

category: "TOTEM_READING" | "QA_SESSION" | "BAIHUA" | "ALL"
```

---

## Input contract — Playback Session (member)

```
POST /api/media/archive/:publicId/session
{
  resumeFromSeconds?: number
}

PATCH /api/media/archive/:publicId/session
{
  currentPositionSeconds: number  // checkpoint save mỗi 30 giây
  completed?: boolean
}
```

---

## Input contract — Offline Download Request (member)

```
POST /api/media/archive/:publicId/download-token
→ trả về signed URL có TTL 1 giờ để PWA cache file
```

---

## Read set

- `MediaArchiveEntry` catalog (cached, TTL 5 phút)
- `PlaybackSession` của user cho track đang chọn
- `OfflineCacheManifest` (PWA — client-side IndexedDB, không phải server DB)

---

## Data Models

```
MediaArchiveEntry {
  id              String   @id
  publicId        String   @unique
  category        String   // TOTEM_READING | QA_SESSION | BAIHUA
  titleVi         String
  titleZh         String?
  episodeNumber   Int?
  recordedDate    DateTime?
  durationSeconds Int
  audioUrl        String   // CDN URL hoặc signed storage path
  transcriptId    String?  // FK tới WisdomEntry nếu có bản text
  tags            String[] // VD: ["ung-thu", "gia-dinh", "phong-sinh"]
  status          String   // PUBLISHED | DRAFT | ARCHIVED
  publishedAt     DateTime?
  createdAt       DateTime
  updatedAt       DateTime
}

PlaybackSession {
  id                    String   @id
  userId                String
  mediaEntryId          String
  startedAt             DateTime
  lastPositionSeconds   Int      @default(0)
  completed             Boolean  @default(false)
  completedAt           DateTime?
  updatedAt             DateTime

  @@unique([userId, mediaEntryId])
}
```

---

## Write path — Playback

1. `POST /session`: Upsert `PlaybackSession` với `resumeFromSeconds` hoặc `0`.
2. Client phát audio từ CDN URL trực tiếp (không proxy qua API server).
3. Client gửi `PATCH /session` checkpoint mỗi 30 giây với `currentPositionSeconds`.
4. Khi `completed = true`: audit `wisdom-qa.media.completed`, optionally trigger merit earned event.

---

## Write path — Admin Ingest

1. Admin upload file audio lên storage (S3/R2), nhận `audioUrl`.
2. `POST /api/admin/media/archive` với đầy đủ metadata.
3. Validate: `durationSeconds > 0`, `category` hợp lệ, `audioUrl` có định dạng URL hợp lệ.
4. Tạo `MediaArchiveEntry` với `status = DRAFT`.
5. Admin review → `PATCH status = PUBLISHED` → invalidate catalog cache.
6. Audit `wisdom-qa.media.published`.

---

## Global Audio Player — Frontend Architecture

**Yêu cầu cốt lõi:** User vừa nghe bài giảng vừa chuyển sang tab `/tu-tap` để đếm niệm kinh
mà không bị đứt audio.

```
Root Layout (apps/web/app/layout.tsx)
├── AudioPlayerProvider (React Context — client component)
│   ├── state: { currentTrack, isPlaying, positionSeconds, queue }
│   ├── actions: { play, pause, seek, setTrack, addToQueue }
│   └── GlobalAudioPlayer (persistent bottom bar UI)
│       ├── Track info + artwork
│       ├── Play/Pause/Seek controls
│       └── Offline indicator (PWA cache status)
└── Page content (route changes không destroy player)
```

**Implementation note:** Dùng HTML5 `<audio>` element gắn tại Root Layout. State quản lý qua
React Context hoặc Zustand store. Không dùng `key` prop thay đổi theo route.

---

## PWA Offline Support

**Mục tiêu:** User có thể tải về và nghe bài giảng khi không có mạng (đi xe, nơi vắng sóng).

```
Service Worker Strategy:
- Catalog metadata:    Network-first, fallback to cache (TTL 24 giờ)
- Audio files:         Cache-on-demand (user phải explicit download)
- UI assets:           Cache-first (stale-while-revalidate)

Offline Download Flow:
1. User bấm [Tải về nghe offline] trên track.
2. App gọi /download-token → nhận signed URL.
3. Service Worker fetch và cache audio file vào Cache Storage.
4. Track hiển thị badge "Đã tải" (offline available).
5. Khi offline: player đọc từ Cache Storage thay vì CDN.

Storage quota advisory:
- 1 bài Bạch Thoại ≈ 50–80 MB (audio 128kbps, ~1 giờ)
- Hiển thị warning nếu storage quota < 200 MB remaining
```

---

## Async side-effects

- Khi `completed = true`: tạo `MeritLedger` entry `entryType = EARNED_BAIHUA` (chỉ cho category `BAIHUA`).
- **Phase 2+:** Outbox event `wisdom-qa.media.completed` → `engagement` cập nhật daily practice log.

---

## Success result

- User nghe liên tục không bị gián đoạn khi đổi route.
- `PlaybackSession` lưu vị trí — user quay lại tiếp tục đúng chỗ.
- Bạch Thoại hoàn thành → merit earned được ghi vào `MeritLedger`.

---

## Errors

| Condition | Error code | HTTP | Recovery |
|---|---|---|---|
| `publicId` không tồn tại hoặc `status != PUBLISHED` | `not_found` | 404 | — |
| Guest cố full-play (qua 5 phút) | `auth_required` | 401 | Redirect login |
| Download token request khi chưa đăng nhập | `unauthorized` | 401 | — |
| Storage server không phản hồi | `service_unavailable` | 503 | Retry với backoff |

---

## Audit

| Action | Actor | Trigger |
|---|---|---|
| `wisdom-qa.media.played` | actorUserId | Bắt đầu phiên nghe |
| `wisdom-qa.media.completed` | actorUserId | `completed = true` |
| `wisdom-qa.media.downloaded` | actorUserId | Download token được tạo |
| `wisdom-qa.media.published` | adminUserId | Admin publish track |

---

## Rate-limit requirement

- Download token: 20 requests/hour per account (chống abuse bandwidth)
- Catalog browse: 120 requests/minute per IP

---

## Outbox event

- Event type: `wisdom-qa.media.completed`
- Subscriber: `engagement` (daily practice log), `vows-merit` (merit ledger)
- Mode: sync-inline (Phase 1), outbox-required (Phase 2+)

---

## Recovery path

- Nếu `PlaybackSession` checkpoint bị mất (app crash): user replay từ vị trí checkpoint gần nhất.
- `OfflineCacheManifest` là client-side — server không cần recovery path cho nó.
- Nếu CDN URL hết hạn: admin re-generate và update `audioUrl` → cache invalidation tự động theo TTL.

---

## Notes for AI/codegen

- Audio file không được proxy qua NestJS API server — CDN URL serve trực tiếp đến browser. API chỉ serve metadata và session tracking.
- `GlobalAudioPlayer` phải là **client component** gắn tại Root Layout, không thể là Server Component.
- Checkpoint save (PATCH /session mỗi 30s) phải debounced ở client — không gọi mỗi giây.
- `MeritLedger` entry chỉ tạo khi `completed = true` và `category = BAIHUA` — các category khác không tạo merit entry.
- PWA manifest và service worker config nằm tại `apps/web` — không thuộc `apps/api`.
- Signed download URL TTL = 1 giờ. Client phải cache token và không re-request nếu còn hiệu lực.
- `tags` field trên `MediaArchiveEntry` dùng để map với `RemedyPrescription` sau này — ví dụ prescription "ung thư" link tới các bài có tag "ung-thu".
