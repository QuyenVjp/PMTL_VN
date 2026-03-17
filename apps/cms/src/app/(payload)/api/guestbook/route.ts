import { mapGuestbookEntryToPublicDTO } from "@/collections/GuestbookEntries/service";
import { buildPublicCacheHeaders, jsonResponse, listCollection, mapPaginatedResult, mapRouteError } from "@/routes/public";

export async function GET(request: Request) {
  try {
    const result = await listCollection("guestbookEntries", request.url, {
      ttlSeconds: 120,
    });

    return jsonResponse(200, mapPaginatedResult(result, mapGuestbookEntryToPublicDTO), {
      headers: buildPublicCacheHeaders(120),
    });
  } catch (error) {
    return mapRouteError(error);
  }
}
