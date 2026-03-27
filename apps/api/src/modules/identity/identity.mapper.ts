import type { User } from "../../generated/prisma/client.js";
import type { AuthResponse } from "./identity.schemas.js";

export function mapUserToAuthResponse(user: Omit<User, "passwordHash">): AuthResponse {
  return {
    user: {
      id: user.publicId,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
  };
}
