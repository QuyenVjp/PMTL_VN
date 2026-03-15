import { buildCommentTreeDTO, mapCommentToPublicDTO } from "@/collections/PostComments/service";
import { findCollectionDocument, getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";

export async function GET(_request: Request, { params }: { params: Promise<{ postIdentifier: string }> }) {
  try {
    const payload = await getCmsPayload();
    const { postIdentifier } = await params;
    const post = await findCollectionDocument("posts", postIdentifier);

    if (!post) {
      return jsonResponse(404, { error: { message: "Post not found." } });
    }

    const result = await payload.find({
      collection: "postComments",
      depth: 1,
      limit: 100,
      where: {
        post: {
          equals: post.id,
        },
      },
    });

    return jsonResponse(200, {
      ...result,
      docs: buildCommentTreeDTO(result.docs.map(mapCommentToPublicDTO)),
    });
  } catch (error) {
    return mapRouteError(error);
  }
}
