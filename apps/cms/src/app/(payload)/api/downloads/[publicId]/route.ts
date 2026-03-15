import { mapDownloadToPublicDTO } from "@/collections/Downloads/service";
import { findCollectionDocument, jsonResponse, mapRouteError } from "@/routes/public";

export async function GET(_request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  try {
    const { publicId } = await params;
    const document = await findCollectionDocument("downloads", publicId);

    if (!document) {
      return jsonResponse(404, { error: { message: "Download not found." } });
    }

    return jsonResponse(200, mapDownloadToPublicDTO(document));
  } catch (error) {
    return mapRouteError(error);
  }
}
