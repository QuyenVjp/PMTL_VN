import type { Column } from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpIcon, CaretSortIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type DataTableColumnHeaderProps<TData, TValue> = React.HTMLAttributes<HTMLDivElement> & {
  column: Column<TData, TValue>;
  title: string;
};

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return (
      <div className={cn("text-xs font-semibold uppercase tracking-wide text-muted-foreground", className)}>
        {title}
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "-ml-3 h-8 gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground data-[sorted=true]:text-foreground",
        className,
      )}
      data-sorted={column.getIsSorted() !== false}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      {column.getIsSorted() === "desc" ? (
        <ArrowDownIcon className="size-3.5 shrink-0" />
      ) : column.getIsSorted() === "asc" ? (
        <ArrowUpIcon className="size-3.5 shrink-0" />
      ) : (
        <CaretSortIcon className="size-3.5 shrink-0 opacity-50" />
      )}
    </Button>
  );
}
