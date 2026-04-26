import type { User } from "../../generated/prisma/client.js";
import type { AuthResponse } from "./identity.schemas.js";

type AuthResponseUser = Pick<User, "publicId" | "email" | "displayName" | "role" | "avatarUrl">;

export function mapUserToAuthResponse(user: AuthResponseUser): AuthResponse {
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
