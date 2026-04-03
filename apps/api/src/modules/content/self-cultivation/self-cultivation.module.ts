import { Module } from "@nestjs/common";

import { AuditModule } from "../../../platform/audit/audit.module.js";
import { AdminSelfCultivationController, SelfCultivationController } from "./self-cultivation.controller.js";
import { SelfCultivationService } from "./self-cultivation.service.js";

@Module({
  imports: [AuditModule],
  controllers: [SelfCultivationController, AdminSelfCultivationController],
  providers: [SelfCultivationService],
  exports: [SelfCultivationService],
})
export class SelfCultivationModule {}
