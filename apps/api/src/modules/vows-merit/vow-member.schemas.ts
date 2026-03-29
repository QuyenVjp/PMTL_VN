import { z } from "zod";

// Member-facing vow creation/tracking (tách với admin-assisted flow đã có)
export const createVowSchema = z
  .object({
    vowType: z.enum(["LIFE_RELEASE", "CHANTING", "SUTRA_READING", "CUSTOM"]),
    description: z.string().min(5).max(2000),
    targetCount: z.number().int().min(1).optional(),
    startDate: z.string().date(),
    endDate: z.string().date().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.endDate && val.endDate < val.startDate) {
      ctx.addIssue({
        code: "custom",
        message: "Ngày hoàn nguyện phải sau ngày phát nguyện",
        path: ["endDate"],
      });
    }
  });
export type CreateVowInput = z.infer<typeof createVowSchema>;

export const updateVowProgressSchema = z.object({
  publicId: z.string().min(1),
  addCount: z.number().int().min(1).max(10000),
  note: z.string().max(500).optional(),
});
export type UpdateVowProgressInput = z.infer<typeof updateVowProgressSchema>;

export const fulfillVowSchema = z.object({
  publicId: z.string().min(1),
});
export type FulfillVowInput = z.infer<typeof fulfillVowSchema>;

export const addMeritTransferSchema = z.object({
  vowPublicId: z.string().min(1),
  transferPercent: z.number().int().min(1).max(100),
  targetLabel: z.string().min(1).max(200),
  note: z.string().max(500).optional(),
});
export type AddMeritTransferInput = z.infer<typeof addMeritTransferSchema>;

export const memberVowQuerySchema = z.object({
  status: z.enum(["ACTIVE", "COMPLETED", "VOIDED"]).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
export type MemberVowQuery = z.infer<typeof memberVowQuerySchema>;
