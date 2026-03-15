import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ZenInputProps = React.ComponentProps<typeof Input>;

export const ZenInput = React.forwardRef<HTMLInputElement, ZenInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        className={cn(
          "h-12 rounded-xl border-border/80 bg-background/80 px-4 shadow-none focus-visible:border-gold/45 focus-visible:ring-gold/20",
          className,
        )}
        {...props}
      />
    );
  },
);

ZenInput.displayName = "ZenInput";
