import { useMemo, type ElementType } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRightIcon, BellIcon, MoonIcon, PlusIcon, SearchIcon, SparklesIcon, SunIcon } from "lucide-react";

import { sidebarNavGroups } from "@/components/layout/sidebar-data";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useSearch } from "@/stores/search";
import { useTheme } from "@/stores/theme";

type RouteCommand = {
  label: string;
  subtitle: string;
  keywords: string[];
  to: string;
  icon?: ElementType;
};

const quickCreateRoutes: RouteCommand[] = [
  {
    label: "Tạo bài viết",
    subtitle: "Nội dung / Bài viết",
    keywords: ["create", "new", "tao moi", "bai viet"],
    to: "/noi-dung/bai-viet/tao-moi",
    icon: PlusIcon,
  },
  {
    label: "Tạo Bạch thoại",
    subtitle: "Nội dung / Bạch thoại Phật pháp",
    keywords: ["create", "new", "bach thoai", "wisdom"],
    to: "/noi-dung/bach-thoai/tao-moi",
    icon: PlusIcon,
  },
  {
    label: "Tạo hướng dẫn",
    subtitle: "Nội dung / Hướng dẫn",
    keywords: ["create", "new", "huong dan"],
    to: "/noi-dung/huong-dan/tao-moi",
    icon: PlusIcon,
  },
  {
    label: "Thêm tài liệu",
    subtitle: "Nội dung / Tài liệu",
    keywords: ["create", "new", "tai lieu", "download"],
    to: "/noi-dung/tai-lieu/tao-moi",
    icon: PlusIcon,
  },
  {
    label: "Tạo sự kiện",
    subtitle: "Sự kiện Phật pháp",
    keywords: ["create", "new", "su kien"],
    to: "/su-kien/danh-sach/tao-moi",
    icon: PlusIcon,
  },
  {
    label: "Thêm phụng sự viên",
    subtitle: "Hệ thống / Phụng sự viên",
    keywords: ["create", "new", "phung su vien"],
    to: "/he-thong/phung-su-vien/tao-moi",
    icon: PlusIcon,
  },
];

export function CommandMenu() {
  const navigate = useNavigate();
  const { open, setOpen } = useSearch();
  const { setTheme } = useTheme();

  const routeGroups = useMemo(() => {
    return sidebarNavGroups.map((group) => ({
      title: group.title,
      items: group.items.flatMap((item) => {
        if ("url" in item && item.url) {
          return [
            {
              label: item.title,
              subtitle: group.title,
              keywords: [group.title],
              to: item.url,
              icon: item.icon,
            } satisfies RouteCommand,
          ];
        }

        return (item.items ?? []).map((subItem) => ({
          label: subItem.title,
          subtitle: `${group.title} / ${item.title}`,
          keywords: [group.title, item.title],
          to: subItem.url ?? "/dashboard",
          icon: subItem.icon,
        }));
      }),
    }));
  }, []);

  const runRoute = (to: string) => {
    void navigate({ to });
    setOpen(false);
  };

  const runTheme = (theme: "light" | "dark" | "system") => {
    setTheme(theme);
    setOpen(false);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      className="max-w-3xl overflow-hidden rounded-2xl border bg-background p-0"
      title="Tìm nhanh và điều hướng"
      description="Mở module, workspace và đổi giao diện từ một nơi."
    >
      <div className="border-b px-6 py-5">
        <h2 className="text-2xl font-semibold tracking-tight">Tìm nhanh và điều hướng</h2>
        <p className="mt-2 text-sm text-muted-foreground">Mở module, workspace và đổi giao diện từ một nơi.</p>
      </div>

      <CommandInput placeholder="Gõ tên route, module hoặc lệnh..." />
      <CommandList className="max-h-[70vh]">
        <CommandEmpty>Không tìm thấy kết quả phù hợp.</CommandEmpty>

        {routeGroups.map((group) => (
          <CommandGroup key={group.title} heading={group.title}>
            {group.items.map((item) => {
              const Icon = item.icon ?? SearchIcon;
              return (
                <CommandItem
                  key={item.to}
                  value={`${item.label} ${item.subtitle} ${item.keywords.join(" ")}`}
                  onSelect={() => runRoute(item.to)}
                  className="rounded-xl"
                >
                  <div className="flex size-9 items-center justify-center rounded-lg border bg-muted/40">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{item.label}</div>
                    <div className="truncate text-sm text-muted-foreground">{item.subtitle}</div>
                  </div>
                  <CommandShortcut className="inline-flex items-center gap-1">
                    Mở
                    <ArrowRightIcon className="size-3.5" />
                  </CommandShortcut>
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}

        <CommandSeparator />

        <CommandGroup heading="Tạo nhanh">
          {quickCreateRoutes.map((item) => {
            const Icon = item.icon ?? PlusIcon;
            return (
              <CommandItem
                key={item.to}
                value={`${item.label} ${item.subtitle} ${item.keywords.join(" ")}`}
                onSelect={() => runRoute(item.to)}
                className="rounded-xl"
              >
                <div className="flex size-9 items-center justify-center rounded-lg border bg-muted/40">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{item.label}</div>
                  <div className="truncate text-sm text-muted-foreground">{item.subtitle}</div>
                </div>
                <CommandShortcut className="inline-flex items-center gap-1">
                  Tạo
                  <ArrowRightIcon className="size-3.5" />
                </CommandShortcut>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Lệnh nhanh">
          <CommandItem onSelect={() => runTheme("light")} className="rounded-xl">
            <SunIcon className="size-4" />
            <span>Đổi sang giao diện sáng</span>
          </CommandItem>
          <CommandItem onSelect={() => runTheme("dark")} className="rounded-xl">
            <MoonIcon className="size-4" />
            <span>Đổi sang giao diện tối</span>
          </CommandItem>
          <CommandItem onSelect={() => runTheme("system")} className="rounded-xl">
            <SparklesIcon className="size-4" />
            <span>Theo giao diện hệ thống</span>
          </CommandItem>
          <CommandItem onSelect={() => runRoute("/he-thong/thong-bao")} className="rounded-xl">
            <BellIcon className="size-4" />
            <span>Mở thông báo hệ thống</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
