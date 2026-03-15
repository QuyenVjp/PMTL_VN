'use client'

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RegisterFormProps {
  onSuccess?: () => void;
}

const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", city: "", note: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Connect to real API when backend is ready
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitted(true);
    setLoading(false);
    if (onSuccess) onSuccess();
  };

  return (
    <div className="w-full">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "name", label: "Họ Tên", placeholder: "Nhập họ tên của bạn", required: true, type: "text" },
                { name: "phone", label: "Số Điện Thoại / Zalo", placeholder: "Zalo / Viber hoặc số thường", required: true, type: "tel" },
                { name: "city", label: "Tỉnh / Thành Phố", placeholder: "Ví dụ: TP. Hồ Chí Minh", required: false, type: "text" },
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
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/40 transition-all"
                  />
                </div>
              ))}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  Ghi Chú / Cầu Nguyện
                </label>
                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  placeholder="Điều bạn muốn cầu nguyện..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/40 transition-all resize-none"
                />
              </div>
            </div>

            {/* List of items */}
            <div className="p-4 rounded-xl bg-gold/5 border border-gold/15">
              <p className="text-xs font-medium text-foreground mb-3 uppercase tracking-wider">Pháp Bảo Bạn Sẽ Nhận:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
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
                    <span className="text-[11px] text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all duration-300 shadow-gold disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                <>
                  Đăng Ký Nhận Pháp Bảo Miễn Phí
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </motion.button>

            <p className="text-center text-[10px] text-muted-foreground/60 leading-tight">
              Hoàn toàn miễn phí. Không có điều kiện ràng buộc. Tôn trọng quyền riêng tư.
            </p>

            {/* Social Links inside Form footer */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 pt-2 border-t border-border/50">
              {[
                { label: "YouTube", href: "https://youtube.com/@phapmon.tamlinh?si=EkMtyo76fes5pJoQ", color: "text-red-500" },
                { label: "Facebook", href: "https://www.facebook.com/groups/1772491517480555/?ref=share", color: "text-blue-400" },
                { label: "Zalo Group", href: "https://zalo.me/g/sjajsj328", color: "text-sky-400" },
                { label: "TikTok", href: "https://www.tiktok.com/@pmtl_0983885116", color: "text-pink-400" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 text-[10px] ${s.color} hover:opacity-80 transition-opacity font-medium`}
                >
                  ↗ {s.label}
                </a>
              ))}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RegisterForm;
