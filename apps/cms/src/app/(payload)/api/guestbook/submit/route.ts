import { mapGuestbookEntryToPublicDTO, submitGuestbookEntry } from "@/collections/GuestbookEntries/service";
import { getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";
import { getRequestIpHash } from "@/routes/request-metadata";
import { getOptionalSession } from "@/routes/session";

export async function POST(request: Request) {
  try {
    const payload = await getCmsPayload();
    const session = await getOptionalSession(request.headers);
    const body = (await request.json()) as Record<string, unknown>;

    const created = await payload.create({
      collection: "guestbookEntries",
      data: submitGuestbookEntry({
        authorName:
          session?.user.displayName ??
          (typeof body.authorName === "string" ? body.authorName : "Khách"),
        message: typeof body.message === "string" ? body.message : "",
        country: typeof body.country === "string" ? body.country : "",
        avatar: typeof body.avatar === "string" ? body.avatar : "",
        entryType: typeof body.entryType === "string" ? body.entryType : "",
        questionCategory: typeof body.questionCategory === "string" ? body.questionCategory : "",
        submittedByUser: session ? Number(session.user.id) : null,
        submittedByIpHash: getRequestIpHash(request.headers),
      }) as never,
      overrideAccess: true,
    });

    return jsonResponse(201, mapGuestbookEntryToPublicDTO(created));
  } catch (error) {
    return mapRouteError(error);
  }
}
