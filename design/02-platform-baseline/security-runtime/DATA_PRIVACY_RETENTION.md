# DATA_PRIVACY_RETENTION — Chính sách Quyền riêng tư & Lưu giữ dữ liệu

File này chốt chính sách bảo vệ dữ liệu cá nhân cho PMTL_VN.
Dữ liệu người cao tuổi và người tu tập là cực kỳ nhạy cảm — cần bảo vệ nghiêm ngặt.

> **Related**: `AUDIT_POLICY.md`, `SECURITY_POLICY.md`, `SECRET_MANAGEMENT.md`

---

## 1. Nguyên tắc cốt lõi

1. **Thu thập tối thiểu**: Chỉ thu thập dữ liệu thật sự cần thiết cho chức năng
2. **Mục đích rõ ràng**: Mỗi loại dữ liệu phải có mục đích cụ thể được khai báo
3. **Lưu giữ có thời hạn**: Dữ liệu có retention period rõ ràng
4. **Quyền truy cập**: User có quyền xem, sửa, xóa dữ liệu của mình
5. **Bảo mật lớp**: PII được mã hóa ở rest và in transit

---

## 2. PDPA Vietnam Compliance

### 2.1 Nghị định 13/2023/NĐ-CP yêu cầu

| Yêu cầu | PMTL Implementation |
|---------|---------------------|
| Thông báo thu thập | Privacy policy page + consent banner |
| Mục đích xử lý | Khai báo trong policy và consent form |
| Quyền truy cập | `/api/me/data-export` endpoint |
| Quyền xóa | `/api/me/delete-account` endpoint |
| Bảo mật | Encryption at rest + TLS 1.3 |
| Thông báo vi phạm | 72h notification SLA |

### 2.2 Các loại dữ liệu và cơ sở pháp lý

| Loại dữ liệu | Cơ sở pháp lý | Retention |
|--------------|---------------|-----------|
| Email, tên hiển thị | Consent | Account lifetime + 30 ngày |
| Practice logs | Consent + Legitimate interest | 7 năm (audit) |
| Ngôi Nhà Nhỏ data | Consent | User-controlled delete |
| Session data | Legitimate interest | 90 ngày |
| Audit logs | Legal obligation | 7 năm |
| Support tickets | Contract | 3 năm |
| Analytics (anonymized) | Legitimate interest | 2 năm |

---

## 3. Phân loại dữ liệu (Data Classification)

### 3.1 Classification levels

| Level | Description | Examples | Storage requirement |
|-------|-------------|----------|---------------------|
| **PUBLIC** | Hiển thị công khai | Published posts, public profile name | Standard |
| **INTERNAL** | Chỉ hệ thống xử lý | Internal IDs, slugs | Standard |
| **CONFIDENTIAL** | PII cơ bản | Email, display name, preferences | Encrypted at rest |
| **SENSITIVE** | PII nhạy cảm | Practice logs, spiritual data | Column-level encryption |
| **RESTRICTED** | Cực kỳ nhạy cảm | Password hashes, tokens | Separate storage + HSM |

### 3.2 Column-level classification

```prisma
// schema.prisma annotations (conceptual)
model User {
  id          String   @id // INTERNAL
  publicId    String   @unique // PUBLIC
  email       String   @unique // CONFIDENTIAL - encrypted
  displayName String   // CONFIDENTIAL
  passwordHash String  // RESTRICTED - never expose
  
  // Spiritual data - SENSITIVE
  practicePreferences Json? // SENSITIVE - encrypted
}

model PracticeLog {
  id        String   @id // INTERNAL
  userId    String   // CONFIDENTIAL
  content   String   // SENSITIVE - encrypted
  mood      String?  // SENSITIVE
  createdAt DateTime // INTERNAL
}
```

---

## 4. Consent Management

### 4.1 Consent table schema

