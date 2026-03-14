import { publishWebhookEvent } from "@/integrations/webhooks/publish-event";

export async function notifyCommentModeration(commentId: string, status: string): Promise<void> {
  await publishWebhookEvent("comment.moderated", {
    id: commentId,
    status,
  });
}

