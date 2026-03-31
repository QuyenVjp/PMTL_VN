# AUDIT_POLICY

Tài liệu này chốt chính sách ghi audit cho PMTL_VN.
Mục tiêu là để mọi hành động quan trọng đều trả lời được:

- ai thực hiện
- lúc nào
- trên entity nào
- trước và sau khi thay đổi là gì
- side-effect nào đã được kích hoạt

## Nguyên tắc gốc

- `auditLogs` là append-only record cho điều tra và truy vết.
- Audit log không thay thế canonical business record.
- Summary fields trên entity được phép tồn tại để đọc nhanh, nhưng không thay cho audit trail.
- Hành động quan trọng phải log ở service (lớp xử lý nghiệp vụ)/hook owner của module, không chỉ log ở UI.

## Khi nào bắt buộc ghi audit

### Identity
- đăng ký tài khoản mới
- đổi role
- khóa hoặc mở khóa tài khoản
- cập nhật profile bởi admin
- reset mật khẩu bởi flow quản trị hoặc support

### Content
- tạo document editorial mới
- chuyển `draft -> published`
- cập nhật document đã publish
- unpublish hoặc xóa document public
- thay đổi taxonomy quan trọng hoặc liên kết event

### Community
- gửi community post
- gửi post comment
- gửi community comment
- gửi guestbook entry
- action bị chặn vì request guard hoặc anti-spam

### Engagement
- tạo hoặc hoàn tất practice log
- thay đổi chant preferences
- ghi bookmark hoặc tiến độ đọc kinh nếu ảnh hưởng self-state chính
- tạo `Ngôi Nhà Nhỏ`
- hoàn thành `Ngôi Nhà Nhỏ`
- đánh dấu `Ngôi Nhà Nhỏ` đã hóa

### Moderation
- tạo moderation report
- admin ra quyết định
- cập nhật summary moderation trên entity đích

### Search
- batch reindex thủ công
- sync thất bại nhiều lần
- fallback (đường dự phòng) search bị dùng do Meilisearch unavailable

### Calendar
- tạo hoặc publish event
- tạo lunar override làm thay đổi lịch hiển thị

### Notification
- tạo push job
- push job fail hoặc complete
- subscribe / unsubscribe push subscription

### Vows & Merit
- tạo phát nguyện
- pause / resume phát nguyện
- hoàn thành phát nguyện
- tạo journal phóng sanh

### Wisdom & QA
- publish hoặc gỡ entry chính thống
- cập nhật mapping bản dịch hoặc media official

## Những gì một audit log tối thiểu phải có

- `actor`
  - user id hoặc system actor
- `action`
  - động từ rõ, ví dụ `post.publish`, `moderation.report.submit`
- `entityType`
  - ví dụ `posts`, `moderationReports`, `guestbookEntries`
- `entityId`
  - internal id nếu có
- `publicId`
  - khi entity có public identity
- `correlationId`
  - để nối request với queue (hàng đợi xử lý)/job và log hệ thống
- `metadata`
  - context gọn nhưng đủ điều tra

### Metadata minimums

`metadata` không được là blob mơ hồ kiểu `{ note: "updated" }`.
Tối thiểu phải ưu tiên các trường sau khi có liên quan:

- request origin (`web`, `admin`, `system`, `worker`, `webhook`)
- route key hoặc use-case key
- moderation reason / publish reason / support reason
- source family / source code / import job id với wisdom-ingestion
- feature flag key nếu action đụng rollout
- dependency fallback context nếu action là degraded path (ví dụ search fallback)

### Moderation audit metadata profile

Các action moderation không được log metadata mơ hồ.
Tối thiểu:

- `reasonCode`
- `decisionType`
- `targetType`
- `targetPublicId`
- `reportPublicId`
- `resolutionEffect`
- `noteSafe` nếu có

Không log:
- raw IP
- raw secret/token
- raw reporter private note nếu không cần điều tra

## Snapshot trước/sau

- Với các thay đổi nội dung quan trọng, nên lưu:
  - `before`
  - `after`
  - `changedFields`
- Không cần copy toàn bộ document nếu quá lớn; ưu tiên field thay đổi có ý nghĩa.
- field ưu tiên khi chọn `before` / `after` / `changedFields`:
  - status / publish state
  - owner / actor-sensitive fields
  - slug / route-facing identifiers
  - permissions / role / visibility
  - linked entity refs có ảnh hưởng public surface
