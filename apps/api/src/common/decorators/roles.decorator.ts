import { SetMetadata } from "@nestjs/common";
import type { UserRole } from "../../generated/prisma/client.js";
import { ROLES_KEY } from "../auth/roles.guard.js";

/**
 * Restrict route to specific roles.
 * Works with RolesGuard — must be applied via @UseGuards(RolesGuard) on the controller or route.
 *
 * @example
 * @Roles('ADMIN', 'SUPER_ADMIN')
 * @Get('users')
 * listUsers() { ... }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
