import { Module } from "@nestjs/common";
import { CalendarController, AdminCalendarController } from "./calendar.controller.js";
import { CalendarRepository } from "./calendar.repository.js";
import { CalendarService } from "./calendar.service.js";
import { AuditModule } from "../../platform/audit/audit.module.js";
import { StorageModule } from "../../platform/storage/storage.module.js";

@Module({
  imports: [AuditModule, StorageModule],
  controllers: [CalendarController, AdminCalendarController],
  providers: [CalendarService, CalendarRepository],
  exports: [CalendarService],
})
export class CalendarModule {}
