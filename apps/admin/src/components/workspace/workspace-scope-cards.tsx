import type { ComponentType } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface WorkspaceScopeCardItem {
  title: string;
  description: string;
  badge?: string;
  note?: string;
  icon?: ComponentType<{ className?: string }>;
}

export function WorkspaceScopeCards({
  items,
  className,
}: {
  items: WorkspaceScopeCardItem[];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-3", className)}>
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.title}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                {Icon ? <Icon className="size-4 text-muted-foreground" /> : null}
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>{item.description}</p>
              <div className="flex flex-wrap gap-2">
                {item.badge ? <Badge variant="outline">{item.badge}</Badge> : null}
                {item.note ? <Badge variant="secondary">{item.note}</Badge> : null}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
