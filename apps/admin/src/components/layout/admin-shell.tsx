import type { PropsWithChildren } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function AdminShell({ children }: PropsWithChildren) {
  const defaultOpen = !document.cookie.includes("sidebar_state=false");

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset className="@container/content">
        <Header />
        <main id="content" className="flex-1 px-4 py-5 sm:px-6 lg:px-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
