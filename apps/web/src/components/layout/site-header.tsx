import Image from "next/image";
import Link from "next/link";

import { AuthNavigation } from "@/features/auth/components/auth-navigation";

const links = [
  { href: "/", label: "Trang chủ" },
  { href: "/posts", label: "Bài viết" },
  { href: "/events", label: "Sự kiện" },
  { href: "/search", label: "Tìm kiếm" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="app-shell header-inner">
        <Link className="brand" href="/">
          <Image
            src="/images/logoo.png"
            alt="Pháp Môn Tâm Linh"
            width={164}
            height={48}
            className="brand-logo"
            priority
          />
        </Link>
        <nav className="inline-list nav-links">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link">
              {link.label}
            </Link>
          ))}
          <div className="auth-nav">
            <AuthNavigation />
          </div>
        </nav>
      </div>
    </header>
  );
}
