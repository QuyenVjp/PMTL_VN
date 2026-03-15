import { mapChantPlanToPublicDTO } from "@/collections/ChantPlans/service";
import { jsonResponse, listCollection, mapPaginatedResult, mapRouteError } from "@/routes/public";

export async function GET(request: Request) {
  try {
    const result = await listCollection("chantPlans", request.url);

    return jsonResponse(200, mapPaginatedResult(result, mapChantPlanToPublicDTO));
  } catch (error) {
    return mapRouteError(error);
  }
}
