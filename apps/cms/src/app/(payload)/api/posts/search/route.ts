import { consumeGuard } from "@/services/request-guard.service";
import { searchPosts } from "@/services/search.service";
import { getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";
import { getRequestIpHash } from "@/routes/request-metadata";
import { getOptionalSession } from "@/routes/session";

export async function GET(request: Request) {
  try {
    const payload = await getCmsPayload();
    const session = await getOptionalSession(request.headers);
    const url = new URL(request.url);
    const query = url.searchParams.get("q") ?? "";
    const limit = Number(url.searchParams.get("limit") ?? "10");
    const actorKey = session?.user.id ?? getRequestIpHash(request.headers) ?? "anonymous";

    const guard = await consumeGuard({
      payload,
      guardKey: `search:posts:${actorKey}`,
      scope: "search",
      ttlSeconds: 60,
      maxHits: session ? 60 : 30,
      notes: "posts-search",
    });

    if (!guard.allowed) {
      return jsonResponse(429, {
        error: {
          message: "Bạn tìm kiếm quá nhanh. Vui lòng thử lại sau.",
          code: "SEARCH_RATE_LIMITED",
        },
      });
    }

    const result = await searchPosts({
      payload,
      query,
      limit,
    });

    return jsonResponse(200, result);
  } catch (error) {
    return mapRouteError(error);
  }
}
