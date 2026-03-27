import { QueryClient } from "@tanstack/react-query";
import { HttpError } from "@/lib/api/http-error.js";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry(failureCount, error) {
        // Don't retry on auth/permission errors
        if (error instanceof HttpError && (error.isUnauthorized || error.isForbidden || error.isNotFound)) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
