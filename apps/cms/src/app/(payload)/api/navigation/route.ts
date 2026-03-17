import { getCmsPayload, mapRouteError } from "@/routes/public";
import { cachedFetch } from "@/services/cache.service";

export async function GET() {
  try {
    const document = await cachedFetch("global:navigation", 300, async () => {
      const payload = await getCmsPayload();
      return payload.findGlobal({
        slug: "navigation",
        depth: 1,
        overrideAccess: true,
      });
    });

    return Response.json(document, {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=900",
      },
      status: 200,
    });
  } catch (error) {
    return mapRouteError(error);
  }
}
