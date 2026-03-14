"use client";

import { useCallback, useEffect, useState } from "react";

import type { AuthSession } from "@pmtl/shared";

import { fetchCurrentSessionViaWeb } from "../api/browser-auth-client";
import { WebAuthError } from "../utils/auth-error";

type UseAuthSessionResult = {
  error: string | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  session: AuthSession | null;
};

export function useAuthSession(): UseAuthSessionResult {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchCurrentSessionViaWeb();
      setSession(response.session);
    } catch (error) {
      if (error instanceof WebAuthError && error.statusCode === 401) {
        setSession(null);
        setError(null);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Khong tai duoc session.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    error,
    isLoading,
    refresh,
    session,
  };
}

