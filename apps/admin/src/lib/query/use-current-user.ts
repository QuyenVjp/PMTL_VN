/**
 * Reactive hook for the currently authenticated admin user.
 *
 * Wraps GET /auth/me in TanStack Query so any component that calls this hook
 * will automatically re-render when the query is invalidated — e.g., after
 * a profile or avatar update in SettingsPage.
 *
 * Replaces the synchronous getCachedUser() / getAdminUserDisplay() pattern
 * in layout components that need live user data (NavUser, settings sidebar).
 */
import { queryOptions, useQuery } from "@tanstack/react-query";

import { adminClient } from "@/lib/api/admin-client";

interface MeUser {
  publicId: string;
  emailMasked: string;
  displayName: string;
  role: string;
  avatarUrl?: string | null;
}

interface MeResponse {
  user: MeUser;
}

export const currentUserQueryKey = ["auth", "me"] as const;

export const currentUserQueryOptions = queryOptions({
  queryKey: currentUserQueryKey,
  queryFn: async () => {
    const response = await adminClient.get<MeResponse>("/auth/me");
    return response.user;
  },
  // Stale after 60 seconds — profile data changes infrequently
  staleTime: 60_000,
  // Don't throw — layout components should degrade gracefully
  retry: false,
});

function makeInitials(displayName: string): string {
  return displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

function roleLabel(role: string): string {
  if (role === "SUPER_ADMIN") return "Quản trị viên cao cấp";
  if (role === "ADMIN") return "Điều phối vận hành";
  return role;
}

function normalizeAvatarUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  // Strip host so /media/... is served via Vite proxy (/media → API static assets)
  try {
    const { pathname } = new URL(url);
    return pathname;
  } catch {
    return url; // already a relative path
  }
}

export interface CurrentUserDisplay {
  name: string;
  initials: string;
  email: string;
  role: string;
  avatar: string | undefined;
  publicId: string;
}

const fallbackDisplay: CurrentUserDisplay = {
  name: "Admin",
  initials: "A",
  email: "",
  role: "Admin",
  avatar: undefined,
  publicId: "",
};

/**
 * Returns the current user display data reactively via TanStack Query.
 * Components using this hook will re-render after invalidateQueries(["auth","me"]).
 */
export function useCurrentUser(): CurrentUserDisplay {
  const { data } = useQuery(currentUserQueryOptions);

  if (!data) return fallbackDisplay;

  return {
    name: data.displayName,
    initials: makeInitials(data.displayName),
    email: data.emailMasked,
    role: roleLabel(data.role),
    avatar: normalizeAvatarUrl(data.avatarUrl),
    publicId: data.publicId,
  };
}
