import { Module } from "@nestjs/common";
import { CommunityController, AdminCommunityController } from "./community.controller.js";
import { CommunityService } from "./community.service.js";
import { AuditModule } from "../../platform/audit/audit.module.js";

@Module({
  imports: [AuditModule],
  controllers: [CommunityController, AdminCommunityController],
  providers: [CommunityService],
  exports: [CommunityService],
})
export class CommunityModule {}
