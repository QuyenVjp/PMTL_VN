import { mapChantPlanToPublicDTO } from "@/collections/ChantPlans/service";
import { findCollectionDocument, jsonResponse, mapRouteError } from "@/routes/public";

export async function GET(_request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  try {
    const { publicId } = await params;
    const document = await findCollectionDocument("chantPlans", publicId);

    if (!document) {
      return jsonResponse(404, { error: { message: "Chant plan not found." } });
    }

    return jsonResponse(200, mapChantPlanToPublicDTO(document));
  } catch (error) {
    return mapRouteError(error);
  }
}
