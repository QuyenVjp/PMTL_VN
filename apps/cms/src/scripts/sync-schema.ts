import { getPayload } from "payload";

import config from "@/payload.config";

async function main() {
  const payload = await getPayload({ config });

  await payload.count({
    collection: "users",
    overrideAccess: true,
  });

  console.info("[db:sync] Payload schema is ready.");
  process.exit(0);
}

void main().catch((error) => {
  console.error("[db:sync]", error);
  process.exit(1);
});
