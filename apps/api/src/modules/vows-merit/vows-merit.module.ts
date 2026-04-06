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
import { AdminAltarManagementController, MemberAltarManagementController } from "./altar-management.controller.js";
import { AltarManagementService } from "./altar-management.service.js";
import { AltarCeremonyController, MemberAltarValidationController } from "./altar-validation.controller.js";
import { AltarValidationService } from "./altar-validation.service.js";

@Module({
  imports: [AuditModule],
  controllers: [
    AdminVowsController,
    MemberVowsController,
    MemberLifeReleaseController,
    AltarController,
    AdminAltarManagementController,
    MemberAltarManagementController,
    AltarCeremonyController,
    MemberAltarValidationController,
  ],
  providers: [
    VowsMeritService,
    VowsMeritRepository,
    VowMemberService,
    LifeReleaseMemberService,
    AltarService,
    AltarManagementService,
    AltarValidationService,
  ],
  exports: [VowsMeritService, AltarManagementService, AltarValidationService],
})
export class VowsMeritModule {}
