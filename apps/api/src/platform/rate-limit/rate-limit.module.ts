import { Module } from "@nestjs/common";
import { RateLimitService } from "./rate-limit.service.js";
import { RateLimitRepository } from "./rate-limit.repository.js";
import { RateLimitGuard } from "./rate-limit.guard.js";

@Module({
  providers: [RateLimitService, RateLimitRepository, RateLimitGuard],
  exports: [RateLimitService, RateLimitGuard],
})
export class RateLimitModule {}
