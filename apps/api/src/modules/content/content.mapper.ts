import type { Post, PostCategory, PostTag, PostTagMap, User } from "../../generated/prisma/client.js";
import type { PostResponse } from "./content.schemas.js";

type PostWithRelations = Post & {
  author: Pick<User, "publicId" | "displayName" | "avatarUrl">;
  primaryCategory: Pick<PostCategory, "publicId" | "name" | "slug"> | null;
  tags: Array<PostTagMap & { tag: Pick<PostTag, "publicId" | "name" | "slug"> }>;
};

export function mapPostToResponse(post: PostWithRelations, featuredImageUrl?: string | null): PostResponse {
  return {
    id: post.publicId,
    slug: post.slug,
    title: post.title,
    postType: post.postType,
    sourceRef: post.sourceRef ?? null,
    excerpt: post.excerpt ?? null,
    content: post.content as Record<string, unknown>,
    status: post.status,
    featured: post.featured,
    allowComments: post.allowComments,
    author: {
      id: post.author.publicId,
      displayName: post.author.displayName,
      avatarUrl: post.author.avatarUrl,
    },
    primaryCategory: post.primaryCategory
      ? { id: post.primaryCategory.publicId, name: post.primaryCategory.name, slug: post.primaryCategory.slug }
      : null,
    tags: post.tags.map((t) => ({ id: t.tag.publicId, name: t.tag.name, slug: t.tag.slug })),
    featuredImageUrl: featuredImageUrl ?? null,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    firstPublishedAt: post.firstPublishedAt?.toISOString() ?? null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}
