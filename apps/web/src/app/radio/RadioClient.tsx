'use client'

import { useState } from "react";
import { motion } from "framer-motion";

import { SearchIcon, PlayIcon } from "@/components/icons/ZenIcons";

const MicIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" strokeLinecap="round" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" strokeLinecap="round" />
    <line x1="12" y1="19" x2="12" y2="22" strokeLinecap="round" />
  </svg>
);

const HeadphonesIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" strokeLinecap="round" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </svg>
);

interface Episode { id: number; title: string; date: string; category: string; duration: string; description: string; tags: string[]; isFeatured?: boolean; listenerCount: number; }

const categories = ["Tất cả", "Phật Học Vấn Đáp", "Huyền Nghệ Tổng Thuật", "Bạch Thoại Phật Pháp", "Khai Thị & Giáo Huấn", "Siêu Độ & Ngôi Nhà Nhỏ", "Sức Khỏe & Bệnh Tật", "Hôn Nhân & Gia Đình", "Sự Nghiệp & Tài Vận", "Phóng Sinh & Phát Nguyện"];

const episodes: Episode[] = [
  { id: 1, title: "Bạch Thoại Phật Pháp Kỳ 91: Lập Thân Thập Giới, Nhân Thành Phật Thành", date: "2026-02-20", category: "Bạch Thoại Phật Pháp", duration: "45:20", description: "Sư Phụ giảng giải mười giới luật để lập thân, khi người tu hành giữ được giới luật thì con đường thành Phật không còn xa.", tags: ["giới luật", "tu tâm", "đạo đức"], isFeatured: true, listenerCount: 28540 },
  { id: 2, title: "Phật Học Vấn Đáp: Cách Niệm Kinh Cho Người Mới Bắt Đầu", date: "2026-02-18", category: "Phật Học Vấn Đáp", duration: "38:15", description: "Hướng dẫn chi tiết cách tụng niệm cho người mới tu học.", tags: ["niệm kinh", "sơ học", "hướng dẫn"], listenerCount: 45230 },
  { id: 3, title: "Huyền Nghệ: Giải Mộng — Mộng Thấy Người Đã Khuất Ý Nghĩa Gì?", date: "2026-02-15", category: "Huyền Nghệ Tổng Thuật", duration: "42:08", description: "Sư Phụ giải thích ý nghĩa tâm linh khi mộng thấy người đã qua đời.", tags: ["giải mộng", "siêu độ", "huyền học"], isFeatured: true, listenerCount: 52180 },
  { id: 4, title: "Khai Thị: Tâm Từ Bi Là Nền Tảng Của Mọi Sự Tu Hành", date: "2026-02-12", category: "Khai Thị & Giáo Huấn", duration: "35:42", description: "Không có từ bi thì không có tu hành.", tags: ["từ bi", "tu tâm", "khai thị"], listenerCount: 31200 },
  { id: 5, title: "Vấn Đáp: Cách Hóa Giải Oán Kết Vợ Chồng Bằng Phật Pháp", date: "2026-02-10", category: "Hôn Nhân & Gia Đình", duration: "41:55", description: "Vợ chồng bất hòa là do oán kết tiền kiếp. Cách niệm Giải Kết Chú.", tags: ["hôn nhân", "oán kết", "giải kết chú"], listenerCount: 67890 },
  { id: 6, title: "Siêu Độ: Hướng Dẫn Chi Tiết Niệm Ngôi Nhà Nhỏ Cho Người Thân", date: "2026-02-08", category: "Siêu Độ & Ngôi Nhà Nhỏ", duration: "50:30", description: "Bài giảng chi tiết nhất về Ngôi Nhà Nhỏ: cách viết, niệm, đốt, hồi hướng.", tags: ["ngôi nhà nhỏ", "siêu độ", "hướng dẫn"], isFeatured: true, listenerCount: 89450 },
  { id: 7, title: "Bạch Thoại Phật Pháp Kỳ 90: Tu Giác Chánh Tịnh, Thực Hành Đại Thừa", date: "2026-02-05", category: "Bạch Thoại Phật Pháp", duration: "48:12", description: "Giác ngộ, chánh kiến, thanh tịnh — ba yếu tố cốt lõi.", tags: ["đại thừa", "chánh kiến", "tu tập"], listenerCount: 25600 },
  { id: 8, title: "Sức Khỏe: Ung Thư Và Nghiệp Lực — Phương Pháp Hóa Giải", date: "2026-02-02", category: "Sức Khỏe & Bệnh Tật", duration: "55:18", description: "Mối liên hệ giữa nghiệp chướng và bệnh ung thư.", tags: ["bệnh tật", "ung thư", "nghiệp chướng"], listenerCount: 76340 },
  { id: 9, title: "Phóng Sinh: Nghi Thức Phóng Sinh Chuẩn Và Hồi Hướng Đúng Pháp", date: "2026-01-28", category: "Phóng Sinh & Phát Nguyện", duration: "33:45", description: "Hướng dẫn toàn bộ quy trình phóng sinh.", tags: ["phóng sinh", "nghi thức", "hồi hướng"], listenerCount: 43200 },
  { id: 10, title: "Sự Nghiệp: Cầu Tài Lộc Và Vượt Qua Khó Khăn Tài Chính", date: "2026-01-25", category: "Sự Nghiệp & Tài Vận", duration: "40:10", description: "Phước đức và nghiệp lực ảnh hưởng thế nào đến tài vận?", tags: ["sự nghiệp", "tài lộc", "chuẩn đề"], listenerCount: 58900 },
  { id: 11, title: "Khai Thị Đặc Biệt: Lời Nhắn Nhủ Cuối Cùng Của Sư Phụ Đến Đồng Tu", date: "2026-01-20", category: "Khai Thị & Giáo Huấn", duration: "62:30", description: "Bài giảng đặc biệt cảm động, Sư Phụ nhắn nhủ đồng tu hãy tinh tấn tu hành.", tags: ["khai thị", "sư phụ", "tinh tấn"], isFeatured: true, listenerCount: 120300 },
  { id: 12, title: "Vấn Đáp: Con Cái Khó Dạy — Nghiệp Chướng Từ Tiền Kiếp?", date: "2026-01-18", category: "Hôn Nhân & Gia Đình", duration: "37:22", description: "Con cái bất hiếu, khó dạy là oán kết từ tiền kiếp.", tags: ["con cái", "nghiệp chướng", "gia đình"], listenerCount: 41500 },
];

