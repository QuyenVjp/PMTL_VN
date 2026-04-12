import { Module } from "@nestjs/common";
import { WisdomQaController, WisdomOfflineBundleController } from "./wisdom-qa.controller.js";
import { WisdomQaAdminController } from "./wisdom-qa.admin.controller.js";
import { WisdomHubController } from "./wisdom-hub.controller.js";
import { WisdomQaService } from "./wisdom-qa.service.js";
import { AuditModule } from "../../platform/audit/audit.module.js";
import { FeatureFlagsModule } from "../../platform/feature-flags/feature-flags.module.js";
import { WisdomGeminiService } from "./wisdom-gemini.service.js";

@Module({
  imports: [AuditModule, FeatureFlagsModule],
  controllers: [WisdomQaController, WisdomOfflineBundleController, WisdomQaAdminController, WisdomHubController],
  providers: [WisdomQaService, WisdomGeminiService],
  exports: [WisdomQaService],
})
export class WisdomQaModule {}
