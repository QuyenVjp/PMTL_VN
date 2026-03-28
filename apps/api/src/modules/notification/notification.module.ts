import { Module } from "@nestjs/common";
import { AdminNotificationController } from "./notification.controller.js";
import { NotificationService } from "./notification.service.js";
import { AuditModule } from "../../platform/audit/audit.module.js";

@Module({
  imports: [AuditModule],
  controllers: [AdminNotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
