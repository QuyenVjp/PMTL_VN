import { hasRole } from "@/access/roles";
import { getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";
import { requireSession } from "@/routes/session";
import { getPostSearchStatus } from "@/services/search.service";

function hasSystemToken(headers: Headers) {
  const token = headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() ?? "";
  const systemToken = (process.env.PAYLOAD_API_TOKEN ?? process.env.STRAPI_API_TOKEN ?? "").trim();

  return Boolean(token && systemToken && token === systemToken);
}

export async function GET(request: Request) {
  try {
    if (!hasSystemToken(request.headers)) {
      const session = await requireSession(request.headers);

      if (!hasRole({ role: session.user.role }, "editor")) {
        return jsonResponse(403, {
          error: {
            message: "Bạn không có quyền xem trạng thái search.",
          },
        });
      }
    }

    const payload = await getCmsPayload();
    const status = await getPostSearchStatus(payload);

    return jsonResponse(200, status);
  } catch (error) {
    return mapRouteError(error);
  }
}
