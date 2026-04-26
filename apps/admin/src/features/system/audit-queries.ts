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
  details: () => [...auditKeys.all, "detail"] as const,
  detail: (publicId: string) => [...auditKeys.details(), publicId] as const,
};

export interface AuditListFilters {
  action?: string;
  actorId?: string;
  resource?: string;
  resourceId?: string;
  limit?: number;
  offset?: number;
}

export function auditListOptions(filters: AuditListFilters = {}) {
  const params = {
    limit: filters.limit ?? 100,
    offset: filters.offset ?? 0,
    action: filters.action,
    actorId: filters.actorId,
    resource: filters.resource,
    resourceId: filters.resourceId,
  };

  return queryOptions({
    queryKey: auditKeys.list(params),
    queryFn: () =>
      adminClient.get<ListEnvelope<AuditLogItem>>("/admin/audit-logs", params),
  });
}
