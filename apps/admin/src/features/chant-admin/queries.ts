import { queryOptions } from "@tanstack/react-query";

import type { ChantEnvironmentRulesResponse } from "@/features/chant-admin/types";

export const chantAdminKeys = {
  all: ["admin-chanting"] as const,
  environmentRules: () => [...chantAdminKeys.all, "environment-rules"] as const,
};

function resolveApiBaseUrl(rawBaseUrl: string | undefined): string {
  if (!rawBaseUrl) {
    return "/api";
  }

  const trimmed = rawBaseUrl.replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

async function fetchEnvironmentRules(): Promise<ChantEnvironmentRulesResponse> {
  const apiBaseUrl = resolveApiBaseUrl(
    import.meta.env.VITE_API_BASE_URL as string | undefined,
  );

  const response = await fetch(`${apiBaseUrl}/content/chanting/environment-rules`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Không tải được dữ liệu môi trường niệm kinh (${response.status}).`);
  }

  const json = (await response.json()) as { data: ChantEnvironmentRulesResponse };
  return json.data;
}

export function getChantEnvironmentRulesQueryOptions() {
  return queryOptions({
    queryKey: chantAdminKeys.environmentRules(),
    queryFn: fetchEnvironmentRules,
    staleTime: 5 * 60 * 1000,
  });
}
