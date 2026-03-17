import { mapChantItemToPublicDTO } from "@/collections/ChantItems/service";
import { buildPublicCacheHeaders, jsonResponse, listCollection, mapPaginatedResult, mapRouteError } from "@/routes/public";

export async function GET(request: Request) {
  try {
    const result = await listCollection("chantItems", request.url, {
      ttlSeconds: 300,
    });

    return jsonResponse(200, mapPaginatedResult(result, mapChantItemToPublicDTO), {
      headers: buildPublicCacheHeaders(300),
    });
  } catch (error) {
    return mapRouteError(error);
  }
}
