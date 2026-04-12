import type { PropsWithChildren } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { ThemeCustomizer } from "@/components/layout/theme-customizer";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function AdminShell({ children }: PropsWithChildren) {
  const defaultOpen = !document.cookie.includes("sidebar_state=false");

  return (
    <SidebarProvider defaultOpen={defaultOpen} className="bg-sidebar">
      <AppSidebar />
      <SidebarInset className="@container/content md:m-2 md:ms-0 md:rounded-2xl md:shadow-sm md:peer-data-[state=collapsed]:ms-2">
        <Header />
        <main id="content" className="flex-1 px-4 py-5 sm:px-6 lg:px-8">{children}</main>
      </SidebarInset>
      <ThemeCustomizer />
    </SidebarProvider>
  );
}
