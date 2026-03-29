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
  ],
  exports: [EngagementService],
})
export class EngagementModule {}
