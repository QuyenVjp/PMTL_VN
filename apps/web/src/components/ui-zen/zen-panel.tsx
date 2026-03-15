import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

export function ZenPanel({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-card/95 shadow-ant",
        className,
      )}
    >
      {children}
    </div>
  );
}
