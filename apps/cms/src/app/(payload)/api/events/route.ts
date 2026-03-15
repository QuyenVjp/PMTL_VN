import { mapEventToPublicDTO } from "@/collections/Events/service";
import { jsonResponse, listCollection, mapPaginatedResult, mapRouteError } from "@/routes/public";

export async function GET(request: Request) {
  try {
    const result = await listCollection("events", request.url);

    return jsonResponse(200, mapPaginatedResult(result, mapEventToPublicDTO));
  } catch (error) {
    return mapRouteError(error);
  }
}
