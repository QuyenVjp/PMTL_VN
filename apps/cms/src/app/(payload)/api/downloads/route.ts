import { mapDownloadToPublicDTO } from "@/collections/Downloads/service";
import { buildPublicCacheHeaders, jsonResponse, listCollection, mapPaginatedResult, mapRouteError } from "@/routes/public";

export async function GET(request: Request) {
  try {
    const result = await listCollection("downloads", request.url, {
      ttlSeconds: 300,
    });

    return jsonResponse(200, mapPaginatedResult(result, mapDownloadToPublicDTO), {
      headers: buildPublicCacheHeaders(300),
    });
  } catch (error) {
    return mapRouteError(error);
  }
}
