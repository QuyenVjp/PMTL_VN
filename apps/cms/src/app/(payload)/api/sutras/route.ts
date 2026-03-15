import { mapSutraToPublicDTO } from "@/collections/Sutras/service";
import { jsonResponse, listCollection, mapPaginatedResult, mapRouteError } from "@/routes/public";

export async function GET(request: Request) {
  try {
    const result = await listCollection("sutras", request.url);

    return jsonResponse(200, mapPaginatedResult(result, mapSutraToPublicDTO));
  } catch (error) {
    return mapRouteError(error);
  }
}
