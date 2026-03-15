import { mapCommunityCommentToDTO, submitCommunityComment } from "@/collections/CommunityComments/service";
import { findCollectionDocument, getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";
import { requireSession } from "@/routes/session";

export async function GET(_request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  try {
    const payload = await getCmsPayload();
    const { publicId } = await params;
    const post = await findCollectionDocument("communityPosts", publicId);

    if (!post) {
      return jsonResponse(404, { error: { message: "Community post not found." } });
    }

    const result = await payload.find({
      collection: "communityComments",
      depth: 1,
      limit: 100,
      where: {
        post: {
          equals: post.id,
        },
      },
    });

    return jsonResponse(200, {
      ...result,
      docs: result.docs.map(mapCommunityCommentToDTO),
    });
  } catch (error) {
    return mapRouteError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  try {
    const payload = await getCmsPayload();
    const session = await requireSession(request.headers);
    const { publicId } = await params;
    const post = await findCollectionDocument("communityPosts", publicId);

    if (!post) {
      return jsonResponse(404, { error: { message: "Community post not found." } });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const parentPublicId = typeof body.parentPublicId === "string" ? body.parentPublicId : null;
    const parentComment = parentPublicId
      ? await findCollectionDocument("communityComments", parentPublicId, { slugField: "publicId" })
      : null;

    const created = await payload.create({
      collection: "communityComments",
      data: submitCommunityComment({
        post: post.id,
        parent: parentComment?.id ?? null,
        content: typeof body.content === "string" ? body.content : "",
        authorUser: Number(session.user.id),
        authorNameSnapshot: session.user.displayName,
      }) as never,
      overrideAccess: true,
    });

    return jsonResponse(201, mapCommunityCommentToDTO(created));
  } catch (error) {
    return mapRouteError(error);
  }
}
