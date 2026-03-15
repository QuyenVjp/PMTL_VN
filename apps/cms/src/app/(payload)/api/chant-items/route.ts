import { mapChantItemToPublicDTO } from "@/collections/ChantItems/service";
import { jsonResponse, listCollection, mapPaginatedResult, mapRouteError } from "@/routes/public";

export async function GET(request: Request) {
  try {
    const result = await listCollection("chantItems", request.url);

    return jsonResponse(200, mapPaginatedResult(result, mapChantItemToPublicDTO));
  } catch (error) {
    return mapRouteError(error);
  }
}
