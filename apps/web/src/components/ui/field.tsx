import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const FieldGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-5", className)} {...props} />
  ),
);
FieldGroup.displayName = "FieldGroup";

const Field = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-2.5 data-[invalid=true]:text-destructive data-[disabled=true]:opacity-70",
        className,
      )}
      {...props}
    />
  ),
);
Field.displayName = "Field";

const FieldLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => (
  <Label
    ref={ref}
    className={cn(
      "text-sm font-medium tracking-[0.01em] text-foreground data-[invalid=true]:text-destructive",
      className,
    )}
    {...props}
  />
));
FieldLabel.displayName = "FieldLabel";

function FieldDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm leading-relaxed text-muted-foreground data-[invalid=true]:text-destructive", className)}
      {...props}
    />
  );
}

function FieldSeparator({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-muted-foreground/80", className)}
      {...props}
    >
      <Separator className="flex-1 bg-border/70" />
      {children ? <span className="shrink-0">{children}</span> : null}
      <Separator className="flex-1 bg-border/70" />
    </div>
  );
}

export { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator };
