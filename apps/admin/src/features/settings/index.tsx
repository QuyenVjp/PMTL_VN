import { useState } from "react";
import { BellIcon, MonitorIcon, PaletteIcon, ShieldCheckIcon, UserCogIcon, WrenchIcon } from "lucide-react";

import { currentAdminUser } from "@/components/layout/admin-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/context/theme-provider";

const settingsNav = [
  { key: "profile", title: "Hồ sơ", icon: UserCogIcon },
  { key: "account", title: "Tài khoản", icon: WrenchIcon },
  { key: "appearance", title: "Giao diện", icon: PaletteIcon },
  { key: "notifications", title: "Thông báo", icon: BellIcon },
  { key: "display", title: "Hiển thị", icon: MonitorIcon },
];

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [section, setSection] = useState("profile");
  const [profile, setProfile] = useState({
    displayName: currentAdminUser.name,
    email: currentAdminUser.email,
    workspace: "PMTL Admin / Wave 0",
    role: currentAdminUser.role,
  });
  const [avatarPreview, setAvatarPreview] = useState(currentAdminUser.avatar);
  const [preferences, setPreferences] = useState({
    theme,
    compactTables: true,
    showRealtime: true,
    emailDigest: true,
    moderationAlerts: true,
    securityAlerts: true,
  });
  const [feedback, setFeedback] = useState<string | null>(null);

  const activeItem = settingsNav.find((item) => item.key === section) ?? settingsNav[0];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Cài đặt admin</h1>
        <p className="text-sm text-muted-foreground">
          Surface cấu hình vận hành theo pattern settings của starter, nhưng copy và option đã map về PMTL.
        </p>
      </div>

      <Separator />

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        <aside className="lg:w-72">
          <div className="rounded-2xl border bg-card p-3">
            <div className="mb-3 flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
              <Avatar className="size-12 rounded-xl">
                <AvatarImage src={currentAdminUser.avatar} alt={currentAdminUser.name} />
                <AvatarFallback className="rounded-xl">{currentAdminUser.initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-semibold">{currentAdminUser.name}</p>
                <p className="truncate text-sm text-muted-foreground">{currentAdminUser.role}</p>
              </div>
            </div>

            <div className="mb-3 md:hidden">
              <Select value={section} onValueChange={setSection}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="Chọn mục cài đặt" />
                </SelectTrigger>
                <SelectContent>
                  {settingsNav.map((item) => (
                    <SelectItem key={item.key} value={item.key}>
                      {item.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="hidden md:block">
              <nav className="grid gap-2">
                {settingsNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.key}
                      variant={item.key === section ? "secondary" : "ghost"}
                      className="justify-start"
                      onClick={() => setSection(item.key)}
                    >
                      <Icon className="size-4" />
                      {item.title}
                    </Button>
                  );
                })}
              </nav>
            </ScrollArea>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <Card>
            <CardHeader>
              <CardTitle>{activeItem.title}</CardTitle>
              <CardDescription>
                {section === "profile" && "Cập nhật thông tin hiển thị của operator trong admin workspace."}
                {section === "account" && "Quản lý quyền, phiên đăng nhập và bảo vệ tài khoản quản trị."}
                {section === "appearance" && "Điều chỉnh theme, mật độ hiển thị và thói quen đọc dashboard."}
                {section === "notifications" && "Bật hoặc tắt các lane cảnh báo vận hành mà anh muốn nhận."}
                {section === "display" && "Giữ trải nghiệm bảng, cột và dashboard đúng nhu cầu điều phối."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {feedback ? (
                <div className="mb-4 rounded-xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">{feedback}</div>
              ) : null}

              {section === "profile" ? (
                <div className="grid gap-4 lg:max-w-2xl">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Ảnh đại diện</label>
                    <div className="flex flex-wrap items-center gap-4 rounded-xl border p-4">
                      <Avatar className="size-16 rounded-2xl">
                        <AvatarImage src={avatarPreview} alt={profile.displayName} />
                        <AvatarFallback className="rounded-2xl">{currentAdminUser.initials}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-2">
                        <Input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (!file) {
                              return;
                            }

                            const previewUrl = URL.createObjectURL(file);
                            setAvatarPreview(previewUrl);
                            setFeedback(`Đã nạp ảnh "${file.name}" để preview trước khi lưu.`);
                          }}
                        />
                        <p className="text-xs text-muted-foreground">
                          Dùng ảnh thật cho avatar operator. Không dùng SVG cho lane avatar.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor="settings-display-name">
                      Tên hiển thị
                    </label>
                    <Input
                      id="settings-display-name"
                      value={profile.displayName}
                      onChange={(event) => setProfile((current) => ({ ...current, displayName: event.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor="settings-email">
                      Email vận hành
                    </label>
                    <Input
                      id="settings-email"
                      type="email"
                      value={profile.email}
                      onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor="settings-role">
                      Vai trò hiển thị
                    </label>
                    <Input
                      id="settings-role"
                      value={profile.role}
                      onChange={(event) => setProfile((current) => ({ ...current, role: event.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor="settings-workspace">
                      Workspace mặc định
                    </label>
                    <Input
                      id="settings-workspace"
                      value={profile.workspace}
                      onChange={(event) => setProfile((current) => ({ ...current, workspace: event.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => setFeedback("Đã lưu thay đổi hồ sơ quản trị.")}>Cập nhật hồ sơ</Button>
                  </div>
                </div>
              ) : null}

              {section === "account" ? (
                <div className="grid gap-4 lg:max-w-3xl">
                  {[
                    ["Quyền hiện tại", "Super-admin nội bộ / quyền chỉnh flag / quyền revoke session"],
                    ["Phiên đăng nhập", "3 phiên đang mở, 1 phiên cảnh báo cần rà soát"],
                    ["Bảo vệ tài khoản", "Bật bắt buộc đổi mật khẩu mỗi 90 ngày và xác thực hai bước"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border p-4">
                      <p className="text-sm text-muted-foreground">{label}</p>
                      <p className="mt-2 font-medium">{value}</p>
                    </div>
                  ))}
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button variant="outline" onClick={() => setFeedback("Đã gửi yêu cầu reset mật khẩu cho operator.")}>
                      Reset mật khẩu
                    </Button>
                    <Button onClick={() => setFeedback("Đã thu hồi toàn bộ phiên đăng nhập khác thiết bị hiện tại.")}>
                      Thu hồi phiên khác
                    </Button>
                  </div>
                </div>
              ) : null}

              {section === "appearance" ? (
                <div className="grid gap-4 lg:max-w-2xl">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Theme mặc định</label>
                    <Select
                      value={preferences.theme}
                      onValueChange={(value) => {
                        const nextTheme = value as "light" | "dark" | "system";
                        setPreferences((current) => ({ ...current, theme: nextTheme }));
                        setTheme(nextTheme);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Sáng</SelectItem>
                        <SelectItem value="dark">Tối</SelectItem>
                        <SelectItem value="system">Theo hệ thống</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {[
                    ["Bật chế độ bảng gọn", "compactTables"],
                    ["Hiện tín hiệu realtime trên dashboard", "showRealtime"],
                  ].map(([label, key]) => (
                    <label key={key} className="flex items-start gap-3 rounded-xl border p-4">
                      <Checkbox
                        checked={preferences[key as keyof typeof preferences] as boolean}
                        onCheckedChange={(checked) =>
                          setPreferences((current) => ({ ...current, [key]: Boolean(checked) }))
                        }
                      />
                      <span className="min-w-0">
                        <span className="block font-medium">{label}</span>
                        <span className="block text-sm text-muted-foreground">
                          Áp dụng ngay lên dashboard, table toolbar và mật độ hiển thị row.
                        </span>
                      </span>
                    </label>
                  ))}
                  <div className="flex justify-end">
                    <Button onClick={() => setFeedback("Đã lưu cài đặt giao diện admin và áp dụng ngay lên shell.")}>
                      Lưu giao diện
                    </Button>
                  </div>
                </div>
              ) : null}

              {section === "notifications" ? (
                <div className="grid gap-4 lg:max-w-3xl">
                  {[
                    ["Email digest cuối ngày", "emailDigest"],
                    ["Cảnh báo moderation khẩn", "moderationAlerts"],
                    ["Cảnh báo bảo mật và session lạ", "securityAlerts"],
                  ].map(([label, key]) => (
                    <label key={key} className="flex items-start gap-3 rounded-xl border p-4">
                      <Checkbox
                        checked={preferences[key as keyof typeof preferences] as boolean}
                        onCheckedChange={(checked) =>
                          setPreferences((current) => ({ ...current, [key]: Boolean(checked) }))
                        }
                      />
                      <span className="min-w-0">
                        <span className="block font-medium">{label}</span>
                        <span className="block text-sm text-muted-foreground">
                          Giữ lane cảnh báo đúng mức, tránh spam mà vẫn không bỏ sót case vận hành.
                        </span>
                      </span>
                    </label>
                  ))}
                  <div className="flex justify-end">
                    <Button onClick={() => setFeedback("Đã cập nhật cài đặt thông báo vận hành.")}>
                      Cập nhật thông báo
                    </Button>
                  </div>
                </div>
              ) : null}

              {section === "display" ? (
                <div className="grid gap-4 lg:max-w-3xl">
                  {[
                    ["Bảng mặc định", "Hiện 20 dòng / sticky action column / cho phép ẩn cột phụ"],
                    ["Dashboard", "Ưu tiên hàng chờ và operator load trước chart mềm"],
                    ["An toàn hiển thị", "Không cho nút destructive chạy một phát không confirm"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border p-4">
                      <p className="text-sm text-muted-foreground">{label}</p>
                      <p className="mt-2 font-medium">{value}</p>
                    </div>
                  ))}
                  <div className="flex justify-end">
                    <Button onClick={() => setFeedback("Đã lưu quy tắc hiển thị mặc định cho admin.")}>
                      Lưu hiển thị
                    </Button>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="mt-4 border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheckIcon className="size-4" />
                Ghi chú production
              </CardTitle>
              <CardDescription>
                Khi đẩy production, route này là admin setting nội bộ. Nó không thay thế auth flow public hay policy backend.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
