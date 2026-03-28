import {
  Controller,
  Get,
  Delete,
  Post,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import type { Request } from "express";
import { RolesGuard } from "../../common/auth/roles.guard.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";
import type { AuthenticatedUser } from "../../common/auth/auth-request.types.js";
import { AdminSessionsService } from "./admin-sessions.service.js";
import {
  adminSessionListQuerySchema,
  adminRevokeBulkSchema,
  type AdminSessionListQuery,
  type AdminRevokeBulkInput,
} from "./admin-sessions.schemas.js";

@ApiTags("admin-sessions")
@Controller("admin/sessions")
@UseGuards(RolesGuard)
@Roles("SUPER_ADMIN")
export class AdminSessionsController {
  constructor(private readonly adminSessionsService: AdminSessionsService) {}

  @Get()
  @ApiOperation({ summary: "Danh sách phiên đăng nhập (super-admin)" })
  async list(@Query() rawQuery: Record<string, unknown>) {
    const query: AdminSessionListQuery = adminSessionListQuerySchema.parse(rawQuery);
    return this.adminSessionsService.list(query);
  }

  @Get(":sessionId")
  @ApiOperation({ summary: "Chi tiết phiên đăng nhập (super-admin)" })
  async detail(@Param("sessionId") sessionId: string) {
    return this.adminSessionsService.getDetail(sessionId);
  }

  @Delete(":sessionId")
  @ApiOperation({ summary: "Thu hồi phiên đăng nhập (super-admin)" })
  async revoke(
    @Param("sessionId") sessionId: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.adminSessionsService.revokeSession(sessionId, {
      actorId: actor.id,
      actorType: "admin",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Post("revoke-bulk")
  @ApiOperation({ summary: "Thu hồi nhiều phiên cùng lúc (super-admin)" })
  async revokeBulk(
    @Body(ZodValidate(adminRevokeBulkSchema)) input: AdminRevokeBulkInput,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.adminSessionsService.revokeBulk(input.sessionIds, {
      actorId: actor.id,
      actorType: "admin",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }
}