- Với dữ liệu nhạy cảm:
  - không log password
  - không log token reset
  - không log IP thô nếu policy hiện tại dùng hash

## Quan hệ giữa audit log và module owner

- Module owner chịu trách nhiệm append audit cho canonical write-path của mình.
- Module downstream chỉ log phần control-plane (lớp điều phối hệ thống) của chính nó.

Ví dụ:
- Content publish log ở content service (lớp xử lý nghiệp vụ).
- Search chỉ log dispatcher/execution batch hoặc sync failure của index flow.
- Notification chỉ log job/subscription, không log lại toàn bộ nội dung canonical của post.

## Mức độ bắt buộc theo loại hành động

| Hành động | Audit bắt buộc | Ghi chú |
|---|---|---|
| Public content publish/update | Có | Phải log actor, publicId, changedFields |
| Community submit/report | Có | Phải có correlationId và anti-spam context |
| Moderation decision | Có | Phải log report id, target entity, decision |
| User profile self-update | Có | Có thể log nhẹ hơn admin action |
| Search query đọc thường | Không | Chỉ cần metrics, không cần audit từng query |
| Push dispatch từng recipient | Không bắt buộc | Job record là control-plane (lớp điều phối hệ thống) chính |

## Mapping khuyến nghị cho action names

- `auth.register`
- `auth.profile.update`
- `user.role.change`
- `post.create`
- `post.publish`
- `post.update.published`
- `community.post.submit`
- `community.comment.submit`
- `guestbook.submit`
- `practice-log.upsert`
- `sutra-progress.upsert`
- `ngoihanho.create`
- `ngoihanho.complete`
- `ngoihanho.offer`
- `moderation.report.submit`
- `moderation.report.resolve`
- `search.reindex.batch`
- `search.sync.failure`
- `event.publish`
- `vow.create`
- `vow.pause`
- `vow.fulfill`
- `life-release.log`
- `wisdom.entry.publish`
- `qa.entry.publish`
- `push.subscription.create`
- `push.subscription.deactivate`
- `push.job.create`
- `push.job.complete`
- `push.job.fail`

## Chính sách giữ dữ liệu

- Audit log nên giữ lâu hơn application job logs.
- Job log có thể được dọn theo retention ngắn hơn nếu vẫn giữ được audit event cốt lõi.
- Khi có tranh chấp cộng đồng hoặc sai nội dung public, audit trail phải đủ để reconstruct ai đã đổi gì.
- retention baseline:
  - `0-30 ngày`: full-fidelity queryable
  - `31-365 ngày`: vẫn giữ full audit row, nhưng analytics/reporting chỉ nên đọc qua index/filter phù hợp
  - `< 1 năm`: không được xoá audit_logs chuẩn nếu chưa có policy superseding rõ

## Enforcement tối thiểu

- Mọi PR thêm canonical write-path mới phải cập nhật file này hoặc domain use-case liên quan nếu action audit thay đổi.
- Mọi test cho write-path bắt buộc audit phải chứng minh được audit append xảy ra ở service boundary, không chỉ ở UI.
- Không được xem write-path là implementation-ready nếu chưa map được action name tương ứng sang `audit_logs` hoặc helper owner trong `apps/api/src/platform/audit/*`.
- Review checklist cho auth, upload, moderation, publish, assisted-entry phải có câu hỏi riêng: "audit event nào được append và append ở đâu?"

## Notes for AI/codegen

- Đừng thêm audit ở UI rồi tưởng là đủ.
- Đừng log secret, token, raw password, IP thô khi policy đang dùng hash.
- Đừng bỏ audit ở các flow "chỉ là submit form" nếu flow đó tạo canonical record (bản ghi chuẩn gốc).

---

## Immutable Audit Trail (Tamper-Proof)

Section này chốt yêu cầu bảo vệ tính toàn vẹn của audit log — không ai có thể xóa, sửa, hoặc làm giả lịch sử.

### Nguyên tắc bất biến

1. **Append-only**: Audit logs chỉ được INSERT, không bao giờ UPDATE hoặc DELETE
2. **Hash chain**: Mỗi entry link với entry trước bằng cryptographic hash
3. **Separate storage**: Audit data ở table/schema riêng, không chung với business data
4. **Access control**: Chỉ audit service được INSERT, không role nào được UPDATE/DELETE

