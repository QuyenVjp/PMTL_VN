import { createParamDecorator } from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";
import type { AuthenticatedUser, RequestWithUser } from "../auth/auth-request.types.js";

export const CurrentUser = createParamDecorator(
  <T extends keyof AuthenticatedUser | undefined>(data: T, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      return undefined;
    }

    return data ? user[data] : user;
  },
);
