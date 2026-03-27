import { Module } from "@nestjs/common";
import { SessionsService } from "./sessions.service.js";
import { SessionsRepository } from "./sessions.repository.js";

@Module({
  providers: [SessionsService, SessionsRepository],
  exports: [SessionsService],
})
export class SessionsModule {}
