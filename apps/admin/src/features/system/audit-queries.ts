import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import type { ListEnvelope } from "@/lib/api/envelopes.js";

export interface AuditLogItem {
  publicId: string;
  actorId: string | null;
  actorType: string | null;
  action: string;
  resourceType: string | null;
  resourcePublicId: string | null;
  occurredAt: string;
}

export const auditKeys = {
  all: ["admin-audit-logs"] as const,
  lists: () => [...auditKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...auditKeys.lists(), filters] as const,
};

export function auditListOptions() {
  return queryOptions({
    queryKey: auditKeys.list({ limit: 100 }),
    queryFn: () =>
      adminClient.get<ListEnvelope<AuditLogItem>>("/admin/audit-logs", { limit: 100, offset: 0 }),
  });
}
