import { mapChantPreferenceToDTO, upsertChantPreferences } from "@/collections/ChantPreferences/service";
import type { ChantPreference } from "@/payload-types";
import { getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";
import { requireSession } from "@/routes/session";

export async function GET(request: Request) {
  try {
    const payload = await getCmsPayload();
    const session = await requireSession(request.headers);
    const result = await payload.find({
      collection: "chantPreferences",
      depth: 1,
      limit: 1,
      overrideAccess: true,
      where: {
        user: {
          equals: Number(session.user.id),
        },
      },
    });

    return jsonResponse(200, {
      preference: result.docs[0] ? mapChantPreferenceToDTO(result.docs[0]) : null,
    });
  } catch (error) {
    return mapRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await getCmsPayload();
    const session = await requireSession(request.headers);
    const body = (await request.json()) as Record<string, unknown>;
    const result = await payload.find({
      collection: "chantPreferences",
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        user: {
          equals: Number(session.user.id),
        },
      },
    });

    const prepared = upsertChantPreferences<{
      publicId?: string | null;
      user: number;
      plan: number | null;
      enabledOptionalItems: { chantItem: number | null }[];
      targetsByItem: { chantItem: number | null; target: number }[];
      intentionsByItem: { chantItem: number | null; intention: string }[];
    }>({
      user: Number(session.user.id),
      plan: typeof body.plan === "number" ? body.plan : null,
      enabledOptionalItems: Array.isArray(body.enabledOptionalItems)
        ? body.enabledOptionalItems.map((item) => ({ chantItem: Number(item) || null }))
        : [],
      targetsByItem: Array.isArray(body.targetsByItem)
        ? body.targetsByItem.map((item) => {
            const record = item as Record<string, unknown>;
            return {
              chantItem: typeof record.chantItem === "number" ? record.chantItem : null,
              target: typeof record.target === "number" ? record.target : 0,
            };
          })
        : [],
      intentionsByItem: Array.isArray(body.intentionsByItem)
        ? body.intentionsByItem.map((item) => {
            const record = item as Record<string, unknown>;
            return {
              chantItem: typeof record.chantItem === "number" ? record.chantItem : null,
              intention: typeof record.intention === "string" ? record.intention : "",
            };
          })
        : [],
    });

    let document: ChantPreference;

    if (result.docs[0]) {
      document = await payload.update({
        collection: "chantPreferences",
        id: result.docs[0].id,
        data: prepared as never,
        overrideAccess: true,
      });
    } else {
      document = await payload.create({
        collection: "chantPreferences",
        data: {
          ...prepared,
          publicId: prepared.publicId ?? "",
        } as never,
        overrideAccess: true,
      });
    }

    return jsonResponse(200, {
      preference: mapChantPreferenceToDTO(document),
    });
  } catch (error) {
    return mapRouteError(error);
  }
}
