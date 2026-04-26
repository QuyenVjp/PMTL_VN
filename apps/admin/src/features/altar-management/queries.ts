import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import type { ListEnvelope } from "@/lib/api/envelopes.js";
import type { AltarItemListItem, ValidationLogItem } from "./types.js";

export type { AltarItemListItem, ValidationLogItem } from "./types.js";

export interface ProtocolTemplate {
  publicId?: string;
  id?: string;
  protocolType: string;
  titleVi: string;
  descriptionVi?: string | null;
  steps?: Array<{ title: string; description?: string | null }> | null;
  isActive?: boolean;
}

export const altarMgmtKeys = {
  all: ["altar-management"] as const,
  lists: () => [...altarMgmtKeys.all, "list"] as const,
  list: (owner: "items" | "logs", f: Record<string, unknown>) => [...altarMgmtKeys.lists(), owner, f] as const,
  details: () => [...altarMgmtKeys.all, "detail"] as const,
  detail: (owner: "items" | "logs", publicId: string) => [...altarMgmtKeys.details(), owner, publicId] as const,
  items: (f: Record<string, unknown>) => altarMgmtKeys.list("items", f),
  logs: (f: Record<string, unknown>) => altarMgmtKeys.list("logs", f),
  protocolTemplates: () => [...altarMgmtKeys.lists(), "protocol-templates"] as const,
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

export function protocolTemplatesOptions() {
  return queryOptions({
    queryKey: altarMgmtKeys.protocolTemplates(),
    queryFn: () => adminClient.get<ProtocolTemplate[]>("/admin/altar-management/protocol-templates"),
  });
}
