import { Global, Module } from "@nestjs/common";
import { EmailService } from "./email.service.js";
import { LogEmailProvider } from "./log-email.provider.js";
import { SmtpEmailProvider } from "./smtp-email.provider.js";
import { ResendEmailProvider } from "./resend-email.provider.js";

@Global()
@Module({
  providers: [EmailService, LogEmailProvider, SmtpEmailProvider, ResendEmailProvider],
  exports: [EmailService],
})
export class EmailModule {}
