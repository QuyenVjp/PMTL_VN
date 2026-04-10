import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import type { ListEnvelope } from "@/lib/api/envelopes.js";
import type { AltarItemListItem, ValidationLogItem } from "./types.js";

export type { AltarItemListItem, ValidationLogItem } from "./types.js";

export const altarMgmtKeys = {
  all: ["altar-management"] as const,
  items: (f: Record<string, unknown>) => [...altarMgmtKeys.all, "items", f] as const,
  logs: (f: Record<string, unknown>) => [...altarMgmtKeys.all, "logs", f] as const,
};

export function altarItemListOptions(filters: { limit?: number; offset?: number; condition?: string; itemType?: string } = {}) {
  const params: Record<string, string | number | boolean | undefined> = {
    limit: filters.limit ?? 50,
    offset: filters.offset ?? 0,
  };
  if (filters.condition) params.condition = filters.condition;
  if (filters.itemType) params.itemType = filters.itemType;

  return queryOptions({
    queryKey: altarMgmtKeys.items(filters),
    queryFn: () => adminClient.get<ListEnvelope<AltarItemListItem>>("/admin/altar-management/items", params),
  });
}

export function validationLogListOptions(filters: { limit?: number; offset?: number; protocolType?: string } = {}) {
  const params: Record<string, string | number | boolean | undefined> = {
    limit: filters.limit ?? 50,
    offset: filters.offset ?? 0,
  };
  if (filters.protocolType) params.protocolType = filters.protocolType;

  return queryOptions({
    queryKey: altarMgmtKeys.logs(filters),
    queryFn: () => adminClient.get<ListEnvelope<ValidationLogItem>>("/admin/altar-management/validation-logs", params),
  });
}
