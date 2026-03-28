import type { CommunityPost, GuestbookEntry, User } from "../../generated/prisma/client.js";

type AuthorAdmin = Pick<User, "publicId" | "displayName" | "email">;

type PostWithAuthorAdmin = CommunityPost & { author: AuthorAdmin };
type GuestbookWithAuthorAdmin = GuestbookEntry & {
  author: AuthorAdmin;
  approvedBy: Pick<User, "publicId" | "displayName"> | null;
};

export function mapPostToAdminItem(post: PostWithAuthorAdmin) {
  return {
    publicId: post.publicId,
    content: post.content,
    status: post.status,
    isHidden: post.isHidden,
    author: {
      publicId: post.author.publicId,
      displayName: post.author.displayName,
      email: post.author.email,
    },
    createdAt: post.createdAt.toISOString(),
  };
}

export function mapGuestbookEntryToAdminItem(entry: GuestbookWithAuthorAdmin) {
  return {
    publicId: entry.publicId,
    content: entry.content,
    status: entry.status,
    author: {
      publicId: entry.author.publicId,
      displayName: entry.author.displayName,
      email: entry.author.email,
    },
    approvedBy: entry.approvedBy
      ? { publicId: entry.approvedBy.publicId, displayName: entry.approvedBy.displayName }
      : null,
    approvedAt: entry.approvedAt?.toISOString() ?? null,
    createdAt: entry.createdAt.toISOString(),
  };
}
