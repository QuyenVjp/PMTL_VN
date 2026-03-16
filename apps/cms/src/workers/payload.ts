import { getPayload } from "payload";

import config from "@/payload.config";

let payloadPromise: ReturnType<typeof getPayload> | null = null;

export function getWorkerPayload() {
  if (!payloadPromise) {
    payloadPromise = getPayload({
      config,
    }).catch((error) => {
      // Reset cached promise so next retry can establish a fresh connection.
      payloadPromise = null;
      throw error;
    });
  }

  return payloadPromise;
}
