import Link from "next/link";
import Image from "next/image";
import { getSiteSettings } from "@/lib/api/settings";
import type { SocialLinks } from "@/types/strapi";

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TiktokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.35 6.35 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.24 8.24 0 0 0 4.82 1.54V6.78a4.85 4.85 0 0 1-1.05-.09z" />
  </svg>
);

const ZaloIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <rect width="24" height="24" rx="5" fill="none" />
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm.75 14.5H11.3c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h.45v-4.5h-.45c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h1.45c.28 0 .5.22.5.5v5h.45c.28 0 .5.22.5.5s-.22.5-.5.5zm-1.25-8a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
  </svg>
);

const navGroups = [
  {
    title: "Tu Học",
    links: [
      { label: "Hướng Dẫn Sơ Học", href: "/beginner-guide" },
      { label: "Lịch Tu Học", href: "/lunar-calendar" },
      { label: "Hỏi Đáp & Lưu Bút", href: "/guestbook" },
      { label: "Danh Bạ Toàn Cầu", href: "/directory" },
      { label: "Hộ Trì Phật Pháp", href: "/donations" },
    ]
  },
  {
    title: "Khai Thị",
    links: [
      { label: "Thư Viện Kinh Văn", href: "/library" },
      { label: "Chương Trình Radio", href: "/radio" },
      { label: "Video Khai Thị", href: "/videos" },
      { label: "Blog Phật Pháp", href: "/blog" },
    ]
  },
  {
    title: "Cộng Đồng",
    links: [
      { label: "Chứng Nghiệm & Chia Sẻ", href: "/shares" },
      { label: "Sự Kiện & Pháp Hội", href: "/events" },
    ]
  }
];

const downloadLinks = [
  { label: "12 Tập Bạch Thoại PDF", href: "https://xlch.org/download" },
  { label: "Audio Niệm Kinh", href: "https://xlch.org/audio" },
  { label: "Mẫu Ngôi Nhà Nhỏ", href: "https://xlch.org/ngoinha" },
  { label: "Hướng Dẫn Sơ Học", href: "https://xlch.org/guide" },
  { label: "Kinh Văn Thường Dụng", href: "https://xlch.org/kinh" },
];

const externalLinks = [
  { label: "YouTube", href: "https://youtube.com/@phapmon.tamlinh?si=EkMtyo76fes5pJoQ" },
  { label: "Facebook", href: "https://www.facebook.com/groups/1772491517480555/?ref=share" },
  { label: "Zalo", href: "https://zalo.me/g/sjajsj328" },
  { label: "TikTok", href: "https://www.tiktok.com/@pmtl_0983885116" },
  { label: "xinlingfamen.info", href: "https://xinlingfamen.info" },
  { label: "xlch.org", href: "https://xlch.org" },
];

function buildSocialIcons(social: SocialLinks | null) {
  const icons = [
    { key: "facebook" as const, icon: <FacebookIcon />, label: "Facebook", fallback: "https://www.facebook.com/groups/1772491517480555/?ref=share" },
    { key: "youtube" as const, icon: <YoutubeIcon />, label: "YouTube", fallback: "https://youtube.com/@phapmon.tamlinh?si=EkMtyo76fes5pJoQ" },
    { key: "tiktok" as const, icon: <TiktokIcon />, label: "TikTok", fallback: "https://www.tiktok.com/@pmtl_0983885116" },
    { key: "zalo" as const, icon: <ZaloIcon />, label: "Zalo", fallback: "https://zalo.me/g/sjajsj328" },
  ]
  return icons.map(({ key, icon, label, fallback }) => ({
    icon,
    href: social?.[key] ?? fallback,
    label,
  }))
}

const Footer = async () => {
  const settings = await getSiteSettings()

  const address = settings.address ?? "2A Holden Street, Ashfield, NSW 2131, Australia"
  const phone = settings.contactPhone ?? "+61 2 9283 2758"
  const email = settings.contactEmail ?? "oriental2or@hotmail.com"
  const socialIcons = buildSocialIcons(settings.socialLinks)

  return (
    <footer className="border-t border-border bg-card/30">
      <div className="container mx-auto px-6 pt-12 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-10">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4 hover:opacity-80 transition-opacity">
              <Image
                src="/images/logoo.png"
                alt="Pháp Môn Tâm Linh"
                width={160}
                height={50}
                className="h-12 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-xs">
              Trực tiếp từ đài Phật pháp của Trưởng Lư Quân Hoành. Tất cả tài liệu hoàn toàn miễn phí.
            </p>
            <div className="flex items-center gap-2">
              {socialIcons.map(({ icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-gold hover:bg-secondary/80 transition-colors"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {navGroups.map((group) => (
            <div key={group.title}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">{group.title}</h4>
              <ul className="space-y-2">
                {group.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-muted-foreground hover:text-gold transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Tài liệu</h4>
            <ul className="space-y-2">
              {downloadLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="sm:col-span-2 md:col-span-3 lg:col-span-1">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Liên kết</h4>
            <ul className="space-y-2 mb-6">
              {externalLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                    ↗ {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="pt-4 border-t border-border/50 space-y-1.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-1">Trụ sở chính</p>
              <p className="text-xs text-muted-foreground/70 leading-relaxed">{address}</p>
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-xs text-muted-foreground/70 hover:text-gold transition-colors block">{phone}</a>
              <a href={`mailto:${email}`} className="text-xs text-muted-foreground/70 hover:text-gold transition-colors block truncate">{email}</a>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground/60 text-center sm:text-left">
            © {new Date().getFullYear()} Pháp Môn Tâm Linh. Nguyện đem công đức này hướng về khắp tất cả chúng sinh đều trọn thành Phật đạo.
          </p>
          <p className="text-xs text-gold/50 shrink-0">南無阿彌陀佛</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
