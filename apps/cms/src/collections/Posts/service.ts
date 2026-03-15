import {
  buildPostData,
  ensurePostCanPublish,
  generatePostSlug,
  derivePostExcerpt,
  extractPostPlainText,
  buildNormalizedPostSearchText,
  mapPostToPublicDTO,
  mapPostToLegacyDTO,
  syncPostSearchDocument,
  incrementPostViewWithCooldown,
  recomputePostCommentCount,
  validatePostTypeConstraints,
} from "@/services/post.service";

type PostInput = {
  publicId?: string | null | undefined;
  postType?: string | null | undefined;
  sourceRef?: string | null | undefined;
  title?: string | null | undefined;
  content?: unknown;
  slug?: string | null | undefined;
  excerptOverride?: string | null | undefined;
  excerptComputed?: string | null | undefined;
  primaryCategory?: string | number | { id?: string | number | null } | null | undefined;
  categories?: (string | number | { id?: string | number | null })[] | null | undefined;
  tags?: (string | number | { id?: string | number | null })[] | null | undefined;
  coverMedia?: string | number | { id?: string | number | null } | null | undefined;
  gallery?: (string | number | { id?: string | number | null })[] | null | undefined;
  source?:
    | {
        sourceName?: string | null | undefined;
        sourceTitle?: string | null | undefined;
        sourceUrl?: string | null | undefined;
      }
    | null
    | undefined;
  series?:
    | {
        seriesKey?: string | null | undefined;
        seriesNumber?: number | null | undefined;
      }
    | null
    | undefined;
  eventContext?:
    | {
        eventDate?: string | null | undefined;
        location?: string | null | undefined;
        relatedEvent?: string | number | { id?: string | number | null } | null | undefined;
      }
    | null
    | undefined;
  postFlags?:
    | {
        featured?: boolean | null | undefined;
        allowComments?: boolean | null | undefined;
      }
    | null
    | undefined;
  relatedPosts?: (string | number | { id?: string | number | null })[] | null | undefined;
  seo?: Record<string, unknown> | null | undefined;
  contentPlainText?: string | null | undefined;
  normalizedSearchText?: string | null | undefined;
  status?: string | null | undefined;
  _status?: "draft" | "published" | null | undefined;
  publishedAt?: string | null | undefined;
  commentCount?: number | null | undefined;
  views?: number | null | undefined;
  uniqueViews?: number | null | undefined;
  likes?: number | null | undefined;
};

export function preparePostData(input: PostInput): PostInput {
  ensurePostCanPublish(input);
  return buildPostData(input);
}

export {
  buildNormalizedPostSearchText,
  derivePostExcerpt,
  extractPostPlainText,
  generatePostSlug,
  incrementPostViewWithCooldown,
  mapPostToLegacyDTO,
  mapPostToPublicDTO,
  recomputePostCommentCount,
  syncPostSearchDocument,
  validatePostTypeConstraints,
};

