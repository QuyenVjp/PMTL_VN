import { Injectable, Logger } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { ConfigService } from "../../common/config/config.service.js";
import { LogEmailProvider } from "./log-email.provider.js";
import { ResendEmailProvider } from "./resend-email.provider.js";
import { SmtpEmailProvider } from "./smtp-email.provider.js";
import type { EmailProvider } from "./email.provider.js";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly provider: EmailProvider;

  constructor(
    private readonly configService: ConfigService,
    private readonly logProvider: LogEmailProvider,
    private readonly smtpProvider: SmtpEmailProvider,
    private readonly resendProvider: ResendEmailProvider,
  ) {
    this.provider = this.resolveProvider();
  }

  async sendPasswordReset(params: { email: string; token: string }): Promise<void> {
    const resetUrl = this.buildResetPasswordUrl(params.token);
    await this.provider.send({
      to: params.email,
      subject: "Đặt lại mật khẩu PMTL",
      text: `Bạn vừa yêu cầu đặt lại mật khẩu. Vui lòng truy cập liên kết sau: ${resetUrl}`,
      html: `
        <p>Xin chào,</p>
        <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản PMTL.</p>
        <p>Vui lòng nhấn vào liên kết sau để tiếp tục:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>Liên kết có hiệu lực trong 60 phút.</p>
      `,
    });
  }

  dispatchPasswordReset(params: { email: string; token: string }): void {
    const eventId = randomUUID();
    this.logger.log({
      msg: "email.outbox.dispatch",
      lane: "auth.password_reset",
      provider: this.configService.emailProvider,
      eventId,
      to: params.email,
    });

    void this.sendPasswordReset(params).catch((error: unknown) => {
      this.logger.error({
        msg: "email.outbox.failed",
        lane: "auth.password_reset",
        eventId,
        error: error instanceof Error ? error.message : "unknown_error",
      });
    });
  }

  private resolveProvider(): EmailProvider {
    if (this.configService.emailProvider === "smtp") {
      return this.smtpProvider;
    }
    if (this.configService.emailProvider === "resend") {
      return this.resendProvider;
    }
    return this.logProvider;
  }

  private buildResetPasswordUrl(token: string): string {
    const resetUrl = new URL("/reset-password", this.configService.webOrigin);
    resetUrl.searchParams.set("token", token);
    return resetUrl.toString();
  }
}
