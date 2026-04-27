import { Module } from "@nestjs/common";
import { SearchController } from "./search.controller.js";
import { AdminSearchController } from "./admin-search.controller.js";
import { SearchService } from "./search.service.js";
import { AuditModule } from "../../platform/audit/audit.module.js";

@Module({
  imports: [AuditModule],
  controllers: [SearchController, AdminSearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
