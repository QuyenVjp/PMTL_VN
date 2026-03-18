import { z } from "zod";

export const communityPostTypeSchema = z.enum(["story", "question", "reflection", "feedback", "video"]);

export const communityCommentSubmitSchema = z.object({
  postDocumentId: z.string().trim().min(1, "Thiếu bài viết."),
  content: z.string().trim().min(3, "Bình luận quá ngắn.").max(2000, "Bình luận quá dài."),
  parentDocumentId: z.string().trim().min(1).optional(),
  author_name: z.string().trim().min(2, "Tên quá ngắn.").max(120, "Tên quá dài.").optional(),
});

export const communityPostSubmitSchema = z.object({
  title: z.string().trim().min(5, "Tiêu đề quá ngắn.").max(160, "Tiêu đề quá dài."),
  content: z.string().trim().min(20, "Nội dung quá ngắn.").max(10000, "Nội dung quá dài."),
  type: communityPostTypeSchema.default("story"),
  category: z.string().trim().max(100, "Chuyên mục quá dài.").optional().default(""),
  video_url: z.string().trim().url("Video URL không hợp lệ.").optional().or(z.literal("")),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  author_name: z.string().trim().min(2, "Tên quá ngắn.").max(120, "Tên quá dài.").optional(),
});

export type CommunityCommentSubmitInput = z.infer<typeof communityCommentSubmitSchema>;
export type CommunityPostSubmitInput = z.infer<typeof communityPostSubmitSchema>;
