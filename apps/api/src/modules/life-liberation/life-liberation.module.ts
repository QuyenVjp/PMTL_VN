import { Module } from "@nestjs/common";
import { AuditModule } from "../../platform/audit/audit.module.js";
import { CacheModule } from "../../common/cache/cache.module.js";
import { PrismaModule } from "../../common/prisma/prisma.module.js";
import {
  AdminLifeLiberationController,
  MemberLifeLiberationController,
} from "./life-liberation.controller.js";
import { LifeLiberationService } from "./life-liberation.service.js";
import { LifeLiberationRepository } from "./life-liberation.repository.js";
import { SpeciesBlacklistService } from "./services/species-blacklist.service.js";
import { PredatorySpeciesGuard } from "./guards/predatory-species.guard.js";

@Module({
  imports: [AuditModule, CacheModule, PrismaModule],
  controllers: [AdminLifeLiberationController, MemberLifeLiberationController],
  providers: [LifeLiberationService, LifeLiberationRepository, SpeciesBlacklistService, PredatorySpeciesGuard],
  exports: [LifeLiberationService, SpeciesBlacklistService],
})
export class LifeLiberationModule {}
