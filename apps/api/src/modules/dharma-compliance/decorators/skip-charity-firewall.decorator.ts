/**
 * SkipCharityFirewall Decorator
 *
 * Marks a route handler to skip CharityFirewall scanning.
 * Used for admin-only routes and other exempt endpoints.
 *
 * Usage:
 * @Post('/admin/content')
 * @SkipCharityFirewall()
 * createContentAsAdmin() { ... }
 */

import { SetMetadata } from "@nestjs/common";

export const SKIP_CHARITY_FIREWALL = "skip_charity_firewall";

export function SkipCharityFirewall() {
  return SetMetadata(SKIP_CHARITY_FIREWALL, true);
}
