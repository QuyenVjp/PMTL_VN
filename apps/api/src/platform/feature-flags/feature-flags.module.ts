import { Module } from "@nestjs/common";
import { FeatureFlagsService } from "./feature-flags.service.js";
import { FeatureFlagsRepository } from "./feature-flags.repository.js";
import { AdminFeatureFlagsController } from "./admin-feature-flags.controller.js";
import { AuditModule } from "../audit/audit.module.js";

@Module({
  imports: [AuditModule],
  controllers: [AdminFeatureFlagsController],
  providers: [FeatureFlagsService, FeatureFlagsRepository],
  exports: [FeatureFlagsService],
})
export class FeatureFlagsModule {}
