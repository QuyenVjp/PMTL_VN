import { getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";
import { getRequestIpHash } from "@/routes/request-metadata";
import { requireSession } from "@/routes/session";
import { submitModerationReport, syncEntityModerationSummary } from "@/services/moderation.service";

export async function POST(request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  try {
    const payload = await getCmsPayload();
    const session = await requireSession(request.headers);
    const { publicId } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const reason = typeof body.reason === "string" ? body.reason : "reported";
    const notes = typeof body.notes === "string" ? body.notes : "";

    const result = await payload.find({
      collection: "communityComments",
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        publicId: {
          equals: publicId,
        },
      },
    });

    const comment = result.docs[0];

    if (!comment) {
      return jsonResponse(404, { error: { message: "Community comment not found." } });
    }

    const report = await payload.create({
      collection: "moderationReports",
      data: submitModerationReport({
        entityType: "communityComment",
        entityPublicId: publicId,
        entityRef: {
          collection: "communityComments",
          id: String(comment.id),
        },
        reason,
        notes,
        reporterUser: Number(session.user.id),
        reporterIpHash: getRequestIpHash(request.headers),
      }) as never,
      overrideAccess: true,
    });

    await syncEntityModerationSummary(payload, "communityComments", comment.id, reason);

    return jsonResponse(201, {
      success: true,
      reportId: report.publicId ?? String(report.id),
    });
  } catch (error) {
    return mapRouteError(error);
  }
}
