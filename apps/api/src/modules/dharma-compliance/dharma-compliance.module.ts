import { Module } from "@nestjs/common";
import { AuditModule } from "../../platform/audit/audit.module.js";
import { OutboxModule } from "../../platform/outbox/outbox.module.js";
import { CacheModule } from "../../common/cache/cache.module.js";
import { PrismaModule } from "../../common/prisma/prisma.module.js";
import {
  PublicDharmaComplianceController,
  AdminCharityController,
  AdminFraudAlertController,
  AdminVowController,
  AdminDharmaComplianceStatusController,
  MemberVowController,
} from "./dharma-compliance.controller.js";
import { DharmaComplianceService } from "./dharma-compliance.service.js";
import { DharmaComplianceRepository } from "./dharma-compliance.repository.js";
import { DharmaCompliancePolicy } from "./dharma-compliance.policy.js";
import { CharityFirewallService } from "./services/charity-firewall.service.js";

@Module({
  imports: [AuditModule, OutboxModule, CacheModule, PrismaModule],
  controllers: [
    PublicDharmaComplianceController,
    AdminCharityController,
    AdminFraudAlertController,
    AdminVowController,
    AdminDharmaComplianceStatusController,
    MemberVowController,
  ],
  providers: [
    DharmaComplianceService,
    DharmaComplianceRepository,
    DharmaCompliancePolicy,
    CharityFirewallService,
  ],
  exports: [DharmaComplianceService, CharityFirewallService],
})
export class DharmaComplianceModule {}
