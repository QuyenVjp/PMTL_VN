import { z } from "zod";

export const moderationReportListQuerySchema = z.object({
  status: z.enum(["PENDING", "RESOLVED_HIDE", "RESOLVED_IGNORE", "RESOLVED_ESCALATE"]).optional(),
  targetType: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const moderationDecisionSchema = z.object({
  decision: z.enum(["hide", "ignore", "escalate"]),
  note: z.string().max(1000).optional(),
});

export const submitReportSchema = z.object({
  targetType: z.enum(["post", "comment", "community_post", "guestbook"]),
  targetId: z.string().min(1),
  reasonCode: z.string().min(1).max(50),
  description: z.string().max(1000).optional(),
});

export const adminCommentQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ModerationReportListQuery = z.infer<typeof moderationReportListQuerySchema>;
export type ModerationDecisionInput = z.infer<typeof moderationDecisionSchema>;
export type SubmitReportInput = z.infer<typeof submitReportSchema>;
export type AdminCommentQuery = z.infer<typeof adminCommentQuerySchema>;
