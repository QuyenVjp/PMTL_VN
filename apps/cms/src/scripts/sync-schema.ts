import { getPayload } from "payload";

import config from "@/payload.config";
import { getLogger, withError } from "@/services/logger.service";

const logger = getLogger("scripts:sync-schema");

async function main() {
  const payload = await getPayload({ config });

  await payload.count({
    collection: "users",
    overrideAccess: true,
  });

  logger.info("Payload schema is ready");
  process.exit(0);
}

void main().catch((error) => {
  logger.error(withError(undefined, error), "Payload schema sync failed");
  process.exit(1);
});
