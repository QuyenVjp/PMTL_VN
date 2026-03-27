import { BellIcon, MonitorIcon, PaletteIcon, UserCogIcon, WrenchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const settingsNav = [
  { title: "Profile", icon: UserCogIcon, active: true },
  { title: "Account", icon: WrenchIcon },
  { title: "Appearance", icon: PaletteIcon },
  { title: "Notifications", icon: BellIcon },
  { title: "Display", icon: MonitorIcon },
];

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>

      <Separator />

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-12">
        <aside className="lg:w-56">
          <nav className="grid gap-2">
            {settingsNav.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.title}
                  variant={item.active ? "secondary" : "ghost"}
                  className="justify-start"
                >
                  <Icon />
                  {item.title}
                </Button>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>This is how others will see you in the admin workspace.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="display-name" className="text-sm font-medium">
                  Display name
                </label>
                <Input id="display-name" defaultValue="QA Operator" />
              </div>
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input id="email" type="email" defaultValue="admin@pmtl.local" />
              </div>
              <div className="grid gap-2">
                <label htmlFor="workspace" className="text-sm font-medium">
                  Workspace
                </label>
                <Input id="workspace" defaultValue="PMTL Admin / Wave 0" />
              </div>
              <div className="flex justify-end">
                <Button>Update profile</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
