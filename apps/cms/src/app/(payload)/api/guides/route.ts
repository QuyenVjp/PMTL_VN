import { mapGuideToPublicDTO } from "@/collections/BeginnerGuides/service";
import { buildPublicCacheHeaders, jsonResponse, listCollection, mapPaginatedResult, mapRouteError } from "@/routes/public";

export async function GET(request: Request) {
  try {
    const result = await listCollection("beginnerGuides", request.url, {
      ttlSeconds: 300,
    });

    return jsonResponse(200, mapPaginatedResult(result, mapGuideToPublicDTO), {
      headers: buildPublicCacheHeaders(300),
    });
  } catch (error) {
    return mapRouteError(error);
  }
}
