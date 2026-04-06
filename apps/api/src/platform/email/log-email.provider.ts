import { Injectable, Logger } from "@nestjs/common";
import type { EmailProvider, MailPayload } from "./email.provider.js";

@Injectable()
export class LogEmailProvider implements EmailProvider {
  private readonly logger = new Logger(LogEmailProvider.name);

  send(payload: MailPayload): Promise<void> {
    this.logger.log({
      msg: "email.log_provider.sent",
      to: payload.to,
      subject: payload.subject,
    });
    return Promise.resolve();
  }
}
