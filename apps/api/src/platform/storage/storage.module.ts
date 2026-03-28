import { Module } from "@nestjs/common";
import { StorageService } from "./storage.service.js";
import { LocalStorageAdapter } from "./local-storage.adapter.js";
import { MediaAssetsRepository } from "./media-assets.repository.js";
import { AdminMediaController } from "./admin-media.controller.js";

@Module({
  controllers: [AdminMediaController],
  providers: [StorageService, LocalStorageAdapter, MediaAssetsRepository],
  exports: [StorageService],
})
export class StorageModule {}
