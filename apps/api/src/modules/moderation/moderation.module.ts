import { Module } from "@nestjs/common";
import {
  ModerationController,
  PublicModerationController,
  AdminCommentModerationController,
} from "./moderation.controller.js";
import { ModerationService } from "./moderation.service.js";
import { ModerationRepository } from "./moderation.repository.js";
import { AuditModule } from "../../platform/audit/audit.module.js";

@Module({
  imports: [AuditModule],
  controllers: [ModerationController, PublicModerationController, AdminCommentModerationController],
  providers: [ModerationService, ModerationRepository],
  exports: [ModerationService],
})
export class ModerationModule {}
