import {
  buildCommentData,
  buildCommentTreeDTO,
  mapCommentToPublicDTO,
  moderateComment,
  recomputePostCommentCount,
  sanitizeCommentContent,
  scoreCommentSpam,
  submitPostComment,
  validateCommentInput,
} from "@/services/comment.service";

type PostCommentInput = {
  publicId?: string | null;
  post?: string | number | null;
  parent?: string | number | null;
  content?: string | null;
  authorName?: string | null;
  authorAvatar?: string | null;
  badge?: string | null;
  isOfficialReply?: boolean | null;
  submittedByUser?: string | number | null;
  submittedByIpHash?: string | null;
  moderationStatus?: "pending" | "approved" | "rejected" | "flagged" | "hidden" | null;
  spamScore?: number | null;
  reportCount?: number | null;
  lastReportReason?: string | null;
  isHidden?: boolean | null;
};

export function preparePostCommentData(input: PostCommentInput): PostCommentInput {
  validateCommentInput({
    ...input,
    authorEmail: "guest@pmtl.local",
  });

  return buildCommentData({
    ...input,
    authorEmail: "guest@pmtl.local",
  }) as PostCommentInput;
}

export {
  buildCommentTreeDTO,
  mapCommentToPublicDTO,
  moderateComment,
  recomputePostCommentCount,
  sanitizeCommentContent,
  scoreCommentSpam,
  submitPostComment,
};
