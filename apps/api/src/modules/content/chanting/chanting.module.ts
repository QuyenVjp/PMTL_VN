import { Module } from "@nestjs/common";
import { ChantingController } from "./chanting.controller.js";
import { ChantingService } from "./chanting.service.js";
import { ChantingRepository } from "./chanting.repository.js";

@Module({
  controllers: [ChantingController],
  providers: [ChantingService, ChantingRepository],
  exports: [ChantingService],
})
export class ChantingModule {}
