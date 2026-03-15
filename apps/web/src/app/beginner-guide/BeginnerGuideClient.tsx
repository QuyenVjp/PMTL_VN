'use client';
// ─────────────────────────────────────────────────────────────────────────────
//  app/beginner-guide/BeginnerGuideClient.tsx
//  Trang Hướng Dẫn Sơ Học — 2 tab: Lộ Trình + Tài Liệu
//  - Dữ liệu động từ CMS (có fallback mock khi CMS trống)
//  - Tab "Tài Liệu": xem preview PDF/ảnh ngay trong trang
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

import { ArrowRightIcon } from "@/components/icons/ZenIcons";
import { resolveUrl } from "@/lib/cms-client";
import type { BeginnerGuide, CmsMedia } from "@/types/cms";

// ─── Icons ────────────────────────────────────────────────────────────────────

const DownloadIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" />
  </svg>
);

const CheckCircleIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" />
    <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FileIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Fallback data (dùng khi CMS chưa có dữ liệu) ───────────────────────────

const MOCK_STEPS: (Partial<BeginnerGuide> & { details?: string[] })[] = [
  { id: 1, title: "Tìm Hiểu Pháp Môn Tâm Linh", description: "Đọc giới thiệu tổng quan về 5 Đại Pháp Bảo và hiểu nền tảng tu học.", details: ["Đọc bài 'Giới Thiệu Pháp Môn Tâm Linh' trên website", "Xem video giới thiệu 10 phút trên YouTube", "Hiểu 5 Pháp Bảo: Niệm Kinh, Phát Nguyện, Phóng Sinh, Sám Hối, Ngôi Nhà Nhỏ", "Đọc một vài câu chuyện đồng tu để thêm niềm tin"], duration: "1-2 ngày" },
  { id: 2, title: "Thiết Lập Bàn Thờ Phật Tại Gia", description: "Hướng dẫn cách bố trí bàn thờ Phật đúng pháp tại nhà.", details: ["Chọn vị trí sạch sẽ, trang nghiêm, hướng Nam hoặc hướng Đông", "Thỉnh tượng Phật Quán Thế Âm Bồ Tát (có thể dùng ảnh)", "Chuẩn bị: bát nhang, đèn dầu/nến, hoa tươi, nước sạch, trái cây", "Giữ bàn thờ sạch sẽ, thay nước mỗi ngày"], duration: "1 ngày" },
  { id: 3, title: "Học 4 Bộ Kinh Chú Cơ Bản", description: "Bắt đầu với 4 kinh chú cốt lõi, học thuộc từng bước.", details: ["Chú Đại Bi (大悲咒): 3-7 biến/ngày", "Tâm Kinh (心经): 3-7 biến/ngày", "Chuẩn Đề Thần Chú (准提神咒): 21-49 biến", "Lễ Phật Đại Sám Hối Văn: 1-3 biến/ngày"], duration: "1-2 tuần" },
  { id: 4, title: "Thiết Lập Công Khóa Hàng Ngày", description: "Lịch trình tụng niệm cố định mỗi ngày — nền tảng của tu học.", details: ["Buổi sáng (6:00-8:00): Niệm Chú Đại Bi + Tâm Kinh + Chuẩn Đề", "Buổi chiều: Lễ Phật Đại Sám Hối Văn", "Tổng thời gian: 30-60 phút/ngày"], duration: "Hàng ngày" },
  { id: 5, title: "Học Về Ngôi Nhà Nhỏ", description: "Hiểu và thực hành Ngôi Nhà Nhỏ — công cụ siêu độ mạnh mẽ.", details: ["Tải mẫu Ngôi Nhà Nhỏ (in trên giấy vàng)", "Gồm: Chú Đại Bi, Tâm Kinh, Vãng Sinh Chú, Thất Phật Diệt Tội Chân Ngôn", "Niệm đủ số, đốt theo nghi thức đúng pháp"], duration: "1 tuần học + thực hành" },
  { id: 6, title: "Thực Hành Phóng Sinh & Phát Nguyện", description: "Phóng sinh và phát nguyện — hai pháp bảo tích đức mạnh mẽ.", details: ["Phóng sinh cá/tôm tại sông, hồ, biển", "Niệm chú trước khi phóng, hồi hướng sau", "Phát nguyện ăn chay và giới thiệu Phật pháp"], duration: "Thực hành suốt đời" },
];

