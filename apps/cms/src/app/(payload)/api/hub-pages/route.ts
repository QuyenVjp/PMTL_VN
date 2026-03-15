import { mapHubPageToPublicDTO } from "@/collections/HubPages/service";
import { jsonResponse, listCollection, mapPaginatedResult, mapRouteError } from "@/routes/public";

export async function GET(request: Request) {
  try {
    const result = await listCollection("hubPages", request.url);

    return jsonResponse(200, mapPaginatedResult(result, mapHubPageToPublicDTO));
  } catch (error) {
    return mapRouteError(error);
  }
}
