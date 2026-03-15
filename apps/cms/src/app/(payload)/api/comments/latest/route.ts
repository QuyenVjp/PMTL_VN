import { getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";
import { commentThreadQuerySchema } from "@pmtl/shared";

export async function GET(request: Request) {
  try {
    const payload = await getCmsPayload();
    const url = new URL(request.url);
    const { pageSize } = commentThreadQuerySchema.parse({
      page: "1",
      pageSize: url.searchParams.get("limit") ?? "5",
    });

    const result = await payload.find({
      collection: "postComments",
      depth: 2,
      limit: pageSize,
      page: 1,
      sort: "-createdAt",
      overrideAccess: true,
      where: {
        parent: {
          exists: false,
        },
        moderationStatus: {
          equals: "approved",
        },
        isHidden: {
          not_equals: true,
        },
      },
    });

    const docs = result.docs.map((comment) => ({
      id: typeof comment.id === "number" ? comment.id : Number(comment.id ?? 0),
      documentId: comment.publicId ?? String(comment.id ?? ""),
      authorName: comment.authorName ?? "Khách",
      authorAvatar: comment.authorAvatar ?? "",
      content: comment.content ?? "",
      likes: typeof comment.likes === "number" ? comment.likes : 0,
      createdAt: comment.createdAt ?? null,
      updatedAt: comment.updatedAt ?? null,
      replies: [],
      post:
        comment.post && typeof comment.post === "object"
          ? {
              documentId: comment.post.publicId ?? String(comment.post.id ?? ""),
              title: comment.post.title ?? "",
              slug: comment.post.slug ?? "",
            }
          : null,
    }));

    return jsonResponse(200, {
      data: docs,
      meta: {
        pagination: {
          page: 1,
          pageSize,
          pageCount: 1,
          total: docs.length,
        },
      },
    });
  } catch (error) {
    return mapRouteError(error);
  }
}
