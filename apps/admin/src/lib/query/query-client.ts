import { QueryClient } from "@tanstack/react-query";
import { HttpError } from "@/lib/api/http-error.js";
import { clearAuthCache } from "@/lib/auth.js";

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

// Global 401 handler: when a query fails with Unauthorized after the client-level
// refresh attempt, clear the stale auth cache and redirect to login.
let redirecting = false;
queryClient.getQueryCache().subscribe((event) => {
  if (event.type === "updated" && event.action.type === "error") {
    const err = (event.action as { error?: unknown }).error;
    if (err instanceof HttpError && err.isUnauthorized && !redirecting) {
      redirecting = true;
      clearAuthCache();
      window.location.replace("/auth/dang-nhap");
    }
  }
});
