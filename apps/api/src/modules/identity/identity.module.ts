import { Module } from "@nestjs/common";
import { IdentityController } from "./identity.controller.js";
import { IdentityService } from "./identity.service.js";
import { AdminUsersController } from "./admin-users.controller.js";
import { AdminUsersService } from "./admin-users.service.js";
import { SessionsModule } from "../../platform/sessions/sessions.module.js";
import { AuditModule } from "../../platform/audit/audit.module.js";

@Module({
  imports: [SessionsModule, AuditModule],
  controllers: [IdentityController, AdminUsersController],
  providers: [IdentityService, AdminUsersService],
  exports: [IdentityService],
})
export class IdentityModule {}
