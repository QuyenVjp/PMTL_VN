export const engagementKeys = {
  all: ["engagement"] as const,

  gongke: () => [...engagementKeys.all, "gongke"] as const,
  gongkeList: (params?: Record<string, unknown>) =>
    [...engagementKeys.gongke(), "list", params] as const,
  gongkeByDate: (date: string) => [...engagementKeys.gongke(), "date", date] as const,

  repentance: () => [...engagementKeys.all, "repentance"] as const,
  repentanceList: (params?: Record<string, unknown>) =>
    [...engagementKeys.repentance(), "list", params] as const,
  repentanceByDate: (date: string) => [...engagementKeys.repentance(), "date", date] as const,

  littleHouse: () => [...engagementKeys.all, "little-house"] as const,
  littleHouseList: (params?: Record<string, unknown>) =>
    [...engagementKeys.littleHouse(), "list", params] as const,
  littleHouseById: (publicId: string) =>
    [...engagementKeys.littleHouse(), "detail", publicId] as const,

  practiceProfile: () => [...engagementKeys.all, "practice-profile"] as const,

  activation: () => [...engagementKeys.all, "activation"] as const,
  activationList: (params?: Record<string, unknown>) =>
    [...engagementKeys.activation(), "list", params] as const,

  meritSummary: () => [...engagementKeys.all, "merit-summary"] as const,
};
