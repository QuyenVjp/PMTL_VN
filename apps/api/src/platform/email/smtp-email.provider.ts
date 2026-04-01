import { Injectable, InternalServerErrorException } from "@nestjs/common";
import nodemailer from "nodemailer";
import { ConfigService } from "../../common/config/config.service.js";
import type { EmailProvider, MailPayload } from "./email.provider.js";

@Injectable()
export class SmtpEmailProvider implements EmailProvider {
  private readonly fromName: string;
  private readonly fromEmail?: string;
  private readonly host?: string;
  private readonly port?: number;
  private readonly user?: string;
  private readonly pass?: string;

  constructor(private readonly configService: ConfigService) {
    this.host = this.configService.smtpHost;
    this.port = this.configService.smtpPort;
    this.user = this.configService.smtpUser;
    this.pass = this.configService.smtpPass;
    this.fromName = this.configService.smtpFromName;
    this.fromEmail = this.configService.smtpFromEmail;
  }

  async send(payload: MailPayload): Promise<void> {
    if (!this.host || !this.port || !this.user || !this.pass || !this.fromEmail) {
      throw new InternalServerErrorException(
        "Thiếu cấu hình SMTP (SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/SMTP_FROM_EMAIL)",
      );
    }

    const transport = nodemailer.createTransport({
      host: this.host,
      port: this.port,
      secure: this.configService.smtpSecure,
      auth: { user: this.user, pass: this.pass },
    });

    await transport.sendMail({
      from: `${this.fromName} <${this.fromEmail}>`,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });
  }
}
