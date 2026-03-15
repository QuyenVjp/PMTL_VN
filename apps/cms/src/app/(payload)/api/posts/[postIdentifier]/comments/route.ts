import { buildCommentTreeDTO, mapCommentToPublicDTO } from "@/collections/PostComments/service";
import { commentThreadQuerySchema } from "@pmtl/shared";
import { findCollectionDocument, getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";

export async function GET(request: Request, { params }: { params: Promise<{ postIdentifier: string }> }) {
  try {
    const payload = await getCmsPayload();
    const { postIdentifier } = await params;
    const post = await findCollectionDocument("posts", postIdentifier);
    const url = new URL(request.url);
    const pagination = commentThreadQuerySchema.parse({
      page: url.searchParams.get("page") ?? "1",
      pageSize: url.searchParams.get("limit") ?? url.searchParams.get("pageSize") ?? "20",
    });

    if (!post) {
      return jsonResponse(404, { error: { message: "Post not found." } });
    }

    const result = await payload.find({
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

    const tree = buildCommentTreeDTO(result.docs.map(mapCommentToPublicDTO));
    const start = (pagination.page - 1) * pagination.pageSize;
    const docs = tree.slice(start, start + pagination.pageSize);

    return jsonResponse(200, {
      docs,
      totalDocs: tree.length,
      totalPages: Math.max(1, Math.ceil(tree.length / pagination.pageSize)),
      page: pagination.page,
      limit: pagination.pageSize,
    });
  } catch (error) {
    return mapRouteError(error);
  }
}
