import { Module } from "@nestjs/common";
import { WisdomQaController } from "./wisdom-qa.controller.js";
import { WisdomQaAdminController } from "./wisdom-qa.admin.controller.js";
import { WisdomHubController } from "./wisdom-hub.controller.js";
import { WisdomQaService } from "./wisdom-qa.service.js";
import { AuditModule } from "../../platform/audit/audit.module.js";

@Module({
  imports: [AuditModule],
  controllers: [WisdomQaController, WisdomQaAdminController, WisdomHubController],
  providers: [WisdomQaService],
  exports: [WisdomQaService],
})
export class WisdomQaModule {}
