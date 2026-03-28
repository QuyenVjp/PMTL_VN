import type { Vow, User } from "../../generated/prisma/client.js";

type UserSummary = Pick<User, "publicId" | "displayName" | "email" | "avatarUrl">;
type VowWithUser = Vow & { user: UserSummary };

export function mapVowToAdminItem(vow: VowWithUser) {
  return {
    publicId: vow.publicId,
    vowType: vow.vowType,
    description: vow.description,
    targetCount: vow.targetCount,
    currentCount: vow.currentCount,
    status: vow.status,
    startDate: vow.startDate.toISOString(),
    member: {
      publicId: vow.user.publicId,
      displayName: vow.user.displayName,
      email: vow.user.email,
      avatarUrl: vow.user.avatarUrl,
    },
    createdAt: vow.createdAt.toISOString(),
  };
}