```sql
CREATE TABLE user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- Consent types
  consent_type VARCHAR(50) NOT NULL,
  -- 'marketing_email', 'analytics', 'practice_data', 'community_features'
  
  granted BOOLEAN NOT NULL,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  
  -- Audit trail
  ip_address_hash VARCHAR(64),
  user_agent TEXT,
  consent_version VARCHAR(20) NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, consent_type)
);

CREATE INDEX idx_user_consents_user ON user_consents(user_id);
```

### 4.2 Consent service

```typescript
// apps/api/src/platform/privacy/consent.service.ts
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";

export type ConsentType = 
  | "marketing_email"
  | "analytics"
  | "practice_data"
  | "community_features"
  | "third_party_sharing";

const CONSENT_VERSION = "2026-03-01";

@Injectable()
export class ConsentService {
  constructor(private readonly prisma: PrismaService) {}

  async grantConsent(
    userId: string,
    consentType: ConsentType,
    ipAddressHash?: string,
    userAgent?: string,
  ) {
    return this.prisma.userConsent.upsert({
      where: { userId_consentType: { userId, consentType } },
      create: {
        userId,
        consentType,
        granted: true,
        grantedAt: new Date(),
        ipAddressHash,
        userAgent,
        consentVersion: CONSENT_VERSION,
      },
      update: {
        granted: true,
        grantedAt: new Date(),
        revokedAt: null,
        ipAddressHash,
        userAgent,
        consentVersion: CONSENT_VERSION,
      },
    });
  }

  async revokeConsent(userId: string, consentType: ConsentType) {
    return this.prisma.userConsent.update({
      where: { userId_consentType: { userId, consentType } },
      data: {
        granted: false,
        revokedAt: new Date(),
      },
    });
  }

  async getUserConsents(userId: string) {
    return this.prisma.userConsent.findMany({
      where: { userId },
      select: {
        consentType: true,
        granted: true,
        grantedAt: true,
        revokedAt: true,
        consentVersion: true,
      },
    });
  }

  async hasConsent(userId: string, consentType: ConsentType): Promise<boolean> {
    const consent = await this.prisma.userConsent.findUnique({
      where: { userId_consentType: { userId, consentType } },
    });
    return consent?.granted ?? false;
  }
}
```

---

## 5. Column-Level Encryption (PII)

### 5.1 Encryption strategy

```typescript
// apps/api/src/platform/privacy/encryption.service.ts
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const TAG_LENGTH = 16;

export class EncryptionService {
  private readonly masterKey: string;

  constructor() {
    this.masterKey = process.env.PII_ENCRYPTION_KEY!;
    if (!this.masterKey || this.masterKey.length < 32) {
      throw new Error("PII_ENCRYPTION_KEY must be at least 32 characters");
    }
  }

  async encrypt(plaintext: string): Promise<string> {
    const salt = randomBytes(SALT_LENGTH);
    const key = (await scryptAsync(this.masterKey, salt, 32)) as Buffer;
    const iv = randomBytes(IV_LENGTH);
    
    const cipher = createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plaintext, "utf8"),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    
    // Format: salt:iv:tag:encrypted (all base64)
    return [
      salt.toString("base64"),
      iv.toString("base64"),
      tag.toString("base64"),
      encrypted.toString("base64"),
    ].join(":");
  }

  async decrypt(ciphertext: string): Promise<string> {
    const [saltB64, ivB64, tagB64, encryptedB64] = ciphertext.split(":");
    
    const salt = Buffer.from(saltB64, "base64");
    const iv = Buffer.from(ivB64, "base64");
    const tag = Buffer.from(tagB64, "base64");
    const encrypted = Buffer.from(encryptedB64, "base64");
    
    const key = (await scryptAsync(this.masterKey, salt, 32)) as Buffer;
    
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8");
  }
}
```

### 5.2 Encrypted fields middleware

