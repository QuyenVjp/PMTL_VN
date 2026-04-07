import { Module } from "@nestjs/common";
import { CalendarController, AdminCalendarController } from "./calendar.controller.js";
import { CalendarRepository } from "./calendar.repository.js";
import { CalendarService } from "./calendar.service.js";
import { Bardo49DayService } from "./bardo-49-day.service.js";
import { LunarCalendarService } from "./lunar-calendar.service.js";
import { AuditModule } from "../../platform/audit/audit.module.js";
import { StorageModule } from "../../platform/storage/storage.module.js";

@Module({
  imports: [AuditModule, StorageModule],
  controllers: [CalendarController, AdminCalendarController],
  providers: [CalendarService, CalendarRepository, Bardo49DayService, LunarCalendarService],
  exports: [CalendarService, Bardo49DayService, LunarCalendarService],
})
export class CalendarModule {}
