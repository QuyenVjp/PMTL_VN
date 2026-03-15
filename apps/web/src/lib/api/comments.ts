import { cmsGet } from "@/lib/cms/client";
import type { BlogComment, BlogCommentThread } from "@/types/cms";

type PayloadComment = {
  id?: number | string | null;
  documentId?: string | null;
  post?: {
    documentId?: string | null;
    title?: string | null;
    slug?: string | null;
  } | null;
  parent?: string | null;
  content?: string | null;
  authorName?: string | null;
  authorAvatar?: string | null;
  likes?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  replies?: PayloadComment[] | null;
};

type PayloadCommentList = {
  docs?: PayloadComment[];
  totalDocs?: number;
  totalPages?: number;
  page?: number;
  limit?: number;
};

function mapComment(comment: PayloadComment): BlogComment {
  return {
    id: typeof comment.id === "number" || typeof comment.id === "string" ? comment.id : 0,
    documentId: comment.documentId ?? String(comment.id ?? ""),
    authorName: comment.authorName ?? "Khách",
    authorAvatar: comment.authorAvatar ?? null,
    userId: null,
    content: comment.content ?? "",
    likes: typeof comment.likes === "number" ? comment.likes : 0,
    createdAt: comment.createdAt ?? new Date(0).toISOString(),
    updatedAt: comment.updatedAt ?? new Date(0).toISOString(),
    publishedAt: comment.createdAt ?? null,
    post: comment.post
      ? {
          documentId: comment.post.documentId ?? "",
          title: comment.post.title ?? "",
          slug: comment.post.slug ?? "",
        }
      : null,
    replies: Array.isArray(comment.replies) ? comment.replies.map(mapComment) : [],
  };
}

function mapCommentThread(payload: PayloadCommentList): BlogCommentThread {
  const data = Array.isArray(payload.docs) ? payload.docs.map(mapComment) : [];
  const total = typeof payload.totalDocs === "number" ? payload.totalDocs : data.length;
  const pageSize = typeof payload.limit === "number" ? payload.limit : 20;
  const page = typeof payload.page === "number" ? payload.page : 1;
  const pageCount =
    typeof payload.totalPages === "number" ? payload.totalPages : Math.max(1, Math.ceil(total / pageSize));

  return {
    data,
    meta: {
      pagination: {
        page,
        pageSize,
        pageCount,
        total,
      },
    },
  };
}

export async function getCommentsByPostSlug(
  slug: string,
  page = 1,
  pageSize = 20,
): Promise<BlogCommentThread> {
  const result = await cmsGet<PayloadCommentList>(
    `/api/posts/${encodeURIComponent(slug)}/comments?page=${page}&limit=${pageSize}`,
    {
      cache: "no-store",
    },
  );

  return mapCommentThread(result);
}

export async function getLatestComments(limit = 5): Promise<BlogComment[]> {
  const result = await cmsGet<BlogCommentThread>(`/api/comments/latest?limit=${limit}`, {
    cache: "no-store",
  });

  return result.data ?? [];
}
