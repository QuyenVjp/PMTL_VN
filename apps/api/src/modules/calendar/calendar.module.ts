import { Module } from "@nestjs/common";
import { CalendarController, AdminCalendarController } from "./calendar.controller.js";
import { CalendarService } from "./calendar.service.js";
import { AuditModule } from "../../platform/audit/audit.module.js";

@Module({
  imports: [AuditModule],
  controllers: [CalendarController, AdminCalendarController],
  providers: [CalendarService],
  exports: [CalendarService],
})
export class CalendarModule {}