```typescript
// apps/api/src/platform/privacy/encrypted-fields.middleware.ts
import { Injectable } from "@nestjs/common";
import { Prisma } from "../../generated/prisma/client.js";
import { EncryptionService } from "./encryption.service.js";

// Fields that need encryption
const ENCRYPTED_FIELDS: Record<string, string[]> = {
  User: ["email"],
  PracticeLog: ["content", "mood"],
  MeritJournal: ["description"],
};

@Injectable()
export class EncryptedFieldsMiddleware {
  constructor(private readonly encryption: EncryptionService) {}

  middleware(): Prisma.Middleware {
    return async (params, next) => {
      const fields = ENCRYPTED_FIELDS[params.model ?? ""];
      
      if (fields && params.action === "create" || params.action === "update") {
        for (const field of fields) {
          if (params.args.data?.[field]) {
            params.args.data[field] = await this.encryption.encrypt(
              params.args.data[field]
            );
          }
        }
      }
      
      const result = await next(params);
      
      // Decrypt on read
      if (fields && result && typeof result === "object") {
        for (const field of fields) {
          if (result[field] && typeof result[field] === "string") {
            try {
              result[field] = await this.encryption.decrypt(result[field]);
            } catch {
              // Log but don't fail - might be old unencrypted data
            }
          }
        }
      }
      
      return result;
    };
  }
}
```

---

## 6. Retention Policies

### 6.1 Retention matrix

| Data type | Retention | After expiry | Cleanup job |
|-----------|-----------|--------------|-------------|
| **Session tokens** | 90 ngày | Hard delete | Daily |
| **Rate limit records** | 24 giờ | Hard delete | Hourly |
| **Email verification tokens** | 24 giờ | Hard delete | Hourly |
| **Password reset tokens** | 1 giờ | Hard delete | Hourly |
| **Practice logs** | 7 năm | Archive then delete | Monthly |
| **Audit logs** | 7 năm | Archive to cold storage | Yearly |
| **User accounts (inactive)** | 2 năm after last login | Soft delete + anonymize | Monthly |
| **Deleted user data** | 30 ngày | Hard delete | Weekly |
| **Analytics events** | 2 năm | Aggregate then delete | Monthly |
| **Support tickets** | 3 năm | Archive | Yearly |

### 6.2 Cleanup jobs

```typescript
// apps/api/src/platform/privacy/retention.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../../common/prisma/prisma.service.js";

@Injectable()
export class RetentionService {
  private readonly logger = new Logger(RetentionService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredTokens() {
    const now = new Date();
    
    const deleted = await this.prisma.session.deleteMany({
      where: { expiresAt: { lt: now } },
    });
    
    this.logger.log({ msg: "retention.sessions.cleaned", count: deleted.count });
    
    await this.prisma.rateLimitRecord.deleteMany({
      where: { expiresAt: { lt: now } },
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupInactiveUsers() {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    
    // Mark as pending deletion
    const marked = await this.prisma.user.updateMany({
      where: {
        lastLoginAt: { lt: twoYearsAgo },
        status: "active",
        deletionScheduledAt: null,
      },
      data: {
        status: "pending_deletion",
        deletionScheduledAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    
    this.logger.log({ msg: "retention.users.marked_deletion", count: marked.count });
  }

  @Cron(CronExpression.EVERY_WEEK)
  async hardDeleteScheduledUsers() {
    const now = new Date();
    
    const users = await this.prisma.user.findMany({
      where: {
        status: "pending_deletion",
        deletionScheduledAt: { lt: now },
      },
      select: { id: true },
    });
    
    for (const user of users) {
      await this.anonymizeAndDelete(user.id);
    }
    
    this.logger.log({ msg: "retention.users.deleted", count: users.length });
  }

  private async anonymizeAndDelete(userId: string) {
    await this.prisma.$transaction([
      // Anonymize audit logs (keep for legal)
      this.prisma.$executeRaw`
        UPDATE audit.logs 
        SET actor_id = 'DELETED_USER', metadata = metadata - 'email' - 'displayName'
        WHERE actor_id = ${userId}
      `,
      
      // Delete user data
      this.prisma.practiceLog.deleteMany({ where: { userId } }),
      this.prisma.meritJournal.deleteMany({ where: { userId } }),
      this.prisma.userConsent.deleteMany({ where: { userId } }),
      this.prisma.session.deleteMany({ where: { userId } }),
      
      // Finally delete user
      this.prisma.user.delete({ where: { id: userId } }),
    ]);
  }
}
```

