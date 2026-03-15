'use client'

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { SearchIcon, MenuIcon, CloseIcon } from "@/components/icons/ZenIcons";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import CategoryNav, { CategoryNavMobile } from "@/components/CategoryNav";
import NotificationMenu from "@/components/notifications/NotificationMenu";
import type { NavItem } from "@/lib/api/navigation";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";

type NavLinkItem = { label: string; href: string };

function dedupeNavItems(items: NavLinkItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.label}::${item.href}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getUserInitial(fullName?: string | null, username?: string | null): string {
  const base = (fullName || username || "").trim()
  if (!base) return "?"
  return base.charAt(0).toUpperCase()
}

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const ChevronDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const NavDropdown = ({ label, items, isOpen, onToggle, onClose, columns = 1 }: {
  label: string;
  items: { label: string; href: string }[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  columns?: number;
}) => (
  <div className="relative group">
    <button
      onClick={onToggle}
      className={`nav-link-quiet flex items-center gap-1 ${isOpen ? "text-foreground" : ""}`}
    >
      {label}
      <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown /></motion.span>
    </button>
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className={`overlay-shell absolute left-0 top-full z-40 mt-1 overflow-hidden ${columns > 1 ? 'w-[26rem]' : 'w-64'}`}
          >
            <div className={columns > 1 ? "grid gap-0 md:grid-cols-2" : ''}>
              {columns === 1 ? (
                <div className="p-2 space-y-1">
                  {items.map((item) => (
                    <Link
                      key={`${item.href}-${item.label}`}
                      href={item.href}
                      onClick={onClose}
                      className="block rounded-md px-3 py-2 text-xs text-muted-foreground transition-colors duration-200 hover:bg-secondary/40 hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <>
                  {Array.from({ length: columns }).map((_, col) => (
                    <div key={col} className="border-r border-border/60 p-2 last:border-r-0">
                      {items.slice(col * Math.ceil(items.length / columns), (col + 1) * Math.ceil(items.length / columns)).map((item) => (
                        <Link
                          key={`${item.href}-${item.label}`}
                          href={item.href}
                          onClick={onClose}
                          className="block rounded-md px-3 py-2 text-xs text-muted-foreground transition-colors duration-200 hover:bg-secondary/40 hover:text-foreground"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  </div>
);

const MobileMenu = ({
  onClose,
  dailyStudy,
  contentLibrary,
  community,
  organization,
  hoTri,
}: {
  onClose: () => void;
  dailyStudy: NavLinkItem[];
  contentLibrary: NavLinkItem[];
  community: NavLinkItem[];
  organization: NavLinkItem[];
  hoTri: NavItem;
}) => {
  const { user, logout } = useAuth();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const sections = [
    {
      id: 'daily-study',
      label: "Tu Học Hằng Ngày",
      items: dailyStudy
    },
    {
      id: 'content-library',
      label: "Kho Nội Dung",
      items: contentLibrary
    },
    {
      id: 'community',
      label: "Cộng Đồng",
      items: community
    },
    {
      id: 'organization',
      label: "Sự Kiện & Tổ Chức",
      items: organization
    },
  ];

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "tween", duration: 0.3 }}
      className="fixed inset-0 z-[100] overflow-y-auto bg-background"
    >
      <div className="flex items-center justify-between border-b border-border/70 px-6 py-5">
        <Link href="/" onClick={onClose} className="flex items-center gap-2">
          <Image
            src="/images/logoo.png"
            alt="Phap Mon Tam Linh"
            width={160}
            height={50}
            className="h-10 w-auto object-contain"
          />
        </Link>
        <button onClick={onClose} className="rounded-md border border-border/70 p-2 text-muted-foreground transition-colors hover:text-foreground">
          <CloseIcon />
        </button>
      </div>
      <nav className="space-y-3 p-6">
        {user ? (
          <div className="panel-shell mb-4 flex items-center justify-between p-4">
            <Link href="/profile" onClick={onClose} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-secondary text-gold-dim">
                {user.avatar_url ? (
                  <Image src={user.avatar_url} alt="Avatar" width={36} height={36} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display text-sm">{getUserInitial(user.fullName, user.username)}</span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{user.fullName || user.username}</p>
                <p className="text-xs text-muted-foreground">Xem hồ sơ</p>
              </div>
            </Link>
            <button onClick={() => { logout(); onClose(); }} className="text-xs text-red-400">Đăng xuất</button>
          </div>
        ) : (
          <Link href="/auth" onClick={onClose} className="mb-6 flex w-full items-center justify-center gap-2 rounded-md border border-gold/35 py-3 text-sm font-medium text-gold-dim">
            <UserIcon /> Đăng nhập / Đăng ký
          </Link>
        )}

        <Link href="/" onClick={onClose} className="block border-b border-border/50 px-2 py-3 text-base font-display text-foreground">
          Trang Chủ
        </Link>
        <NotificationMenu mobile />

        {sections.map((s) => (
          <div key={s.id} className="border-b border-border/50">
            <button
              onClick={() => setOpenSection(openSection === s.id ? null : s.id)}
              className="w-full flex items-center justify-between py-4 px-2 text-left font-display text-base text-foreground"
            >
              {s.label}
              <motion.span animate={{ rotate: openSection === s.id ? 180 : 0 }}><ChevronDown /></motion.span>
            </button>
            <AnimatePresence>
              {openSection === s.id && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden pl-4 pb-2">
                  {s.items.map((item) => (
                    <Link key={`${item.href}-${item.label}`} href={item.href} onClick={onClose} className="block py-2.5 text-sm text-muted-foreground hover:text-foreground">
                      {item.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        <div className="px-2 py-3">
          <button
            onClick={() => setOpenSection(openSection === 'khai-thi' ? null : 'khai-thi')}
            className={`w-full flex items-center justify-between rounded-md border px-4 py-3.5 text-left text-sm font-semibold tracking-wide transition-all ${openSection === 'khai-thi'
              ? 'border-gold/35 bg-gold/10 text-gold-dim'
              : 'border-border bg-background text-foreground hover:border-gold/20 hover:bg-secondary/20'
              }`}
          >
            Chủ Đề Khai Thị
            <motion.span animate={{ rotate: openSection === 'khai-thi' ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown /></motion.span>
          </button>
          <AnimatePresence>
            {openSection === 'khai-thi' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mt-2"
              >
                <div className="panel-shell-muted overflow-hidden rounded-md">
                  <CategoryNavMobile onClose={onClose} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link href={hoTri.href} onClick={onClose} className="block px-2 py-4 text-base font-display text-foreground">
          {hoTri.label}
        </Link>
      </nav>
    </motion.div>
  );
};

const Header = ({ tuHoc, congDong, hoTri }: { tuHoc?: NavItem[]; congDong?: NavItem[]; hoTri?: NavItem } = {}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout, loading } = useAuth();

  useBodyScrollLock(mobileOpen || categoryOpen || userMenuOpen);

  // Default nav items nếu không truyền props
  const defaultTuHoc: NavItem[] = [
    { label: "Hướng Dẫn Sơ Học", href: "/beginner-guide" },
    { label: "Bạch Thoại Phật Pháp", href: "/hub/bach-thoai-phat-phap" },
    { label: "Thường Thức Niệm Phật", href: "/hub/thuong-thuc-niem-phat" },
    { label: "Thư Viện Tài Liệu", href: "/library" },
    { label: "Phim Truyện & Video", href: "/videos" },
    { label: "Đài Phát Thanh", href: "/radio" },
    { label: "Danh Bạ Toàn Cầu", href: "/directory" },
  ]

  const defaultCongDong: NavItem[] = [
    { label: "Hỏi Đáp & Sổ Lưu Bút", href: "/guestbook" },
    { label: "Danh Bạ Toàn Cầu", href: "/directory" },
  ]

  const defaultHoTri: NavItem = { label: "Hộ Trì Phật Pháp", href: "/donations" }

  const groups = {
    tuHoc: tuHoc ?? defaultTuHoc,
    congDong: congDong ?? defaultCongDong,
    hoTri: hoTri ?? defaultHoTri
  };

  const dailyStudyLinks: NavLinkItem[] = [
    { label: "Tu Học Hằng Ngày", href: "/lunar-calendar" },
    { label: "Niệm Kinh", href: "/niem-kinh" },
    { label: "Trung Tâm Tu Học Trực Tuyến", href: "/beginner-guide" },
  ];

  const contentLibraryLinks = dedupeNavItems([
    { label: "Khai Thị", href: "/blog" },
    { label: "Kinh Điển", href: "/kinh-dien" },
    { label: "Thư Viện Khai Thị", href: "/hub/thu-vien-khai-thi" },
    { label: "Thư Viện Tài Liệu", href: "/library" },
    { label: "Thư Viện Hình Ảnh", href: "/gallery" },
    { label: "Phim Truyện & Video", href: "/videos" },
    { label: "Đài Phát Thanh", href: "/radio" },
    ...groups.tuHoc.filter((item) => !['/beginner-guide', '/directory', '/library', '/gallery', '/videos', '/radio', '/blog', '/kinh-dien', '/hub/thu-vien-khai-thi'].includes(item.href)),
  ]);

  const communityLinks = dedupeNavItems([
    { label: "Diễn Đàn", href: "/shares" },
    ...groups.congDong,
  ]);

  const organizationLinks = dedupeNavItems([
    { label: "Sự Kiện & Pháp Hội", href: "/events" },
    { label: "Thông Báo", href: "/thong-bao" },
  ]);

  return (
    <header className="sticky top-0 z-50">
      <div className="relative z-[60] border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-3 lg:px-6 flex items-center justify-between h-16 gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity flex-shrink-0">
              <Image
                src="/images/logoo.png"
                alt="Phap Mon Tam Linh"
                width={160}
                height={48}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-0.5">
              <Link href="/" className="nav-link-quiet whitespace-nowrap">
                Trang Chủ
              </Link>

              <NavDropdown
                label="Tu Học Hằng Ngày"
                items={dailyStudyLinks}
                isOpen={activeDropdown === 'tuHoc'}
                onToggle={() => setActiveDropdown(activeDropdown === 'tuHoc' ? null : 'tuHoc')}
                onClose={() => setActiveDropdown(null)}
              />

              <NavDropdown
                label="Kho Nội Dung"
                items={contentLibraryLinks}
                isOpen={activeDropdown === 'content'}
                onToggle={() => setActiveDropdown(activeDropdown === 'content' ? null : 'content')}
                onClose={() => setActiveDropdown(null)}
                columns={2}
              />

              <NavDropdown
                label="Cộng Đồng"
                items={communityLinks}
                isOpen={activeDropdown === 'community'}
                onToggle={() => setActiveDropdown(activeDropdown === 'community' ? null : 'community')}
                onClose={() => setActiveDropdown(null)}
              />

              <NavDropdown
                label="Sự Kiện"
                items={organizationLinks}
                isOpen={activeDropdown === 'organization'}
                onToggle={() => setActiveDropdown(activeDropdown === 'organization' ? null : 'organization')}
                onClose={() => setActiveDropdown(null)}
              />

              <button
                onClick={() => { setCategoryOpen(!categoryOpen); setActiveDropdown(null); }}
                className={`nav-link-quiet flex items-center gap-1 whitespace-nowrap ${categoryOpen ? "text-foreground" : ""}`}
              >
                Chủ Đề
                <motion.span animate={{ rotate: categoryOpen ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown /></motion.span>
              </button>

              <Link href={groups.hoTri.href} className="ml-1 whitespace-nowrap border-l border-border/50 pl-3 text-xs font-medium text-gold-dim transition-colors duration-200 hover:text-gold">
                {groups.hoTri.label}
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link href="/search" className="rounded-md border border-transparent p-1.5 text-muted-foreground transition-colors duration-200 hover:border-gold/20 hover:text-foreground flex-shrink-0">
              <SearchIcon />
            </Link>
            <NotificationMenu />

            {!loading && (
              user ? (
                <div className="relative hidden md:block flex-shrink-0">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="user-chip">
                    <div className="flex size-4 items-center justify-center overflow-hidden rounded-full bg-secondary flex-shrink-0 text-gold-dim">
                      {user.avatar_url ? (
                        <Image src={user.avatar_url} alt="Avatar" width={16} height={16} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold">{getUserInitial(user.fullName, user.username)}</span>
                      )}
                    </div>
                    <span className="text-xs text-foreground max-w-20 truncate hidden lg:inline">{user.fullName || user.username}</span>
                    <ChevronDown />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="overlay-shell absolute right-0 top-full z-[100] mt-2 w-56 overflow-hidden">
                        <div className="border-b border-border/70 p-2"><p className="truncate px-2 py-1 text-xs text-foreground">{user.email}</p></div>
                        <div className="p-1">
                          <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="block rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary/35">Hồ sơ của tôi</Link>
                          <button onClick={() => { logout(); setUserMenuOpen(false); }} className="w-full rounded-md px-3 py-2 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10">Đăng xuất</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href="/auth" className="hidden md:flex items-center gap-1.5 rounded-md border border-gold/30 px-3 py-1.5 text-xs font-medium text-gold-dim transition-all duration-200 hover:bg-gold/10">
                  <UserIcon /> Đăng nhập
                </Link>
              )
            )}

            <button className="md:hidden p-2 text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {categoryOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setCategoryOpen(false)} />
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="absolute left-0 right-0 top-full z-[45] overflow-hidden border-b border-border bg-card shadow-2xl">
              <CategoryNav onClose={() => setCategoryOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <MobileMenu
            onClose={() => setMobileOpen(false)}
            dailyStudy={dailyStudyLinks}
            contentLibrary={contentLibraryLinks}
            community={communityLinks}
            organization={organizationLinks}
            hoTri={groups.hoTri}
          />
        )}
      </AnimatePresence>
      {userMenuOpen && <div className="fixed inset-0 z-50" onClick={() => setUserMenuOpen(false)} />}
    </header>
  );
};

export default Header;
