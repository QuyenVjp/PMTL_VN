import { mapSutraToPublicDTO } from "@/collections/Sutras/service";
import { findCollectionDocument, jsonResponse, mapRouteError } from "@/routes/public";

export async function GET(_request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  try {
    const { publicId } = await params;
    const document = await findCollectionDocument("sutras", publicId);

    if (!document) {
      return jsonResponse(404, { error: { message: "Sutra not found." } });
    }

    return jsonResponse(200, mapSutraToPublicDTO(document));
  } catch (error) {
    return mapRouteError(error);
  }
}
