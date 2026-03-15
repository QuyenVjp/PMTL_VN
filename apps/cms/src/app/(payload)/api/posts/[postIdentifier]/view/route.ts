import { incrementPostViewWithCooldown } from "@/collections/Posts/service";
import { findCollectionDocument, getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";
import { getRequestIpHash } from "@/routes/request-metadata";
import { consumeGuard } from "@/services/request-guard.service";

export async function POST(request: Request, { params }: { params: Promise<{ postIdentifier: string }> }) {
  try {
    const payload = await getCmsPayload();
    const { postIdentifier } = await params;
    const post = await findCollectionDocument("posts", postIdentifier);

    if (!post) {
      return jsonResponse(404, { error: { message: "Post not found." } });
    }

    const publicIdentifier = post.publicId ?? postIdentifier;
    const actorKey = getRequestIpHash(request.headers) || "anonymous";
    const guard = await consumeGuard({
      payload,
      guardKey: `post-view:${publicIdentifier}:${actorKey}`,
      scope: "view",
      ttlSeconds: 60 * 30,
      maxHits: 1,
    });

    if (!guard.allowed) {
      return jsonResponse(200, {
        id: publicIdentifier,
        viewCount: post.views ?? 0,
      });
    }

    const nextDocument = incrementPostViewWithCooldown(payload, post, `post-view:${publicIdentifier}`);

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
