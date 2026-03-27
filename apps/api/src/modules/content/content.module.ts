import { Module } from "@nestjs/common";
import { ContentController } from "./content.controller.js";
import { ContentService } from "./content.service.js";
import { ContentRepository } from "./content.repository.js";
import { AuditModule } from "../../platform/audit/audit.module.js";
import { StorageModule } from "../../platform/storage/storage.module.js";
import { ChantingModule } from "./chanting/chanting.module.js";

@Module({
  imports: [AuditModule, StorageModule, ChantingModule],
  controllers: [ContentController],
  providers: [ContentService, ContentRepository],
  exports: [ContentService],
})
export class ContentModule {}
