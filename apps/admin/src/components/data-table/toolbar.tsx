import type { Table } from "@tanstack/react-table";
import { Cross2Icon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableFacetedFilter } from "@/components/data-table/faceted-filter";
import { DataTableViewOptions } from "@/components/data-table/view-options";

type DataTableToolbarProps<TData> = {
  table: Table<TData>;
  searchPlaceholder?: string;
  searchKey?: string;
  filters?: {
    columnId: string;
    title: string;
    options: {
      label: string;
      value: string;
      icon?: React.ComponentType<{ className?: string }>;
    }[];
  }[];
  viewButtonLabel?: string;
};

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = "Tìm nhanh...",
  searchKey,
  filters = [],
  viewButtonLabel,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0 || Boolean(table.getState().globalFilter);

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        {searchKey ? (
          <Input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn(searchKey)?.setFilterValue(event.target.value)}
            className="h-8 w-full sm:w-[220px] lg:w-[280px]"
          />
        ) : (
          <Input
            placeholder={searchPlaceholder}
            value={(table.getState().globalFilter as string) ?? ""}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="h-8 w-full sm:w-[220px] lg:w-[280px]"
          />
        )}

        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => {
            const column = table.getColumn(filter.columnId);
            if (!column) {
              return null;
            }

            return (
              <DataTableFacetedFilter
                key={filter.columnId}
                column={column}
                title={filter.title}
                options={filter.options}
              />
            );
          })}

          {isFiltered ? (
            <Button
              variant="ghost"
              onClick={() => {
                table.resetColumnFilters();
                table.setGlobalFilter("");
              }}
              className="h-8 px-2 lg:px-3"
            >
              Đặt lại
              <Cross2Icon className="ms-2 size-4" />
            </Button>
          ) : null}
        </div>
      </div>

      <DataTableViewOptions table={table} label={viewButtonLabel} />
    </div>
  );
}
