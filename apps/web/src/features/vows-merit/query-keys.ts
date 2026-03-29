export const vowsMeritKeys = {
  all: ["vows-merit"] as const,

  vows: () => [...vowsMeritKeys.all, "vows"] as const,
  vowList: (params?: Record<string, unknown>) =>
    [...vowsMeritKeys.vows(), "list", params] as const,
  vowById: (publicId: string) => [...vowsMeritKeys.vows(), "detail", publicId] as const,

  altar: () => [...vowsMeritKeys.all, "altar"] as const,
  altarList: (params?: Record<string, unknown>) =>
    [...vowsMeritKeys.altar(), "list", params] as const,
};