### Schema thiết kế

```sql
-- Separate schema cho audit (isolation)
CREATE SCHEMA IF NOT EXISTS audit;

-- Main audit table with hash chain
CREATE TABLE audit.logs (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Business fields
  actor_type VARCHAR(20) NOT NULL,
  actor_id VARCHAR(36),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(36),
  public_id VARCHAR(36),
  correlation_id VARCHAR(36),
  metadata JSONB,
  ip_address_hash VARCHAR(64),  -- Hashed, không raw
  user_agent TEXT,
  
  -- Integrity fields
  sequence_number BIGINT NOT NULL,  -- Monotonic sequence cho detection
  previous_hash VARCHAR(64),  -- SHA-256 của row trước
  row_hash VARCHAR(64) NOT NULL,  -- SHA-256 của row này
  
  -- Constraints
  CONSTRAINT audit_logs_sequence_unique UNIQUE (sequence_number),
  CONSTRAINT audit_logs_action_check CHECK (action ~ '^[a-z0-9._-]+$')
);

-- Index cho query thường dùng
CREATE INDEX idx_audit_logs_actor ON audit.logs(actor_id, created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit.logs(resource, resource_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit.logs(action, created_at DESC);
CREATE INDEX idx_audit_logs_correlation ON audit.logs(correlation_id) WHERE correlation_id IS NOT NULL;

-- Revoke all dangerous permissions
REVOKE UPDATE, DELETE ON audit.logs FROM PUBLIC;
REVOKE UPDATE, DELETE ON audit.logs FROM pmtl_app;

-- Only allow INSERT through dedicated role
CREATE ROLE audit_writer;
GRANT INSERT ON audit.logs TO audit_writer;
GRANT USAGE ON SCHEMA audit TO audit_writer;
GRANT USAGE, SELECT ON SEQUENCE audit.logs_id_seq TO audit_writer;

-- App role chỉ được SELECT
GRANT SELECT ON audit.logs TO pmtl_app;
GRANT USAGE ON SCHEMA audit TO pmtl_app;
```

### Hash chain implementation

```typescript
// apps/api/src/platform/audit/audit-integrity.service.ts
import { createHash } from "crypto";
import type { PrismaClient } from "../../generated/prisma/client.js";

export interface AuditRowData {
  actorType: string;
  actorId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  publicId?: string;
  correlationId?: string;
  metadata?: Record<string, unknown>;
  ipAddressHash?: string;
  userAgent?: string;
}

export function computeRowHash(
  sequenceNumber: bigint,
  previousHash: string | null,
  data: AuditRowData,
  createdAt: Date,
): string {
  const payload = JSON.stringify({
    seq: sequenceNumber.toString(),
    prev: previousHash,
    ts: createdAt.toISOString(),
    ...data,
  });
  
  return createHash("sha256").update(payload).digest("hex");
}

export function hashIpAddress(ip: string): string {
  // One-way hash với salt cố định (hoặc pepper từ env)
  const salt = process.env.AUDIT_IP_SALT || "pmtl-audit-2026";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export async function getLastAuditEntry(prisma: PrismaClient) {
  return prisma.$queryRaw<Array<{ sequence_number: bigint; row_hash: string }>>`
    SELECT sequence_number, row_hash 
    FROM audit.logs 
    ORDER BY sequence_number DESC 
    LIMIT 1
  `.then((rows) => rows[0] ?? null);
}

export async function verifyChainIntegrity(
  prisma: PrismaClient,
  fromSeq: bigint,
  toSeq: bigint,
): Promise<{ valid: boolean; brokenAt?: bigint }> {
  const rows = await prisma.$queryRaw<Array<{
    sequence_number: bigint;
    previous_hash: string | null;
    row_hash: string;
  }>>`
    SELECT sequence_number, previous_hash, row_hash
    FROM audit.logs
    WHERE sequence_number BETWEEN ${fromSeq} AND ${toSeq}
    ORDER BY sequence_number ASC
  `;
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i].previous_hash !== rows[i - 1].row_hash) {
      return { valid: false, brokenAt: rows[i].sequence_number };
    }
  }
  
  return { valid: true };
}
```

