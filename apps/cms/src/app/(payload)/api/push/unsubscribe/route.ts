import { getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";

export async function POST(request: Request) {
  try {
    const payload = await getCmsPayload();
    const body = (await request.json()) as { endpoint?: string };
    const endpoint = body.endpoint?.trim();

    if (!endpoint) {
      return jsonResponse(400, { error: { message: "Endpoint is required." } });
    }

    const existing = await payload.find({
      collection: "pushSubscriptions",
      depth: 0,
      limit: 1,
      where: {
        endpoint: {
          equals: endpoint,
        },
      },
    });

    const document = existing.docs[0];

    if (!document) {
      return jsonResponse(200, { success: true });
    }

    await payload.update({
      collection: "pushSubscriptions",
      id: document.id,
      data: {
        isActive: false,
      },
      overrideAccess: true,
    });

    return jsonResponse(200, { success: true });
  } catch (error) {
    return mapRouteError(error);
  }
}
