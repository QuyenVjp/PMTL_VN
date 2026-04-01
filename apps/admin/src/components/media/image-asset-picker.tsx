import { useMemo, useState } from "react";
import { CheckIcon, ChevronsUpDownIcon, SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { resolveMediaSrc } from "@/lib/media-src";

export interface ImageAssetOption {
  publicId: string;
  filename: string;
  url: string;
}

interface ImageAssetPickerProps {
  assets: ImageAssetOption[];
  value: string;
  onChange: (publicId: string) => void;
  placeholder?: string;
}

export function ImageAssetPicker({
  assets,
  value,
  onChange,
  placeholder = "Chọn ảnh từ thư viện...",
}: ImageAssetPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = assets.find((asset) => asset.publicId === value) ?? null;
  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return assets;
    return assets.filter((asset) => asset.filename.toLowerCase().includes(keyword));
  }, [assets, query]);

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="w-full justify-between">
            <span className="truncate text-start">
              {selected ? selected.filename : placeholder}
            </span>
            <ChevronsUpDownIcon className="size-4 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[520px] max-w-[92vw] p-3" align="start">
          <div className="space-y-3">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="pl-8"
                placeholder="Tìm theo tên ảnh..."
              />
            </div>
            <ScrollArea className="h-[280px]">
              <div className="grid grid-cols-3 gap-2 pr-2">
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                  className={cn(
                    "rounded-md border p-2 text-left text-sm transition hover:border-primary/60",
                    !value ? "border-primary" : "border-border",
                  )}
                >
                  Không chọn
                </button>
                {filtered.map((asset) => {
                  const active = value === asset.publicId;
                  return (
                    <button
                      key={asset.publicId}
                      type="button"
                      onClick={() => {
                        onChange(asset.publicId);
                        setOpen(false);
                      }}
                      className={cn(
                        "group relative overflow-hidden rounded-md border text-left transition hover:border-primary/60",
                        active ? "border-primary ring-1 ring-primary/40" : "border-border",
                      )}
                    >
                      <img
                        src={resolveMediaSrc(asset.url) ?? undefined}
                        alt={asset.filename}
                        className="aspect-square w-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                        <p className="truncate text-[11px] text-white">{asset.filename}</p>
                      </div>
                      {active ? (
                        <span className="absolute right-1.5 top-1.5 rounded-full bg-primary/90 p-1 text-primary-foreground">
                          <CheckIcon className="size-3" />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>

      {selected ? (
        <div className="flex items-center gap-2 rounded border p-2">
          <img
            src={resolveMediaSrc(selected.url) ?? undefined}
            alt={selected.filename}
            className="size-12 rounded border object-cover"
            loading="lazy"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{selected.filename}</p>
            <p className="text-xs text-muted-foreground">{selected.publicId}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

