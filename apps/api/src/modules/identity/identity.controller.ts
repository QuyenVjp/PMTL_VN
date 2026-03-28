import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UsePipes,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import type { Request, Response } from "express";
import { Public } from "../../common/decorators/public.decorator.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";
import type { AuthenticatedUser } from "../../common/auth/auth-request.types.js";
import { IdentityService } from "./identity.service.js";
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
  changePasswordSchema,
  type LoginInput,
  type RegisterInput,
  type UpdateProfileInput,
  type ChangePasswordInput,
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
  @HttpCode(HttpStatus.OK)
  @UsePipes(ZodValidate(loginSchema))
  @ApiOperation({ summary: "Đăng nhập" })
  @ApiResponse({ status: 200, description: "Đăng nhập thành công" })
  @ApiResponse({ status: 401, description: "Email hoặc mật khẩu không đúng" })
  async login(
    @Body() input: LoginInput,
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
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(ZodValidate(registerSchema))
  @ApiOperation({ summary: "Đăng ký tài khoản mới" })
  @ApiResponse({ status: 201, description: "Đăng ký thành công" })
  @ApiResponse({ status: 409, description: "Email đã được sử dụng" })
  async register(@Body() input: RegisterInput) {
    return this.identityService.register(input);
  }

  @Post("refresh")
  @Public()
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
  @ApiOperation({ summary: "Lấy thông tin người dùng hiện tại" })
  @ApiResponse({ status: 200, description: "Thông tin người dùng" })
  async me(@CurrentUser() user: AuthenticatedUser) {
    return this.identityService.getProfile(user.id);
  }

  @Patch("profile")
  @UsePipes(ZodValidate(updateProfileSchema))
  @ApiOperation({ summary: "Cập nhật hồ sơ" })
  @ApiResponse({ status: 200, description: "Đã cập nhật" })
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: UpdateProfileInput,
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
  @HttpCode(HttpStatus.OK)
  @UsePipes(ZodValidate(changePasswordSchema))
  @ApiOperation({ summary: "Đổi mật khẩu" })
  @ApiResponse({ status: 200, description: "Đã đổi mật khẩu" })
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: ChangePasswordInput,
    @Req() req: Request,
  ) {
    return this.identityService.changePassword(user.id, input, {
      actorId: user.id,
      actorType: "user",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const domain = this.resolveCookieDomain();
    const cookieOptions = {
      httpOnly: true,
      secure: this.configService.cookieSecure,
      sameSite: "lax" as const,
      path: "/",
      ...(domain ? { domain } : {}),
    };

    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      ...cookieOptions,
      maxAge: this.configService.accessTokenTtlMinutes * 60 * 1000,
    });

    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...cookieOptions,
      maxAge: this.configService.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
    });
  }

  private clearAuthCookies(res: Response) {
    const domain = this.resolveCookieDomain();
    const cookieOptions = {
      httpOnly: true,
      secure: this.configService.cookieSecure,
      sameSite: "lax" as const,
      path: "/",
      ...(domain ? { domain } : {}),
    };

    res.clearCookie(ACCESS_TOKEN_COOKIE, cookieOptions);
    res.clearCookie(REFRESH_TOKEN_COOKIE, cookieOptions);
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
