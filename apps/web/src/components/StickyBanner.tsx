'use client'

import { useState } from "react";
import { motion } from "framer-motion";
import { CloseIcon, BookIcon } from "@/components/icons/ZenIcons";
import Link from "next/link";
import type { StickyBannerConfig } from "@/types/strapi";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import RegisterForm from "./RegisterForm";

interface StickyBannerProps {
  config?: StickyBannerConfig | null
}

const StickyBanner = ({ config }: StickyBannerProps) => {
  const [visible, setVisible] = useState(true);
  const [open, setOpen] = useState(false);

  // Nếu config bảo disabled hoặc không có config → ẩn
  if (!visible || (config && !config.enabled)) return null;

  const title = config?.title ?? "Thỉnh Kinh Văn & Máy Niệm Kinh Miễn Phí";
  const subtitle = config?.subtitle ?? "Gieo duyên miễn phí: Máy niệm kinh, Tranh Phật, Kinh văn";
  const buttonText = config?.buttonText ?? "Đăng ký ngay";

  return (
    <>
      <motion.div
        animate={visible ? { y: 0, opacity: 1 } : { y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-3 md:p-0"
      >
        <div className="md:mx-0 mx-2 mb-2 md:mb-0 rounded-xl md:rounded-none border border-gold/20 md:border-t md:border-x-0 md:border-b-0 bg-card/80 backdrop-blur-xl shadow-elevated">
          <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="hidden sm:flex w-10 h-10 rounded-lg bg-gold/10 items-center justify-center shrink-0">
                <BookIcon className="w-5 h-5 text-gold" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {title}
                </p>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {subtitle}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <motion.button
                    animate={{ boxShadow: ["0 0 0 0 hsl(var(--gold) / 0)", "0 0 0 8px hsl(var(--gold) / 0.15)", "0 0 0 0 hsl(var(--gold) / 0)"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap"
                  >
                    {buttonText}
                  </motion.button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl w-[calc(100vw-2rem)] p-0 overflow-hidden border-gold/20 bg-card/95 backdrop-blur-xl max-h-[85vh] flex flex-col">
                  <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar">
                    <div className="p-6 md:p-8">
                    <DialogHeader className="mb-6">
                      <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                          <BookIcon className="w-6 h-6 text-gold" />
                        </div>
                      </div>
                      <p className="text-gold text-[10px] font-bold tracking-widest uppercase text-center mb-1">Hoàn Toàn Miễn Phí</p>
                      <DialogTitle className="font-display text-2xl md:text-3xl text-center">
                        Đăng Ký Thỉnh <span className="gold-gradient-text">Pháp Bảo</span>
                      </DialogTitle>
                      <DialogDescription className="text-center text-muted-foreground text-xs px-4">
                        Nhận hướng dẫn tu tập và tài liệu Pháp Môn Tâm Linh (心灵法门) miễn phí từ Bồ Tát.
                      </DialogDescription>
                    </DialogHeader>

                    <RegisterForm />
                  </div>
                  </div>
                </DialogContent>
              </Dialog>

              <button
                onClick={() => setVisible(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Đóng"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default StickyBanner;
