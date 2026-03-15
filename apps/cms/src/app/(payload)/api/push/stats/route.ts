import { hasRole } from "@/access/roles";
import { getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";
import { requireSession } from "@/routes/session";

function hasSystemToken(headers: Headers) {
  const token = headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() ?? "";
  const systemToken = (process.env.PAYLOAD_API_TOKEN ?? "").trim();

  return Boolean(token && systemToken && token === systemToken);
}

export async function GET(request: Request) {
  try {
    if (!hasSystemToken(request.headers)) {
      const session = await requireSession(request.headers);

      if (!hasRole({ role: session.user.role }, "moderator")) {
        return jsonResponse(403, {
          error: {
            message: "Bạn không có quyền xem thống kê push.",
          },
        });
      }
    }

    const payload = await getCmsPayload();

    const [allSubscriptions, activeSubscriptions, failedJobs, pendingJobs] = await Promise.all([
      payload.count({
        collection: "pushSubscriptions",
        overrideAccess: true,
      }),
      payload.count({
        collection: "pushSubscriptions",
        overrideAccess: true,
        where: {
          isActive: {
            equals: true,
          },
        },
      }),
      payload.count({
        collection: "pushJobs",
        overrideAccess: true,
        where: {
          status: {
            equals: "failed",
          },
        },
      }),
      payload.count({
        collection: "pushJobs",
        overrideAccess: true,
        where: {
          status: {
            in: ["pending", "queued", "processing"],
          },
        },
      }),
    ]);

    return jsonResponse(200, {
      data: {
        subscriptions: {
          total: allSubscriptions.totalDocs,
          active: activeSubscriptions.totalDocs,
          inactive: Math.max(0, allSubscriptions.totalDocs - activeSubscriptions.totalDocs),
        },
        jobs: {
          pending: pendingJobs.totalDocs,
          failed: failedJobs.totalDocs,
        },
      },
    });
  } catch (error) {
    return mapRouteError(error);
  }
}
