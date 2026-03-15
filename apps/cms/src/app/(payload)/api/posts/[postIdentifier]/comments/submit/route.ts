import { mapCommentToPublicDTO, submitPostComment } from "@/collections/PostComments/service";
import { findCollectionDocument, getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";
import { getRequestIpHash, getRequestMetadata } from "@/routes/request-metadata";
import { getOptionalSession } from "@/routes/session";
import { appendRouteAuditLog } from "@/services/audit.service";
import { notifyModerators } from "@/services/notification.service";
import { consumeGuard } from "@/services/request-guard.service";

export async function POST(request: Request, { params }: { params: Promise<{ postIdentifier: string }> }) {
  try {
    const payload = await getCmsPayload();
    const { postIdentifier } = await params;
    const post = await findCollectionDocument("posts", postIdentifier);

    if (!post) {
      return jsonResponse(404, { error: { message: "Post not found." } });
    }

    const session = await getOptionalSession(request.headers);
    const actorKey = session ? `user:${session.user.id}` : getRequestIpHash(request.headers) || "guest";
    const guard = await consumeGuard({
      payload,
      guardKey: `post-comment:${post.publicId ?? postIdentifier}:${actorKey}`,
      scope: "comment-submit",
      ttlSeconds: 60 * 10,
      maxHits: session ? 10 : 5,
    });

    if (!guard.allowed) {
      return jsonResponse(429, {
        error: {
          message: "Bạn gửi bình luận quá nhanh. Vui lòng thử lại sau ít phút.",
        },
      });
    }

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

    await appendRouteAuditLog(payload, {
      action: "postComments.submit",
      actorType: session ? "user" : "guest",
      actorUser: session ? Number(session.user.id) : null,
      targetType: "postComments",
      targetPublicId: created.publicId ?? null,
      targetRef: {
        collection: "postComments",
        id: String(created.id),
      },
      ...getRequestMetadata(request.headers),
      metadata: {
        postPublicId: post.publicId ?? postIdentifier,
      },
    });

    await notifyModerators({
      payload,
      actorUserId: session?.user.id ?? null,
      actorDisplayName: session?.user.displayName ?? created.authorName ?? "Khách",
      kind: "report",
      subject: "Có bình luận bài viết mới cần duyệt",
      message: `${session?.user.displayName ?? created.authorName ?? "Khách"} vừa gửi bình luận cho bài viết ${post.publicId ?? postIdentifier}.`,
      url: `/admin/collections/postComments/${created.id}`,
      metadata: {
        targetPublicId: created.publicId ?? null,
        postPublicId: post.publicId ?? postIdentifier,
      },
    });

    return jsonResponse(201, mapCommentToPublicDTO(created));
  } catch (error) {
    return mapRouteError(error);
  }
}
