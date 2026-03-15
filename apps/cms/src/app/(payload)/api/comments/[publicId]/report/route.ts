import { getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";
import { getRequestIpHash, getRequestMetadata } from "@/routes/request-metadata";
import { getOptionalSession } from "@/routes/session";
import { appendRouteAuditLog } from "@/services/audit.service";
import { notifyModerators } from "@/services/notification.service";
import { consumeGuard } from "@/services/request-guard.service";
import { submitModerationReport, syncEntityModerationSummary } from "@/services/moderation.service";

export async function POST(request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  try {
    const payload = await getCmsPayload();
    const { publicId } = await params;
    const session = await getOptionalSession(request.headers);
    const actorKey = session ? `user:${session.user.id}` : getRequestIpHash(request.headers) || "guest";
    const guard = await consumeGuard({
      payload,
      guardKey: `report:post-comment:${publicId}:${actorKey}`,
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

    const commentResult = await payload.find({
      collection: "postComments",
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        publicId: {
          equals: publicId,
        },
      },
    });

    const comment = commentResult.docs[0];

    if (!comment) {
      return jsonResponse(404, { error: { message: "Comment not found." } });
    }

    const report = await payload.create({
      collection: "moderationReports",
      data: submitModerationReport({
        entityType: "postComment",
        entityPublicId: publicId,
        entityRef: {
          collection: "postComments",
          id: String(comment.id),
        },
        reason,
        notes,
        reporterUser: session ? Number(session.user.id) : null,
        reporterIpHash: getRequestIpHash(request.headers),
      }) as never,
      overrideAccess: true,
    });

    await syncEntityModerationSummary(payload, "postComments", comment.id, reason);

    await appendRouteAuditLog(payload, {
      action: "postComments.report",
      actorType: session ? "user" : "guest",
      actorUser: session ? Number(session.user.id) : null,
      targetType: "postComments",
      targetPublicId: publicId,
      targetRef: {
        collection: "postComments",
        id: String(comment.id),
      },
      ...getRequestMetadata(request.headers),
      metadata: {
        reason,
        reportId: report.publicId ?? String(report.id),
      },
    });

    await notifyModerators({
      payload,
      actorUserId: session?.user.id ?? null,
      actorDisplayName: session?.user.displayName ?? "Khách",
      kind: "report",
      subject: "Có report mới cho bình luận bài viết",
      message: `${session?.user.displayName ?? "Một người dùng"} vừa report bình luận bài viết ${publicId}.`,
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
