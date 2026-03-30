import { Module } from "@nestjs/common";
import { PracticeSupportController, AdminPracticeSupportController } from "./practice-support.controller.js";
import { PracticeSupportService } from "./practice-support.service.js";
import { AuditModule } from "../../../platform/audit/audit.module.js";

@Module({
  imports: [AuditModule],
  controllers: [PracticeSupportController, AdminPracticeSupportController],
  providers: [PracticeSupportService],
  exports: [PracticeSupportService],
})
export class PracticeSupportModule {}
