# USE CASE: Immutable Audit Trail (Zod & Pino)
**Module:** `vows-merit`, `moderation`, `platform`  
**Phase:** 28 - Ngũ Đại Pháp Bảo Enterprise Integration  
**Source:** Buddhism in Plain Terms - Luật Nhân Quả, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

Đạo Phật dạy:
> **"Nhân quả không bao giờ sai lệch. Không ai có quyền xóa bỏ hay sửa đổi."**

### Ánh Xạ Kỹ Thuật:
Hệ thống PMTL phải bảo vệ tính **toàn vẹn dữ liệu nhân quả**:

- ❌ **TUYỆT ĐỐI KHÔNG ĐƯỢC** delete các model quan trọng (`Vow`, `LittleHouse`, `MeritLog`)
- ❌ **TUYỆT ĐỐI KHÔNG ĐƯỢC** update trực tiếp trạng thái cũ (phải thêm bản ghi mới)
- ✅ **MỌI THAY ĐỔI** phải được ghi log bằng **Pino** với context đầy đủ
- ✅ **AUDIT TRAIL** phải là **bất biến** (immutable), giống "Sổ Nam Tào"

---

## 🎯 Acceptance Criteria

### AC1: Ban `.delete()` Method For Karma Models
**GIVEN** codebase sử dụng Prisma  
**WHEN** architect review repository layer  
**THEN** 
- **CẤM HOÀN TOÀN** import `.delete()` cho các model:
  ```typescript
  // ❌ STRICTLY FORBIDDEN:
  prisma.vow.delete()
  prisma.littleHouse.delete()
  prisma.meritLog.delete()
  prisma.lifeReleaseEvent.delete()
  prisma.recitationPrescription.delete()
  ```

### AC2: State Transition Pattern (Soft Updates)
**GIVEN** cần update trạng thái của Vow từ "Pending" → "Completed"  
**WHEN** update needed  
**THEN** 
- **KHÔNG UPDATE trực tiếp**, thay vào đó:
  ```typescript
  // ❌ WRONG:
  await prisma.vow.update({
    where: { id },
    data: { status: 'COMPLETED' }
  });
  
  // ✅ CORRECT:
  await prisma.vow.update({
    where: { id },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      
      // Keep history
      previousStatus: oldVow.status,
      statusHistory: {
        // Append new transition
        ...oldVow.statusHistory,
        [new Date().toISOString()]: {
          from: oldVow.status,
          to: 'COMPLETED',
          reason: <transition_reason>
        }
      }
    }
  });
  ```

### AC3: Immutable Audit Log For Every Action
**GIVEN** bất kỳ hành động quan trọng (create, update, revoke)  
**WHEN** execute  
**THEN** 
- **Bắt buộc** ghi Pino log với context:
  ```typescript
  logger.info({
    eventType: 'VOW_STATUS_CHANGED',
    vowId: <uuid>,
    userId: <user_id>,
    previousStatus: 'PENDING',
    newStatus: 'COMPLETED',
    timestamp: new Date().toISOString(),
    hardware: {
      deviceId: <hashed>,
      ipAddress: <hashed>,
      userAgent: <sanitized>
    },
    context: {
      reason: 'User completed recitation',
      meritPoints: 150
    }
  });
  ```

### AC4: Prisma Schema Enforcement
**GIVEN** schema.prisma được define  
**WHEN** design karma models  
**THEN** 
- Tất cả models phải có:
  ```prisma
  model Vow {
    id              String   @id @default(cuid())
    // ... business fields
    
    // ===== IMMUTABLE AUDIT FIELDS =====
    createdAt       DateTime @default(now())
    // NO updatedAt! History tracked separately
    
    // State transition history
    status          String   @default("PENDING")
    statusHistory   Json     @default("{}")  // Nested history
    
    // Soft deletion marker
    isRevokedDueToFraud  Boolean @default(false)
    revokedAt            DateTime?
    revocationReason     String?
    
    // Indexes for audit queries
    @@index([createdAt])
    @@index([status])
    @@index([isRevokedDueToFraud])
  }
  ```

### AC5: NestJS Repository Pattern With Audit Hooks
**GIVEN** repository method called  
**WHEN** create/update operation  
**THEN** 
- Enforce via Guard:
  ```typescript
  // apps/api/src/platform/guards/immutable-audit.guard.ts
  
  @Injectable()
  export class ImmutableAuditGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      
      // Detect if trying to .delete() a karma model
      const query = request.body._prismaQuery;
      if (query.includes('.delete()')) {
        throw new ForbiddenException({
          message: "Nhân quả không bao giờ bị xóa. Hệ thống không cho phép delete().",
          code: "IMMUTABLE_KARMA_VIOLATION"
        });
      }
      
      return true;
    }
  }
  ```

