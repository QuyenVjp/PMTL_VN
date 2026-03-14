export const userRoleValues = [
  "super-admin",
  "admin",
  "editor",
  "moderator",
  "member",
] as const;

export type UserRole = (typeof userRoleValues)[number];

