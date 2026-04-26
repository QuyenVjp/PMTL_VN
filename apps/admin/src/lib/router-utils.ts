import { useNavigate } from "@tanstack/react-router";

/**
 * Navigation wrapper for cases where `to` is a runtime string
 * (e.g. received as a prop). Uses a structural cast — not `as any`.
 */
export function useNavigateTo(): (to: string) => void {
  const navigate = useNavigate();
  return (to: string): void => {
    void navigate({ to } as Parameters<typeof navigate>[0]);
  };
}

export function readRouteParam(params: unknown, key: string): string | undefined {
  if (!params || typeof params !== "object") return undefined;
  const value = (params as Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
}