// ─── Props ──────────────────────────────────────────────────────────────────

interface BeginnerGuideClientProps {
  initialGuides: BeginnerGuide[];
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BeginnerGuideClient({ initialGuides }: BeginnerGuideClientProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  // Ưu tiên dữ liệu CMS; nếu trống thì dùng mock
  const displayGuides = initialGuides.length > 0 ? initialGuides : MOCK_STEPS;
  const hasLiveCMSData = initialGuides.length > 0;

  const toggleComplete = (id: number) => {
    setCompletedSteps((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const progress = displayGuides.length > 0 ? Math.round((completedSteps.length / displayGuides.length) * 100) : 0;

  return (
    <>
      <main className="route-shell">
        <div className="route-frame">

          {/* ── Header ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="route-hero">
            <p className="route-kicker mb-3">Dành Cho Người Mới</p>
            <h1 className="route-title mb-4 md:text-5xl">Hướng Dẫn Sơ Học</h1>
            <p className="route-copy mx-auto">Lộ trình 6 bước để bắt đầu tu học Pháp Môn Tâm Linh. Tất cả tài liệu đều miễn phí tuyệt đối.</p>
            {/* Indicator dữ liệu */}
            {!hasLiveCMSData && (
              <p className="mt-3 rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-1.5 text-xs text-amber-400/70">
                Đang hiển thị dữ liệu mẫu — Chưa có dữ liệu từ CMS
              </p>
            )}
          </motion.div>

          <AnimatePresence mode="wait">
            {/* ═══════════════════════════════════════════════════════════
                TAB: LỘ TRÌNH TU HỌC
            ═══════════════════════════════════════════════════════════ */}
            <motion.div key="steps" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left: Steps */}
                <div className="flex-1">
                  {/* Progress bar */}
                  <div className="panel-shell mb-8 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-foreground font-medium">Tiến Trình Của Bạn</p>
                      <p className="text-sm text-gold font-medium">{progress}%</p>
                    </div>
                    <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                      <motion.div className="h-full bg-gradient-to-r from-gold to-amber-400 rounded-full" animate={{ width: `${progress}%` }} transition={{ type: "spring", stiffness: 100 }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{completedSteps.length}/{displayGuides.length} bước hoàn thành</p>
                  </div>

                  {/* Step list */}
                  <div className="space-y-4">
                    {displayGuides.map((step, index) => {
                      const displayIndex = index + 1;
                      const stepId = (step.id ?? displayIndex) as number;
                      const isCompleted = completedSteps.includes(stepId);
                      const isExpanded = expandedStep === stepId;
                      const details = (step as Partial<BeginnerGuide> & { details?: string[] }).details;
                      return (
                        <motion.div
                          key={stepId}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`rounded-xl border transition-all ${isCompleted ? "border-green-500/30 bg-green-500/5" : isExpanded ? "border-gold/30 bg-card" : "border-border bg-card"}`}
                        >
                          <button onClick={() => setExpandedStep(isExpanded ? null : stepId)} className="w-full flex items-center gap-4 p-5 text-left">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-display transition-colors ${isCompleted ? "bg-green-500/20 text-green-400" : "bg-secondary text-muted-foreground"}`}>
                              {isCompleted ? <CheckCircleIcon className="w-5 h-5" /> : displayIndex}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className={`text-sm font-medium ${isCompleted ? "text-green-400" : "text-foreground"}`}>Bước {displayIndex}: {step.title}</h3>
                              <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                            </div>
                            {step.duration && <span className="text-xs text-muted-foreground/60 shrink-0">{step.duration}</span>}
                            <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} className="text-muted-foreground">
                              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                            </motion.span>
                          </button>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="px-5 pb-5 pt-0">
                                  <div className="pl-14 space-y-4">
                                    {/* Rich text content từ CMS */}
                                    {step.content ? (
                                      <div
                                        className="prose prose-sm dark:prose-invert prose-p:text-muted-foreground prose-a:text-gold prose-a:no-underline hover:prose-a:underline max-w-none"
                                        dangerouslySetInnerHTML={{ __html: step.content }}
                                      />
                                    ) : details ? (
                                      <div className="space-y-2">
                                        {details.map((d: string, i: number) => (
                                          <div key={i} className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-gold/40 mt-1.5 shrink-0" />
                                            <p className="text-sm text-muted-foreground leading-relaxed">{d}</p>
                                          </div>
                                        ))}
                                      </div>
                                    ) : null}

                                    {/* Ảnh đính kèm từ CMS */}
                                    {step.images && step.images.length > 0 && (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        {step.images.map((img: CmsMedia) => {
                                          const imgUrl = resolveUrl(img.formats?.large?.url || img.formats?.medium?.url || img.url);
                                          if (!imgUrl) return null;
                                          return (
                                            <div key={img.id} className="relative aspect-auto rounded-lg overflow-hidden border border-border/50 bg-secondary">
                                              {/* eslint-disable-next-line @next/next/no-img-element */}
                                              <img src={imgUrl} alt={img.alternativeText || ''} className="w-full h-auto" loading="lazy" />
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}

                                    {/* Nút hoàn thành */}
                                    <button
                                      onClick={(e) => { e.stopPropagation(); toggleComplete(stepId); }}
                                      className={`mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${isCompleted ? "bg-green-500/10 text-green-400 hover:bg-green-500/20" : "bg-primary/10 text-gold hover:bg-primary/20"}`}
                                    >
                                      <CheckCircleIcon className="w-3.5 h-3.5" />{isCompleted ? "Đã hoàn thành ✓" : "Đánh dấu hoàn thành"}
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Sidebar */}
                <div className="lg:w-80 space-y-6">
                  <div className="p-5 rounded-xl bg-card border border-border">
                    <h3 className="text-sm font-medium text-foreground mb-3">Video Hướng Dẫn</h3>
                    <a href="https://www.youtube.com/watch?v=eEtCu31EDa4" target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden mb-3 group">
                      <div className="aspect-video bg-secondary relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="https://i.ytimg.com/vi/eEtCu31EDa4/mqdefault.jpg" alt="Video giới thiệu" className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center"><svg viewBox="0 0 20 20" fill="white" className="w-4 h-4 ml-0.5"><polygon points="5 3 19 10 5 17" /></svg></div>
                        </div>
                      </div>
                    </a>
                    <p className="text-xs text-muted-foreground">Video giới thiệu Pháp Môn Tâm Linh (10 phút)</p>
                  </div>

                  <div className="p-5 rounded-xl bg-card border border-border">
                    <h3 className="text-sm font-medium text-foreground mb-3">Bước Tiếp Theo</h3>
                    <div className="space-y-2">
                      {[
                        { label: "Thư Viện Kinh Văn", href: "/library" },
                        { label: "Nghe Bài Giảng", href: "/radio" },
                        { label: "Tìm Quán Âm Đường", href: "/directory" },
                        { label: "Câu Chuyện Đồng Tu", href: "/testimonials" },
                      ].map((l) => (
                        <Link
                          key={l.href + l.label}
                          href={l.href}
                          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-secondary transition-colors text-sm text-muted-foreground hover:text-gold"
                        >
                          {l.label}
                          <ArrowRightIcon className="w-3.5 h-3.5" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}
