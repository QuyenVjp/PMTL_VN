import { Module } from "@nestjs/common";
import { AuditModule } from "../../platform/audit/audit.module.js";
import {
  AdminLifeLiberationController,
  MemberLifeLiberationController,
} from "./life-liberation.controller.js";
import { LifeLiberationService } from "./life-liberation.service.js";
import { LifeLiberationRepository } from "./life-liberation.repository.js";

@Module({
  imports: [AuditModule],
  controllers: [AdminLifeLiberationController, MemberLifeLiberationController],
  providers: [LifeLiberationService, LifeLiberationRepository],
  exports: [LifeLiberationService],
})
export class LifeLiberationModule {}
