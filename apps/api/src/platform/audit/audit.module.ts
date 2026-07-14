import { Module } from "@nestjs/common";
import { AuditService } from "./audit.service.js";
import { AuditRepository } from "./audit.repository.js";
import { AdminAuditLogsController } from "./admin-audit-logs.controller.js";
import { AdminAuditLogsService } from "./admin-audit-logs.service.js";

@Module({
  controllers: [AdminAuditLogsController],
  providers: [AuditService, AuditRepository, AdminAuditLogsService],
  exports: [AuditService],
})
export class AuditModule {}
