'use client'

import { motion } from "framer-motion";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
export interface SearchCategoryItem {
  id: number | string;
  title: string;
  icon?: { key?: string | null; lucideName?: string | null; name?: string | null } | null;
  iconName?: string | null;
  link: string;
}
import { resolveLucideIcon } from "@/lib/ui-icons";

interface SearchDirectoryProps {
  categories: SearchCategoryItem[]
}

const SearchDirectory = ({ categories }: SearchDirectoryProps) => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Soft Background Gradients */}
      <div className="absolute inset-0 bg-background pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-muted-foreground text-xs font-medium tracking-widest uppercase mb-4 shadow-sm backdrop-blur-sm">
            <Search className="w-3.5 h-3.5 mr-2" />
            Khám Phá Phật Pháp
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
            Danh Mục <span className="gold-gradient-text tracking-tight">Tra Cứu</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg leading-relaxed font-light">
            Tìm kiếm lời khai thị theo chủ đề phù hợp với hoàn cảnh của bạn. Hơn 22 chuyên mục Phật học ứng dụng dễ hiểu.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
            >
              <Link
                href={cat.link}
                className="group relative flex items-center gap-4 p-5 rounded-2xl bg-card border border-border/50 hover:border-gold/30 hover:shadow-xl hover:shadow-gold/5 transition-all duration-300 overflow-hidden isolate"
              >
                {/* Hover Background Blob */}
                <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

                <div className="w-12 h-12 rounded-xl bg-secondary/80 group-hover:bg-gold/10 flex items-center justify-center shrink-0 transition-colors shadow-sm border border-transparent group-hover:border-gold/20">
                  {(() => { const Icon = resolveLucideIcon(cat.icon ?? cat.iconName, Search); return <Icon className="w-5 h-5 text-muted-foreground group-hover:text-gold transition-colors stroke-[1.5]" />; })()}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-foreground group-hover:text-gold transition-colors truncate">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-muted-foreground/70 mt-0.5 truncate flex items-center gap-1 group-hover:text-gold/70 transition-colors">
                    Tra cứu nội dung <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 group-hover:text-gold" />
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-foreground text-background hover:bg-gold hover:text-black hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all duration-300 font-semibold text-sm group"
          >
            <Search className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Tra Cứu Toàn Bộ Kho Khai Thị
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default SearchDirectory;
