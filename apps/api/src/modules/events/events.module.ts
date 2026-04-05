import { Module } from "@nestjs/common";
import { AuditModule } from "../../platform/audit/audit.module.js";
import { AdminEventsController, MemberEventsController } from "./events.controller.js";
import { EventsService } from "./events.service.js";
import { EventsRepository } from "./events.repository.js";

@Module({
  imports: [AuditModule],
  controllers: [AdminEventsController, MemberEventsController],
  providers: [EventsService, EventsRepository],
  exports: [EventsService],
})
export class EventsModule {}
