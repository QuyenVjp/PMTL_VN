import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Resend } from "resend";
import { ConfigService } from "../../common/config/config.service.js";
import type { EmailProvider, MailPayload } from "./email.provider.js";

@Injectable()
export class ResendEmailProvider implements EmailProvider {
  private readonly apiKey?: string;
  private readonly from?: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.resendApiKey;
    this.from = this.configService.resendFromEmail;
  }

  async send(payload: MailPayload): Promise<void> {
    if (!this.apiKey || !this.from) {
      throw new InternalServerErrorException(
        "Thiếu cấu hình Resend (RESEND_API_KEY/RESEND_FROM_EMAIL)",
      );
    }

    const client = new Resend(this.apiKey);
    await client.emails.send({
      from: this.from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });
  }
}
