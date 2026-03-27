import { Module } from "@nestjs/common";
import { FeatureFlagsService } from "./feature-flags.service.js";
import { FeatureFlagsRepository } from "./feature-flags.repository.js";

@Module({
  providers: [FeatureFlagsService, FeatureFlagsRepository],
  exports: [FeatureFlagsService],
})
export class FeatureFlagsModule {}
