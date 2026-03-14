import { fetchJson } from "@/lib/api/fetch-json";
import { serverEnv } from "@/lib/env/server-env";

export function buildCMSUrl(path: string): string {
  return new URL(path, serverEnv.PAYLOAD_PUBLIC_SERVER_URL).toString();
}

export async function cmsGet<T>(path: string, init?: RequestInit): Promise<T> {
  return fetchJson<T>(buildCMSUrl(path), init);
}

