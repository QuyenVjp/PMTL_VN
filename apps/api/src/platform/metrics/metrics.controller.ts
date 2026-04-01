import { Controller, Get, Res } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import type { Response } from "express";
import { Public } from "../../common/decorators/public.decorator.js";
import { MetricsService } from "./metrics.service.js";

@ApiTags("metrics")
@Controller("metrics")
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: "Get Prometheus metrics" })
  @ApiResponse({ status: 200, description: "Prometheus metrics in text format" })
  async getMetrics(@Res() res: Response): Promise<void> {
    const [body, contentType] = await Promise.all([
      this.metricsService.getMetrics(),
      Promise.resolve(this.metricsService.contentType()),
    ]);
    res.setHeader("Content-Type", contentType);
    res.end(body);
  }
}
