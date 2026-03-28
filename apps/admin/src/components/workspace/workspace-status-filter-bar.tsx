/**
 * WorkspaceStatusFilterBar
 *
 * Search input + status filter button group used by simple list pages.
 * Designed for pages that filter server-side via query params rather
 * than through a TanStack Table column filter.
 */
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type StatusOption = {
  value: string;
  label: string;
};

type WorkspaceStatusFilterBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  statusOptions: StatusOption[];
};

export function WorkspaceStatusFilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Tìm kiếm...",
  statusFilter,
  onStatusChange,
  statusOptions,
}: WorkspaceStatusFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={searchPlaceholder}
        className="max-w-sm"
      />
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((opt) => (
          <Button
            key={opt.value}
            variant={statusFilter === opt.value ? "default" : "outline"}
            size="sm"
            onClick={() => onStatusChange(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
