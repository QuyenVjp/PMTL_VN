import { Module, Global } from "@nestjs/common";
import { TraceService } from "./trace.service.js";

@Global()
@Module({
  providers: [TraceService],
  exports: [TraceService],
})
export class TracingModule {}
