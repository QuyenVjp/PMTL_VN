import type { PropsWithChildren } from "react";

import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function SiteShell({ children }: PropsWithChildren) {
  return (
    <>
      <SiteHeader />
      <main className="app-shell main-shell">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
