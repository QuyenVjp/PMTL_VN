import * as React from "react";

import { cn } from "@/lib/utils";

type SectionShellProps = Omit<React.HTMLAttributes<HTMLElement>, "title"> & {
  innerClassName?: string;
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
};

function SectionShell({
  className,
  innerClassName,
  eyebrow,
  title,
  description,
  actions,
  children,
  ...props
}: SectionShellProps) {
  return (
    <section className={cn("relative py-20 sm:py-24", className)} {...props}>
      <div className="absolute inset-x-0 top-0 h-px bg-border/80" />
      <div className={cn("container relative mx-auto px-6", innerClassName)}>
        {(eyebrow || title || description || actions) && (
          <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              {eyebrow}
              {title}
              {description}
            </div>
            {actions ? <div className="shrink-0">{actions}</div> : null}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export { SectionShell };
