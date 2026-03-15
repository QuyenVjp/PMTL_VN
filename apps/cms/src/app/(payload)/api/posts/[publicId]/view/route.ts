import { incrementPostViewWithCooldown } from "@/collections/Posts/service";
import { findCollectionDocument, getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";

export async function POST(_request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  try {
    const payload = await getCmsPayload();
    const { publicId } = await params;
    const post = await findCollectionDocument("posts", publicId);

    if (!post) {
      return jsonResponse(404, { error: { message: "Post not found." } });
    }

    const nextDocument = incrementPostViewWithCooldown(payload, post, `post-view:${publicId}`);

    const updated = await payload.update({
      collection: "posts",
      id: post.id,
      data: {
        views: nextDocument.views ?? 0,
      },
      overrideAccess: true,
    });

    return jsonResponse(200, {
      id: updated.publicId ?? String(updated.id),
      viewCount: updated.views ?? 0,
    });
  } catch (error) {
    return mapRouteError(error);
  }
}
