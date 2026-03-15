import { mapCommunityPostToPublicDTO } from "@/collections/CommunityPosts/service";
import { jsonResponse, listCollection, mapPaginatedResult, mapRouteError } from "@/routes/public";

export async function GET(request: Request) {
  try {
    const result = await listCollection("communityPosts", request.url);

    return jsonResponse(200, mapPaginatedResult(result, mapCommunityPostToPublicDTO));
  } catch (error) {
    return mapRouteError(error);
  }
}
