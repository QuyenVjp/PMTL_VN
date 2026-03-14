import Link from "next/link";

import { AuthNavigation } from "@/features/auth/components/auth-navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/posts", label: "Posts" },
  { href: "/events", label: "Events" },
  { href: "/search", label: "Search" },
];

export function SiteHeader() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "rgba(249, 246, 240, 0.82)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(18, 33, 23, 0.08)",
      }}
    >
      <div
        className="app-shell"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 0",
          gap: 16,
        }}
      >
        <div>
          <strong>PMTL_VN</strong>
          <p className="muted" style={{ margin: "4px 0 0", fontSize: "0.92rem" }}>
            Monorepo web architecture for solo dev + AI
          </p>
        </div>
        <nav className="inline-list">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
          <AuthNavigation />
        </nav>
      </div>
    </header>
  );
}
