import { Module } from "@nestjs/common";
import { AdminVowsController } from "./vows-merit.controller.js";
import { VowsMeritRepository } from "./vows-merit.repository.js";
import { VowsMeritService } from "./vows-merit.service.js";
import { AuditModule } from "../../platform/audit/audit.module.js";

@Module({
  imports: [AuditModule],
  controllers: [AdminVowsController],
  providers: [VowsMeritService, VowsMeritRepository],
  exports: [VowsMeritService],
})
export class VowsMeritModule {}
