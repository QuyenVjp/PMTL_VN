import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client";

import type { ChantEnvironmentRulesResponse } from "@/features/chant-admin/types";

export const chantAdminKeys = {
  all: ["admin-chanting"] as const,
  environmentRules: () => [...chantAdminKeys.all, "environment-rules"] as const,
};

async function fetchEnvironmentRules(): Promise<ChantEnvironmentRulesResponse> {
  return adminClient.get<ChantEnvironmentRulesResponse>("/admin/content/chanting/environment-rules");
}

export function getChantEnvironmentRulesQueryOptions() {
  return queryOptions({
    queryKey: chantAdminKeys.environmentRules(),
    queryFn: fetchEnvironmentRules,
    staleTime: 5 * 60 * 1000,
  });
}
