import { Module } from "@nestjs/common";
import { ContactController, AdminVolunteerController, AdminContactInfoController } from "./contact.controller.js";
import { ContactService } from "./contact.service.js";
import { AuditModule } from "../../platform/audit/audit.module.js";
import { CacheModule } from "../../common/cache/cache.module.js";

@Module({
  imports: [AuditModule, CacheModule],
  controllers: [ContactController, AdminVolunteerController, AdminContactInfoController],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}
