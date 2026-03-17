import { mapPostToLegacyDTO } from "@/collections/Posts/service";
import { cachedFetch } from "@/services/cache.service";
import { listCollection, mapPaginatedResult, mapRouteError } from "@/routes/public";

export async function GET(request: Request) {
  try {
    const result = await cachedFetch(`posts:list:${request.url}`, 300, () => listCollection("posts", request.url));

    return Response.json(mapPaginatedResult(result, mapPostToLegacyDTO), {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
      status: 200,
    });
  } catch (error) {
    return mapRouteError(error);
  }
}
