import { Module } from "@nestjs/common";
import { AdminNotificationController, MemberNotificationController } from "./notification.controller.js";
import { NotificationService } from "./notification.service.js";
import { NotificationRepository } from "./notification.repository.js";
import { AuditModule } from "../../platform/audit/audit.module.js";

@Module({
  imports: [AuditModule],
  controllers: [MemberNotificationController, AdminNotificationController],
  providers: [NotificationService, NotificationRepository],
  exports: [NotificationService],
})
export class NotificationModule {}
