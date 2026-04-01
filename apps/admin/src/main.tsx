import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";

import { ThemeSync } from "@/stores/theme-sync";
import { CommandPaletteShortcut } from "@/stores/command-shortcut";
import { queryClient } from "@/lib/query/query-client.js";
import { routeTree } from "@/routes/__root.js";
import { SpeculationRulesAdmin } from "@/components/performance/speculation-rules-admin";
import { initAdminSentry } from "@/lib/monitoring/sentry";
import { ErrorBoundary } from "@/components/error-boundary";
import "@/index.css";

const router = createRouter({ routeTree });
initAdminSentry();

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeSync />
        <CommandPaletteShortcut />
        <SpeculationRulesAdmin />
        <ErrorBoundary>
          <RouterProvider router={router} />
        </ErrorBoundary>
      </QueryClientProvider>
    </StrictMode>,
  );
}
