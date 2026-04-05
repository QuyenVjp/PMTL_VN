import { Module } from "@nestjs/common";
import { AuditModule } from "../../platform/audit/audit.module.js";
import { AdminSacredFormsController, MemberSacredFormsController } from "./sacred-forms.controller.js";
import { SacredFormsService } from "./sacred-forms.service.js";
import { SacredFormsRepository } from "./sacred-forms.repository.js";

@Module({
  imports: [AuditModule],
  controllers: [AdminSacredFormsController, MemberSacredFormsController],
  providers: [SacredFormsService, SacredFormsRepository],
  exports: [SacredFormsService],
})
export class SacredFormsModule {}
