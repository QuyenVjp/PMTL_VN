import { mapSutraToPublicDTO } from "@/collections/Sutras/service";
import { buildPublicCacheHeaders, findCollectionDocument, jsonResponse, mapRouteError } from "@/routes/public";

export async function GET(_request: Request, { params }: { params: Promise<{ sutraIdentifier: string }> }) {
  try {
    const { sutraIdentifier } = await params;
    const document = await findCollectionDocument("sutras", sutraIdentifier, {
      ttlSeconds: 300,
    });

    if (!document) {
      return jsonResponse(404, { error: { message: "Sutra not found." } });
    }

    return jsonResponse(200, mapSutraToPublicDTO(document), {
      headers: buildPublicCacheHeaders(300),
    });
  } catch (error) {
    return mapRouteError(error);
  }
}
