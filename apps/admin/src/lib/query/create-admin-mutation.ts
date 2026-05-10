import { mutationOptions, type MutationOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import { invalidateExact, invalidateFamily } from "./invalidate.js";

/**
 * Standard mutation result with ID
 */
export interface MutationResult<T = unknown> {
  data: T;
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

/**
 * Invalidation choreography config
 * Defines which query keys to invalidate after mutation success
 */
export interface InvalidationConfig {
  /** Exact keys to invalidate */
  exact?: (unknown[])[];
  /** Key family prefixes to invalidate */
  families?: (unknown[])[];
  /** Invalidate dashboard (convenience helper) */
  dashboard?: boolean;
  /** Custom callback for additional side effects */
  onSuccess?: () => Promise<void> | void;
}

/**
 * Create a POST mutation with standard invalidation choreography
 * @example
 * export function useCreatePostMutation() {
 *   return useMutation(
 *     createAdminMutation<PostInput, Post>({
 *       endpoint: "/admin/content/posts",
 *       invalidate: {
 *         families: [postAdminKeys.lists()],
 *         dashboard: true,
 *       },
 *     })
 *   );
 * }
 */
export function createAdminMutation<TPayload, TResponse = unknown>({
  endpoint,
  method = "POST",
  invalidate,
}: {
  endpoint: string;
  method?: "POST" | "PUT" | "PATCH" | "DELETE";
  invalidate: InvalidationConfig;
}): MutationOptions<MutationResult<TResponse>, Error, TPayload> {
  return mutationOptions({
    mutationFn: async (payload: TPayload) => {
      if (method === "POST") {
        return adminClient.post<MutationResult<TResponse>>(endpoint, payload);
      }
      if (method === "PUT") {
        return adminClient.put<MutationResult<TResponse>>(endpoint, payload);
      }
      if (method === "PATCH") {
        return adminClient.patch<MutationResult<TResponse>>(endpoint, payload);
      }
      if (method === "DELETE") {
        return adminClient.delete<MutationResult<TResponse>>(endpoint);
      }
      throw new Error(`Unsupported method: ${method as string}`);
    },
    onSuccess: async () => {
      // Invalidate exact keys
      if (invalidate.exact) {
        await Promise.all(invalidate.exact.map((key) => invalidateExact(key)));
      }

      // Invalidate key families
      if (invalidate.families) {
        await Promise.all(
          invalidate.families.map((family) => invalidateFamily(family))
        );
      }

      // Invalidate dashboard if requested
      if (invalidate.dashboard) {
        const { invalidateDashboard } = await import("./invalidate.js");
        await invalidateDashboard();
      }

      // Run custom callback
      if (invalidate.onSuccess) {
        await invalidate.onSuccess();
      }
    },
  });
}

/**
 * Create a GET-based query-like mutation (e.g., search, export, preview)
 * Used for mutations that are logically queries but need mutation semantics
 */
export function createAdminQueryMutation<TPayload, TResponse = unknown>({
  endpoint,
  invalidate,
}: {
  endpoint: string;
  invalidate?: InvalidationConfig;
}): MutationOptions<TResponse, Error, TPayload> {
  return mutationOptions({
    mutationFn: async (payload: TPayload) => {
      return adminClient.post<TResponse>(endpoint, payload);
    },
    onSuccess: async () => {
      if (!invalidate) return;

      // Invalidate exact keys
      if (invalidate.exact) {
        await Promise.all(invalidate.exact.map((key) => invalidateExact(key)));
      }

      // Invalidate key families
      if (invalidate.families) {
        await Promise.all(
          invalidate.families.map((family) => invalidateFamily(family))
        );
      }

      // Invalidate dashboard if requested
      if (invalidate.dashboard) {
        const { invalidateDashboard } = await import("./invalidate.js");
        await invalidateDashboard();
      }

      // Run custom callback
      if (invalidate.onSuccess) {
        await invalidate.onSuccess();
      }
    },
  });
}
