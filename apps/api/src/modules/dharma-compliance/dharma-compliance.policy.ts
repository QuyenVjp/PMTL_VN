import { Injectable, ForbiddenException } from "@nestjs/common";
import type { AuthenticatedUser } from "../../common/auth/auth-request.types.js";

@Injectable()
export class DharmaCompliancePolicy {
  assertAdmin(user: AuthenticatedUser): void {
    if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      throw new ForbiddenException("Yêu cầu quyền admin");
    }
  }

  assertSelf(user: AuthenticatedUser, resourceUserId: string): void {
    if (user.id !== resourceUserId && !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      throw new ForbiddenException("Không có quyền truy cập");
    }
  }

  assertCanRespondGuidance(user: AuthenticatedUser): void {
    if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      throw new ForbiddenException("Yêu cầu quyền Dharma Support");
    }
  }
}
