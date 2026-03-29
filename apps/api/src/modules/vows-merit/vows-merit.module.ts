import { Module } from "@nestjs/common";
import { AdminVowsController, MemberVowsController, AltarController } from "./vows-merit.controller.js";
import { VowsMeritRepository } from "./vows-merit.repository.js";
import { VowsMeritService } from "./vows-merit.service.js";
import { VowMemberService } from "./vow-member.service.js";
import { AltarService } from "./altar.service.js";
import { AuditModule } from "../../platform/audit/audit.module.js";

@Module({
  imports: [AuditModule],
  controllers: [AdminVowsController, MemberVowsController, AltarController],
  providers: [VowsMeritService, VowsMeritRepository, VowMemberService, AltarService],
  exports: [VowsMeritService],
})
export class VowsMeritModule {}
