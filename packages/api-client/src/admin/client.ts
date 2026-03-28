import { createAdminClient } from "../core/client.js";

/**
 * Singleton admin HTTP client.
 * All admin feature query factories import from here — never from apps/admin/src/lib.
 */
export const adminClient = createAdminClient("/api");
