import { useEffect, useRef, useState } from "react";
import type { Table } from "@tanstack/react-table";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>;
  entityName: string;
  children?: React.ReactNode;
};

export function DataTableBulkActions<TData>({
  table,
  entityName,
  children,
}: DataTableBulkActionsProps<TData>): React.ReactNode | null {
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (!selectedCount) {
      return;
    }

    const message = `Đã chọn ${selectedCount} ${entityName}${selectedCount > 1 ? "" : ""}. Có thể chạy thao tác hàng loạt.`;
    queueMicrotask(() => setAnnouncement(message));
    const timer = setTimeout(() => setAnnouncement(""), 3000);
    return () => clearTimeout(timer);
  }, [entityName, selectedCount]);

  if (!selectedCount) {
    return null;
  }

  const buttons = () => toolbarRef.current?.querySelectorAll("button");

  const clearSelection = () => {
    table.resetRowSelection();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const currentButtons = buttons();
    if (!currentButtons?.length) {
      return;
    }

    const currentIndex = Array.from(currentButtons).findIndex((button) => button === document.activeElement);

    switch (event.key) {
      case "ArrowRight": {
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % currentButtons.length;
        currentButtons[nextIndex]?.focus();
        break;
      }
      case "ArrowLeft": {
        event.preventDefault();
        const previousIndex = currentIndex === 0 ? currentButtons.length - 1 : currentIndex - 1;
        currentButtons[previousIndex]?.focus();
        break;
      }
      case "Home":
        event.preventDefault();
        currentButtons[0]?.focus();
        break;
      case "End":
        event.preventDefault();
        currentButtons[currentButtons.length - 1]?.focus();
        break;
      case "Escape":
        event.preventDefault();
        clearSelection();
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div aria-live="polite" aria-atomic="true" className="sr-only" role="status">
        {announcement}
      </div>

      <div
        ref={toolbarRef}
        role="toolbar"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        aria-label={`Thao tác hàng loạt cho ${selectedCount} ${entityName}`}
        className={cn(
          "fixed bottom-6 start-1/2 z-50 -translate-x-1/2 rounded-xl transition-all delay-100 duration-300 ease-out hover:scale-[1.02]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        )}
      >
        <div className="flex items-center gap-2 rounded-xl border bg-background/95 p-2 shadow-xl backdrop-blur supports-backdrop-filter:bg-background/60">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={clearSelection}
                className="size-7 rounded-full"
                aria-label="Bỏ chọn"
                title="Bỏ chọn (Escape)"
              >
                <XIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bỏ chọn (Escape)</p>
            </TooltipContent>
          </Tooltip>

          <Separator className="h-5" orientation="vertical" />

          <div className="flex items-center gap-2 text-sm">
            <Badge variant="default" className="min-w-8 rounded-lg">
              {selectedCount}
            </Badge>
            <span>{entityName} được chọn</span>
          </div>

          {children ? (
            <>
              <Separator className="h-5" orientation="vertical" />
              <div className="flex items-center gap-2">{children}</div>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
