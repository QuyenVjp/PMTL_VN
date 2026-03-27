import { SearchIcon } from "lucide-react";

import { useSearch } from "@/stores/search";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Search({ className = "" }: { className?: string }) {
  const { setOpen } = useSearch();

  return (
    <Button
      variant="outline"
      className={cn(
        "group relative h-10 w-full flex-1 justify-start rounded-xl bg-background text-sm font-normal text-muted-foreground shadow-none sm:w-40 sm:pe-12 md:flex-none lg:w-64 xl:w-80",
        className,
      )}
      onClick={() => setOpen(true)}
    >
      <SearchIcon className="absolute start-3 top-1/2 size-4 -translate-y-1/2" />
      <span className="ms-5">Tìm route, workspace...</span>
      <kbd className="pointer-events-none absolute end-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border bg-muted px-2 py-1 font-mono text-[10px] font-medium sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );
}
