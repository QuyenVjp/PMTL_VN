# R2_MIGRATION_PLAN — Cloudflare R2 Storage Cutover

File này chốt target migration từ local disk storage sang Cloudflare R2.
Phase 1 dùng local disk + storage abstraction. Phase 2+ cutover sang R2.

> **Storage abstraction**: `tracking/implementation-mapping.md` — local adapter
> **Upload policy**: `baseline/security.md` — upload hardening rules
> **Infra**: `baseline/infra.md` — "Cloudflare R2: Phase 2+" entry

---

## Tại sao local disk là Phase 1

- Không cần account/billing ngay
- Restore procedure đơn giản (VPS snapshot + pgdump)
- Single VPS không cần distributed storage
- Nhược điểm đã biết: disk đầy, volume mount sai, DB/file sync lệch khi restore

---

## Trigger conditions cho R2 migration

Cutover sang R2 khi **ít nhất 1** điều kiện sau:

| Trigger | Measurement |
|---|---|
| Local disk > 70% capacity | `df -h` trên VPS media volume |
| Media volume mount fail gây 2+ restore drill fail | `ops/restore-drill-log.md` |
| Multi-instance deploy (horizontal scale) cần shared media | Deploy architecture change |
| Backup/restore drift giữa DB và media > 5% of assets | Orphan/missing check script |

---

## R2 migration strategy

### Storage abstraction boundary (Phase 1)

Code phải đã implement interface trước migration:

```typescript
// apps/api/src/platform/storage/storage.interface.ts
interface StorageAdapter {
  upload(key: string, buffer: Buffer, contentType: string): Promise<{ url: string }>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresIn: number): Promise<string>;
  exists(key: string): Promise<boolean>;
}
```

Adapter implementations:
- `LocalDiskAdapter` — Phase 1, reads `LOCAL_STORAGE_ROOT`
- `R2Adapter` — Phase 2+, reads `S3_*` env vars (R2 is S3-compatible)

### Migration steps

```
Step 1 — Audit existing assets
  → Query media_assets table: count, total size, file types
  → Identify orphan files (on disk but not in DB)
  → Identify missing files (in DB but not on disk)
  → Output: migration_asset_manifest.csv

Step 2 — Set up R2 bucket
  → Create bucket: pmtl-media (Cloudflare R2 dashboard)
  → Set CORS: allow WEB_ORIGIN + ADMIN_ORIGIN for GET
  → Set lifecycle: no auto-deletion (managed by app)
  → Create R2 API token with object:read + object:write
  → Test: upload 1 test file, verify URL accessible

Step 3 — Configure R2 custom domain
  → Cloudflare: add custom domain to R2 bucket
  → Domain: media.pmtl.vn (or cdn.pmtl.vn)
  → Verify: https://media.pmtl.vn/<test-key> returns file

Step 4 — Enable R2 adapter in staging
  → Set S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY in staging env
  → Set STORAGE_ADAPTER=r2 (new env var — see below)
  → Test upload → verify URL resolves via R2
  → Test delete → verify file removed from R2

Step 5 — Migrate existing assets (script)
  → Script: infra/scripts/migrate-media-to-r2.sh
  → Process: stream each file from local disk → upload to R2 with same key
  → After each file: update media_assets.storageBackend = 'r2'
  → Run during low-traffic window
  → Idempotent: skip already-migrated files

Step 6 — Dual-read period (1 week)
  → New uploads → R2
  → Reads: check storageBackend column, serve from correct adapter
  → Monitor: error rate, URL resolution failures

Step 7 — Validate and cutover
  → Verify 0 missing files via storage check script
  → Disable local disk adapter
  → Remove LOCAL_STORAGE_ROOT dependency

Step 8 — Backup update
  → Update backup-restore.md: R2 improves durability but does NOT remove need for deletion/recovery policy
  → Keep versioning / deletion recovery / export policy explicit
  → Media restore = restore DB metadata + verify R2 object presence + keep R2 env vars

**Important**: R2 durability does not protect against accidental deletion, bad writes, or wrong lifecycle policy. Do not write “no backup needed” as if durability solved recovery.
```

---

## Schema change for migration

```sql
-- Migration: add storageBackend column
ALTER TABLE media_assets ADD COLUMN storage_backend VARCHAR(20) DEFAULT 'local';
-- Values: 'local' | 'r2' | 's3'
-- Query performance: index on storage_backend
CREATE INDEX idx_media_assets_storage_backend ON media_assets(storage_backend);
```

---

## Env vars (Phase 2)

| Env | Required | Purpose |
|---|---|---|
| `STORAGE_ADAPTER` | yes | `local` or `r2` — adapter selector |
| `S3_ENDPOINT` | yes when r2 | `https://<accountid>.r2.cloudflarestorage.com` |
| `S3_BUCKET` | yes when r2 | R2 bucket name |
| `S3_ACCESS_KEY_ID` | yes when r2 | R2 API token ID |
| `S3_SECRET_ACCESS_KEY` | yes when r2 | R2 API token secret |
| `S3_REGION` | no | `auto` for R2 |
| `PUBLIC_MEDIA_BASE_URL` | yes | Stays — update to R2 custom domain |

---

## Rollback

- Set `STORAGE_ADAPTER=local` → LocalDiskAdapter activates
- Requires local disk to still have files (do not delete until fully verified)
- Keep local files for 30 days after successful R2 migration

---

## Failure modes during migration

| Failure | Action |
|---|---|
| R2 upload fails during migration script | Script logs failure, continues with next file, generates error report |
| File exists on disk but missing from R2 | Retry upload, mark as `migration_failed` in manifest |
| URL resolution fails post-migration | Fallback to local serve if storage_backend='local', log warning |
| R2 unavailable | All new uploads fail closed; existing R2 assets degrade |

---

## Code locations

| Artifact | Location |
|---|---|
| Storage interface | `apps/api/src/platform/storage/storage.interface.ts` |
| Local adapter | `apps/api/src/platform/storage/adapters/local-disk.adapter.ts` |
| R2 adapter | `apps/api/src/platform/storage/adapters/r2.adapter.ts` |
| Migration script | `infra/scripts/migrate-media-to-r2.sh` |
| Storage module | `apps/api/src/platform/storage/storage.module.ts` |

---

## Implementation proof criteria

| Check | Proof |
|---|---|
| Abstraction in place | Upload/delete/url logic does not reference LOCAL_STORAGE_ROOT directly |
| R2 adapter works | Test file uploaded, URL resolves via R2 custom domain |
| Migration script idempotent | Run twice → same result, no duplicates |
| Dual-read period clean | Zero URL resolution errors after migration |
| Rollback tested | Set STORAGE_ADAPTER=local → local files served correctly |
