import { Module } from "@nestjs/common";
import { AdminVowsController } from "./vows-merit.controller.js";
import { VowsMeritService } from "./vows-merit.service.js";
import { AuditModule } from "../../platform/audit/audit.module.js";

@Module({
  imports: [AuditModule],
  controllers: [AdminVowsController],
  providers: [VowsMeritService],
  exports: [VowsMeritService],
})
export class VowsMeritModule {}
