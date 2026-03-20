# Offline Bundle Delta Sync (Đồng bộ Gói Ngoại tuyến Gia tăng)

File này chốt schema versioning và delta sync flow cho `offlineBundles` trong Wisdom-QA module.

Không có doc này, offline sync không có contract rõ:
- client không biết khi nào bundle cũ
- server không biết đang deliver cho client version nào
- state drift giữa server và client không có recovery path

---

## Khái niệm cốt lõi

- **Bundle**: tập hợp entries (wisdomEntries hoặc qaEntries) được đóng gói để dùng offline
- **BundleVersion**: số nguyên tăng dần, tăng mỗi khi bundle có thay đổi
- **Delta**: tập hợp thay đổi từ version N đến version M (added + updated + deleted)
- **SyncState**: trạng thái đồng bộ của một thiết bị cụ thể với một bundle cụ thể

---

## Bundle versioning schema

### `offlineBundles` table additions

```sql
-- thêm vào bảng offlineBundles
ALTER TABLE offline_bundles ADD COLUMN bundle_version  INTEGER NOT NULL DEFAULT 1;
ALTER TABLE offline_bundles ADD COLUMN bundle_hash     TEXT;    -- sha256 of full content
ALTER TABLE offline_bundles ADD COLUMN last_built_at   TIMESTAMPTZ;
ALTER TABLE offline_bundles ADD COLUMN entry_count     INTEGER;
```

### `offlineBundleEntries` table (join table với versioning)

```sql
CREATE TABLE offline_bundle_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id       UUID NOT NULL REFERENCES offline_bundles(id),
  entry_public_id TEXT NOT NULL,   -- publicId của wisdomEntry hoặc qaEntry
  entry_type      TEXT NOT NULL,   -- 'wisdom_entry' | 'qa_entry'
  entry_version   INTEGER NOT NULL DEFAULT 1,  -- version của entry tại thời điểm add vào bundle
  added_at_version INTEGER NOT NULL,   -- bundle_version khi entry được thêm
  removed_at_version INTEGER,          -- bundle_version khi entry bị xóa khỏi bundle (NULL = còn active)
  content_snapshot JSONB,              -- snapshot content tại thời điểm add (cho offline delivery)
  UNIQUE (bundle_id, entry_public_id, added_at_version)
);
```

### `offlineSyncStates` table (per user per bundle per device)

```sql
CREATE TABLE offline_sync_states (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES users(id),
  bundle_id               UUID NOT NULL REFERENCES offline_bundles(id),
  device_fingerprint      TEXT NOT NULL,   -- client-provided device identifier
  last_synced_version     INTEGER NOT NULL DEFAULT 0,
  last_synced_at          TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, bundle_id, device_fingerprint)
);
```

---

## Delta sync API contract

### Request

```
GET /api/offline/bundles/:bundlePublicId/delta?sinceVersion=N&deviceFingerprint=<string>
Authorization: Bearer <access_token>
```

| Param | Mô tả |
|---|---|
| `sinceVersion` | version client đang có (0 = full download) |
| `deviceFingerprint` | identifier thiết bị do client generate (UUID hoặc hash) |

---

### Response schema

```typescript
// Zod schema — phải có file riêng
const DeltaResponseSchema = z.object({
  bundleId:       z.string(),
  bundleName:     z.string(),
  fromVersion:    z.number().int().nonnegative(),
  toVersion:      z.number().int().positive(),
  isFullSync:     z.boolean(),  // true nếu sinceVersion = 0 hoặc server không có delta đủ xa
  added:          z.array(OfflineEntrySchema),
  updated:        z.array(OfflineEntrySchema),
  deletedIds:     z.array(z.string()),  // publicIds đã bị remove khỏi bundle
  totalEntries:   z.number().int(),     // tổng số entries trong bundle hiện tại
  generatedAt:    z.string().datetime(),
});

const OfflineEntrySchema = z.object({
  publicId:       z.string(),
  entryType:      z.enum(['wisdom_entry', 'qa_entry']),
  entryVersion:   z.number().int(),
  title:          z.string(),
  originalText:   z.string().optional(),
  translatedText: z.string(),
  tags:           z.array(z.string()),
  sourceName:     z.string().optional(),
  sourceUrl:      z.string().url().optional(),
  audioUrl:       z.string().url().optional(),
});
```

---

## Sync flow (Luồng đồng bộ)

```
Client                              Server
  |                                   |
  |-- GET /delta?sinceVersion=N ----> |
  |                                   |-- query: entries added/updated since N
  |                                   |-- query: entries removed since N
  |                                   |-- build delta response
  |<-- DeltaResponse (toVersion=M) --|
  |                                   |
  |-- apply added + updated          |
  |-- remove deletedIds              |
  |-- save lastSyncedVersion = M     |
  |                                   |
  |-- (next sync: sinceVersion=M) -> |
```

**Full sync trigger**: server trả `isFullSync: true` khi:
- client gửi `sinceVersion = 0` (first download)
- server không còn lưu delta đủ xa (e.g., client quá cũ, hơn 30 versions)
- bundle được force-rebuild (admin trigger)

---

## Conflict resolution

- server always wins: không có user-side editing của offline content
- nếu client có local annotation (bookmark, note), đây là Engagement data — không conflict với bundle
- `content_snapshot` trong `offlineBundleEntries` là bất biến tại thời điểm snapshot — không retroactively update

---

## Bundle rebuild trigger

Khi nào rebuild bundle (increment `bundle_version`):

| Trigger | Action |
|---|---|
| `wisdomEntry.published` (review approved) | Add entry vào bundle nếu tags match, increment version |
| `wisdomEntry.updated` (nội dung thay đổi) | Update `content_snapshot`, update `entry_version`, increment bundle version |
| `wisdomEntry.unpublished` / soft deleted | Set `removed_at_version = current`, increment bundle version |
| `qaEntry.*` tương tự | như trên |
| Admin trigger manual rebuild | Force-rebuild toàn bộ snapshot, increment version |

Rebuild nên đi qua **outbox event** `wisdom.bundle.rebuild_requested` → worker → rebuild job.

---

## Delta retention policy (Chính sách lưu delta)

- server giữ delta history trong `offlineBundleEntries` với `added_at_version` và `removed_at_version`
- client có thể request delta từ bất kỳ version nào trong vòng **30 versions gần nhất**
- nếu client quá cũ (< version hiện tại - 30), server trả `isFullSync: true`
- không cần giữ snapshots cũ sau 30 versions — có thể purge

---

## Notes for AI/codegen

- `deviceFingerprint` do client generate — server không cần verify ownership, chỉ dùng để track sync state
- `content_snapshot` phải là immutable sau khi tạo — không retroactively mutate snapshot cũ
- delta endpoint chỉ trả content đã published và reviewed — không expose draft/quarantined
- không implement delta cho media files (audio) trong phase 1 — chỉ trả `audioUrl` reference
- khi `isFullSync = true`, client phải clear local cache trước khi apply — không merge
- rebuild job phải implement idempotency: nếu chạy 2 lần, kết quả phải giống nhau
