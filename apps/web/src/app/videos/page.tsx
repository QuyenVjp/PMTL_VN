'use client'

import { useState } from "react";
import { motion } from "framer-motion";


const PlayCircleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
  </svg>
);

interface Video { id: string; title: string; titleCn: string; description: string; youtubeId: string; category: string; duration: string; views: string; date: string; }

const categories = ["Tất cả", "Nhân Quả Hiện Tiền", "Khai Thị Đại Pháp", "Pháp Hội Thế Giới", "Bạch Thoại Phật Pháp", "Phóng Sinh & Từ Thiện"];

const videos: Video[] = [
  { id: "1", title: "Người Ngồi Xe Lăn 7 Năm Đứng Dậy Đi Lại", titleCn: "坐轮椅7年站起来", description: "Câu chuyện chấn động: Một người đàn ông ngồi xe lăn suốt 7 năm đã kỳ diệu đứng dậy đi lại.", youtubeId: "f-UKk3THR3Y", category: "Nhân Quả Hiện Tiền", duration: "12:34", views: "2.3M", date: "2024-05-15" },
  { id: "2", title: "Ni Cô Bị Câm Sau Khi Xây Chùa — Nghiệp Gì?", titleCn: "尼姑建庙后失语", description: "Sư Phụ khai thị về nghiệp lực từ tiền kiếp.", youtubeId: "N7OVli-xGFA", category: "Nhân Quả Hiện Tiền", duration: "8:45", views: "1.8M", date: "2024-03-20" },
  { id: "3", title: "Bạch Thoại Phật Pháp Kỳ 91 — Lập Thân Thập Giới", titleCn: "白话佛法第91集", description: "Sư Phụ giảng giải mười giới luật lập thân.", youtubeId: "8OtEhhmIYQ4", category: "Bạch Thoại Phật Pháp", duration: "45:20", views: "850K", date: "2025-12-10" },
  { id: "4", title: "Pháp Hội Thế Giới 2024 — Bi Tâm Hoằng Nguyện", titleCn: "悲心宏愿遍满人间", description: "Ghi hình Pháp Hội lớn nhất năm 2024 với hàng chục nghìn đồng tu.", youtubeId: "58rDNtonUak", category: "Pháp Hội Thế Giới", duration: "1:32:15", views: "3.1M", date: "2024-09-01" },
  { id: "5", title: "Khai Thị Đặc Biệt: Vô Thường và Giá Trị Cuộc Sống", titleCn: "无常与生命价值", description: "Bài giảng cảm động nhất của Sư Phụ về vô thường.", youtubeId: "rbvZWtuc0xw", category: "Khai Thị Đại Pháp", duration: "28:40", views: "1.5M", date: "2025-01-18" },
  { id: "6", title: "Phóng Sinh 10,000 Con Cá — Melbourne 2024", titleCn: "墨尔本万鱼放生", description: "Buổi phóng sinh tập thể lớn nhất tại Melbourne.", youtubeId: "nWU6PsFkZJE", category: "Phóng Sinh & Từ Thiện", duration: "18:22", views: "920K", date: "2024-07-12" },
  { id: "7", title: "Bạch Thoại Phật Pháp Kỳ 90 — Tu Giác Chánh Tịnh", titleCn: "白话佛法第90集", description: "Giác ngộ, chánh kiến, thanh tịnh — ba yếu tố cốt lõi.", youtubeId: "v_KPwA9ACTo", category: "Bạch Thoại Phật Pháp", duration: "48:12", views: "780K", date: "2025-11-05" },
  { id: "8", title: "Nhân Quả Hiện Tiền — Bé Gái Nhớ Rõ Tiền Kiếp", titleCn: "小女孩记得前世", description: "Một bé gái 4 tuổi nhớ rõ tiền kiếp.", youtubeId: "_P86k6Kj6HI", category: "Nhân Quả Hiện Tiền", duration: "6:30", views: "4.2M", date: "2024-11-22" },
];

export default function VideosPage() {
  const [activeCat, setActiveCat] = useState("Tất cả");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const filtered = videos.filter((v) => activeCat === "Tất cả" || v.category === activeCat);

  return (
    <>
      <main className="route-shell">
        <div className="route-frame">

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="route-hero">
            <p className="route-kicker mb-3">因果现前 — Nhân Quả Hiện Tiền</p>
            <h1 className="route-title mb-4 md:text-5xl">Video Khai Thị & Đồ Đằng</h1>
            <p className="route-copy mx-auto">Xem nghiệp lực hiện tiền trước mắt. Những video chấn động tâm linh từ Sư Phụ Lư Quân Hoành.</p>
          </motion.div>

          <div className="flex gap-2 flex-wrap justify-center mb-8">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCat(cat)} className={`filter-chip ${activeCat === cat ? "filter-chip-active" : "filter-chip-idle"}`}>{cat}</button>
            ))}
          </div>

          {selectedVideo && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="panel-shell mb-10 overflow-hidden">
              <div className="aspect-video bg-black">
                <iframe src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0`} title={selectedVideo.title} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-gold">{selectedVideo.category}</span>
                  <span className="text-xs text-muted-foreground">{selectedVideo.views} lượt xem</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{selectedVideo.date}</span>
                </div>
                <h2 className="ant-title mb-1 text-xl text-foreground">{selectedVideo.title}</h2>
                <p className="text-xs text-muted-foreground mb-2">{selectedVideo.titleCn}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedVideo.description}</p>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((v, i) => (
              <motion.div key={v.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} onClick={() => setSelectedVideo(v)} className={`group cursor-pointer overflow-hidden rounded-xl border transition-all ${selectedVideo?.id === v.id ? "border-gold/35 bg-card shadow-ant" : "border-border bg-card hover:border-gold/20 hover:shadow-ant"}`}>
                <div className="relative aspect-video bg-secondary overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://i.ytimg.com/vi/${v.youtubeId}/mqdefault.jpg`} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="flex size-12 items-center justify-center rounded-md bg-black/60 opacity-80 transition-all group-hover:scale-110 group-hover:opacity-100">
                      <PlayCircleIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 text-xs bg-black/70 text-white rounded">{v.duration}</span>
                </div>
                <div className="p-3">
                  <h3 className="mb-1 text-base font-semibold leading-snug text-foreground line-clamp-2">{v.title}</h3>
                  <p className="text-xs text-muted-foreground/60">{v.titleCn}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground"><span>{v.views} lượt xem</span><span>•</span><span>{v.category}</span></div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <a href="https://www.youtube.com/channel/UCuupstmJXSQBhUYr64R8BYQ?sub_confirmation=1" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md bg-red-600 px-6 py-3 font-medium text-white transition-colors hover:bg-red-700">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98" fill="white" /></svg>
              Xem Thêm Trên YouTube
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
