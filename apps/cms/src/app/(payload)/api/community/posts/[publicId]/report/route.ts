import { getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";
import { getRequestIpHash, getRequestMetadata } from "@/routes/request-metadata";
import { requireSession } from "@/routes/session";
import { appendRouteAuditLog } from "@/services/audit.service";
import { notifyModerators } from "@/services/notification.service";
import { consumeGuard } from "@/services/request-guard.service";
import { submitModerationReport, syncEntityModerationSummary } from "@/services/moderation.service";

export async function POST(request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  try {
    const payload = await getCmsPayload();
    const session = await requireSession(request.headers);
    const { publicId } = await params;
    const guard = await consumeGuard({
      payload,
      guardKey: `report:community-post:${publicId}:${session.user.id}`,
      scope: "report",
      ttlSeconds: 60 * 60,
      maxHits: 3,
    });

    if (!guard.allowed) {
      return jsonResponse(429, {
        error: {
          message: "Bạn đã report quá nhiều lần trong thời gian ngắn.",
        },
      });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const reason = typeof body.reason === "string" ? body.reason : "reported";
    const notes = typeof body.notes === "string" ? body.notes : "";

    const result = await payload.find({
      collection: "communityPosts",
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        publicId: {
          equals: publicId,
        },
      },
    });

    const post = result.docs[0];

    if (!post) {
      return jsonResponse(404, { error: { message: "Community post not found." } });
    }

    const report = await payload.create({
      collection: "moderationReports",
      data: submitModerationReport({
        entityType: "communityPost",
        entityPublicId: publicId,
        entityRef: {
          collection: "communityPosts",
          id: String(post.id),
        },
        reason,
        notes,
        reporterUser: Number(session.user.id),
        reporterIpHash: getRequestIpHash(request.headers),
      }) as never,
      overrideAccess: true,
    });

    await syncEntityModerationSummary(payload, "communityPosts", post.id, reason);

    await appendRouteAuditLog(payload, {
      action: "communityPosts.report",
      actorType: "user",
      actorUser: Number(session.user.id),
      targetType: "communityPosts",
      targetPublicId: publicId,
      targetRef: {
        collection: "communityPosts",
        id: String(post.id),
      },
      ...getRequestMetadata(request.headers),
      metadata: {
        reason,
        reportId: report.publicId ?? String(report.id),
      },
    });

    await notifyModerators({
      payload,
      actorUserId: session.user.id,
      actorDisplayName: session.user.displayName,
      kind: "report",
      subject: "Có report mới cho bài viết cộng đồng",
      message: `${session.user.displayName} vừa report bài viết cộng đồng ${publicId}.`,
      url: `/admin/collections/moderationReports/${report.id}`,
      metadata: {
        reportPublicId: report.publicId ?? null,
        targetPublicId: publicId,
        reason,
      },
    });

    return jsonResponse(201, {
      success: true,
      reportId: report.publicId ?? String(report.id),
    });
  } catch (error) {
    return mapRouteError(error);
  }
}
