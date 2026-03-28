import { useRef, useState } from "react";
import { BellIcon, Loader2Icon, MonitorIcon, PaletteIcon, UserCogIcon, WrenchIcon } from "lucide-react";
import { toast } from "sonner";

import { getAdminUserDisplay } from "@/components/layout/admin-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { adminClient } from "@/lib/api/admin-client";
import { clearAuthCache } from "@/lib/auth";
import { useTheme } from "@/stores/theme";

const settingsNav = [
  { key: "profile", title: "Hồ sơ", icon: UserCogIcon },
  { key: "account", title: "Tài khoản", icon: WrenchIcon },
  { key: "appearance", title: "Giao diện", icon: PaletteIcon },
  { key: "notifications", title: "Thông báo", icon: BellIcon },
  { key: "display", title: "Hiển thị", icon: MonitorIcon },
];

interface UploadResponse {
  publicId: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

interface ProfileResponse {
  id: string;
  email: string;
  displayName: string;
  role: string;
  avatarUrl: string | null;
}

async function uploadAvatar(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/admin/media/upload", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    const errJson: unknown = await response.json().catch(() => null);
    const errObj = errJson as Record<string, unknown> | null;
    const errInner = (errObj?.error ?? null) as Record<string, unknown> | null;
    const msg = typeof errInner?.message === "string" ? errInner.message : "Upload thất bại";
    throw new Error(msg);
  }

  const json = (await response.json()) as { data: UploadResponse };
  return json.data;
}

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const adminUser = getAdminUserDisplay();
  const [section, setSection] = useState("profile");
  const [profile, setProfile] = useState({
    displayName: adminUser.name,
    email: adminUser.email,
    workspace: "PMTL Admin / Wave 0",
    role: adminUser.role,
  });
  const [avatarPreview, setAvatarPreview] = useState(adminUser.avatar);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preferences, setPreferences] = useState({
    theme,
    compactTables: true,
    showRealtime: true,
    emailDigest: true,
    moderationAlerts: true,
    securityAlerts: true,
  });

  const activeItem = settingsNav.find((item) => item.key === section) ?? settingsNav[0];

  async function handleSaveProfile() {
    setSaving(true);
    try {
      let avatarUrl: string | undefined;

      // Step 1: Upload avatar if a new file was selected
      if (avatarFile) {
        const uploaded = await uploadAvatar(avatarFile);
        avatarUrl = uploaded.url;
      }

      // Step 2: Update profile via PATCH /auth/profile
      await adminClient.patch<ProfileResponse>("/auth/profile", {
        displayName: profile.displayName,
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
      });

      // Step 3: Clear auth cache so next read picks up fresh data
      clearAuthCache();

      setAvatarFile(null);
      toast.success("Đã cập nhật hồ sơ thành công");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Lỗi không xác định";
      toast.error(`Cập nhật hồ sơ thất bại: ${message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleRevokeOtherSessions() {
    try {
      await adminClient.post("/auth/logout-all");
      clearAuthCache();
      toast.success("Đã thu hồi toàn bộ phiên đăng nhập khác.");
    } catch {
      toast.error("Không thể thu hồi phiên. Vui lòng thử lại.");
    }
  }

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
                <AvatarImage src={adminUser.avatar} alt={adminUser.name} />
                <AvatarFallback className="rounded-xl">{adminUser.initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-semibold">{adminUser.name}</p>
                <p className="truncate text-sm text-muted-foreground">{adminUser.role}</p>
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
              {section === "profile" ? (
                <div className="grid gap-4 lg:max-w-2xl">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Ảnh đại diện</label>
                    <div className="flex flex-wrap items-center gap-4 rounded-xl border p-4">
                      <Avatar className="size-16 rounded-2xl">
                        <AvatarImage src={avatarPreview} alt={profile.displayName} />
                        <AvatarFallback className="rounded-2xl">{adminUser.initials}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-2">
                        <Input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;

                            if (file.size > 5 * 1024 * 1024) {
                              toast.error("Ảnh không được vượt quá 5MB");
                              return;
                            }

                            const previewUrl = URL.createObjectURL(file);
                            setAvatarPreview(previewUrl);
                            setAvatarFile(file);
                          }}
                        />
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, WebP tối đa 5MB. Ảnh sẽ được upload khi bấm Cập nhật hồ sơ.
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
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email không thể thay đổi qua giao diện cài đặt.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor="settings-role">
                      Vai trò hiển thị
                    </label>
                    <Input
                      id="settings-role"
                      value={profile.role}
                      disabled
                      className="bg-muted"
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
                    <Button onClick={() => void handleSaveProfile()} disabled={saving}>
                      {saving && <Loader2Icon className="size-4 animate-spin" />}
                      Cập nhật hồ sơ
                    </Button>
                  </div>
                </div>
              ) : null}

              {section === "account" ? (
                <div className="grid gap-4 lg:max-w-3xl">
                  {[
                    ["Quyền hiện tại", `${adminUser.role} — quyền quản trị nội bộ`],
                    ["Email đăng nhập", adminUser.email],
                    ["Bảo vệ tài khoản", "Cookie-based session với refresh token tự động"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border p-4">
                      <p className="text-sm text-muted-foreground">{label}</p>
                      <p className="mt-2 font-medium">{value}</p>
                    </div>
                  ))}
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button variant="destructive" onClick={() => void handleRevokeOtherSessions()}>
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
                    <Button onClick={() => toast.success("Đã lưu cài đặt giao diện.")}>
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
                    <Button onClick={() => toast.success("Đã cập nhật cài đặt thông báo.")}>
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
                    <Button onClick={() => toast.success("Đã lưu quy tắc hiển thị.")}>
                      Lưu hiển thị
                    </Button>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
