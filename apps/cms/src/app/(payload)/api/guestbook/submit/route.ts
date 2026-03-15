import { mapGuestbookEntryToPublicDTO, submitGuestbookEntry } from "@/collections/GuestbookEntries/service";
import { getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";
import { getRequestIpHash, getRequestMetadata } from "@/routes/request-metadata";
import { getOptionalSession } from "@/routes/session";
import { appendRouteAuditLog } from "@/services/audit.service";
import { notifyModerators } from "@/services/notification.service";
import { consumeGuard } from "@/services/request-guard.service";

export async function POST(request: Request) {
  try {
    const payload = await getCmsPayload();
    const session = await getOptionalSession(request.headers);
    const actorKey = session ? `user:${session.user.id}` : getRequestIpHash(request.headers) || "guest";
    const guard = await consumeGuard({
      payload,
      guardKey: `guestbook:${actorKey}`,
      scope: "community-submit",
      ttlSeconds: 60 * 60,
      maxHits: session ? 5 : 2,
    });

    if (!guard.allowed) {
      return jsonResponse(429, {
        error: {
          message: "Bạn gửi lưu bút quá nhanh. Vui lòng thử lại sau.",
        },
      });
    }

    const body = (await request.json()) as Record<string, unknown>;

    const created = await payload.create({
      collection: "guestbookEntries",
      data: submitGuestbookEntry({
        authorName:
          session?.user.displayName ??
          (typeof body.authorName === "string" ? body.authorName : "Khách"),
        message: typeof body.message === "string" ? body.message : "",
        country: typeof body.country === "string" ? body.country : "",
        avatar: typeof body.avatar === "string" ? body.avatar : "",
        entryType: typeof body.entryType === "string" ? body.entryType : "",
        questionCategory: typeof body.questionCategory === "string" ? body.questionCategory : "",
        submittedByUser: session ? Number(session.user.id) : null,
        submittedByIpHash: getRequestIpHash(request.headers),
      }) as never,
      overrideAccess: true,
    });

    await appendRouteAuditLog(payload, {
      action: "guestbook.submit",
      actorType: session ? "user" : "guest",
      actorUser: session ? Number(session.user.id) : null,
      targetType: "guestbookEntries",
      targetPublicId: created.publicId ?? null,
      targetRef: {
        collection: "guestbookEntries",
        id: String(created.id),
      },
      ...getRequestMetadata(request.headers),
      metadata: {
        approvalStatus: created.approvalStatus ?? "pending",
      },
    });

    await notifyModerators({
      payload,
      actorUserId: session?.user.id ?? null,
      actorDisplayName: session?.user.displayName ?? created.authorName ?? "Khách",
      kind: "guestbook",
      subject: "Có lời lưu bút mới cần duyệt",
      message: `${created.authorName ?? "Khách"} vừa gửi một lời lưu bút mới.`,
      url: `/admin/collections/guestbookEntries/${created.id}`,
      metadata: {
        targetPublicId: created.publicId ?? null,
      },
    });

    return jsonResponse(201, mapGuestbookEntryToPublicDTO(created));
  } catch (error) {
    return mapRouteError(error);
  }
}
