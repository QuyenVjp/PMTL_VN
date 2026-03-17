import { buildPublicCacheHeaders, findGlobalDocument, jsonResponse, mapRouteError } from "@/routes/public";

export async function GET() {
  try {
    const document = await findGlobalDocument("homepage", {
      depth: 2,
      ttlSeconds: 300,
    });

    return jsonResponse(200, document, {
      headers: buildPublicCacheHeaders(300),
    });
  } catch (error) {
    return mapRouteError(error);
  }
}
