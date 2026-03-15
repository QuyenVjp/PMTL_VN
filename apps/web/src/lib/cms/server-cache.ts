"use cache";

import { cacheLife, cacheTag } from "next/cache";

import { cmsFetch, type CmsFetchOptions } from "@/lib/cms";
import { cmsGet } from "@/lib/cms/client";

export type CmsCacheProfile = "default" | "seconds" | "minutes" | "hours" | "days" | "weeks" | "max";

type CacheableCmsFetchOptions = Omit<CmsFetchOptions, "next" | "noCache">;

type CacheOptions = {
  profile?: CmsCacheProfile;
  tags?: string[];
};

function applyCacheOptions(options?: CacheOptions): void {
  cacheLife(options?.profile ?? "hours");

  if (options?.tags?.length) {
    cacheTag(...options.tags);
  }
}

export async function cachedCmsFetch<T>(
  path: string,
  options: CacheableCmsFetchOptions = {},
  cacheOptions?: CacheOptions,
): Promise<T> {
  applyCacheOptions(cacheOptions);

  return cmsFetch<T>(path, {
    ...options,
    noCache: false,
  });
}

export async function cachedCmsGet<T>(
  path: string,
  init?: RequestInit,
  cacheOptions?: CacheOptions,
): Promise<T> {
  applyCacheOptions(cacheOptions);

  return cmsGet<T>(path, {
    ...init,
    cache: "force-cache",
  });
}
