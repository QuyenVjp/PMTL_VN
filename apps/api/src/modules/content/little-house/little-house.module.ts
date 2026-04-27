import { Module } from "@nestjs/common";

import { AuditModule } from "../../../platform/audit/audit.module.js";
import { AdminLittleHouseController, LittleHouseController } from "./little-house.controller.js";
import { LittleHouseService } from "./little-house.service.js";

@Module({
  imports: [AuditModule],
  controllers: [LittleHouseController, AdminLittleHouseController],
  providers: [LittleHouseService],
  exports: [LittleHouseService],
})
export class LittleHouseModule {}
