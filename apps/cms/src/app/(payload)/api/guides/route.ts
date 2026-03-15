import { mapGuideToPublicDTO } from "@/collections/BeginnerGuides/service";
import { jsonResponse, listCollection, mapPaginatedResult, mapRouteError } from "@/routes/public";

export async function GET(request: Request) {
  try {
    const result = await listCollection("beginnerGuides", request.url);

    return jsonResponse(200, mapPaginatedResult(result, mapGuideToPublicDTO));
  } catch (error) {
    return mapRouteError(error);
  }
}
