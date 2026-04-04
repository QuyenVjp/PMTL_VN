import { z } from "zod";

// 6 bước lifecycle: DRAFT -> SIGNED -> CHANTED -> BURNED
// special case phải có confirm step trước khi chuyển trạng thái

// Phase 12: Added purpose, recipientName, offerTo for Logic 1 & 2
export const createLittleHouseSchema = z
  .object({
    recipient: z.string().min(1).max(200),
    recipientName: z.string().min(1).max(200).optional(),
    purpose: z
      .enum([
        "GENERAL_SUPPORT",
        "RESOLVE_CONFLICT",
        "DECEASED",
        "FETAL_SPIRIT",
        "SELF_ACCUMULATE",
        "HEALTH_ISSUE",
        "CUSTOM",
      ])
      .default("GENERAL_SUPPORT"),
    sheetsCount: z.number().int().min(1).max(999).default(1),
    specialCase: z.boolean().default(false),
  })
  .superRefine((val, ctx) => {
    // Logic 2: Conflict naming blocker
    if (val.purpose === "RESOLVE_CONFLICT" && val.recipientName) {
      ctx.addIssue({
        code: "custom",
        message:
          "LUẬT QUY ĐỊNH: Trên Ngôi Nhà Nhỏ hóa giải oán kết chỉ được xuất hiện tên của bạn, TUYỆT ĐỐI không ghi tên đối phương lên giấy.",
        path: ["recipientName"],
      });
    }
  });
export type CreateLittleHouseInput = z.infer<typeof createLittleHouseSchema>;

export const advanceLittleHouseSchema = z
  .object({
    publicId: z.string().min(1),
    // nextStatus phải đúng thứ tự lifecycle
    nextStatus: z.enum(["SIGNED", "CHANTED", "BURNED"]),
    // bắt buộc khi nextStatus === "BURNED"
    burnDate: z.string().datetime().optional(),
    postBurnNote: z.string().max(1000).optional(),
    // bắt buộc confirm khi là special case
    specialCaseConfirmed: z.boolean().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.nextStatus === "BURNED" && !val.burnDate) {
      ctx.addIssue({
        code: "custom",
        message: "burnDate là bắt buộc khi đốt ngôi nhà nhỏ",
        path: ["burnDate"],
      });
    }
  });

export type AdvanceLittleHouseInput = z.infer<typeof advanceLittleHouseSchema>;

export const littleHouseQuerySchema = z.object({
  status: z.enum(["DRAFT", "SIGNED", "CHANTED", "BURNED"]).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
export type LittleHouseQuery = z.infer<typeof littleHouseQuerySchema>;
