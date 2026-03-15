import { getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sutraPublicId: string; chapterPublicId: string }> },
) {
  try {
    const { sutraPublicId, chapterPublicId } = await params;
    const payload = await getCmsPayload();

    const sutraResult = await payload.find({
      collection: "sutras",
      depth: 0,
      limit: 1,
      where: {
        publicId: {
          equals: sutraPublicId,
        },
      },
    });

    const sutra = sutraResult.docs[0];

    if (!sutra) {
      return jsonResponse(404, { error: { message: "Sutra not found." } });
    }

    const chapterResult = await payload.find({
      collection: "sutraChapters",
      depth: 1,
      limit: 1,
      where: {
        and: [
          {
            publicId: {
              equals: chapterPublicId,
            },
          },
          {
            sutra: {
              equals: sutra.id,
            },
          },
        ],
      },
    });

    const chapter = chapterResult.docs[0];

    if (!chapter) {
      return jsonResponse(404, { error: { message: "Sutra chapter not found." } });
    }

    return jsonResponse(200, chapter);
  } catch (error) {
    return mapRouteError(error);
  }
}
