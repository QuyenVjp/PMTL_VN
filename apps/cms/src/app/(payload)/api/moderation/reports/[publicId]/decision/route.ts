import { hasRole } from "@/access/roles";
import { getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";
import { getRequestMetadata } from "@/routes/request-metadata";
import { requireSession } from "@/routes/session";
import { appendRouteAuditLog } from "@/services/audit.service";
import { notifyUserModerationDecision } from "@/services/notification.service";
import {
  applyModerationDecisionToTarget,
  resolveModerationReport,
} from "@/services/moderation.service";

type SupportedEntityCollection =
  | "postComments"
  | "communityPosts"
  | "communityComments"
  | "guestbookEntries";

function isSupportedCollection(value: string): value is SupportedEntityCollection {
  return (
    value === "postComments" ||
    value === "communityPosts" ||
    value === "communityComments" ||
    value === "guestbookEntries"
  );
}

function resolveTargetUserId(target: Record<string, unknown>) {
  const candidate = target.authorUser ?? target.submittedByUser ?? null;

  if (typeof candidate === "string" || typeof candidate === "number") {
    return candidate;
  }

  if (candidate && typeof candidate === "object" && "id" in candidate) {
    const relationId = candidate.id;

    if (typeof relationId === "string" || typeof relationId === "number") {
      return relationId;
    }
  }

  return null;
}

export async function POST(request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  try {
    const payload = await getCmsPayload();
    const session = await requireSession(request.headers);

    if (!hasRole({ role: session.user.role }, "moderator")) {
      return jsonResponse(403, { error: { message: "Bạn không có quyền duyệt moderation." } });
    }

    const { publicId } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const decision =
      typeof body.decision === "string" ? body.decision : "approved";

    if (
      decision !== "approved" &&
      decision !== "rejected" &&
      decision !== "flagged" &&
      decision !== "hidden"
    ) {
      return jsonResponse(400, { error: { message: "Moderation decision không hợp lệ." } });
    }

    const result = await payload.find({
      collection: "moderationReports",
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        publicId: {
          equals: publicId,
        },
      },
    });

    const report = result.docs[0];

    if (!report) {
      return jsonResponse(404, { error: { message: "Moderation report not found." } });
    }

    const collection = report.entityRef?.collection ?? "";
    const targetId = report.entityRef?.id ?? "";

    if (!isSupportedCollection(collection) || !targetId) {
      return jsonResponse(400, {
        error: {
          message: "Report chưa gắn đúng entity để thực hiện moderation.",
        },
      });
    }

    const target = await applyModerationDecisionToTarget(payload, {
      collection,
      id: targetId,
      decision,
    });

    const updatedReport = await resolveModerationReport(payload, report.id, decision);

    await appendRouteAuditLog(payload, {
      action: "moderationReports.decision",
      actorType: "user",
      actorUser: Number(session.user.id),
      targetType: collection,
      targetPublicId: report.entityPublicId ?? null,
      targetRef: {
        collection,
        id: String(targetId),
      },
      ...getRequestMetadata(request.headers),
      metadata: {
        reportPublicId: publicId,
        decision,
      },
    });

    await notifyUserModerationDecision({
      payload,
      targetUserId: resolveTargetUserId(target as unknown as Record<string, unknown>),
      excludeUserIds: [session.user.id],
      subject: "Nội dung của bạn đã được duyệt moderation",
      message: `Nội dung ${report.entityPublicId ?? publicId} đã được cập nhật trạng thái moderation: ${decision}.`,
      url: "/profile",
    });

    return jsonResponse(200, {
      report: updatedReport,
      target,
    });
  } catch (error) {
    return mapRouteError(error);
  }
}
