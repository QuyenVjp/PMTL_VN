import { mapChantItemToPublicDTO } from "@/collections/ChantItems/service";
import { findCollectionDocument, jsonResponse, mapRouteError } from "@/routes/public";

export async function GET(_request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  try {
    const { publicId } = await params;
    const document = await findCollectionDocument("chantItems", publicId);

    if (!document) {
      return jsonResponse(404, { error: { message: "Chant item not found." } });
    }

    return jsonResponse(200, mapChantItemToPublicDTO(document));
  } catch (error) {
    return mapRouteError(error);
  }
}
