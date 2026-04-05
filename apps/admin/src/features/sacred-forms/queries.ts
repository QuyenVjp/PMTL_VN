import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import type { ListEnvelope } from "@/lib/api/envelopes.js";
import type { TemplateListItem, ApplicantListItem } from "./types.js";

export const sacredFormKeys = {
  all: ["sacred-forms"] as const,
  templates: () => [...sacredFormKeys.all, "templates"] as const,
  templateList: (f: Record<string, unknown>) => [...sacredFormKeys.templates(), f] as const,
  applicants: () => [...sacredFormKeys.all, "applicants"] as const,
  applicantList: (f: Record<string, unknown>) => [...sacredFormKeys.applicants(), f] as const,
  applicantDetail: (id: string) => [...sacredFormKeys.applicants(), "detail", id] as const,
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
    queryFn: () => adminClient.get<ListEnvelope<TemplateListItem>>("/sacred-forms/templates", params),
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
    queryFn: () => adminClient.get<ListEnvelope<ApplicantListItem>>("/sacred-forms/applicants", params),
  });
}
