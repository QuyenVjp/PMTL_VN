/**
 * WorkspacePageHeader
 *
 * Standardised page header for list/workspace pages:
 * title, description with optional total count, and a right-side
 * actions slot (refresh button, create button, etc.).
 */
import { RefreshCcwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type WorkspacePageHeaderProps = {
  title: string;
  description: string;
  /** When provided, appended to description as "(N item)" */
  total?: number;
  /** Unit label appended to total, e.g. "bài" → "(12 bài)" */
  totalUnit?: string;
  /** Called when the refresh button is clicked */
  onRefresh?: () => void;
  /** Extra action buttons rendered to the right of refresh */
  actions?: React.ReactNode;
};

export function WorkspacePageHeader({
  title,
  description,
  total,
  totalUnit = "mục",
  onRefresh,
  actions,
}: WorkspacePageHeaderProps) {
  const descWithCount =
    total !== undefined && total > 0
      ? `${description} (${total} ${totalUnit})`
      : description;

  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{descWithCount}</p>
      </div>
      <div className="flex items-center gap-2">
        {actions}
        {onRefresh && (
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCcwIcon className="size-4" />
            Làm mới
          </Button>
        )}
      </div>
    </div>
  );
}
