import { hasRole } from "@/access/roles";
import { getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";
import { getRequestMetadata } from "@/routes/request-metadata";
import { requireSession } from "@/routes/session";
import { appendRouteAuditLog } from "@/services/audit.service";
import { enqueuePostReindexBatch } from "@/services/search.service";

export async function POST(request: Request) {
  try {
    const payload = await getCmsPayload();
    const session = await requireSession(request.headers);

    if (!hasRole({ role: session.user.role }, "editor")) {
      return jsonResponse(403, { error: { message: "Bạn không có quyền reindex bài viết." } });
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const result = await enqueuePostReindexBatch(payload, {
      ...(typeof body.limit === "number" ? { limit: body.limit } : {}),
      ...(typeof body.page === "number" ? { page: body.page } : {}),
    });

    await appendRouteAuditLog(payload, {
      action: "posts.search.reindex",
      actorType: "user",
      actorUser: Number(session.user.id),
      targetType: "posts",
      targetPublicId: null,
      ...getRequestMetadata(request.headers),
      metadata: result,
    });

    return jsonResponse(202, result);
  } catch (error) {
    return mapRouteError(error);
  }
}
