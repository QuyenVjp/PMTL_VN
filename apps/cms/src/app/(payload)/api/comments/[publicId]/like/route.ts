import { getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";

export async function POST(_request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  try {
    const payload = await getCmsPayload();
    const { publicId } = await params;
    const existing = await payload.find({
      collection: "postComments",
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        publicId: {
          equals: publicId,
        },
      },
    });

    const comment = existing.docs[0];

    if (!comment) {
      return jsonResponse(404, { error: { message: "Comment not found." } });
    }

    const updated = await payload.update({
      collection: "postComments",
      id: comment.id,
      data: {
        likes: (typeof comment.likes === "number" ? comment.likes : 0) + 1,
      },
      overrideAccess: true,
    });

    return jsonResponse(200, {
      success: true,
      likes: typeof updated.likes === "number" ? updated.likes : 0,
    });
  } catch (error) {
    return mapRouteError(error);
  }
}
