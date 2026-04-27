import { Module } from "@nestjs/common";

import { AuditModule } from "../../../platform/audit/audit.module.js";
import { AdminLifeReleaseContentController, LifeReleaseContentController } from "./life-release.controller.js";
import { LifeReleaseContentService } from "./life-release.service.js";

@Module({
  imports: [AuditModule],
  controllers: [LifeReleaseContentController, AdminLifeReleaseContentController],
  providers: [LifeReleaseContentService],
  exports: [LifeReleaseContentService],
})
export class LifeReleaseContentModule {}
