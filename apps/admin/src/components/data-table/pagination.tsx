import type { Table } from "@tanstack/react-table";
import { ChevronLeftIcon, ChevronRightIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon } from "@radix-ui/react-icons";

import { cn, getPageNumbers } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type DataTablePaginationProps<TData> = {
  table: Table<TData>;
  className?: string;
};

export function DataTablePagination<TData>({ table, className }: DataTablePaginationProps<TData>) {
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className={cn("flex w-full flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="flex items-center gap-2 self-start">
        <p className="text-sm font-medium">Số dòng mỗi trang</p>
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
          <SelectTrigger className="h-8 w-[86px]">
            <SelectValue placeholder={table.getState().pagination.pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="ml-auto flex w-full flex-wrap items-center justify-end gap-2 self-end sm:w-auto sm:gap-3">
        <div className="min-w-[116px] text-right text-sm font-medium">
          Trang {currentPage} / {totalPages || 1}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="size-8 p-0 max-md:hidden"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Về trang đầu</span>
            <DoubleArrowLeftIcon className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Trang trước</span>
            <ChevronLeftIcon className="size-4" />
          </Button>

          {pageNumbers.map((pageNumber: number | string, index: number) => (
            <div key={`${pageNumber}-${index}`} className="flex items-center">
              {pageNumber === "..." ? (
                <span className="px-1 text-sm text-muted-foreground">...</span>
              ) : (
                <Button
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  className="h-8 min-w-8 px-2"
                  onClick={() => table.setPageIndex((pageNumber as number) - 1)}
                >
                  <span className="sr-only">Đến trang {pageNumber}</span>
                  {pageNumber}
                </Button>
              )}
            </div>
          ))}

          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Trang sau</span>
            <ChevronRightIcon className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="size-8 p-0 max-md:hidden"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Đến trang cuối</span>
            <DoubleArrowRightIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
