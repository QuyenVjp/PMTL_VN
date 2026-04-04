/**
 * Theme Customizer — floating panel (Sheet) for color theme, radius, and mode.
 *
 * Ported from Shadboard customizer, adapted for PMTL admin:
 * - OKLCH color themes instead of HSL
 * - Vietnamese labels
 * - Zustand store instead of cookie-based settings context
 * - No layout/direction/locale options (single layout, LTR Vietnamese)
 */
import { MoonStarIcon, RotateCcwIcon, SettingsIcon, SunIcon, SunMoonIcon } from "lucide-react";

import type { CSSProperties } from "react";

import { colorThemes, radii } from "@/configs/themes";
import type { ColorTheme } from "@/configs/themes";
import { useThemeStore } from "@/stores/theme";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ThemeCustomizer() {
  const theme = useThemeStore((s) => s.theme);
  const colorTheme = useThemeStore((s) => s.colorTheme);
  const radius = useThemeStore((s) => s.radius);
  const setTheme = useThemeStore((s) => s.setTheme);
  const setColorTheme = useThemeStore((s) => s.setColorTheme);
  const setRadius = useThemeStore((s) => s.setRadius);
  const resetSettings = useThemeStore((s) => s.resetSettings);

  return (
    <Sheet>
      <Tooltip>
        <TooltipTrigger asChild>
          <SheetTrigger asChild>
            <Button
              size="icon"
              className="fixed bottom-6 end-0 z-50 rounded-e-none shadow-md"
              aria-label="Tuỳ chỉnh giao diện"
            >
              <SettingsIcon className="size-4 animate-spin" style={{ animationDuration: "4s" }} />
            </Button>
          </SheetTrigger>
        </TooltipTrigger>
        <TooltipContent side="left">Tuỳ chỉnh giao diện</TooltipContent>
      </Tooltip>

      <SheetContent className="p-0" side="right">
        <ScrollArea className="h-full p-5">
          <div className="flex flex-1 flex-col gap-6">
            <SheetHeader className="pb-0">
              <SheetTitle>Tuỳ chỉnh giao diện</SheetTitle>
              <SheetDescription>
                Chọn phong cách màu sắc và kiểu dáng cho trang quản trị.
              </SheetDescription>
            </SheetHeader>

            {/* Color theme */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Màu sắc</p>
              <div className="grid grid-cols-4 gap-2">
                {(Object.entries(colorThemes) as Array<[ColorTheme, (typeof colorThemes)[ColorTheme]]>).map(
                  ([name, config]) => {
                    const isActive = colorTheme === name;

                    return (
                      <button
                        key={name}
                        type="button"
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-lg border-2 p-2 transition-colors",
                          isActive
                            ? "border-primary bg-accent"
                            : "border-transparent hover:border-muted-foreground/25",
                        )}
                        onClick={() => setColorTheme(name)}
                        aria-label={config.label}
                        aria-pressed={isActive}
                      >
                        <span
                          className="size-6 rounded-full ring-1 ring-border"
                          style={{ "--swatch": config.preview, backgroundColor: "var(--swatch)" } as CSSProperties}
                        />
                        <span className="text-[11px] leading-none text-muted-foreground">
                          {config.label}
                        </span>
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            {/* Radius */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Bo góc</p>
              <div className="grid grid-cols-5 gap-2">
                {radii.map((value) => (
                  <Button
                    key={value}
                    variant={radius === value ? "secondary" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => setRadius(value)}
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>

            {/* Mode */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Chế độ hiển thị</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={theme === "light" ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                >
                  <SunIcon className="me-1.5 size-3.5" />
                  Sáng
                </Button>
                <Button
                  variant={theme === "dark" ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                >
                  <MoonStarIcon className="me-1.5 size-3.5" />
                  Tối
                </Button>
                <Button
                  variant={theme === "system" ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setTheme("system")}
                >
                  <SunMoonIcon className="me-1.5 size-3.5" />
                  Hệ thống
                </Button>
              </div>
            </div>

            {/* Reset */}
            <Button variant="outline" className="w-full" onClick={resetSettings}>
              <RotateCcwIcon className="me-2 size-3.5" />
              Đặt lại mặc định
            </Button>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
