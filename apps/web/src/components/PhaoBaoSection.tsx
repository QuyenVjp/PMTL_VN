'use client'

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PhapBaoItem } from "@/types/strapi";
import { resolveIconToken } from "@/lib/ui-icons";

// SVG icons — consistent with project style
const svgIcons: Record<string, React.ReactNode> = {
  book: (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 6h18a2 2 0 0 1 2 2v22a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" strokeLinecap="round" />
      <path d="M12 12h12M12 17h12M12 22h8" strokeLinecap="round" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 6l2.4 7.2H30l-6.2 4.5 2.4 7.2L20 18.5l-6.2 5.4 2.4-7.2L10 13.2h7.6L20 6z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  leaf: (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 30c-6-4-10-9-10-14a10 10 0 0 1 20 0c0 5-4 10-10 14z" strokeLinecap="round" />
    </svg>
  ),
  flame: (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 6c0 0-8 6-8 14s3.6 12 8 12 8-4 8-12c0-8-8-14-8-14z" strokeLinecap="round" />
    </svg>
  ),
  house: (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 10c0 0-8 5-8 11s8 9 8 9 8-3 8-9-8-11-8-11z" strokeLinecap="round" />
      <path d="M20 17v6M17 22l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

interface PhaoBaoSectionProps {
  items: PhapBaoItem[]
}

const PhaoBaoSection = ({ items }: PhaoBaoSectionProps) => {
  return (
    <section className="section-shell">
      <div className="section-frame">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-intro-centered"
        >
          <p className="section-kicker">心灵法门 五大法宝</p>
          <h2 className="section-title">
            5 Đại Pháp Bảo
          </h2>
          <p className="section-copy mx-auto">
            Năm Đại Pháp Bảo do Quán Thế Âm Bồ Tát truyền thụ — con đường hóa giải nghiệp chướng, tích đức hồi hướng và khai mở trí tuệ.
          </p>
        </motion.div>

        {/* Cards Grid - 3 top, 2 bottom centered */}
        <div className="flex flex-wrap justify-center gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className={`w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] `}
            >
              <Link href={item.link} className="block h-full">
                <div className="panel-shell panel-hover card-stack h-full gap-5 p-6 group">
                  {/* Icon */}
                  <div className="icon-shell size-12">
                    {svgIcons[String(resolveIconToken(item.icon) ?? item.iconType ?? '').toLowerCase()] ?? svgIcons.book}
                  </div>

                  {/* Title + Chinese */}
                  <div className="space-y-2">
                    <p className="card-eyebrow">{item.chinese}</p>
                    <h3 className="card-title transition-colors duration-200 group-hover:text-gold-dim">
                      {item.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="card-copy">
                    {item.description}
                  </p>

                  {/* CTA Link */}
                  <span className="card-meta text-foreground transition-colors duration-200 group-hover:text-gold-dim">
                    Tìm hiểu thêm
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PhaoBaoSection;
