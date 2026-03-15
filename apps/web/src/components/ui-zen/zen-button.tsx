import * as React from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ZenButton({ className, ...props }: ButtonProps) {
  return (
    <Button
      className={cn("rounded-xl shadow-ant", className)}
      {...props}
    />
  );
}
