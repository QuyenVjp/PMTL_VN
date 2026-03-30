import { Module } from "@nestjs/common";
import { AdminChantingController, ChantingController } from "./chanting.controller.js";
import { ChantingService } from "./chanting.service.js";
import { ChantingRepository } from "./chanting.repository.js";
import { AuditModule } from "../../../platform/audit/audit.module.js";

@Module({
  imports: [AuditModule],
  controllers: [ChantingController, AdminChantingController],
  providers: [ChantingService, ChantingRepository],
  exports: [ChantingService],
})
export class ChantingModule {}
