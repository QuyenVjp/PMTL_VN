import { mapCommunityPostToPublicDTO, submitCommunityPost } from "@/collections/CommunityPosts/service";
import { getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";
import { requireSession } from "@/routes/session";

export async function POST(request: Request) {
  try {
    const payload = await getCmsPayload();
    const session = await requireSession(request.headers);
    const body = (await request.json()) as Record<string, unknown>;

    const created = await payload.create({
      collection: "communityPosts",
      data: submitCommunityPost({
        title: typeof body.title === "string" ? body.title : "",
        content: typeof body.content === "string" ? body.content : "",
        type: typeof body.type === "string" ? body.type : "story",
        slug: typeof body.slug === "string" ? body.slug : "",
        videoURL: typeof body.videoURL === "string" ? body.videoURL : "",
        category: typeof body.category === "string" ? body.category : "",
        rating: typeof body.rating === "number" ? body.rating : null,
        tags: Array.isArray(body.tags) ? body.tags.map((value) => String(value)) : [],
        authorUser: Number(session.user.id),
        authorNameSnapshot: session.user.displayName,
      }) as never,
      overrideAccess: true,
    });

    return jsonResponse(201, mapCommunityPostToPublicDTO(created));
  } catch (error) {
    return mapRouteError(error);
  }
}
