export const userStatusValues = ["active", "pending", "suspended"] as const;

export type UserStatus = (typeof userStatusValues)[number];

