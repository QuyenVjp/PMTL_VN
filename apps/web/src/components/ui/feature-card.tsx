import * as React from "react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type FeatureCardProps = Omit<React.ComponentProps<typeof Card>, "title"> & {
  icon?: React.ReactNode;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  tone?: "default" | "hero" | "muted";
};

const toneStyles: Record<NonNullable<FeatureCardProps["tone"]>, string> = {
  default:
    "border-border bg-card shadow-ant hover:border-gold/35",
  hero:
    "border-white/12 bg-black/40 text-white shadow-ant backdrop-blur-xl hover:border-gold/30",
  muted:
    "border-border bg-muted/30 hover:border-gold/25",
};

function FeatureCard({
  className,
  icon,
  eyebrow,
  title,
  description,
  footer,
  tone = "default",
  children,
  ...props
}: FeatureCardProps) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-[1.75rem] border transition-all duration-300",
        "rounded-xl before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.08),transparent_32%)] before:opacity-80",
        toneStyles[tone],
        className,
      )}
      {...props}
    >
      <CardHeader className="relative gap-4 p-6">
        {(icon || eyebrow) && (
          <div className="flex items-center justify-between gap-4">
            {icon ? (
              <div className="flex size-11 items-center justify-center rounded-md border border-border bg-muted text-gold">
                {icon}
              </div>
            ) : (
              <span />
            )}
            {eyebrow}
          </div>
        )}
        <div className="space-y-2">
          <CardTitle className="text-xl leading-tight">{title}</CardTitle>
          {description ? (
            <CardDescription className={cn(tone === "hero" ? "text-white/72" : "text-muted-foreground")}>
              {description}
            </CardDescription>
          ) : null}
        </div>
      </CardHeader>
      {(children || footer) && (
        <CardContent className="relative space-y-5 p-6 pt-0">
          {children}
          {footer}
        </CardContent>
      )}
    </Card>
  );
}

export { FeatureCard };
