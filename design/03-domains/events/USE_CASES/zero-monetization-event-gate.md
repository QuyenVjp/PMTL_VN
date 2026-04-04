# Gating Sự Kiện Zero-Monetization — Zero-Monetization Event Gate

> **Nguồn:** Lời dạy chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Mọi sự kiện Pháp hội (dharma gatherings), phóng sinh (life liberation), học tập (study circles), và tài liệu Pháp môn phải được cung cấp hoàn toàn miễn phí. Không được phép thu tiền vé, phí vật liệu, hay phí đăng ký.

Lý do: Pháp môn Tâm Linh là duyên hợp của Phật pháp. Kinh doanh bằng Phật pháp là tội đọa địa ngục. Admin phải bị chặn ngay lập tức nếu cố gắng tạo event có bất kỳ loại tiền nào.

---

## Owner module

`events` — ZeroMonetizationEventGate
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `admin` — tạo event (POST /api/events/create)
- `system` — validate monetization fields, reject if any > 0

---

## Trigger

Khi admin POST /api/events/create với eventType ∈ ['DHARMA_GATHERING', 'LIFE_LIBERATION', 'STUDY_CIRCLE', 'OTHER'].

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| ticketPrice = 0 AND materialFee = 0 AND registrationFee = 0 | ✅ Event created |
| ticketPrice > 0 OR materialFee > 0 OR registrationFee > 0 | ❌ 403 forbidden |
| Admin tries mutation after creation | ❌ 403 forbidden |
| All dharma-related materials (books, CDs, sutras, NNN) | ⚠️ Must be free |

---

## Input Contract

```typescript
enum EventType {
  DHARMA_GATHERING  = 'DHARMA_GATHERING',
  LIFE_LIBERATION   = 'LIFE_LIBERATION',
  STUDY_CIRCLE      = 'STUDY_CIRCLE',
  OTHER             = 'OTHER'
}

interface CreateEventDto {
  eventName: string                          // Required
  eventType: EventType                       // Required
  ticketPrice?: number = 0                   // Optional, defaults to 0
  materialFee?: number = 0                   // Optional, defaults to 0
  registrationFee?: number = 0               // Optional, defaults to 0
  // ... other fields (dates, descriptions, etc.) ...
}

enum MonetizationError {
  MONETIZATION_FORBIDDEN_FOR_DHARMA_EVENTS = 'monetization_forbidden_for_dharma_events'
}
```

---

## Write Path

```
POST /api/events/create
1. Validate CreateEventDto via Zod schema
2. Check monetization fields:
   → If ticketPrice > 0:
     ❌ Return 403 { code: MONETIZATION_FORBIDDEN_FOR_DHARMA_EVENTS }
   → If materialFee > 0:
     ❌ Return 403 { code: MONETIZATION_FORBIDDEN_FOR_DHARMA_EVENTS }
   → If registrationFee > 0:
     ❌ Return 403 { code: MONETIZATION_FORBIDDEN_FOR_DHARMA_EVENTS }
3. If all prices = 0 OR not provided:
   → Create Event with schema defaults (all prices @default(0))
   → Audit: events.monetization.zero-price-enforced
   → Audit: events.monetization.dharma-event-created
   → Return 201 { event, message }
4. If mutation attempt on existing event:
   → Check if any price field mutation request
   → If any price > 0: ❌ 403 forbidden
   → If all prices remain 0: ✅ Allow other fields update
```

---

## Error Response

```json
{
  "statusCode": 403,
  "code": "monetization_forbidden_for_dharma_events",
  "message": "CẤM KỴ: Mọi sự kiện Pháp hội và tài liệu của Pháp môn Tâm Linh phải được phát miễn phí để gieo duyên chúng sinh. Lấy Phật pháp kinh doanh là tội đọa địa ngục!",
  "timestamp": "2026-04-04T10:30:00Z"
}
```

---

## Prisma Schema

```prisma
// Add to schema.prisma
enum EventType {
  DHARMA_GATHERING
  LIFE_LIBERATION
  STUDY_CIRCLE
  OTHER
}

model Event {
  id              String    @id @default(cuid())
  eventName       String
  eventType       EventType
  ticketPrice     Int       @default(0)      // Immutable via @default
  materialFee     Int       @default(0)      // Immutable via @default
  registrationFee Int       @default(0)      // Immutable via @default

  // ... other fields (dates, descriptions, location, capacity, etc.) ...

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime?

  @@index([eventType])
  @@index([createdAt])
}
```

---

## NestJS Service Implementation

