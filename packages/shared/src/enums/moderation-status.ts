export const moderationStatusValues = ["pending", "approved", "rejected", "flagged", "hidden"] as const;

export type ModerationStatus = (typeof moderationStatusValues)[number];
