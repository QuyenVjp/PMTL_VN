# Backup & Recovery — VPS Canon

File này mở rộng `design/02-platform-baseline/deploy-ops/BACKUP_RESTORE.md` với VPS-specific implementation.
Owner của RPO/RTO targets và minimum contract vẫn là `BACKUP_RESTORE.md`.
File này chốt **cách thực hiện cụ thể** trên VPS self-host.

---

## Backup strategy tổng quan

```mermaid
graph LR
  PG[("Postgres 16\nVPS")]
  Cron["cron: pg_dump\n(daily 2AM)"]
  Local["/backups/daily/\n(giữ 7 ngày)"]
  Remote["Remote storage\n(Backblaze B2 free 10GB\nhoặc GitHub repo private)"]
  Media["/data/media/\n(local disk)"]
  MediaRemote["Media backup\n(rsync weekly)"]

  PG --> Cron
  Cron --> Local
  Local -->|"sync"| Remote
  Media -->|"rsync weekly"| MediaRemote
```

---

## pg_dump cron script

```bash
#!/bin/bash
# /opt/pmtl/scripts/backup-db.sh

set -euo pipefail

BACKUP_DIR="/opt/pmtl/backups/daily"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
CONTAINER="pmtl-prod-postgres-1"   # docker compose service name
DB_NAME="${POSTGRES_DB:-pmtl_prod}"
DB_USER="${POSTGRES_USER:-pmtl}"
KEEP_DAYS=7
TELEGRAM_SCRIPT="/opt/pmtl/scripts/alert.sh"

mkdir -p "${BACKUP_DIR}"

# Dump vào file nén
DUMP_FILE="${BACKUP_DIR}/pmtl_${TIMESTAMP}.sql.gz"

docker exec "${CONTAINER}" \
  pg_dump -U "${DB_USER}" -d "${DB_NAME}" --no-password \
  | gzip > "${DUMP_FILE}"

# Kiểm tra dump không rỗng
if [ ! -s "${DUMP_FILE}" ]; then
  ${TELEGRAM_SCRIPT} "❌ pg_dump EMPTY: ${DUMP_FILE}"
  exit 1
fi

SIZE=$(du -sh "${DUMP_FILE}" | cut -f1)
echo "$(date): Backup OK: ${DUMP_FILE} (${SIZE})"

# Xoá dump cũ hơn KEEP_DAYS ngày
find "${BACKUP_DIR}" -name "*.sql.gz" -mtime "+${KEEP_DAYS}" -delete

# Thông báo Telegram thành công (weekly only, tránh spam)
DOW=$(date +%u)  # 1=Mon, 7=Sun
if [ "${DOW}" = "1" ]; then
  ${TELEGRAM_SCRIPT} "✅ DB backup weekly OK: ${SIZE}"
fi
```

```cron
# /etc/cron.d/pmtl-backup
# Chạy lúc 2:00 AM mỗi ngày
0 2 * * * pmtl /opt/pmtl/scripts/backup-db.sh >> /var/log/pmtl-backup.log 2>&1
```

---

## Remote sync — Backblaze B2 (free 10GB)

```bash
# Cài rclone
curl https://rclone.org/install.sh | sudo bash

# Config Backblaze B2
rclone config
# → Chọn "b2", điền account_id và application_key từ Backblaze console

# Sync backups lên B2
rclone sync /opt/pmtl/backups/daily remote:pmtl-backups/daily \
  --transfers 2 \
  --log-level INFO

# Thêm vào cron (sau pg_dump)
30 2 * * * pmtl rclone sync /opt/pmtl/backups/daily remote:pmtl-backups/daily >> /var/log/pmtl-rclone.log 2>&1
```

**Alternatives free storage:**
- GitHub private repo (push dump nhỏ < 100MB)
- Cloudflare R2 free 10GB/tháng
- Backblaze B2 free 10GB

---

## 1-click restore procedure

```bash
#!/bin/bash
# /opt/pmtl/scripts/restore-db.sh
# Usage: ./restore-db.sh /opt/pmtl/backups/daily/pmtl_20260327_020000.sql.gz

set -euo pipefail

DUMP_FILE="$1"
CONTAINER="pmtl-prod-postgres-1"
DB_NAME="${POSTGRES_DB:-pmtl_prod}"
DB_USER="${POSTGRES_USER:-pmtl}"

if [ -z "${DUMP_FILE}" ]; then
  echo "Usage: $0 <dump_file.sql.gz>"
  exit 1
fi

echo "⚠️  Restore sẽ DROP và tạo lại database ${DB_NAME}"
echo "Nhập 'yes' để tiếp tục:"
read -r CONFIRM
[ "${CONFIRM}" != "yes" ] && exit 0

# Stop app containers (không stop postgres)
docker compose -f /opt/pmtl/infra/docker/docker-compose.prod.yml stop api web admin

# Drop + recreate
docker exec "${CONTAINER}" psql -U "${DB_USER}" -c "DROP DATABASE IF EXISTS ${DB_NAME};"
docker exec "${CONTAINER}" psql -U "${DB_USER}" -c "CREATE DATABASE ${DB_NAME};"

# Restore
gunzip -c "${DUMP_FILE}" | docker exec -i "${CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}"

echo "✅ Restore xong: ${DUMP_FILE}"

# Restart apps
docker compose -f /opt/pmtl/infra/docker/docker-compose.prod.yml start api web admin
```

---

## Restore drill protocol (bắt buộc trước launch)

Theo `design/04-execution-overlay/repo/RESTORE_DRILL_LOG.md`:

1. Chạy `backup-db.sh` thủ công
2. Tạo môi trường test (hoặc dùng staging branch trên cùng VPS)
3. Chạy `restore-db.sh <dump_file>` vào DB staging
4. Verify: app boot, `/health/ready` pass, 1 vài query kiểm tra data
5. Ghi kết quả vào `RESTORE_DRILL_LOG.md`

---

## Media backup (local disk → remote)

```bash
# Weekly sync media lên Backblaze B2
0 3 * * 0 pmtl rclone sync /opt/pmtl/data/media remote:pmtl-backups/media >> /var/log/pmtl-media-backup.log 2>&1
```

---

## Disk space monitoring

```bash
# Alert khi disk > 80%
# Thêm vào healthcheck cron:
DISK_USAGE=$(df /opt/pmtl | awk 'NR==2 {print $5}' | tr -d '%')
if [ "${DISK_USAGE}" -gt 80 ]; then
  /opt/pmtl/scripts/alert.sh "⚠️ Disk usage: ${DISK_USAGE}% — cần dọn dẹp"
fi
```
