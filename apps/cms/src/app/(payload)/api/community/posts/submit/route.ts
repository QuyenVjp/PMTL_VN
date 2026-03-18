import { communityPostSubmitSchema } from "@pmtl/shared";

import { mapCommunityPostToPublicDTO, submitCommunityPost } from "@/collections/CommunityPosts/service";
import { getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";
import { getRequestIpHash, getRequestMetadata } from "@/routes/request-metadata";
import { getOptionalSession } from "@/routes/session";
import { appendRouteAuditLog } from "@/services/audit.service";
import { notifyModerators } from "@/services/notification.service";
import { consumeGuard } from "@/services/request-guard.service";

export async function POST(request: Request) {
  try {
    const payload = await getCmsPayload();
    const session = await getOptionalSession(request.headers);
    const actorKey = session ? `user:${session.user.id}` : getRequestIpHash(request.headers) || "guest";
    const guard = await consumeGuard({
      payload,
      guardKey: `community-post:${actorKey}`,
      scope: "community-submit",
      ttlSeconds: 60 * 60,
      maxHits: session ? 2 : 1,
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
    const authorName = session?.user.displayName ?? parsedBody.data.author_name?.trim() ?? "";

    if (!authorName) {
      return jsonResponse(400, {
        error: {
          message: "Thiếu tên người đăng bài.",
        },
      });
    }

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
        authorUser: session ? Number(session.user.id) : null,
        authorNameSnapshot: authorName,
      }) as never,
      overrideAccess: true,
    });

    await appendRouteAuditLog(payload, {
      action: "communityPosts.submit",
      actorType: session ? "user" : "guest",
      actorUser: session ? Number(session.user.id) : null,
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
      actorUserId: session?.user.id ?? null,
      actorDisplayName: authorName,
      kind: "community-post",
      subject: "Có bài viết cộng đồng mới cần duyệt",
      message: `${authorName} vừa gửi bài viết cộng đồng "${created.title ?? "Không tiêu đề"}".`,
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
