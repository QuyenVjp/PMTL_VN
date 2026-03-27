import { Module } from "@nestjs/common";
import { StorageService } from "./storage.service.js";
import { LocalStorageAdapter } from "./local-storage.adapter.js";
import { MediaAssetsRepository } from "./media-assets.repository.js";

@Module({
  providers: [StorageService, LocalStorageAdapter, MediaAssetsRepository],
  exports: [StorageService],
})
export class StorageModule {}
