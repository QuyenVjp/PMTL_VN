import { Injectable, Logger } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { ConfigService } from "../../common/config/config.service.js";
import { LogEmailProvider } from "./log-email.provider.js";
import { ResendEmailProvider } from "./resend-email.provider.js";
import { SmtpEmailProvider } from "./smtp-email.provider.js";
import type { EmailProvider } from "./email.provider.js";

export type PasswordResetAudience = "admin" | "member";

export interface PasswordResetEmailParams {
  email: string;
  token: string;
  audience: PasswordResetAudience;
}

/**
 * Password-reset link owners (review 2026-07-13):
 * - ADMIN / SUPER_ADMIN → ADMIN_ORIGIN + /auth/dat-lai-mat-khau?token=...
 * - MEMBER → WEB_ORIGIN + /dat-lai-mat-khau?token=...
 *   (canonical design route in AUTH_UX_CONTRACT.md; never accept caller-supplied callback URL)
 */
const ADMIN_RESET_PATH = "/auth/dat-lai-mat-khau";
const MEMBER_RESET_PATH = "/dat-lai-mat-khau";

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

  async sendPasswordReset(params: PasswordResetEmailParams): Promise<void> {
    const resetUrl = this.buildResetPasswordUrl(params.token, params.audience);
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

  dispatchPasswordReset(params: PasswordResetEmailParams): void {
    const eventId = randomUUID();
    // Never log token, token hash, or full reset URL (contains token).
    this.logger.log({
      msg: "email.outbox.dispatch",
      lane: "auth.password_reset",
      provider: this.configService.emailProvider,
      eventId,
      audience: params.audience,
      // email is needed for ops; token is never logged
      to: params.email,
    });

    void this.sendPasswordReset(params).catch((error: unknown) => {
      this.logger.error({
        msg: "email.outbox.failed",
        lane: "auth.password_reset",
        eventId,
        audience: params.audience,
        error: error instanceof Error ? error.message : "unknown_error",
      });
    });
  }

  /**
   * Pure URL builder — exported for tests. Does not accept caller-supplied origins/paths.
   */
  buildResetPasswordUrl(token: string, audience: PasswordResetAudience): string {
    const origin =
      audience === "admin"
        ? this.configService.adminOrigin
        : this.configService.webOrigin;
    const path = audience === "admin" ? ADMIN_RESET_PATH : MEMBER_RESET_PATH;
    const resetUrl = new URL(path, origin);
    resetUrl.searchParams.set("token", token);
    return resetUrl.toString();
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
}
