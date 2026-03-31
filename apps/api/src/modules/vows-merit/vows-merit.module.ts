import { Module } from "@nestjs/common";
import {
  AdminVowsController,
  MemberVowsController,
  MemberLifeReleaseController,
  AltarController,
} from "./vows-merit.controller.js";
import { VowsMeritRepository } from "./vows-merit.repository.js";
import { VowsMeritService } from "./vows-merit.service.js";
import { VowMemberService } from "./vow-member.service.js";
import { LifeReleaseMemberService } from "./life-release-member.service.js";
import { AltarService } from "./altar.service.js";
import { AuditModule } from "../../platform/audit/audit.module.js";

@Module({
  imports: [AuditModule],
  controllers: [AdminVowsController, MemberVowsController, MemberLifeReleaseController, AltarController],
  providers: [VowsMeritService, VowsMeritRepository, VowMemberService, LifeReleaseMemberService, AltarService],
  exports: [VowsMeritService],
})
export class VowsMeritModule {}
