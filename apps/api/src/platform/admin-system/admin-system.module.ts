import { Module } from "@nestjs/common";
import { AdminSystemController } from "./admin-system.controller.js";
import { AdminSystemService } from "./admin-system.service.js";
import { HealthModule } from "../health/health.module.js";

@Module({
  imports: [HealthModule],
  controllers: [AdminSystemController],
  providers: [AdminSystemService],
})
export class AdminSystemModule {}
