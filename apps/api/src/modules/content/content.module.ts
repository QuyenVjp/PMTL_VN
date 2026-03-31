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
import { AuditModule } from "../../platform/audit/audit.module.js";
import { StorageModule } from "../../platform/storage/storage.module.js";
import { ChantingModule } from "./chanting/chanting.module.js";
import { PracticeSupportModule } from "./practice-support/practice-support.module.js";

@Module({
  imports: [AuditModule, StorageModule, ChantingModule, PracticeSupportModule],
  controllers: [
    ContentController,
    GuideController,
    AdminDownloadController,
    PublicBeginnerGuideController,
    PublicDownloadController,
    PublicChantItemsController,
    AdminMediaLibraryController,
  ],
  providers: [ContentService, ContentRepository, AdminMediaLibraryService],
  exports: [ContentService],
})
export class ContentModule {}
