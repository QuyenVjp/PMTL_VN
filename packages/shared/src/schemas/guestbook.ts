import { z } from "zod";

export const guestbookEntryTypeSchema = z.enum(["message", "question"]);

export const guestbookSubmitSchema = z
  .object({
    authorName: z.string().trim().min(1, "Vui long nhap ten.").max(100, "Ten qua dai."),
    entryType: guestbookEntryTypeSchema,
    questionCategory: z.string().trim().max(100, "Chu de qua dai.").optional().or(z.literal("")),
    message: z.string().trim().min(5, "Noi dung qua ngan.").max(2000, "Noi dung qua dai."),
  })
  .superRefine((value, ctx) => {
    if (value.entryType === "question" && !value.questionCategory?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["questionCategory"],
        message: "Vui long chon chu de cau hoi.",
      });
    }
  });

export type GuestbookSubmitInput = z.infer<typeof guestbookSubmitSchema>;
