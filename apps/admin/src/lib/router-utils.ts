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
