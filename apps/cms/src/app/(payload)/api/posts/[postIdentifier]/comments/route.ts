import { buildCommentTreeDTO, mapCommentToPublicDTO } from "@/collections/PostComments/service";
import { commentThreadQuerySchema } from "@pmtl/shared";
import { cachedFetch } from "@/services/cache.service";
import { buildPublicCacheHeaders, findCollectionDocument, getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";

export async function GET(request: Request, { params }: { params: Promise<{ postIdentifier: string }> }) {
  try {
    const { postIdentifier } = await params;
    const post = await findCollectionDocument("posts", postIdentifier, {
      ttlSeconds: 300,
    });
    const url = new URL(request.url);
    const pagination = commentThreadQuerySchema.parse({
      page: url.searchParams.get("page") ?? "1",
      pageSize: url.searchParams.get("limit") ?? url.searchParams.get("pageSize") ?? "20",
    });

    if (!post) {
      return jsonResponse(404, { error: { message: "Post not found." } });
    }

    const result = await cachedFetch(`post-comments:thread:${post.id}`, 60, async () => {
      const payload = await getCmsPayload();

      return payload.find({
        collection: "postComments",
        depth: 1,
        limit: 500,
        sort: "createdAt",
        overrideAccess: true,
        where: {
          post: {
            equals: post.id,
          },
          moderationStatus: {
            equals: "approved",
          },
          isHidden: {
            not_equals: true,
          },
        },
      });
    });

    const tree = buildCommentTreeDTO(result.docs.map(mapCommentToPublicDTO));
    const start = (pagination.page - 1) * pagination.pageSize;
    const docs = tree.slice(start, start + pagination.pageSize);

    return jsonResponse(
      200,
      {
        docs,
        totalDocs: tree.length,
        totalPages: Math.max(1, Math.ceil(tree.length / pagination.pageSize)),
        page: pagination.page,
        limit: pagination.pageSize,
      },
      {
        headers: buildPublicCacheHeaders(60, {
          staleWhileRevalidateSeconds: 180,
        }),
      },
    );
  } catch (error) {
    return mapRouteError(error);
  }
}
