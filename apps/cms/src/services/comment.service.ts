import { commentCreateSchema } from "@pmtl/shared";

type CommentInput = {
  post?: string;
  authorName?: string;
  authorEmail?: string;
  content?: string;
  status?: string;
};

export function validateCommentInput(input: CommentInput): void {
  commentCreateSchema.parse({
    postId: input.post ?? "",
    authorName: input.authorName ?? "",
    authorEmail: input.authorEmail ?? "",
    content: input.content ?? "",
  });
}

export function buildCommentData(input: CommentInput): CommentInput {
  return {
    ...input,
    status: input.status ?? "pending",
  };
}

