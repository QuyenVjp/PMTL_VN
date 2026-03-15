import { mapCommentToPublicDTO, submitPostComment } from "@/collections/PostComments/service";
import { findCollectionDocument, getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";
import { getRequestIpHash } from "@/routes/request-metadata";
import { getOptionalSession } from "@/routes/session";

export async function POST(request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  try {
    const payload = await getCmsPayload();
    const { publicId } = await params;
    const post = await findCollectionDocument("posts", publicId);

    if (!post) {
      return jsonResponse(404, { error: { message: "Post not found." } });
    }

    const session = await getOptionalSession(request.headers);
    const body = (await request.json()) as Record<string, unknown>;
    const parentPublicId = typeof body.parentPublicId === "string" ? body.parentPublicId : null;
    const parentComment = parentPublicId
      ? await findCollectionDocument("postComments", parentPublicId, { slugField: "publicId" })
      : null;

    const created = await submitPostComment(payload, {
      post: post.id,
      parent: parentComment?.id ?? null,
      content: typeof body.content === "string" ? body.content : "",
      authorName:
        session?.user.displayName ??
        (typeof body.authorName === "string" ? body.authorName : "Khách"),
      authorAvatar: typeof body.authorAvatar === "string" ? body.authorAvatar : "",
      submittedByUser: session ? Number(session.user.id) : null,
      submittedByIpHash: getRequestIpHash(request.headers),
    });

    return jsonResponse(201, mapCommentToPublicDTO(created));
  } catch (error) {
    return mapRouteError(error);
  }
}
