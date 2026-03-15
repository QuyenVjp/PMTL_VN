import { mapPostToLegacyDTO } from "@/collections/Posts/service";
import { findCollectionDocument, jsonResponse, mapRouteError } from "@/routes/public";

export async function GET(_request: Request, { params }: { params: Promise<{ slugOrPublicId: string }> }) {
  try {
    const { slugOrPublicId } = await params;
    const document = await findCollectionDocument("posts", slugOrPublicId);

    if (!document) {
      return jsonResponse(404, { error: { message: "Post not found." } });
    }

    return jsonResponse(200, mapPostToLegacyDTO(document));
  } catch (error) {
    return mapRouteError(error);
  }
}
