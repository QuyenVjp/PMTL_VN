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
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";
import { AdminAuditLogsService } from "./admin-audit-logs.service.js";

const auditLogListQuerySchema = z.object({
  action: z.string().optional(),
  actorId: z.string().optional(),
  resource: z.string().optional(),
  resourceId: z.string().optional(),
  correlationId: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

type AuditLogListQuery = z.infer<typeof auditLogListQuerySchema>;

/**
 * Admin audit read controller — validates the query (Zod) and delegates to the
 * service. All where-construction, projection, and metadata redaction live in
 * AdminAuditLogsService; the controller imports no Prisma types (Plans 4.6).
 */
@ApiTags("admin-audit-logs")
@Controller("admin/audit-logs")
@UseGuards(RolesGuard)
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminAuditLogsController {
  constructor(private readonly service: AdminAuditLogsService) {}

  @Get()
  @ApiOperation({ summary: "Danh sách audit logs (admin)" })
  async list(@Query(ZodValidate(auditLogListQuerySchema)) query: AuditLogListQuery) {
    return this.service.list(query);
  }

  @Get(":publicId")
  @ApiOperation({ summary: "Chi tiết audit log (admin)" })
  async detail(@Param("publicId") publicId: string) {
    return this.service.detail(publicId);
  }
}
