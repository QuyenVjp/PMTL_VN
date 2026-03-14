export const commentStatusValues = ["pending", "approved", "rejected"] as const;

export type CommentStatus = (typeof commentStatusValues)[number];

