/**
 * Admin API Client — re-exported from @pmtl/api-client.
 * Source of truth has moved to packages/api-client; this shim keeps existing
 * feature imports (`import { adminClient } from "@/lib/api/admin-client.js"`) working
 * without requiring a bulk migration of every feature at once.
 */
export { adminClient } from "@pmtl/api-client";
