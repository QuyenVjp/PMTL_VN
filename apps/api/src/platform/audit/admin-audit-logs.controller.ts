import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { z } from "zod";
import { RolesGuard } from "../../common/auth/roles.guard.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { NotFoundError } from "../../common/errors/app-error.js";

const auditLogListQuerySchema = z.object({
  action: z.string().optional(),
  actorId: z.string().optional(),
  resource: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

type AuditLogListQuery = z.infer<typeof auditLogListQuerySchema>;

@ApiTags("admin-audit-logs")
@Controller("admin/audit-logs")
@UseGuards(RolesGuard)
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminAuditLogsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: "Danh sách audit logs (admin)" })
  async list(@Query() rawQuery: Record<string, unknown>) {
    const query: AuditLogListQuery = auditLogListQuerySchema.parse(rawQuery);

    const where: Record<string, unknown> = {};

    if (query.action) {
      where.action = query.action;
    }
    if (query.actorId) {
      where.actorId = query.actorId;
    }
    if (query.resource) {
      where.resource = query.resource;
    }
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {
        ...(query.dateFrom && { gte: query.dateFrom }),
        ...(query.dateTo && { lte: query.dateTo }),
      };
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: query.offset,
        take: query.limit,
        select: {
          id: true,
          actorId: true,
          actorType: true,
          action: true,
          resource: true,
          resourceId: true,
          createdAt: true,
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs.map((log) => ({
        publicId: log.id,
        actorId: log.actorId,
        actorType: log.actorType,
        action: log.action,
        resourceType: log.resource,
        resourcePublicId: log.resourceId,
        occurredAt: log.createdAt,
      })),
      meta: {
        pagination: {
          total,
          limit: query.limit,
          offset: query.offset,
          hasMore: query.offset + query.limit < total,
        },
      },
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "Chi tiết audit log (admin)" })
  async detail(@Param("id") id: string) {
    const log = await this.prisma.auditLog.findUnique({
      where: { id },
      select: {
        id: true,
        actorId: true,
        actorType: true,
        action: true,
        resource: true,
        resourceId: true,
        metadata: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
      },
    });

    if (!log) {
      throw new NotFoundError("Audit log", id);
    }

    // Safe projection — strip sensitive fields from metadata
    const safeMetadata = log.metadata && typeof log.metadata === "object"
      ? Object.fromEntries(
          Object.entries(log.metadata as Record<string, unknown>).filter(
            ([key]) => !["token", "secret", "password", "hash"].includes(key),
          ),
        )
      : log.metadata;

    return {
      data: {
        publicId: log.id,
        actorId: log.actorId,
        actorType: log.actorType,
        action: log.action,
        resourceType: log.resource,
        resourcePublicId: log.resourceId,
        metadata: safeMetadata,
        occurredAt: log.createdAt,
      },
    };
  }
}
