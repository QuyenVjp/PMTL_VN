import { Module } from "@nestjs/common";
import { AuditModule } from "../../platform/audit/audit.module.js";
import {
  AdminCharityController,
  AdminFraudAlertController,
  AdminVowController,
  MemberVowController,
} from "./dharma-compliance.controller.js";
import { DharmaComplianceService } from "./dharma-compliance.service.js";
import { DharmaComplianceRepository } from "./dharma-compliance.repository.js";
import { DharmaCompliancePolicy } from "./dharma-compliance.policy.js";

@Module({
  imports: [AuditModule],
  controllers: [
    AdminCharityController,
    AdminFraudAlertController,
    AdminVowController,
    MemberVowController,
  ],
  providers: [DharmaComplianceService, DharmaComplianceRepository, DharmaCompliancePolicy],
  exports: [DharmaComplianceService],
})
export class DharmaComplianceModule {}
