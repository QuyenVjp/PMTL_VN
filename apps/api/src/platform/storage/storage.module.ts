import { Module } from "@nestjs/common";
import { StorageService } from "./storage.service.js";
import { LocalStorageAdapter } from "./local-storage.adapter.js";
import { MediaAssetsRepository } from "./media-assets.repository.js";
import { AdminMediaController } from "./admin-media.controller.js";
import { AuditModule } from "../audit/audit.module.js";

@Module({
  imports: [AuditModule],
  controllers: [AdminMediaController],
  providers: [StorageService, LocalStorageAdapter, MediaAssetsRepository],
  exports: [StorageService],
})
export class StorageModule {}