### Audit service với hash chain

```typescript
// apps/api/src/platform/audit/immutable-audit.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { computeRowHash, getLastAuditEntry, hashIpAddress } from "./audit-integrity.service.js";
import type { AuditAction, AuditActorType } from "./audit.schemas.js";

@Injectable()
export class ImmutableAuditService {
  private readonly logger = new Logger(ImmutableAuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async append(
    actorType: AuditActorType,
    actorId: string | undefined,
    action: AuditAction,
    resource: string,
    resourceId?: string,
    metadata?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string,
    correlationId?: string,
  ) {
    // Get last entry for chain linking
    const lastEntry = await getLastAuditEntry(this.prisma);
    const nextSeq = lastEntry ? lastEntry.sequence_number + 1n : 1n;
    const previousHash = lastEntry?.row_hash ?? null;
    
    const createdAt = new Date();
    const ipAddressHash = ipAddress ? hashIpAddress(ipAddress) : undefined;
    
    const rowData = {
      actorType,
      actorId,
      action,
      resource,
      resourceId,
      metadata,
      ipAddressHash,
      userAgent,
      correlationId,
    };
    
    const rowHash = computeRowHash(nextSeq, previousHash, rowData, createdAt);
    
    // Insert với raw query để dùng audit schema
    await this.prisma.$executeRaw`
      INSERT INTO audit.logs (
        created_at, actor_type, actor_id, action, resource, resource_id,
        metadata, ip_address_hash, user_agent, correlation_id,
        sequence_number, previous_hash, row_hash
      ) VALUES (
        ${createdAt}, ${actorType}, ${actorId}, ${action}, ${resource}, ${resourceId},
        ${metadata ? JSON.stringify(metadata) : null}::jsonb, ${ipAddressHash}, ${userAgent}, ${correlationId},
        ${nextSeq}, ${previousHash}, ${rowHash}
      )
    `;
    
    this.logger.debug({
      msg: "audit.appended",
      seq: nextSeq.toString(),
      action,
      resource,
    });
    
    return { sequenceNumber: nextSeq, rowHash };
  }
}
```

### Verification job

```typescript
// scripts/verify-audit-chain.ts
import { PrismaClient } from "@prisma/client";
import { verifyChainIntegrity } from "../apps/api/src/platform/audit/audit-integrity.service.js";
import pino from "pino";

const prisma = new PrismaClient();
const logger = pino({ name: "audit-chain-verify" });

async function main() {
  const BATCH_SIZE = 10000n;
  
  const lastSeq = await prisma.$queryRaw<Array<{ max: bigint }>>`
    SELECT COALESCE(MAX(sequence_number), 0) as max FROM audit.logs
  `.then((r) => r[0].max);
  
  logger.info({ msg: "verification.start", lastSeq: lastSeq.toString() });
  
  let currentSeq = 1n;
  while (currentSeq <= lastSeq) {
    const toSeq = currentSeq + BATCH_SIZE < lastSeq ? currentSeq + BATCH_SIZE : lastSeq;
    
    const result = await verifyChainIntegrity(prisma, currentSeq, toSeq);
    
    if (!result.valid) {
      logger.error({
        msg: "verification.FAILED",
        brokenAt: result.brokenAt?.toString(),
        range: `${currentSeq}-${toSeq}`,
      });
      process.exit(1);
    }
    
    logger.info({ msg: "verification.batch.ok", range: `${currentSeq}-${toSeq}` });
    currentSeq = toSeq + 1n;
  }
  
  logger.info({ msg: "verification.PASSED", totalEntries: lastSeq.toString() });
}

main()
  .catch((e) => {
    logger.error({ msg: "verification.error", error: e.message });
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

### Immutable audit checklist

- [ ] Audit table ở separate schema (`audit.logs`)
- [ ] `REVOKE UPDATE, DELETE` từ tất cả roles
- [ ] Dedicated `audit_writer` role chỉ có INSERT
- [ ] Hash chain với `previous_hash` và `row_hash`
- [ ] Sequence number monotonic, không gaps
- [ ] IP address hashed, không raw
- [ ] Verification job chạy định kỳ (daily)
- [ ] Alerting khi chain integrity fail
- [ ] Backup audit logs riêng biệt với business data
- [ ] Retention policy ≥ 7 năm cho audit logs
