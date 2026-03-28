/**
 * WorkspaceTableShell
 *
 * Card wrapper for simple list/table pages. Handles three states:
 * - loading  → skeleton rows
 * - error    → red error card
 * - empty    → centred empty message
 * - data     → children (the actual <Table> element)
 *
 * Used by module-pages.tsx and similar lightweight list pages that do
 * not need the full TanStack Table data-table/ stack.
 */
import { AlertCircleIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type WorkspaceTableShellProps = {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  /** Number of skeleton rows shown while loading */
  skeletonRows?: number;
  children: React.ReactNode;
};

export function WorkspaceTableShell({
  isLoading,
  isError,
  isEmpty,
  errorMessage = "Không tải được dữ liệu. Vui lòng thử lại.",
  emptyMessage = "Chưa có dữ liệu nào.",
  skeletonRows = 5,
  children,
}: WorkspaceTableShellProps) {
  if (isError) {
    return (
      <Card className="border-red-200 dark:border-red-800">
        <CardContent className="flex items-center gap-2 p-4 text-sm text-red-600 dark:text-red-400">
          <AlertCircleIcon className="size-4 shrink-0" />
          {errorMessage}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: skeletonRows }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : isEmpty ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
