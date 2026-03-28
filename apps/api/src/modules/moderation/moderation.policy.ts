import type { UserRole, ReportStatus } from "../../generated/prisma/client.js";
import { ConflictError } from "../../common/errors/app-error.js";

/** Authorization: only admins and super-admins may decide on reports */
export function canDecideReport(role: UserRole): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

/**
 * Business invariant: a report must be PENDING before a decision can be applied.
 * Throws ConflictError if already resolved — callers should not catch this defensively,
 * it propagates as a 409 via GlobalExceptionFilter.
 */
export function assertReportIsPending(status: ReportStatus): void {
  if (status !== "PENDING") {
    throw new ConflictError("Báo cáo đã được xử lý");
  }
}

/**
 * Authorization: only admins and super-admins may view moderation reports.
 * This mirrors the @Roles guard on the controller but lets the service layer
 * enforce the rule programmatically when called from other services.
 */
export function canViewReports(role: UserRole): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}
