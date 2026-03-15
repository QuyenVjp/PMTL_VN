import { mapPracticeLogToDTO, upsertPracticeLog } from "@/collections/PracticeLogs/service";
import type { PracticeLog } from "@/payload-types";
import { getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";
import { requireSession } from "@/routes/session";

export async function GET(request: Request) {
  try {
    const payload = await getCmsPayload();
    const session = await requireSession(request.headers);
    const url = new URL(request.url);
    const practiceDate = url.searchParams.get("practiceDate");
    const result = await payload.find({
      collection: "practiceLogs",
      depth: 1,
      limit: 1,
      overrideAccess: true,
      where: {
        and: [
          {
            user: {
              equals: Number(session.user.id),
            },
          },
          ...(practiceDate
            ? [
                {
                  practiceDate: {
                    equals: practiceDate,
                  },
                },
              ]
            : []),
        ],
      },
    });

    return jsonResponse(200, {
      practiceLog: result.docs[0] ? mapPracticeLogToDTO(result.docs[0]) : null,
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
    const practiceDate =
      typeof body.practiceDate === "string"
        ? body.practiceDate
        : new Date().toISOString().slice(0, 10);
    const plan = typeof body.plan === "number" ? body.plan : null;
    const sessionConfig =
      body.sessionConfig && typeof body.sessionConfig === "object"
        ? {
            durationMinutes:
              typeof (body.sessionConfig as Record<string, unknown>).durationMinutes === "number"
                ? ((body.sessionConfig as Record<string, unknown>).durationMinutes as number)
                : 0,
            notes:
              typeof (body.sessionConfig as Record<string, unknown>).notes === "string"
                ? ((body.sessionConfig as Record<string, unknown>).notes as string)
                : "",
          }
        : null;

    const existing = await payload.find({
      collection: "practiceLogs",
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        and: [
          {
            user: {
              equals: Number(session.user.id),
            },
          },
          {
            practiceDate: {
              equals: practiceDate,
            },
          },
          ...(plan
            ? [
                {
                  plan: {
                    equals: plan,
                  },
                },
              ]
            : []),
        ],
      },
    });

    const prepared = upsertPracticeLog<{
      publicId?: string | null;
      user: number;
      plan: number | null;
      practiceDate: string;
      itemStates: { chantItem: number | null; completed: boolean; count: number }[];
      sessionConfig?: { durationMinutes: number; notes: string } | undefined;
      startedAt: string | null;
      completedAt: string | null;
      isCompleted: boolean;
    }>({
      user: Number(session.user.id),
      plan,
      practiceDate,
      itemStates: Array.isArray(body.itemStates)
        ? body.itemStates.map((item) => {
            const record = item as Record<string, unknown>;
            return {
              chantItem: typeof record.chantItem === "number" ? record.chantItem : null,
              completed: Boolean(record.completed),
              count: typeof record.count === "number" ? record.count : 0,
            };
          })
        : [],
      ...(sessionConfig ? { sessionConfig } : {}),
      startedAt: typeof body.startedAt === "string" ? body.startedAt : null,
      completedAt: typeof body.completedAt === "string" ? body.completedAt : null,
      isCompleted: Boolean(body.isCompleted),
    });

    let document: PracticeLog;

    if (existing.docs[0]) {
      document = await payload.update({
        collection: "practiceLogs",
        id: existing.docs[0].id,
        data: prepared as never,
        overrideAccess: true,
      });
    } else {
      document = await payload.create({
        collection: "practiceLogs",
        data: {
          ...prepared,
          publicId: prepared.publicId ?? "",
        } as never,
        overrideAccess: true,
      });
    }

    return jsonResponse(200, {
      practiceLog: mapPracticeLogToDTO(document),
    });
  } catch (error) {
    return mapRouteError(error);
  }
}