```typescript
// events.service.ts
import { ForbiddenException, Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@nestjs/prisma';
import { CreateEventDto } from './dto/create-event.dto';
import { AuditService } from '../audit/audit.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class EventsService {
  private logger = new Logger(EventsService.name);

  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async create(createEventDto: CreateEventDto, adminId: string) {
    // Step 1: Validate monetization fields
    const { ticketPrice = 0, materialFee = 0, registrationFee = 0, ...rest } = createEventDto;

    if (ticketPrice > 0) {
      this.logger.warn(`Admin ${adminId} attempted to set ticketPrice=${ticketPrice}`);
      throw new ForbiddenException({
        code: 'monetization_forbidden_for_dharma_events',
        message: 'CẤM KỴ: Mọi sự kiện Pháp hội và tài liệu của Pháp môn Tâm Linh phải được phát miễn phí để gieo duyên chúng sinh. Lấy Phật pháp kinh doanh là tội đọa địa ngục!',
      });
    }

    if (materialFee > 0) {
      this.logger.warn(`Admin ${adminId} attempted to set materialFee=${materialFee}`);
      throw new ForbiddenException({
        code: 'monetization_forbidden_for_dharma_events',
        message: 'CẤM KỴ: Mọi sự kiện Pháp hội và tài liệu của Pháp môn Tâm Linh phải được phát miễn phí để gieo duyên chúng sinh. Lấy Phật pháp kinh doanh là tội đọa địa ngục!',
      });
    }

    if (registrationFee > 0) {
      this.logger.warn(`Admin ${adminId} attempted to set registrationFee=${registrationFee}`);
      throw new ForbiddenException({
        code: 'monetization_forbidden_for_dharma_events',
        message: 'CẤM KỴ: Mọi sự kiện Pháp hội và tài liệu của Pháp môn Tâm Linh phải được phát miễn phí để gieo duyên chúng sinh. Lấy Phật pháp kinh doanh là tội đọa địa ngục!',
      });
    }

    // Step 2: Create event with defaults (all prices = 0)
    const event = await this.prisma.event.create({
      data: {
        ...rest,
        ticketPrice: 0,          // Explicit override
        materialFee: 0,          // Explicit override
        registrationFee: 0,      // Explicit override
      },
    });

    // Step 3: Audit
    await this.audit.log({
      action: 'events.monetization.zero-price-enforced',
      adminId,
      eventId: event.id,
      details: { eventType: event.eventType, eventName: event.eventName },
    });

    await this.audit.log({
      action: 'events.monetization.dharma-event-created',
      adminId,
      eventId: event.id,
      details: { eventType: event.eventType },
    });

    return event;
  }

  async update(eventId: string, updateEventDto: any, adminId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new BadRequestException(`Event ${eventId} not found`);
    }

    // Step 1: Block any monetization mutation
    if (updateEventDto.ticketPrice !== undefined && updateEventDto.ticketPrice > 0) {
      this.logger.warn(`Admin ${adminId} attempted to mutate ticketPrice on event ${eventId}`);
      throw new ForbiddenException({
        code: 'monetization_forbidden_for_dharma_events',
        message: 'CẤM KỴ: Mọi sự kiện Pháp hội và tài liệu của Pháp môn Tâm Linh phải được phát miễn phí để gieo duyên chúng sinh. Lấy Phật pháp kinh doanh là tội đọa địa ngục!',
      });
    }

    if (updateEventDto.materialFee !== undefined && updateEventDto.materialFee > 0) {
      this.logger.warn(`Admin ${adminId} attempted to mutate materialFee on event ${eventId}`);
      throw new ForbiddenException({
        code: 'monetization_forbidden_for_dharma_events',
        message: 'CẤM KỴ: Mọi sự kiện Pháp hội và tài liệu của Pháp môn Tâm Linh phải được phát miễn phí để gieo duyên chúng sinh. Lấy Phật pháp kinh doanh là tội đọa địa ngục!',
      });
    }

    if (updateEventDto.registrationFee !== undefined && updateEventDto.registrationFee > 0) {
      this.logger.warn(`Admin ${adminId} attempted to mutate registrationFee on event ${eventId}`);
      throw new ForbiddenException({
        code: 'monetization_forbidden_for_dharma_events',
        message: 'CẤM KỴ: Mọi sự kiện Pháp hội và tài liệu của Pháp môn Tâm Linh phải được phát miễn phí để gieo duyên chúng sinh. Lấy Phật pháp kinh doanh là tội đọa địa ngục!',
      });
    }

    // Step 2: Safe to update non-monetization fields
    const updated = await this.prisma.event.update({
      where: { id: eventId },
      data: updateEventDto,
    });

    return updated;
  }
}
```

---

## Zod DTO Validation

```typescript
// create-event.dto.ts
import { z } from 'zod';

export const CreateEventDtoSchema = z.object({
  eventName: z.string().min(1).max(255),
  eventType: z.enum(['DHARMA_GATHERING', 'LIFE_LIBERATION', 'STUDY_CIRCLE', 'OTHER']),
  ticketPrice: z.number().int().min(0).default(0).optional(),
  materialFee: z.number().int().min(0).default(0).optional(),
  registrationFee: z.number().int().min(0).default(0).optional(),
  // ... other optional fields ...
}).strict();

export type CreateEventDto = z.infer<typeof CreateEventDtoSchema>;
```

---

## Audit Log

| Action | Trigger |
|---|---|
| `events.monetization.zero-price-enforced` | Event created with all prices = 0 |
| `events.monetization.dharma-event-created` | Dharma event successfully created |
| `events.monetization.forbidden_mutation_attempt` | Admin tried to mutate price fields |

---

## Notes for Implementation

- **Immutability**: All price fields are hardcoded to 0 in Prisma schema via `@default(0)`. Service layer explicitly overrides any user input.
- **Fail-Fast**: Check monetization fields FIRST before any database operation.
- **Vietnamese Error Message**: Full dharma teaching context in error response for admin clarity.
- **Audit Logging**: Log both success (zero-price-enforced) and dharma-event-created for dharma gathering creation.
- **Update Constraints**: Block mutation on all three price fields, not just one.

---

## Related

- [CREATE_EVENT_API.md](../CONTRACTS.md) — API contract for event creation
- [zero-monetization-dharma-materials.md](../REFERENCES/dharma-material-pricing.md) — dharma materials pricing guide
