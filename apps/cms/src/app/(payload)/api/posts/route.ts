import { mapPostToLegacyDTO } from "@/collections/Posts/service";
import { jsonResponse, listCollection, mapPaginatedResult, mapRouteError } from "@/routes/public";

export async function GET(request: Request) {
  try {
    const result = await listCollection("posts", request.url);

    return jsonResponse(200, mapPaginatedResult(result, mapPostToLegacyDTO));
  } catch (error) {
    return mapRouteError(error);
  }
}
