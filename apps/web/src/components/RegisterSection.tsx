'use client'

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const RegisterSection = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", city: "", note: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Kết nối API thật khi có backend
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <section className="py-20 bg-secondary/20 relative overflow-hidden">
      {/* Nền trang trí */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-gold/5 -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-amber-500/5 translate-x-1/3 translate-y-1/3 blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9 text-gold" stroke="currentColor" strokeWidth="1.2">
                  <path d="M20 32C20 32 8 22 8 14a12 12 0 0 1 12-12 12 12 0 0 1 12 12c0 8-12 18-12 18z" strokeLinecap="round" />
                  <path d="M20 8v16M14 16c2-3 6-4 6-4s4 1 6 4" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <p className="text-gold text-sm font-medium tracking-widest uppercase mb-3">Hoàn Toàn Miễn Phí</p>
            <h2 className="font-display text-3xl md:text-5xl text-foreground mb-4 leading-tight">
              Đăng Ký Thỉnh{" "}
              <span className="gold-gradient-text">Pháp Bảo</span>
            </h2>
            <div className="zen-divider w-32 mx-auto mb-5" />
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Đăng ký nhận hướng dẫn tu tập và tài liệu Pháp Môn Tâm Linh (心灵法门). Hoàn toàn miễn phí, gieo duyên lành cùng Bồ Tát.
            </p>
          </motion.div>

          {/* Card form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-gold/20 bg-card/80 backdrop-blur-sm p-8 md:p-12 shadow-elevated"
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-10 h-10 text-green-400">
                      <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="font-display text-2xl text-foreground mb-3">Đăng Ký Thành Công!</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
                    Chúng tôi sẽ liên hệ với bạn sớm nhất để hướng dẫn cách nhận Pháp Bảo. Nguyện Quán Thế Âm Bồ Tát gia hộ cho bạn và gia đình.
                  </p>
                  <p className="mt-4 text-gold font-display text-xl">南無觀世音菩薩</p>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      { name: "name", label: "Họ Tên", placeholder: "Nhập họ tên của bạn", required: true, type: "text" },
                      { name: "phone", label: "Số Điện Thoại / Zalo", placeholder: "Zalo / Viber hoặc số thường", required: true, type: "tel" },
                      { name: "city", label: "Tỉnh / Thành Phố", placeholder: "Ví dụ: TP. Hồ Chí Minh", required: false, type: "text" },
                      { name: "note", label: "Ghi Chú / Cầu Nguyện", placeholder: "Điều bạn muốn cầu nguyện...", required: false, type: "text" },
                    ].map((field) => (
                      <div key={field.name} className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          {field.label} {field.required && <span className="text-gold">*</span>}
                        </label>
                        <input
                          type={field.type}
                          name={field.name}
                          value={form[field.name as keyof typeof form]}
                          onChange={handleChange}
                          required={field.required}
                          placeholder={field.placeholder}
                          className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/40 transition-all"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Danh sách pháp bảo */}
                  <div className="p-4 rounded-xl bg-gold/5 border border-gold/15">
                    <p className="text-sm font-medium text-foreground mb-3">Pháp Bảo Bạn Sẽ Nhận:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        "Hướng dẫn tu tập 5 Đại Pháp Bảo",
                        "Kinh văn thường dụng (PDF)",
                        "Audio niệm Chú Đại Bi & Tâm Kinh",
                        "12 tập Bạch Thoại Phật Pháp",
                        "Mẫu Ngôi Nhà Nhỏ",
                        "Hỗ trợ hướng dẫn qua Zalo",
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                          <span className="text-xs text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Nút submit */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-medium text-base hover:bg-primary/90 transition-all duration-300 shadow-gold disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                        </svg>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        Đăng Ký Nhận Pháp Bảo Miễn Phí
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                          <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </>
                    )}
                  </motion.button>

                  <p className="text-center text-xs text-muted-foreground/60">
                    Hoàn toàn miễn phí. Không có điều kiện ràng buộc. Tôn trọng quyền riêng tư của bạn.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Mạng xã hội */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-4 mt-8"
          >
            {[
              { label: "YouTube", href: "https://youtube.com/@phapmon.tamlinh?si=EkMtyo76fes5pJoQ", color: "text-red-500" },
              { label: "Facebook Group", href: "https://www.facebook.com/groups/1772491517480555/?ref=share", color: "text-blue-400" },
              { label: "Zalo Group", href: "https://zalo.me/g/sjajsj328", color: "text-sky-400" },
              { label: "TikTok", href: "https://www.tiktok.com/@pmtl_0983885116", color: "text-pink-400" },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 text-xs ${s.color} hover:opacity-80 transition-opacity font-medium`}
              >
                ↗ {s.label}
              </a>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default RegisterSection;
