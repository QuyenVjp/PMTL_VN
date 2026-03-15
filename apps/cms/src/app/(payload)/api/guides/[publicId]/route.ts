import { mapGuideToPublicDTO } from "@/collections/BeginnerGuides/service";
import { findCollectionDocument, jsonResponse, mapRouteError } from "@/routes/public";

export async function GET(_request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  try {
    const { publicId } = await params;
    const document = await findCollectionDocument("beginnerGuides", publicId);

    if (!document) {
      return jsonResponse(404, { error: { message: "Guide not found." } });
    }

    return jsonResponse(200, mapGuideToPublicDTO(document));
  } catch (error) {
    return mapRouteError(error);
  }
}
