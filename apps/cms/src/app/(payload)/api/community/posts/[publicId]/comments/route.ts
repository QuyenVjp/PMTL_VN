import { z } from "zod";

import { mapCommunityCommentToDTO, submitCommunityComment } from "@/collections/CommunityComments/service";
import { cachedFetch } from "@/services/cache.service";
import { buildPublicCacheHeaders, findCollectionDocument, getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";
import { getRequestIpHash, getRequestMetadata } from "@/routes/request-metadata";
import { getOptionalSession } from "@/routes/session";
import { appendRouteAuditLog } from "@/services/audit.service";
import { notifyModerators } from "@/services/notification.service";
import { consumeGuard } from "@/services/request-guard.service";

const commentSubmitSchema = z.object({
  content: z.string().trim().min(3).max(2000),
  parentPublicId: z.string().trim().min(1).optional(),
  author_name: z.string().trim().min(2).max(120).optional(),
});

export async function GET(_request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  try {
    const { publicId } = await params;
    const post = await findCollectionDocument("communityPosts", publicId, {
      ttlSeconds: 120,
    });

    if (!post) {
      return jsonResponse(404, { error: { message: "Community post not found." } });
    }

    const result = await cachedFetch(`community-comments:thread:${post.id}`, 60, async () => {
      const payload = await getCmsPayload();

      return payload.find({
        collection: "communityComments",
        depth: 1,
        limit: 100,
        overrideAccess: true,
        where: {
          post: {
            equals: post.id,
          },
        },
      });
    });

    return jsonResponse(
      200,
      {
        ...result,
        docs: result.docs.map(mapCommunityCommentToDTO),
      },
      {
        headers: buildPublicCacheHeaders(60, {
          staleWhileRevalidateSeconds: 180,
        }),
      },
    );
  } catch (error) {
    return mapRouteError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  try {
    const payload = await getCmsPayload();
    const session = await getOptionalSession(request.headers);
    const { publicId } = await params;
    const actorKey = session ? `user:${session.user.id}` : getRequestIpHash(request.headers) || "guest";
    const guard = await consumeGuard({
      payload,
      guardKey: `community-comment:${publicId}:${actorKey}`,
      scope: "comment-submit",
      ttlSeconds: 60 * 10,
      maxHits: session ? 8 : 3,
    });

    if (!guard.allowed) {
      return jsonResponse(429, {
        error: {
          message: "Bạn gửi bình luận cộng đồng quá nhanh. Vui lòng thử lại sau.",
        },
      });
    }

    const post = await findCollectionDocument("communityPosts", publicId);

    if (!post) {
      return jsonResponse(404, { error: { message: "Community post not found." } });
    }

    const rawBody: unknown = await request.json();
    const parsedBody = commentSubmitSchema.safeParse(rawBody);
    if (!parsedBody.success) {
      return jsonResponse(400, {
        error: {
          message: "Community comment payload is invalid.",
          details: parsedBody.error.flatten(),
        },
      });
    }

    const parentPublicId = parsedBody.data.parentPublicId ?? null;
    const parentComment = parentPublicId
      ? await findCollectionDocument("communityComments", parentPublicId, { slugField: "publicId" })
      : null;
    const authorName = session?.user.displayName ?? parsedBody.data.author_name?.trim() ?? "";

    if (!authorName) {
      return jsonResponse(400, {
        error: {
          message: "Thiếu tên người bình luận.",
        },
      });
    }

    const created = await payload.create({
      collection: "communityComments",
      data: submitCommunityComment({
        post: post.id,
        parent: parentComment?.id ?? null,
        content: parsedBody.data.content,
        authorUser: session ? Number(session.user.id) : null,
        authorNameSnapshot: authorName,
      }) as never,
      overrideAccess: true,
    });

    await appendRouteAuditLog(payload, {
      action: "communityComments.submit",
      actorType: session ? "user" : "guest",
      actorUser: session ? Number(session.user.id) : null,
      targetType: "communityComments",
      targetPublicId: created.publicId ?? null,
      targetRef: {
        collection: "communityComments",
        id: String(created.id),
      },
      ...getRequestMetadata(request.headers),
      metadata: {
        postPublicId: publicId,
      },
    });

    await notifyModerators({
      payload,
      actorUserId: session?.user.id ?? null,
      actorDisplayName: authorName,
      kind: "community-comment",
      subject: "Có bình luận cộng đồng mới cần duyệt",
      message: `${authorName} vừa gửi bình luận trong bài cộng đồng ${publicId}.`,
      url: `/admin/collections/communityComments/${created.id}`,
      metadata: {
        targetPublicId: created.publicId ?? null,
        postPublicId: publicId,
      },
    });

    return jsonResponse(201, mapCommunityCommentToDTO(created));
  } catch (error) {
    return mapRouteError(error);
  }
}
