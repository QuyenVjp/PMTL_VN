import { hasRole } from "@/access/roles";
import { getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";
import { requireSession } from "@/routes/session";

export async function GET(request: Request) {
  try {
    const payload = await getCmsPayload();
    const session = await requireSession(request.headers);

    if (!hasRole({ role: session.user.role }, "moderator")) {
      return jsonResponse(403, { error: { message: "Bạn không có quyền duyệt moderation." } });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const result = await payload.find({
      collection: "moderationReports",
      depth: 1,
      limit: 50,
      overrideAccess: true,
      ...(status
        ? {
            where: {
              status: {
                equals: status,
              },
            },
          }
        : {}),
    });

    return jsonResponse(200, result);
  } catch (error) {
    return mapRouteError(error);
  }
}
