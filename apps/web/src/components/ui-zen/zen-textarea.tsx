import * as React from "react";

import { Textarea, type TextareaProps } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const ZenTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <Textarea
        ref={ref}
        className={cn(
          "min-h-[128px] rounded-xl border-border/80 bg-background/80 px-4 py-3 shadow-none focus-visible:border-gold/45 focus-visible:ring-gold/20 focus-visible:ring-offset-0",
          className,
        )}
        {...props}
      />
    );
  },
);

ZenTextarea.displayName = "ZenTextarea";
