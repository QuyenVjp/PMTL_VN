import type { Post, User } from "../../generated/prisma/client.js";
import type { PostResponse } from "./content.schemas.js";

type PostWithAuthor = Post & {
  author: Pick<User, "publicId" | "displayName" | "avatarUrl">;
};

export function mapPostToResponse(post: PostWithAuthor, featuredImageUrl?: string | null): PostResponse {
  return {
    id: post.publicId,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content as Record<string, unknown>,
    status: post.status,
    author: {
      id: post.author.publicId,
      displayName: post.author.displayName,
      avatarUrl: post.author.avatarUrl,
    },
    featuredImageUrl: featuredImageUrl ?? null,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}
