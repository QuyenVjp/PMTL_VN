export async function publishWebhookEvent(
  eventName: string,
  payload: Record<string, string>,
): Promise<void> {
  if (!process.env.INTERNAL_WEBHOOK_URL) {
    return;
  }

  await fetch(process.env.INTERNAL_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      eventName,
      payload,
    }),
  });
}

