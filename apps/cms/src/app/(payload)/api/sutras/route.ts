import { mapSutraToPublicDTO } from "@/collections/Sutras/service";
import { buildPublicCacheHeaders, jsonResponse, listCollection, mapPaginatedResult, mapRouteError } from "@/routes/public";

export async function GET(request: Request) {
  try {
    const result = await listCollection("sutras", request.url, {
      ttlSeconds: 300,
    });

    return jsonResponse(200, mapPaginatedResult(result, mapSutraToPublicDTO), {
      headers: buildPublicCacheHeaders(300),
    });
  } catch (error) {
    return mapRouteError(error);
  }
}
