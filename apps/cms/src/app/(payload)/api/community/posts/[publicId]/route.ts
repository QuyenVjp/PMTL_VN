import { mapCommunityPostToPublicDTO } from "@/collections/CommunityPosts/service";
import { findCollectionDocument, jsonResponse, mapRouteError } from "@/routes/public";

export async function GET(_request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  try {
    const { publicId } = await params;
    const document = await findCollectionDocument("communityPosts", publicId);

    if (!document) {
      return jsonResponse(404, { error: { message: "Community post not found." } });
    }

    return jsonResponse(200, mapCommunityPostToPublicDTO(document));
  } catch (error) {
    return mapRouteError(error);
  }
}
