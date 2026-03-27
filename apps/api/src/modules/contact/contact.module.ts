import { Module } from "@nestjs/common";
import { ContactController } from "./contact.controller.js";
import { ContactService } from "./contact.service.js";
import { AuditModule } from "../../platform/audit/audit.module.js";

@Module({
  imports: [AuditModule],
  controllers: [ContactController],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}
