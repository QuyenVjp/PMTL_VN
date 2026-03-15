import { mapGuestbookEntryToPublicDTO } from "@/collections/GuestbookEntries/service";
import { jsonResponse, listCollection, mapPaginatedResult, mapRouteError } from "@/routes/public";

export async function GET(request: Request) {
  try {
    const result = await listCollection("guestbookEntries", request.url);

    return jsonResponse(200, mapPaginatedResult(result, mapGuestbookEntryToPublicDTO));
  } catch (error) {
    return mapRouteError(error);
  }
}
