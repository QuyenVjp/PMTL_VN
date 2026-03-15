import { getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";
import { getRequestIpHash } from "@/routes/request-metadata";
import { getOptionalSession } from "@/routes/session";
import { submitModerationReport, syncEntityModerationSummary } from "@/services/moderation.service";

export async function POST(request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  try {
    const payload = await getCmsPayload();
    const { publicId } = await params;
    const session = await getOptionalSession(request.headers);
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

    return jsonResponse(201, {
      success: true,
      reportId: report.publicId ?? String(report.id),
    });
  } catch (error) {
    return mapRouteError(error);
  }
}
