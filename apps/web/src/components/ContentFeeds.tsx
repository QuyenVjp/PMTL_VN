'use client'
// ─────────────────────────────────────────────────────────────
//  components/ContentFeeds.tsx
//  Hiển thị Khai Thị mới nhất và Chuyện Phật Pháp từ server thật
//  Đã gỡ bỏ mock data (dharmaTalks)
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon, BookIcon } from "@/components/icons/ZenIcons";
import { getCategoriesClient } from "@/lib/api/categories-client";
import type { Category, BlogPost } from "@/types/cms";
import { BookOpen, Clock } from "lucide-react";
import { getCmsMediaUrl } from "@/lib/cms";

type CommunityStory = {
  id: string;
  documentId: string;
  slug: string;
  title: string;
  createdAt: string;
  publishedAt?: string;
  type?: string;
  content?: string;
  cover_image?: { url?: string };
  author_avatar?: string;
  author_name?: string;
  author_country?: string;
};

function formatDate(value?: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("vi-VN");
}

function toPlainPreview(html?: string) {
  if (!html) return "Nhấn để xem chi tiết câu chuyện...";
  const text = html.replace(/<[^>]*>/g, "").trim();
  return `${text.substring(0, 220)}${text.length > 220 ? "..." : ""}`;
}

const ContentFeeds = () => {
  const [danhMuc, setDanhMuc] = useState<Category[]>([]);
  const [baiKhaiThi, setBaiKhaiThi] = useState<BlogPost[]>([]);
  const [chuyenPhapBao, setChuyenPhapBao] = useState<CommunityStory[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [dangTaiBaiViet, setDangTaiBaiViet] = useState(true);

  useEffect(() => {
    // Tải danh mục khai thị
    getCategoriesClient()
      .then(ds => setDanhMuc(ds.slice(0, 8)))
      .catch(() => null);

    // Tải bài khai thị mới nhất (4 bài) từ API blog
    fetch('/api/blog-posts?pageSize=4')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.data) {
          setBaiKhaiThi(data.data as BlogPost[])
        }
      })
      .catch(() => null)
      .finally(() => {
        setDangTaiBaiViet(false)
      })

    // Tải chuyện Phật pháp mới nhất (1 bài) từ API cộng đồng
    fetch('/api/community-posts?pageSize=1')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.data) {
          setChuyenPhapBao(data.data)
        }
      })
      .catch(() => null)
      .finally(() => {
        setDangTai(false)
      })
  }, []);

  return (
    <section className="section-shell">
      <div className="section-frame">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">

          {/* ── Cột trái (8/12) ── */}
          <div className="space-y-20 lg:col-span-8">

            {/* Khai Thị Mới Nhất */}
            <div>
              <div className="mb-8 flex items-end justify-between gap-6">
                <div className="space-y-1">
                  <p className="section-kicker">Kho Nội Dung</p>
                  <h2 className="ant-title text-3xl text-foreground">Khai Thị Mới Nhất</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">Lời vàng ý ngọc từ Sư Phụ, cập nhật theo nhịp đọc hằng ngày.</p>
                </div>
                <Link href="/blog" className="section-link shrink-0">
                  Xem tất cả <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>

              {dangTaiBaiViet ? (
                // Skeleton
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="panel-shell-muted animate-pulse p-5">
                      <div className="mb-3 h-4 w-1/3 rounded bg-secondary" />
                      <div className="mb-2 h-5 w-full rounded bg-secondary" />
                      <div className="h-3 w-4/5 rounded bg-secondary" />
                    </div>
                  ))}
                </div>
              ) : baiKhaiThi.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {baiKhaiThi.map((bai, i) => (
                    <motion.div
                      key={bai.documentId}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        href={`/blog/${bai.slug}`}
                        className="panel-shell panel-hover card-stack group/item block h-full gap-5 p-5"
                      >
                        <div className="flex items-start gap-4">
                          <div className="icon-shell mt-0.5 size-10 shrink-0">
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1 space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                              {bai.categories?.[0] && (
                                <span className="card-eyebrow">
                                  {bai.categories[0].name}
                                </span>
                              )}
                              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {formatDate(bai.publishedAt || bai.createdAt)}
                              </span>
                            </div>
                            <h4 className="ant-title line-clamp-2 text-base leading-snug text-foreground transition-colors duration-200 group-hover/item:text-gold-dim">
                              {bai.title}
                            </h4>
                            <div className="card-meta pt-0 text-foreground">
                              Đọc tiếp
                              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover/item:translate-x-1" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                // Fallback: link đến trang blog
                <div className="rounded-xl border border-dashed border-border/50 py-12 text-center text-muted-foreground">
                  <p className="mb-4 text-sm italic">Chưa có bài khai thị nào được đăng tải</p>
                  <Link href="/blog" className="text-sm font-medium text-gold-dim hover:underline">
                    Đến trang Khai Thị →
                  </Link>
                </div>
              )}
            </div>

            {/* Chuyện Phật Pháp */}
            <div>
              <div className="mb-8 flex items-end justify-between gap-6">
                <div className="space-y-1">
                  <p className="section-kicker">Cộng Đồng</p>
                  <h2 className="ant-title text-3xl text-foreground">Chuyện Phật Pháp</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">Những ghi chép chứng nghiệm và chia sẻ chân thành từ đồng tu.</p>
                </div>
                <Link href="/shares" className="section-link shrink-0">
                  Xem tất cả <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>

              {dangTai ? (
                <div className="panel-shell-muted animate-pulse p-8">
                  <div className="mx-auto mb-4 h-4 w-1/4 rounded bg-secondary" />
                  <div className="h-20 w-full rounded bg-secondary" />
                </div>
              ) : chuyenPhapBao.length > 0 ? (
                chuyenPhapBao.map((bai) => (
                  <motion.div
                    key={bai.documentId}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <Link
                      href={`/shares?post=${encodeURIComponent(bai.slug)}`}
                      className="panel-shell panel-hover group/share block p-6 md:p-8"
                    >
                      <div className="flex flex-col gap-6 md:flex-row">
                        {bai.cover_image && (
                          <div className="h-32 w-full shrink-0 overflow-hidden rounded-xl md:w-48">
                            <Image
                              src={getCmsMediaUrl(bai.cover_image.url) || ''}
                              alt={bai.title}
                              width={200}
                              height={150}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover/share:scale-[1.03]"
                            />
                          </div>
                        )}
                        <div className="card-stack flex-1 gap-4">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="card-eyebrow">
                              {bai.type || 'Câu chuyện'}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {formatDate(bai.publishedAt || bai.createdAt)}
                            </span>
                          </div>
                          <h3 className="card-title text-[1.35rem] transition-colors duration-200 group-hover/share:text-gold-dim">
                            {bai.title}
                          </h3>
                          <p className="card-copy line-clamp-3">
                            {toPlainPreview(bai.content)}
                          </p>
                          <div className="card-meta border-t border-border/70 pt-4">
                            <div className="flex size-7 items-center justify-center overflow-hidden rounded-full bg-secondary">
                              {bai.author_avatar ? (
                                <Image src={getCmsMediaUrl(bai.author_avatar) || ''} alt={bai.author_name || "Tác giả"} width={24} height={24} />
                              ) : (
                                <span className="text-[10px] font-bold text-gold-dim">{bai.author_name?.charAt(0)}</span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">{bai.author_name || "Ẩn danh"}</span>
                            <span className="text-[10px] text-muted-foreground/50">•</span>
                            <span className="text-[10px] text-muted-foreground">{bai.author_country || 'Đồng tu'}</span>
                            <span className="ml-auto inline-flex items-center gap-2 text-sm font-medium text-foreground">
                              Xem bài
                              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover/share:translate-x-1" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="panel-shell p-8 text-center">
                  <BookIcon className="mx-auto mb-3 h-8 w-8 text-foreground/28" />
                  <p className="text-sm italic text-muted-foreground">
                    Những câu chuyện chứng nghiệm từ cộng đồng đồng tu đang được tổng hợp.
                  </p>
                  <Link href="/shares" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gold-dim hover:underline">
                    Đến Diễn Đàn <ArrowRightIcon className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>


          {/* ── Sidebar (4/12) ── */}
          <aside className="space-y-8 lg:col-span-4">

            {/* Danh Mục Tra Cứu  */}
            <div className="panel-shell overflow-hidden">
              <div className="border-b border-border/70 px-6 py-4 bg-secondary/18">
                <h3 className="flex items-center gap-2 font-display text-lg text-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-foreground/45" />
                  Danh Mục Tra Cứu
                </h3>
              </div>
              <div className="p-3">
                {danhMuc.length === 0 ? (
                  <div className="space-y-2 p-3">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-9 animate-pulse rounded-md bg-secondary" />
                    ))}
                  </div>
                ) : (
                  <nav className="space-y-1 max-h-[700px] overflow-y-auto custom-scrollbar pr-1">
                    {danhMuc.map((dm, i) => (
                      <Link
                        key={dm.id}
                        href={`/category/${dm.slug}`}
                        className="group flex items-center justify-between rounded-md px-4 py-2.5 transition-colors duration-200 hover:bg-secondary/45"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-muted-foreground font-mono opacity-50">
                                {(i + 1).toString().padStart(2, '0')}
                          </span>
                          <span className="text-sm text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
                            {dm.name}
                          </span>
                        </div>
                        <ArrowRightIcon className="h-3 w-3 text-foreground/45 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
                      </Link>
                    ))}
                  </nav>
                )}
                <div className="mt-4 border-t border-border/40 p-4">
                  <Link href="/blog" className="section-link w-full justify-center text-xs">
                    Xem tất cả bài viết <ArrowRightIcon className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default ContentFeeds;
