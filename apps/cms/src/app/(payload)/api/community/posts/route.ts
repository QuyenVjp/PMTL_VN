import { mapCommunityPostToPublicDTO } from "@/collections/CommunityPosts/service";
import { cachedFetch } from "@/services/cache.service";
import { listCollection, mapPaginatedResult, mapRouteError } from "@/routes/public";

export async function GET(request: Request) {
  try {
    const result = await cachedFetch(`community-posts:list:${request.url}`, 120, () =>
      listCollection("communityPosts", request.url),
    );

    return Response.json(mapPaginatedResult(result, mapCommunityPostToPublicDTO), {
      headers: {
        "Cache-Control": "public, max-age=120, stale-while-revalidate=300",
      },
      status: 200,
    });
  } catch (error) {
    return mapRouteError(error);
  }
}