const platformLinks = [
  { name: "Apple Podcasts", url: "https://podcasts.apple.com/podcast/id1250342346" },
  { name: "YouTube", url: "https://www.youtube.com/channel/UCuupstmJXSQBhUYr64R8BYQ" },
  { name: "SoundCloud", url: "https://soundcloud.com/guanyincittadharma" },
  { name: "Spotify", url: "https://open.spotify.com" },
];

export default function RadioClient() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [playingId, setPlayingId] = useState<number | null>(null);

  const filtered = episodes.filter((ep) => {
    const matchSearch = ep.title.toLowerCase().includes(search.toLowerCase()) || ep.description.toLowerCase().includes(search.toLowerCase()) || ep.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = activeCategory === "Tất cả" || ep.category === activeCategory;
    return matchSearch && matchCat;
  });

  const featured = episodes.filter((ep) => ep.isFeatured);

  return (
    <>
      <main className="route-shell">
        <div className="route-frame">

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="route-hero">
            <div className="flex items-center justify-center gap-2 mb-3">
              <MicIcon className="w-5 h-5 text-gold-dim" />
              <p className="route-kicker">Đài Phật Pháp</p>
            </div>
            <h1 className="route-title mb-4 md:text-5xl">Chương Trình Phát Thanh</h1>
            <p className="route-copy mx-auto">3,000+ giờ ghi âm bài giảng Phật pháp từ Sư Phụ Lư Quân Hoành. Nghe miễn phí, mọi lúc mọi nơi.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mb-8 flex flex-wrap justify-center gap-2">
            {platformLinks.map((p) => (
              <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" className="filter-chip filter-chip-idle text-sm">{p.name}</a>
            ))}
            <a href="https://xinlingfamen.info/radio" target="_blank" rel="noopener noreferrer" className="filter-chip filter-chip-active text-sm">
              <MicIcon className="w-3.5 h-3.5" />Nghe Radio Trực Tiếp
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="panel-shell-strong mb-10 p-5">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="relative"><div className="flex size-12 items-center justify-center rounded-md bg-red-500/20"><div className="h-3 w-3 rounded-sm bg-red-500 animate-pulse" /></div></div>
                <div><p className="text-sm font-medium text-foreground">Radio Trực Tiếp — Đài Đông Phương</p><p className="text-xs text-muted-foreground">Phát thanh hàng ngày từ Sydney, Australia</p></div>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><span>Hotline:</span><a href="tel:+61292832758" className="text-gold font-medium">+61 2 9283 2758</a></div>
              <a href="https://xinlingfamen.info/radio" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-md bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700">
                <HeadphonesIcon className="w-4 h-4" />Nghe Ngay
              </a>
            </div>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 min-w-0">
              {featured.length > 0 && (
                <div className="mb-10">
                  <h2 className="ant-title mb-5 text-2xl text-foreground">Bài Giảng Nổi Bật</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {featured.map((ep, i) => (
                      <motion.div key={ep.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="group relative cursor-pointer rounded-xl border border-border bg-card p-5 transition-all hover:border-gold/30 hover:shadow-ant" onClick={() => setPlayingId(playingId === ep.id ? null : ep.id)}>
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`flex size-10 shrink-0 items-center justify-center rounded-md transition-colors ${playingId === ep.id ? "bg-gold text-black" : "bg-secondary group-hover:bg-primary/10 text-muted-foreground group-hover:text-gold"}`}><PlayIcon className="w-4 h-4" /></div>
                          <div className="min-w-0"><p className="text-xs text-gold/70 mb-0.5">{ep.category}</p><h3 className="text-sm font-medium text-foreground leading-snug line-clamp-2">{ep.title}</h3></div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground"><span>{ep.duration}</span><span>•</span><span>{ep.listenerCount.toLocaleString()} lượt nghe</span></div>
                        {playingId === ep.id && (
                          <div className="mt-3 space-y-2">
                            <div className="h-1.5 w-full overflow-hidden rounded-md bg-border"><motion.div className="h-full rounded-md bg-gradient-to-r from-gold to-amber-400" initial={{ width: "0%" }} animate={{ width: "35%" }} transition={{ duration: 2 }} /></div>
                            <p className="text-xs text-muted-foreground">Đang phát...</p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input type="text" placeholder="Tìm kiếm bài giảng..." value={search} onChange={(e) => setSearch(e.target.value)} className="toolbar-search py-2.5 pl-12 pr-4" />
                </div>
                <span className="rounded-md border border-border bg-card px-4 py-2.5 text-sm text-muted-foreground whitespace-nowrap">{filtered.length} bài giảng</span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
                {categories.map((cat) => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} className={`whitespace-nowrap filter-chip ${activeCategory === cat ? "filter-chip-active" : "filter-chip-idle"}`}>{cat}</button>
                ))}
              </div>

              <div className="space-y-3">
                {filtered.map((ep) => (
                  <motion.div key={ep.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`cursor-pointer rounded-xl border p-4 transition-all ${playingId === ep.id ? "border-gold/30 bg-primary/5 shadow-ant" : "border-border bg-card hover:border-gold/20 hover:shadow-ant"}`} onClick={() => setPlayingId(playingId === ep.id ? null : ep.id)}>
                    <div className="flex gap-4">
                      <button className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md transition-colors ${playingId === ep.id ? "bg-gold text-black" : "bg-secondary hover:bg-primary/10 text-muted-foreground hover:text-gold"}`}>
                        {playingId === ep.id ? (
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                        ) : (
                          <PlayIcon className="w-4 h-4 ml-0.5" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{ep.category}</span>
                          <span className="text-xs text-muted-foreground">{ep.date}</span>
                        </div>
                        <h3 className="text-sm font-medium text-foreground leading-snug mb-1.5">{ep.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{ep.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground/60">
                          <span>{ep.duration}</span><span>•</span><span>{ep.listenerCount.toLocaleString()} lượt nghe</span><span>•</span>
                          <div className="flex gap-1">{ep.tags.map((t) => (<span key={t} className="text-gold/50">#{t}</span>))}</div>
                        </div>
                        {playingId === ep.id && (
                          <div className="mt-3"><div className="h-1.5 w-full overflow-hidden rounded-md bg-border"><motion.div className="h-full rounded-md bg-gradient-to-r from-gold to-amber-400" initial={{ width: "0%" }} animate={{ width: "42%" }} transition={{ duration: 3 }} /></div></div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {filtered.length === 0 && (
                <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground"><MicIcon className="mx-auto mb-3 h-10 w-10 opacity-30" /><p>Không tìm thấy bài giảng phù hợp.</p></div>
              )}
            </div>

            <div className="lg:w-80 shrink-0 space-y-6">
              <div className="rounded-xl border border-border bg-card p-5 shadow-ant">
                <h3 className="text-sm font-medium text-foreground mb-4">Thống Kê</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[{ label: "Bài Giảng", value: "3,200+" }, { label: "Giờ Phát Sóng", value: "3,000+" }, { label: "Người Nghe", value: "10M+" }, { label: "Quốc Gia", value: "50+" }].map((s) => (
                    <div key={s.label} className="rounded-md border border-border bg-secondary/50 p-3 text-center"><p className="ant-number text-lg text-gold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-ant">
                <h3 className="text-sm font-medium text-foreground mb-3">Chủ Đề Hot Tuần Này</h3>
                <div className="space-y-2">
                  {[{ topic: "Niệm Kinh Trị Bệnh", count: "12.5K" }, { topic: "Oán Kết Vợ Chồng", count: "9.8K" }, { topic: "Ngôi Nhà Nhỏ", count: "8.2K" }, { topic: "Phóng Sinh Giải Hạn", count: "7.1K" }, { topic: "Cầu Sự Nghiệp", count: "5.4K" }].map((t, i) => (
                    <div key={t.topic} className="flex items-center gap-3 py-2"><span className="text-xs text-gold/50 w-4">{i + 1}</span><span className="text-sm text-foreground flex-1">{t.topic}</span><span className="text-xs text-muted-foreground">{t.count}</span></div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-ant">
                <h3 className="text-sm font-medium text-foreground mb-3">Liên Kết Nhanh</h3>
                <div className="space-y-2">
                  {[{ label: "Nghe Radio Trực Tiếp", href: "https://xinlingfamen.info/radio" }, { label: "Kênh YouTube Pháp Môn", href: "https://www.youtube.com/channel/UCuupstmJXSQBhUYr64R8BYQ" }, { label: "Apple Podcasts", href: "https://podcasts.apple.com/podcast/id1250342346" }, { label: "SoundCloud", href: "https://soundcloud.com/guanyincittadharma" }].map((l) => (
                    <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="block text-sm text-muted-foreground hover:text-gold transition-colors">↗ {l.label}</a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

