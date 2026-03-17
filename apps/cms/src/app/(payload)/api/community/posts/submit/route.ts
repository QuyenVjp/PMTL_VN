import { communityPostSubmitSchema } from "@pmtl/shared";

import { mapCommunityPostToPublicDTO, submitCommunityPost } from "@/collections/CommunityPosts/service";
import { getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";
import { requireSession } from "@/routes/session";
import { appendRouteAuditLog } from "@/services/audit.service";
import { getRequestMetadata } from "@/routes/request-metadata";
import { notifyModerators } from "@/services/notification.service";
import { consumeGuard } from "@/services/request-guard.service";

export async function POST(request: Request) {
  try {
    const payload = await getCmsPayload();
    const session = await requireSession(request.headers);
    const guard = await consumeGuard({
      payload,
      guardKey: `community-post:${session.user.id}`,
      scope: "community-submit",
      ttlSeconds: 60 * 60,
      maxHits: 2,
    });

    if (!guard.allowed) {
      return jsonResponse(429, {
        error: {
          message: "Bạn đã gửi quá nhiều bài cộng đồng trong thời gian ngắn.",
        },
      });
    }

    const rawBody: unknown = await request.json();
    const parsedBody = communityPostSubmitSchema.safeParse(rawBody);
    if (!parsedBody.success) {
      return jsonResponse(400, {
        error: {
          message: "Community post payload is invalid.",
          details: parsedBody.error.flatten(),
        },
      });
    }

    const tags = Array.isArray(parsedBody.data.tags)
      ? parsedBody.data.tags
      : typeof parsedBody.data.tags === "string"
        ? parsedBody.data.tags.split(",").map((value) => value.trim()).filter(Boolean)
        : [];

    const created = await payload.create({
      collection: "communityPosts",
      data: submitCommunityPost({
        title: parsedBody.data.title,
        content: parsedBody.data.content,
        type: parsedBody.data.type,
        slug: "",
        videoURL: parsedBody.data.video_url ?? "",
        category: parsedBody.data.category,
        tags,
        authorUser: Number(session.user.id),
        authorNameSnapshot: session.user.displayName,
      }) as never,
      overrideAccess: true,
    });

    await appendRouteAuditLog(payload, {
      action: "communityPosts.submit",
      actorType: "user",
      actorUser: Number(session.user.id),
      targetType: "communityPosts",
      targetPublicId: created.publicId ?? null,
      targetRef: {
        collection: "communityPosts",
        id: String(created.id),
      },
      ...getRequestMetadata(request.headers),
      metadata: {
        moderationStatus: created.moderationStatus ?? "pending",
      },
    });

    await notifyModerators({
      payload,
      actorUserId: session.user.id,
      actorDisplayName: session.user.displayName,
      kind: "community-post",
      subject: "Có bài viết cộng đồng mới cần duyệt",
      message: `${session.user.displayName} vừa gửi bài viết cộng đồng "${created.title ?? "Không tiêu đề"}".`,
      url: `/admin/collections/communityPosts/${created.id}`,
      metadata: {
        targetPublicId: created.publicId ?? null,
      },
    });

    return jsonResponse(201, mapCommunityPostToPublicDTO(created));
  } catch (error) {
    return mapRouteError(error);
  }
}