---

## 7. User Rights (GDPR-style)

### 7.1 Data export endpoint

```typescript
// POST /api/me/data-export
// Returns: { downloadUrl: string, expiresAt: Date }

async exportUserData(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: {
      practiceLogs: true,
      meritJournals: true,
      consents: true,
      communityPosts: true,
      guestbookEntries: true,
    },
  });
  
  // Generate JSON export
  const exportData = {
    exportedAt: new Date().toISOString(),
    user: {
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt,
    },
    practiceLogs: user.practiceLogs,
    meritJournals: user.meritJournals,
    consents: user.consents,
    communityPosts: user.communityPosts.map(p => ({
      content: p.content,
      createdAt: p.createdAt,
    })),
  };
  
  // Upload to temp storage with 24h expiry
  const downloadUrl = await this.storage.uploadTemp(
    `exports/${userId}/${Date.now()}.json`,
    JSON.stringify(exportData, null, 2),
    { expiresIn: 24 * 60 * 60 },
  );
  
  return { downloadUrl, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) };
}
```

### 7.2 Account deletion endpoint

```typescript
// DELETE /api/me/account
// Requires: password confirmation + reason

async requestAccountDeletion(userId: string, password: string, reason?: string) {
  // Verify password
  const user = await this.prisma.user.findUnique({ where: { id: userId } });
  const valid = await this.auth.verifyPassword(password, user.passwordHash);
  if (!valid) throw new UnauthorizedException("Mật khẩu không đúng");
  
  // Schedule deletion (30 day grace period)
  await this.prisma.user.update({
    where: { id: userId },
    data: {
      status: "pending_deletion",
      deletionScheduledAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      deletionReason: reason,
    },
  });
  
  // Revoke all sessions
  await this.prisma.session.deleteMany({ where: { userId } });
  
  // Send confirmation email
  await this.email.sendDeletionScheduled(user.email, {
    scheduledDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    cancelUrl: `${this.config.webUrl}/cancel-deletion`,
  });
  
  return { scheduledAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) };
}
```

---

## 8. PII Redaction in Logs

### 8.1 Pino redaction config

```typescript
// apps/api/src/common/logger/logger.config.ts
export const pinoConfig = {
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.body.password",
      "req.body.email",
      "req.body.currentPassword",
      "req.body.newPassword",
      "res.headers['set-cookie']",
      "user.email",
      "*.email",
      "*.password",
      "*.passwordHash",
      "*.token",
      "*.refreshToken",
      "*.accessToken",
    ],
    censor: "[REDACTED]",
  },
};
```

---

## 9. Checklist

### 9.1 Implementation checklist

- [ ] Privacy policy page published
- [ ] Consent banner implemented
- [ ] Consent table created
- [ ] Column-level encryption for PII
- [ ] Retention jobs scheduled
- [ ] Data export endpoint working
- [ ] Account deletion endpoint working
- [ ] PII redaction in logs configured
- [ ] Encryption key in Secret Manager
- [ ] Backup encryption verified

### 9.2 Compliance checklist

- [ ] PDPA VN Nghị định 13/2023 reviewed
- [ ] Data classification documented
- [ ] Retention periods justified
- [ ] DPO contact published (if applicable)
- [ ] Breach notification procedure documented
- [ ] Third-party data sharing disclosed
- [ ] Cross-border transfer documented (if any)

---

*Owner: `design/02-platform-baseline/security-runtime/` · Last updated: 2026-03-31*
