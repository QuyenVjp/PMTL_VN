import { Module } from "@nestjs/common";
import {
  ContentController,
  GuideController,
  AdminDownloadController,
  PublicBeginnerGuideController,
  PublicDownloadController,
  PublicChantItemsController,
} from "./content.controller.js";
import { ContentService } from "./content.service.js";
import { ContentRepository } from "./content.repository.js";
import { AdminMediaLibraryController } from "./admin-media-library.controller.js";
import { AdminMediaLibraryService } from "./admin-media-library.service.js";
import { AdminDailyPracticeController } from "./daily-practice.controller.js";
import { AdminDailyRecitationController } from "./daily-recitation.controller.js";
import { DailyRecitationService } from "./daily-recitation.service.js";
import { AuditModule } from "../../platform/audit/audit.module.js";
import { StorageModule } from "../../platform/storage/storage.module.js";
import { ChantingModule } from "./chanting/chanting.module.js";
import { PracticeSupportModule } from "./practice-support/practice-support.module.js";
import { SelfCultivationModule } from "./self-cultivation/self-cultivation.module.js";
import { LittleHouseModule } from "./little-house/little-house.module.js";
import { LifeReleaseContentModule } from "./life-release/life-release.module.js";
import { SearchModule } from "../search/search.module.js";
import { ConvincingFamilyRitualService } from "./convincing-family-ritual.service.js";
import { NameChangeService } from "./name-change.service.js";
import { SutraInterruptionService } from "./sutra-interruption.service.js";
import { SutraReaderHygieneService } from "./sutra-reader-hygiene.service.js";

@Module({
  imports: [AuditModule, StorageModule, ChantingModule, PracticeSupportModule, SelfCultivationModule, LittleHouseModule, LifeReleaseContentModule, SearchModule],
  controllers: [
    ContentController,
    GuideController,
    AdminDownloadController,
    PublicBeginnerGuideController,
    PublicDownloadController,
    PublicChantItemsController,
    AdminMediaLibraryController,
    AdminDailyPracticeController,
    AdminDailyRecitationController,
  ],
  providers: [
    ContentService,
    ContentRepository,
    AdminMediaLibraryService,
    DailyRecitationService,
    ConvincingFamilyRitualService,
    NameChangeService,
    SutraInterruptionService,
    SutraReaderHygieneService,
  ],
  exports: [ContentService, ConvincingFamilyRitualService, NameChangeService, SutraInterruptionService, SutraReaderHygieneService],
})
export class ContentModule {}
