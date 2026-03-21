# STORAGE_LIFECYCLE — Media Storage Lifecycle & Cleanup Jobs

File này chốt vòng đời (lifecycle) của media assets và các cleanup jobs cần thiết.
Không có doc này, orphan files tích lũy, disk đầy ngầm, restore fail do drift.

> **Upload policy**: `baseline/security.md` — upload hardening
> **R2 migration**: `baseline/r2-migration-plan.md`
> **Failure modes**: `baseline/failure-modes.md`

---

## Asset states (Trạng thái tài sản)

```
uploaded → pending_scan → approved → published
                       ↓
                  quarantined → (manual review) → approved | rejected
                       ↓
                   rejected → (scheduled delete after 7 days)

Any state → soft_deleted → (scheduled hard delete after 30 days)
```

| State | DB value | Publicly served? | Action |
|---|---|---|---|
| `uploaded` | `uploaded` | No | Awaiting scan/approval |
| `pending_scan` | `pending_scan` | No | Phase 2+: scan pipeline processing |
| `approved` | `approved` | Yes (if published) | Normal use |
| `published` | `published` | Yes | Fully public |
| `quarantined` | `quarantined` | No | Manual review required |
| `rejected` | `rejected` | No | Scheduled delete in 7 days |
| `soft_deleted` | `soft_deleted` | No | Scheduled hard delete in 30 days |

**Phase 1 simplified flow** (no scan pipeline):
```
uploaded → approved → published
         ↓
      soft_deleted → hard_deleted (30 days)
```

---

## media_assets table — required columns for lifecycle

```prisma
model MediaAsset {
  id               Int          @id @default(autoincrement())
  publicId         String       @unique @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  storageKey       String       @unique  // UUID-based, not raw filename
  storageBackend   String       @default("local")  // local | r2
  originalFilename String       // stored for audit, never used as storageKey
  mimeType         String
  sizeBytes        Int
  checksum         String?      // sha256 of file content — canonical integrity field, không dựa vào ETag object store; phase 1 cho phép null ở legacy/sample assets nhưng new upload flow nên cố gắng populate
  status           MediaStatus  @default(UPLOADED)
  uploadedBy       String       @db.Uuid  // FK to users.publicId
  linkedEntityType String?      // post | guide | event | etc.
  linkedEntityId   String?
  deletedAt        DateTime?
  deletedBy        String?      @db.Uuid
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  @@index([status])
  @@index([uploadedBy])
  @@index([storageBackend])
  @@index([deletedAt])
}

enum MediaStatus {
  UPLOADED
  PENDING_SCAN
  APPROVED
  PUBLISHED
  QUARANTINED
  REJECTED
  SOFT_DELETED
}
```

---

## Cleanup jobs

### Job 1: Orphan file detection

**Schedule**: Daily 03:00 VN time (cron: `0 20 * * *` UTC)
**Owner**: `apps/api/src/platform/storage/jobs/orphan-detection.job.ts`
**What it does**:
1. List all files on disk (or R2 bucket)
2. Query `media_assets` for all known storageKeys
3. Find files on disk NOT in DB (orphans)
4. Log orphans as `warn` with count and sample keys
5. Do NOT auto-delete — human review required for now

**Metric**: `pmtl_storage_orphan_files_count`
**Alert**: if orphan_count > 100 → warn

### Job 2: Rejected asset hard delete

**Schedule**: Daily 04:00 VN time (cron: `0 21 * * *` UTC)
**Owner**: `apps/api/src/platform/storage/jobs/rejected-cleanup.job.ts`
**What it does**:
1. Query `media_assets WHERE status='rejected' AND updatedAt < NOW() - 7 days`
2. Delete physical file via storage adapter
3. Update status to `soft_deleted` (keep DB record)
4. Log deletion with audit append

### Job 3: Soft-deleted hard delete

**Schedule**: Daily 04:30 VN time (cron: `0 20 30 * * *` UTC)
**Owner**: `apps/api/src/platform/storage/jobs/soft-delete-cleanup.job.ts`
**What it does**:
1. Query `media_assets WHERE status='soft_deleted' AND deletedAt < NOW() - 30 days`
2. Delete physical file via storage adapter (if not already deleted)
3. Mark `media_assets.status = 'hard_deleted'` (final state, keep record 1 year)
4. Append audit log: `storage.asset.hard_deleted`

### Job 4: Missing file detection (backup consistency)

