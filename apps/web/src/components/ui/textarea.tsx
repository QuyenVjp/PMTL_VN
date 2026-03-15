import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[112px] w-full rounded-md border border-border/80 bg-card/94 px-3 py-2 text-sm leading-6 text-foreground shadow-[inset_0_1px_0_hsl(var(--background)/0.85)] ring-offset-background transition-[border-color,background-color,box-shadow] duration-200 placeholder:text-muted-foreground focus-visible:border-primary/45 focus-visible:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/15 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
