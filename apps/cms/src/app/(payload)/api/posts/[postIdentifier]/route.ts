import { mapPostToLegacyDTO } from "@/collections/Posts/service";
import { buildPublicCacheHeaders, findCollectionDocument, jsonResponse, mapRouteError } from "@/routes/public";

export async function GET(_request: Request, { params }: { params: Promise<{ postIdentifier: string }> }) {
  try {
    const { postIdentifier } = await params;
    const document = await findCollectionDocument("posts", postIdentifier, {
      ttlSeconds: 300,
    });

    if (!document) {
      return jsonResponse(404, { error: { message: "Post not found." } });
    }

    return jsonResponse(200, mapPostToLegacyDTO(document), {
      headers: buildPublicCacheHeaders(300),
    });
  } catch (error) {
    return mapRouteError(error);
  }
}
