import { Module } from "@nestjs/common";
import { AuditModule } from "../../platform/audit/audit.module.js";
import { AdminLittleHouseController, MemberLittleHouseController } from "./little-house.controller.js";
import { LittleHouseService } from "./little-house.service.js";
import { LittleHouseRepository } from "./little-house.repository.js";

@Module({
  imports: [AuditModule],
  controllers: [AdminLittleHouseController, MemberLittleHouseController],
  providers: [LittleHouseService, LittleHouseRepository],
  exports: [LittleHouseService],
})
export class LittleHouseModule {}
