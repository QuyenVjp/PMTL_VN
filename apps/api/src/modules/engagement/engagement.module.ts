import { Module } from "@nestjs/common";
import {
  EngagementController,
  DailyGongkeController,
  RepentanceController,
  LittleHouseController,
  PracticeProfileController,
  ActivationController,
  MeritDashboardController,
} from "./engagement.controller.js";
import { EngagementService } from "./engagement.service.js";
import { DailyGongkeService } from "./daily-gongke.service.js";
import { RepentanceService } from "./repentance.service.js";
import { LittleHouseService } from "./little-house.service.js";
import { PracticeProfileService } from "./practice-profile.service.js";
import { ActivationService } from "./activation.service.js";
import { MeritDashboardService } from "./merit-dashboard.service.js";
import { DreamJournalService } from "./dream-journal.service.js";
import { GamingAddictionDiagnosisService } from "./gaming-addiction.service.js";
import { LittleHouseBurnService } from "./little-house-burn.service.js";
import { LittleHouseCronService } from "./little-house-cron.service.js";

@Module({
  controllers: [
    EngagementController,
    DailyGongkeController,
    RepentanceController,
    LittleHouseController,
    PracticeProfileController,
    ActivationController,
    MeritDashboardController,
  ],
  providers: [
    EngagementService,
    DailyGongkeService,
    RepentanceService,
    LittleHouseService,
    PracticeProfileService,
    ActivationService,
    MeritDashboardService,
    // Phase 12 logic services — registered so NestJS DI can inject them
    DreamJournalService,
    GamingAddictionDiagnosisService,
    LittleHouseBurnService,
    LittleHouseCronService,
  ],
  exports: [EngagementService, DreamJournalService],
})
export class EngagementModule {}
