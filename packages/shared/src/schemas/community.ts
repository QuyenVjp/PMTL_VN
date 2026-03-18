import { z } from "zod";

export const communityPostTypeSchema = z.enum(["story", "question", "reflection", "feedback", "video"]);

export const communityCommentSubmitSchema = z.object({
  postDocumentId: z.string().trim().min(1, "Thieu bai viet."),
  content: z.string().trim().min(3, "Binh luan qua ngan.").max(2000, "Binh luan qua dai."),
  parentDocumentId: z.string().trim().min(1).optional(),
  author_name: z.string().trim().min(2, "Ten qua ngan.").max(120, "Ten qua dai.").optional(),
});

export const communityPostSubmitSchema = z.object({
  title: z.string().trim().min(5, "Tieu de qua ngan.").max(160, "Tieu de qua dai."),
  content: z.string().trim().min(20, "Noi dung qua ngan.").max(10000, "Noi dung qua dai."),
  type: communityPostTypeSchema.default("story"),
  category: z.string().trim().max(100, "Chuyen muc qua dai.").optional().default(""),
  video_url: z.string().trim().url("Video URL khong hop le.").optional().or(z.literal("")),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  author_name: z.string().trim().min(2, "Ten qua ngan.").max(120, "Ten qua dai.").optional(),
});

export type CommunityCommentSubmitInput = z.infer<typeof communityCommentSubmitSchema>;
export type CommunityPostSubmitInput = z.infer<typeof communityPostSubmitSchema>;
