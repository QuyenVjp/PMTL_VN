import { Module } from "@nestjs/common";
import { IdentityController } from "./identity.controller.js";
import { IdentityService } from "./identity.service.js";
import { SessionsModule } from "../../platform/sessions/sessions.module.js";
import { AuditModule } from "../../platform/audit/audit.module.js";

@Module({
  imports: [SessionsModule, AuditModule],
  controllers: [IdentityController],
  providers: [IdentityService],
  exports: [IdentityService],
})
export class IdentityModule {}
