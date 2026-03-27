import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller.js";
import { HealthService } from "./health.service.js";
import { FeatureFlagsModule } from "../feature-flags/feature-flags.module.js";

@Module({
  imports: [FeatureFlagsModule],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
