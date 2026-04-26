import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import type { ListEnvelope } from "@/lib/api/envelopes.js";
import type { TemplateListItem, ApplicantListItem } from "./types.js";

export type { TemplateListItem, ApplicantListItem } from "./types.js";

export type DisposalPolarity = "BURN" | "KEEP" | "OTHER";

export interface DisposalPolarityItem {
  publicId?: string;
  id?: string;
  formType: string;
  polarity: DisposalPolarity;
  rule?: string | null;
  note?: string | null;
  effectiveAt?: string | null;
}

export const sacredFormKeys = {
  all: ["sacred-forms"] as const,
  lists: () => [...sacredFormKeys.all, "list"] as const,
  list: (owner: "templates" | "applicants" | "disposal-polarities", f: Record<string, unknown>) => [...sacredFormKeys.lists(), owner, f] as const,
  details: () => [...sacredFormKeys.all, "detail"] as const,
  detail: (owner: "templates" | "applicants", id: string) => [...sacredFormKeys.details(), owner, id] as const,
  templates: () => [...sacredFormKeys.lists(), "templates"] as const,
  templateList: (f: Record<string, unknown>) => sacredFormKeys.list("templates", f),
  applicants: () => [...sacredFormKeys.lists(), "applicants"] as const,
  applicantList: (f: Record<string, unknown>) => sacredFormKeys.list("applicants", f),
  applicantDetail: (id: string) => sacredFormKeys.detail("applicants", id),
  disposalPolarities: () => sacredFormKeys.list("disposal-polarities", {}),
};

export function templateListOptions(filters: { limit?: number; offset?: number; formType?: string; isActive?: boolean } = {}) {
  const params: Record<string, string | number | boolean | undefined> = {
    limit: filters.limit ?? 50,
    offset: filters.offset ?? 0,
  };
  if (filters.formType) params.formType = filters.formType;
  if (filters.isActive !== undefined) params.isActive = filters.isActive;

  return queryOptions({
    queryKey: sacredFormKeys.templateList(filters),
    queryFn: () => adminClient.get<ListEnvelope<TemplateListItem>>("/admin/sacred-forms/templates", params),
  });
}

export function applicantListOptions(filters: { limit?: number; offset?: number; status?: string } = {}) {
  const params: Record<string, string | number | boolean | undefined> = {
    limit: filters.limit ?? 50,
    offset: filters.offset ?? 0,
  };
  if (filters.status) params.status = filters.status;

  return queryOptions({
    queryKey: sacredFormKeys.applicantList(filters),
    queryFn: () => adminClient.get<ListEnvelope<ApplicantListItem>>("/admin/sacred-forms/applicants", params),
  });
}

export function disposalPolaritiesOptions() {
  return queryOptions({
    queryKey: sacredFormKeys.disposalPolarities(),
    queryFn: () =>
      adminClient.get<{ data: DisposalPolarityItem[] }>(
        "/admin/sacred-forms/disposal-polarities",
      ),
  });
}