**Schedule**: Weekly Sunday 02:00 VN time (cron: `0 19 * * 0` UTC)
**Owner**: `apps/api/src/platform/storage/jobs/missing-file-check.job.ts`
**What it does**:
1. Query `media_assets WHERE status IN ('approved','published') LIMIT 500` (sample, not full scan)
2. Check each storageKey exists via `storage.exists(key)`
3. Log missing rate: `pmtl_storage_missing_file_rate`
4. If missing_rate > 1% → alert (potential backup drift or manual deletion)

**Alert**: `pmtl_storage_missing_file_rate > 0.01` → page on-call

---

## Upload quota policy

| Actor | Daily limit | Monthly limit |
|---|---|---|
| Member | 10 uploads, 50 MB total | 100 uploads, 500 MB total |
| Editor | 100 uploads, 500 MB total | Unlimited |
| Admin | Unlimited | Unlimited |

**Quota tracking**: `upload_quota_records` table (similar to rate_limit_records)

```prisma
model UploadQuotaRecord {
  id        Int      @id @default(autoincrement())
  userId    String   @db.Uuid
  period    String   // e.g. "2026-03-21"
  fileCount Int      @default(0)
  totalBytes BigInt  @default(0)
  @@unique([userId, period])
}
```

---

## Disk capacity monitoring

**Phase 1 (local disk)**:
```bash
# Check disk usage — run in scheduled maintenance
df -h /var/lib/docker/volumes/pmtl_media_data
```

**Alert threshold**: 70% full → warn, 85% full → critical

**Metric** (Phase 2): `node_filesystem_avail_bytes` from node_exporter → Grafana alert

---

## Media reference integrity rules

When deleting a media asset that is referenced by content:
1. Check `linked_entity_type + linked_entity_id` — if linked, block hard delete
2. Admin must unlink before delete is allowed
3. Soft delete is always allowed (just hides asset)
4. Content that references a soft-deleted asset → show placeholder image, not 500 error

---

## Restore considerations

After DB restore:
- Run orphan detection job manually
- Run missing file detection job manually
- Accept expected mismatch if backup timestamps differ
- Document mismatch in restore-drill-log.md

### Integrity verification rule

- local disk và object storage đều phải coi `checksum` + `sizeBytes` là integrity baseline
- không dùng riêng ETag làm bằng chứng integrity vì multipart/object-store behavior có thể làm ETag không còn đồng nghĩa với content hash
- restore drill hoặc repair flow nên verify theo thứ tự:
  1. `storage.exists(storageKey)`
  2. `sizeBytes` khớp
  3. checksum khớp khi asset nằm trong sample hoặc suspicious set

### Media consistency manifest rule

- mọi backup/restore drill nên ưu tiên đối chiếu bằng manifest tối thiểu thay vì chỉ kiểm ngẫu nhiên bằng mắt
- manifest tối thiểu cho sample verify nên gồm:
  - `publicId`
  - `storageKey`
  - `checksum` nếu đã có
  - `sizeBytes`
  - `status`
- nếu chưa có full manifest export job, phase 1 vẫn phải có sample manifest generator cho restore drill và missing/orphan checks
- mục tiêu của manifest không phải tạo source of truth mới, mà giảm code kiểm tra lặp lại và giúp restore verification có thể tự động hóa

---

## Code locations

| Artifact | Location |
|---|---|
| Storage jobs | `apps/api/src/platform/storage/jobs/` |
| Orphan detection | `apps/api/src/platform/storage/jobs/orphan-detection.job.ts` |
| Rejected cleanup | `apps/api/src/platform/storage/jobs/rejected-cleanup.job.ts` |
| Soft delete cleanup | `apps/api/src/platform/storage/jobs/soft-delete-cleanup.job.ts` |
| Missing file check | `apps/api/src/platform/storage/jobs/missing-file-check.job.ts` |
| Upload quota service | `apps/api/src/platform/storage/upload-quota.service.ts` |
| MediaAsset schema | `prisma/schema.prisma` — MediaAsset model |

---

## Implementation proof criteria

| Check | Proof |
|---|---|
| Orphan detection runs | Cron log shows daily execution, metric emitted |
| Rejected cleanup runs | Asset in rejected state for 7+ days gets deleted |
| Soft-delete enforced | UI delete → status=soft_deleted, file still on disk for 30 days |
| Missing file detection | Weekly log shows missing rate |
| Quota enforced | Member upload attempt over quota → 429 with clear message |
| Restore check | Post-restore drill includes orphan + missing file job run |
