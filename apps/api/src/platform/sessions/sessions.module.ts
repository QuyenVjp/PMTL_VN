import { Module } from "@nestjs/common";
import { SessionsService } from "./sessions.service.js";
import { SessionsRepository } from "./sessions.repository.js";
import { AdminSessionsController } from "./admin-sessions.controller.js";
import { AdminSessionsService } from "./admin-sessions.service.js";
import { AuditModule } from "../audit/audit.module.js";

@Module({
  imports: [AuditModule],
  controllers: [AdminSessionsController],
  providers: [SessionsService, SessionsRepository, AdminSessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
