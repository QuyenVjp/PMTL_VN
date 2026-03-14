import { z } from "zod";

export const commentCreateSchema = z.object({
  postId: z.string().min(1),
  authorName: z.string().min(2).max(120),
  authorEmail: z.email(),
  content: z.string().min(5).max(2000),
});

export type CommentCreateSchema = z.infer<typeof commentCreateSchema>;

