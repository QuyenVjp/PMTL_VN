import {
  Controller,
  Get,
  Patch,
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
import { AdminUsersService } from "./admin-users.service.js";
import {
  adminUserListQuerySchema,
  adminUserAuditQuerySchema,
  adminCreateUserSchema,
  adminUpdateProfileSchema,
  adminChangeRoleSchema,
  adminBlockUserSchema,
  type AdminUserListQuery,
  type AdminUserAuditQuery,
  type AdminCreateUserInput,
  type AdminUpdateProfileInput,
  type AdminChangeRoleInput,
  type AdminBlockUserInput,
} from "./admin-users.schemas.js";

@ApiTags("admin-users")
@Controller("admin/users")
@UseGuards(RolesGuard)
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: "Danh sách người dùng (admin)" })
  async list(@Query() rawQuery: Record<string, unknown>) {
    const query: AdminUserListQuery = adminUserListQuerySchema.parse(rawQuery);
    return this.adminUsersService.list(query);
  }

  @Post()
  @Roles("SUPER_ADMIN")
  @ApiOperation({ summary: "Tạo tài khoản phụng sự viên (super-admin)" })
  async create(
    @Body(ZodValidate(adminCreateUserSchema)) input: AdminCreateUserInput,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.adminUsersService.createUser(input, actor.role, {
      actorId: actor.id,
      actorType: "admin",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Get(":publicId")
  @ApiOperation({ summary: "Chi tiết người dùng (admin)" })
  async detail(@Param("publicId") publicId: string) {
    return this.adminUsersService.getDetail(publicId);
  }

  @Patch(":publicId/profile")
  @ApiOperation({ summary: "Cập nhật hồ sơ người dùng (admin)" })
  async updateProfile(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(adminUpdateProfileSchema)) input: AdminUpdateProfileInput,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.adminUsersService.updateProfile(publicId, input, {
      actorId: actor.id,
      actorType: "admin",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Patch(":publicId/role")
  @ApiOperation({ summary: "Thay đổi quyền người dùng (admin)" })
  async changeRole(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(adminChangeRoleSchema)) input: AdminChangeRoleInput,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.adminUsersService.changeRole(publicId, input, actor.role, {
      actorId: actor.id,
      actorType: "admin",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Post(":publicId/block")
  @ApiOperation({ summary: "Khóa người dùng (admin)" })
  async block(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(adminBlockUserSchema)) input: AdminBlockUserInput,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.adminUsersService.blockUser(publicId, input.reason, {
      actorId: actor.id,
      actorType: "admin",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Post(":publicId/unblock")
  @ApiOperation({ summary: "Mở khóa người dùng (admin)" })
  async unblock(
    @Param("publicId") publicId: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.adminUsersService.unblockUser(publicId, {
      actorId: actor.id,
      actorType: "admin",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Get(":publicId/audit-history")
  @ApiOperation({ summary: "Lịch sử audit của người dùng (admin)" })
  async auditHistory(
    @Param("publicId") publicId: string,
    @Query() rawQuery: Record<string, unknown>,
  ) {
    const query: AdminUserAuditQuery = adminUserAuditQuerySchema.parse(rawQuery);
    return this.adminUsersService.getAuditHistory(publicId, query);
  }

  @Get(":publicId/practice-stats")
  @ApiOperation({ summary: "Thống kê tu tập của người dùng (admin)" })
  async practiceStats(@Param("publicId") publicId: string) {
    return this.adminUsersService.getPracticeStats(publicId);
  }

  @Post(":publicId/sessions/revoke-all")
  @Roles("SUPER_ADMIN")
  @ApiOperation({ summary: "Thu hồi tất cả phiên của người dùng (super-admin)" })
  async revokeAllSessions(
    @Param("publicId") publicId: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.adminUsersService.revokeAllUserSessions(publicId, {
      actorId: actor.id,
      actorType: "admin",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }
}
