import { mapHubPageToPublicDTO } from "@/collections/HubPages/service";
import { buildPublicCacheHeaders, jsonResponse, listCollection, mapPaginatedResult, mapRouteError } from "@/routes/public";

export async function GET(request: Request) {
  try {
    const result = await listCollection("hubPages", request.url, {
      ttlSeconds: 300,
    });

    return jsonResponse(200, mapPaginatedResult(result, mapHubPageToPublicDTO), {
      headers: buildPublicCacheHeaders(300),
    });
  } catch (error) {
    return mapRouteError(error);
  }
}
