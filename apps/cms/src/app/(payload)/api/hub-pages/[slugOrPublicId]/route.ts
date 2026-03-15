import { mapHubPageToPublicDTO } from "@/collections/HubPages/service";
import { findCollectionDocument, jsonResponse, mapRouteError } from "@/routes/public";

export async function GET(_request: Request, { params }: { params: Promise<{ slugOrPublicId: string }> }) {
  try {
    const { slugOrPublicId } = await params;
    const document = await findCollectionDocument("hubPages", slugOrPublicId);

    if (!document) {
      return jsonResponse(404, { error: { message: "Hub page not found." } });
    }

    return jsonResponse(200, mapHubPageToPublicDTO(document));
  } catch (error) {
    return mapRouteError(error);
  }
}
