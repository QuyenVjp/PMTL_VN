import { Controller, Get, OnApplicationBootstrap } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator.js";
import { HealthService } from "./health.service.js";

@ApiTags("health")
@Controller("health")
export class HealthController implements OnApplicationBootstrap {
  constructor(private readonly healthService: HealthService) {}

  onApplicationBootstrap() {
    this.healthService.markStartupComplete();
  }

  @Get("live")
  @Public()
  @ApiOperation({ summary: "Liveness check" })
  @ApiResponse({ status: 200, description: "Service is alive" })
  getLive() {
    return this.healthService.getLivenessStatus();
  }

  @Get("ready")
  @Public()
  @ApiOperation({ summary: "Readiness check" })
  @ApiResponse({ status: 200, description: "Service is ready to accept traffic" })
  @ApiResponse({ status: 503, description: "Service is not ready" })
  async getReady() {
    const result = await this.healthService.getReadinessStatus();
    return result;
  }

  @Get("startup")
  @Public()
  @ApiOperation({ summary: "Startup check" })
  @ApiResponse({ status: 200, description: "Service has started successfully" })
  @ApiResponse({ status: 503, description: "Service is still starting" })
  async getStartup() {
    const result = await this.healthService.getStartupStatus();
    return result;
  }
}
