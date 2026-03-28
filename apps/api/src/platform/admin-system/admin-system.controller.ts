import {
  Controller,
  Get,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { RolesGuard } from "../../common/auth/roles.guard.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { AdminSystemService } from "./admin-system.service.js";

@ApiTags("admin-system")
@Controller("admin/system")
@UseGuards(RolesGuard)
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminSystemController {
  constructor(private readonly adminSystem: AdminSystemService) {}

  @Get("dashboard-stats")
  @ApiOperation({ summary: "Admin dashboard aggregate stats" })
  async dashboardStats() {
    const stats = await this.adminSystem.getDashboardStats();
    return { data: stats };
  }

  @Get("health-extended")
  @ApiOperation({ summary: "Extended system health for admin operators" })
  async healthExtended() {
    const health = await this.adminSystem.getHealthExtended();
    return { data: health };
  }
}
