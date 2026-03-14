import { buildCommentData, validateCommentInput } from "@/services/comment.service";

type CommentInput = {
  post?: string;
  authorName?: string;
  authorEmail?: string;
  content?: string;
  status?: string;
};

export function prepareCommentData(input: CommentInput): CommentInput {
  validateCommentInput(input);
  return buildCommentData(input);
}

