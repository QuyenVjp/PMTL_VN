import { getPayload } from "payload";

import config from "@/payload.config";

let payloadPromise: ReturnType<typeof getPayload> | null = null;

export function getWorkerPayload() {
  if (!payloadPromise) {
    payloadPromise = getPayload({
      config,
    });
  }

  return payloadPromise;
}
