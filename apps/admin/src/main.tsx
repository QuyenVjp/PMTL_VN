import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";

import { CommandMenu } from "@/components/command-menu";
import { SearchProvider } from "@/context/search-provider";
import { ThemeProvider } from "@/context/theme-provider";
import { queryClient } from "@/lib/query/query-client.js";
import { routeTree } from "@/routes/__root.js";
import "@/index.css";

const router = createRouter({ routeTree });

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
        <ThemeProvider>
          <SearchProvider>
            <RouterProvider router={router} />
            <CommandMenu />
          </SearchProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}
