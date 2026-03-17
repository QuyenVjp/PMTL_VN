import { mapDownloadToPublicDTO } from "@/collections/Downloads/service";
import { buildPublicCacheHeaders, findCollectionDocument, jsonResponse, mapRouteError } from "@/routes/public";

export async function GET(_request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  try {
    const { publicId } = await params;
    const document = await findCollectionDocument("downloads", publicId, {
      ttlSeconds: 300,
    });

    if (!document) {
      return jsonResponse(404, { error: { message: "Download not found." } });
    }

    return jsonResponse(200, mapDownloadToPublicDTO(document), {
      headers: buildPublicCacheHeaders(300),
    });
  } catch (error) {
    return mapRouteError(error);
  }
}
