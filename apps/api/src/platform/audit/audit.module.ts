import { Module } from "@nestjs/common";
import { AuditService } from "./audit.service.js";
import { AuditRepository } from "./audit.repository.js";
import { AdminAuditLogsController } from "./admin-audit-logs.controller.js";

@Module({
  controllers: [AdminAuditLogsController],
  providers: [AuditService, AuditRepository],
  exports: [AuditService],
})
export class AuditModule {}
