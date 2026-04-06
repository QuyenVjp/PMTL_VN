import { Module } from "@nestjs/common";
import { CommunityController, AdminCommunityController, GuestbookController } from "./community.controller.js";
import { CommunityRepository } from "./community.repository.js";
import { CommunityService } from "./community.service.js";
import { AuditModule } from "../../platform/audit/audit.module.js";
import { DharmaComplianceModule } from "../dharma-compliance/dharma-compliance.module.js";

@Module({
  imports: [AuditModule, DharmaComplianceModule],
  controllers: [CommunityController, AdminCommunityController, GuestbookController],
  providers: [CommunityService, CommunityRepository],
  exports: [CommunityService],
})
export class CommunityModule {}
