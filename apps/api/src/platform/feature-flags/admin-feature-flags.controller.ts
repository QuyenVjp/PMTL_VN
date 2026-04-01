import {
  Controller,
  Get,
  Patch,
  Param,
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
import { FeatureFlagsService } from "./feature-flags.service.js";
import { FeatureFlagsRepository } from "./feature-flags.repository.js";
import { AuditService } from "../audit/audit.service.js";
import { NotFoundError, ValidationError } from "../../common/errors/app-error.js";
import {
  featureFlagKeySchema,
  updateFeatureFlagSchema,
  type UpdateFeatureFlagInput,
} from "./feature-flags.schemas.js";

@ApiTags("admin-feature-flags")
@Controller("admin/feature-flags")
@UseGuards(RolesGuard)
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminFeatureFlagsController {
  constructor(
    private readonly featureFlagsService: FeatureFlagsService,
    private readonly featureFlagsRepository: FeatureFlagsRepository,
    private readonly audit: AuditService,
  ) {}

  @Get()
  @ApiOperation({ summary: "Danh sách feature flags (admin)" })
  async list() {
    const flags = await this.featureFlagsService.getAll();
    return {
      data: flags.map((f) => ({
        key: f.key,
        enabled: f.enabled,
        description: f.description,
        metadata: f.metadata,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
      })),
    };
  }

  @Get(":key")
  @ApiOperation({ summary: "Chi tiết feature flag (admin)" })
  async detail(@Param("key") key: string) {
    const flag = await this.featureFlagsRepository.findByKey(key);
    if (!flag) {
      throw new NotFoundError("Feature flag", key);
    }

    return {
      data: {
        key: flag.key,
        enabled: flag.enabled,
        description: flag.description,
        metadata: flag.metadata,
        createdAt: flag.createdAt,
        updatedAt: flag.updatedAt,
      },
    };
  }

  @Patch(":key")
  @Roles("SUPER_ADMIN")
  @ApiOperation({ summary: "Cập nhật feature flag (super-admin)" })
  async update(
    @Param("key") key: string,
    @Body(ZodValidate(updateFeatureFlagSchema)) input: UpdateFeatureFlagInput,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const parsedKey = featureFlagKeySchema.safeParse(key);
    if (!parsedKey.success) {
      throw new ValidationError("Feature flag key không hợp lệ", { key });
    }

    const featureKey = parsedKey.data;
    const existing = await this.featureFlagsRepository.findByKey(key);

    const previousEnabled = existing?.enabled ?? false;

    const updated = existing
      ? await this.featureFlagsRepository.update(featureKey, input)
      : await this.featureFlagsRepository.upsert(featureKey, {
          key: featureKey,
          enabled: input.enabled ?? false,
          description: input.description,
          metadata: input.metadata,
        });

    // Refresh in-memory cache
    await this.featureFlagsService.refreshCache();

    await this.audit.append(
      {
        actorId: actor.id,
        actorType: "admin",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      },
      "admin.feature_flag.update",
      "feature_flag",
      key,
      { previousEnabled, newEnabled: updated.enabled, changes: input },
    );

    return {
      data: {
        key: updated.key,
        enabled: updated.enabled,
        description: updated.description,
        metadata: updated.metadata,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    };
  }
}
