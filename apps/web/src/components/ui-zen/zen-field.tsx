import type { PropsWithChildren, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ZenFieldProps = PropsWithChildren<{
  label: string;
  htmlFor: string;
  error?: string | null;
  hint?: ReactNode;
  className?: string;
}>;

export function ZenField({
  label,
  htmlFor,
  error,
  hint,
  className,
  children,
}: ZenFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-foreground"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <div className="text-xs text-muted-foreground">{hint}</div>
      ) : null}
    </div>
  );
}
