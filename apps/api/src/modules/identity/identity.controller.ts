import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { randomBytes } from "node:crypto";
import type { Request, Response } from "express";
import { Public } from "../../common/decorators/public.decorator.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { RateLimit } from "../../common/decorators/rate-limit.decorator.js";
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";
import type { AuthenticatedUser } from "../../common/auth/auth-request.types.js";
import { IdentityService } from "./identity.service.js";
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  bootstrapAdminSchema,
  type LoginInput,
  type RegisterInput,
  type BootstrapAdminInput,
  type UpdateProfileInput,
  type ChangePasswordInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type VerifyEmailInput,
} from "./identity.schemas.js";
import { ConfigService } from "../../common/config/config.service.js";
import { UnauthorizedError } from "../../common/errors/app-error.js";

const ACCESS_TOKEN_COOKIE = "pmtl_access";
const REFRESH_TOKEN_COOKIE = "pmtl_refresh";

@ApiTags("auth")
@Controller("auth")
export class IdentityController {
  constructor(
    private readonly identityService: IdentityService,
    private readonly configService: ConfigService,
  ) {}

  @Post("login")
  @Public()
  @RateLimit("auth.login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Đăng nhập" })
  @ApiResponse({ status: 200, description: "Đăng nhập thành công" })
  @ApiResponse({ status: 401, description: "Email hoặc mật khẩu không đúng" })
  async login(
    @Body(ZodValidate(loginSchema)) input: LoginInput,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.identityService.login(input, {
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
    });

    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    return { user: result.user };
  }

  @Post("register")
  @Public()
  @RateLimit("auth.login")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Đăng ký tài khoản mới" })
  @ApiResponse({ status: 201, description: "Đăng ký thành công" })
  @ApiResponse({ status: 409, description: "Email đã được sử dụng" })
  async register(@Body(ZodValidate(registerSchema)) input: RegisterInput) {
    return this.identityService.register(input);
  }

  @Get("bootstrap-status")
  @Public()
  @RateLimit("auth.login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Kiểm tra trạng thái khởi tạo admin đầu tiên" })
  @ApiResponse({ status: 200, description: "Trạng thái bootstrap" })
  async bootstrapStatus() {
    return this.identityService.getBootstrapStatus();
  }

  @Post("bootstrap-admin")
  @Public()
  @RateLimit("auth.login")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Tạo tài khoản quản trị đầu tiên khi hệ thống chưa có dữ liệu" })
  @ApiResponse({ status: 201, description: "Tạo tài khoản quản trị đầu tiên thành công" })
  @ApiResponse({ status: 409, description: "Hệ thống đã có tài khoản quản trị" })
  async bootstrapAdmin(
    @Body(ZodValidate(bootstrapAdminSchema)) input: BootstrapAdminInput,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.identityService.bootstrapFirstAdmin(input, {
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
    });

    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return { user: result.user };
  }

  @Post("refresh")
  @Public()
  @RateLimit("auth.refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Làm mới token" })
  @ApiResponse({ status: 200, description: "Token đã được làm mới" })
  @ApiResponse({ status: 401, description: "Refresh token không hợp lệ" })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = this.extractCookieValue(req, REFRESH_TOKEN_COOKIE);

    if (!refreshToken) {
      this.clearAuthCookies(res);
      throw new UnauthorizedError("Chưa đăng nhập");
    }

    const result = await this.identityService.refresh(refreshToken, {
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
    });

    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    return { user: result.user };
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Đăng xuất" })
  @ApiResponse({ status: 200, description: "Đã đăng xuất" })
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.identityService.logout(user.sessionId, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    this.clearAuthCookies(res);

    return { success: true };
  }

  @Post("logout-all")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Đăng xuất tất cả thiết bị" })
  @ApiResponse({ status: 200, description: "Đã đăng xuất tất cả" })
  async logoutAll(
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.identityService.logoutAll(user.id, user.sessionId, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    this.clearAuthCookies(res);

    return { success: true };
  }

  @Get("me")
  @ApiOperation({ summary: "Lấy trạng thái phiên xác thực (AuthSessionStateDto)" })
  @ApiResponse({ status: 200, description: "Auth bootstrap aggregate cho client gating" })
  async me(@CurrentUser() user: AuthenticatedUser) {
    return this.identityService.getAuthSessionState(user.id, user.sessionId);
  }

  @Post("verify-email")
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Xác minh email bằng token" })
  @ApiResponse({ status: 200, description: "Email đã được xác minh" })
  @ApiResponse({ status: 400, description: "Token không hợp lệ hoặc đã hết hạn" })
  async verifyEmail(@Body(ZodValidate(verifyEmailSchema)) body: VerifyEmailInput) {
    return this.identityService.verifyEmail(body.token);
  }

  @Post("send-verification")
  @RateLimit("auth.login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Gửi lại email xác minh" })
  @ApiResponse({ status: 200, description: "Email xác minh đã được gửi" })
  async sendVerification(@CurrentUser() user: AuthenticatedUser) {
    return this.identityService.sendEmailVerification(user.id);
  }

  @Delete("me/account")
  @RateLimit("auth.login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Yêu cầu xóa tài khoản (PDPA — NĐ 13/2023 Điều 16)" })
  @ApiResponse({ status: 200, description: "Yêu cầu đã ghi nhận, xóa sau 30 ngày" })
  async deleteMyAccount(
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.identityService.requestAccountDeletion(user.id, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    // Clear cookies immediately — sessions already revoked in service
    this.clearAuthCookies(res);

    return result;
  }

  @Get("me/data-export")
  @RateLimit("data.export")
  @ApiOperation({ summary: "Xuất toàn bộ dữ liệu cá nhân (PDPA — NĐ 13/2023)" })
  @ApiResponse({ status: 200, description: "Dữ liệu cá nhân đầy đủ" })
  @ApiResponse({ status: 429, description: "Giới hạn 2 lần/ngày" })
  async exportMyData(@CurrentUser() user: AuthenticatedUser) {
    return this.identityService.exportPersonalData(user.id);
  }

  @Patch("profile")
  @ApiOperation({ summary: "Cập nhật hồ sơ" })
  @ApiResponse({ status: 200, description: "Đã cập nhật" })
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body(ZodValidate(updateProfileSchema)) input: UpdateProfileInput,
    @Req() req: Request,
  ) {
    return this.identityService.updateProfile(user.id, input, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Post("change-password")
  @RateLimit("auth.login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Đổi mật khẩu" })
  @ApiResponse({ status: 200, description: "Đã đổi mật khẩu" })
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body(ZodValidate(changePasswordSchema)) input: ChangePasswordInput,
    @Req() req: Request,
  ) {
    return this.identityService.changePassword(user.id, input, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  @Post("forgot-password")
  @Public()
  @RateLimit("auth.login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Yêu cầu đặt lại mật khẩu" })
  @ApiResponse({ status: 200, description: "Yêu cầu đã được xử lý" })
  async forgotPassword(
    @Body(ZodValidate(forgotPasswordSchema)) input: ForgotPasswordInput,
  ) {
    return this.identityService.requestPasswordReset(input);
  }

  @Post("reset-password")
  @Public()
  @RateLimit("auth.login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Đặt lại mật khẩu bằng token" })
  @ApiResponse({ status: 200, description: "Mật khẩu đã được đặt lại" })
  @ApiResponse({ status: 400, description: "Token không hợp lệ hoặc đã hết hạn" })
  async resetPassword(
    @Body(ZodValidate(resetPasswordSchema)) input: ResetPasswordInput,
  ) {
    return this.identityService.resetPassword(input);
  }

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const domain = this.resolveCookieDomain();
    const baseOptions = {
      secure: this.configService.cookieSecure,
      sameSite: "lax" as const,
      path: "/",
      ...(domain ? { domain } : {}),
    };

    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      ...baseOptions,
      httpOnly: true,
      maxAge: this.configService.accessTokenTtlMinutes * 60 * 1000,
    });

    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...baseOptions,
      httpOnly: true,
      maxAge: this.configService.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
    });

    // Non-httpOnly CSRF token — JS-readable for double-submit cookie pattern
    const csrfToken = randomBytes(32).toString("hex");
    res.cookie("csrf_token", csrfToken, {
      ...baseOptions,
      httpOnly: false,
      maxAge: this.configService.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
    });
  }

  private clearAuthCookies(res: Response) {
    const domain = this.resolveCookieDomain();
    const baseOptions = {
      secure: this.configService.cookieSecure,
      sameSite: "lax" as const,
      path: "/",
      ...(domain ? { domain } : {}),
    };

    res.clearCookie(ACCESS_TOKEN_COOKIE, { ...baseOptions, httpOnly: true });
    res.clearCookie(REFRESH_TOKEN_COOKIE, { ...baseOptions, httpOnly: true });
    res.clearCookie("csrf_token", { ...baseOptions, httpOnly: false });
  }

  private extractCookieValue(req: Request, key: string): string | undefined {
    const cookies = req.cookies as Record<string, unknown> | undefined;
    const value = cookies?.[key];
    return typeof value === "string" ? value : undefined;
  }

  private resolveCookieDomain(): string | undefined {
    const configuredDomain = this.configService.cookieDomain?.trim();
    if (!configuredDomain) {
      return undefined;
    }

    const normalizedDomain = configuredDomain.replace(/^\./, "").toLowerCase();
    if (
      normalizedDomain === "localhost" ||
      normalizedDomain === "127.0.0.1" ||
      normalizedDomain === "::1"
    ) {
      return undefined;
    }

    return configuredDomain;
  }
}
