export const contentStatusValues = ["draft", "published", "archived"] as const;

export type ContentStatus = (typeof contentStatusValues)[number];

