import { cachedFetch } from "@/services/cache.service";
import { buildPublicCacheHeaders, getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sutraIdentifier: string; chapterPublicId: string }> },
) {
  try {
    const { sutraIdentifier, chapterPublicId } = await params;
    const chapter = await cachedFetch(`sutra-chapter:${sutraIdentifier}:${chapterPublicId}`, 300, async () => {
      const payload = await getCmsPayload();
      const sutraResult = await payload.find({
        collection: "sutras",
        depth: 0,
        limit: 1,
        overrideAccess: true,
        where: {
          or: [
            {
              publicId: {
                equals: sutraIdentifier,
              },
            },
            {
              slug: {
                equals: sutraIdentifier,
              },
            },
          ],
        },
      });

      const sutra = sutraResult.docs[0];

      if (!sutra) {
        return null;
      }

      const chapterResult = await payload.find({
        collection: "sutraChapters",
        depth: 1,
        limit: 1,
        overrideAccess: true,
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

      return chapterResult.docs[0] ?? null;
    });

    if (!chapter) {
      return jsonResponse(404, {
        error: {
          message: "Sutra chapter not found.",
        },
      });
    }

    return jsonResponse(200, chapter, {
      headers: buildPublicCacheHeaders(300),
    });
  } catch (error) {
    return mapRouteError(error);
  }
}