### AC6: Pino Logger Configuration
**GIVEN** app bootstrap  
**WHEN** setup logger  
**THEN** 
- Configure Pino với immutable requirements:
  ```typescript
  // apps/api/src/main.ts
  
  const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    },
    // Immutable audit trail
    serializers: {
      req: (req) => ({
        id: req.id,
        method: req.method,
        path: req.path,
        userAgent: hashForPrivacy(req.headers['user-agent']),
        ip: hashForPrivacy(req.ip)
      }),
      res: (res) => ({
        statusCode: res.statusCode,
        responseTime: res.responseTime
      })
    }
  });
  ```

### AC7: Audit Trail Storage (Separate Schema)
**GIVEN** immutable audit needed  
**WHEN** model changes  
**THEN** 
- Store in separate table:
  ```prisma
  model AuditTrail {
    id              String   @id @default(cuid())
    entityType      String   // 'VOW', 'LITTLEHOUSE', etc.
    entityId        String
    action          String   // 'CREATE', 'UPDATE', 'REVOKE'
    
    // Before/After snapshots
    previousState   Json?
    newState        Json
    changedFields   String[]
    
    // Who & When
    actorUserId     String?
    actorType       String   // 'USER', 'SYSTEM', 'ADMIN'
    timestamp       DateTime @default(now())
    
    // Context
    reason          String?
    ipAddress       String?  // Hashed
    deviceId        String?  // Hashed
    
    // Immutability marker
    isCanonical     Boolean  @default(true)
    
    @@index([entityType, entityId, timestamp])
    @@index([timestamp])
    @@index([action])
  }
  ```

### AC8: Query-Time Integrity Check
**GIVEN** API endpoint call  
**WHEN** retrieve karma data  
**THEN** 
- Always check audit trail:
  ```typescript
  async getVowWithAudit(vowId: string) {
    const vow = await prisma.vow.findUnique({
      where: { id: vowId }
    });
    
    const auditTrail = await prisma.auditTrail.findMany({
      where: {
        entityType: 'VOW',
        entityId: vowId
      },
      orderBy: { timestamp: 'asc' }
    });
    
    // Verify integrity
    if (auditTrail.length > 0 && !vow) {
      logger.error({
        message: 'INTEGRITY VIOLATION: Vow deleted but audit trail exists',
        vowId,
        auditCount: auditTrail.length
      });
      throw new InternalServerErrorException("Data integrity compromised");
    }
    
    return { vow, auditTrail };
  }
  ```

---

## 🔧 Technical Notes

### Repository Pattern With Immutability
```typescript
// Location: apps/api/src/shared/repositories/karma.repository.ts

@Injectable()
export abstract class KarmaRepository<T> {
  // ❌ NO delete() method at all!
  // async delete(id: string) { FORBIDDEN }
  
  // ✅ Only soft updates with audit
  async updateWithAudit(
    id: string,
    updates: Partial<T>,
    reason: string
  ): Promise<T> {
    const oldEntity = await this.findById(id);
    
    const newEntity = await this.update(id, {
      ...updates,
      statusHistory: {
        ...oldEntity.statusHistory,
        [new Date().toISOString()]: {
          changes: updates,
          reason
        }
      }
    });
    
    // Immutable audit
    logger.info({
      eventType: 'ENTITY_UPDATED',
      entityType: this.constructor.name,
      entityId: id,
      previousState: oldEntity,
      newState: newEntity,
      reason,
      timestamp: new Date().toISOString()
    });
    
    return newEntity;
  }
}
```

### Validation Pipe For Delete Prevention
```typescript
// apps/api/src/shared/pipes/immutable-validation.pipe.ts

@Injectable()
export class ImmutableValidationPipe implements PipeTransform {
  KARMA_MODELS = ['Vow', 'LittleHouse', 'MeritLog', 'LifeReleaseEvent'];
  
  transform(value: any) {
    if (this.isDeleteOperation(value)) {
      const model = this.getModel(value);
      if (this.KARMA_MODELS.includes(model)) {
        throw new ForbiddenException(
          `Model ${model} không được phép xóa. Nhân quả là bất biến.`
        );
      }
    }
    return value;
  }
  
  private isDeleteOperation(value: any): boolean {
    return value._method === 'DELETE' || value._operation === 'delete';
  }
}
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Luật Nhân Quả Bất Biến
- **Technical Reference:** Event Sourcing pattern, Audit Trail design
- **Hướng dẫn thực hành:** Sổ Nam Tào (Record of Life & Death) metaphor

---

## 🏷️ Tags
`#phase-28` `#ngu-dai-phap-bao` `#immutable-audit` `#event-sourcing` `#pino` `#zod` `#karma-integrity` `#platform`
