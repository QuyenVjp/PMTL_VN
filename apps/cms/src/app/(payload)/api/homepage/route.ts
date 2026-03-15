import { getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";

export async function GET() {
  try {
    const payload = await getCmsPayload();
    const document = await payload.findGlobal({
      slug: "homepage",
      depth: 2,
    });

    return jsonResponse(200, document);
  } catch (error) {
    return mapRouteError(error);
  }
}
