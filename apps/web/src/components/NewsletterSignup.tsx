'use client'

import { useState } from "react";
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const digestItems = [
  "Lịch pháp sự và thời khóa cần lưu ý",
  "Bài giảng mới được chọn lọc",
  "Liên kết nhanh tới thư viện và radio",
];

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail("");
  };

  return (
    <section className="section-shell">
      <div className="section-frame">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="panel-shell-strong p-8 md:p-12"
        >
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="space-y-5">
              <p className="section-kicker">
                Pháp Âm Mỗi Tuần
              </p>
              <div className="space-y-4">
                <h2 className="section-title max-w-2xl">
                  Nhận một bản tổng hợp ngắn, đủ để theo kịp nhịp tu học trong tuần.
                </h2>
                <p className="section-copy">
                  Không phải newsletter kiểu marketing. Đây là một bản nhắc nhẹ, giúp anh theo dõi lịch,
                  bài giảng mới và các tài nguyên cần mở lại khi cần.
                </p>
              </div>
              <div className="zen-divider max-w-sm" />
              <ul className="grid gap-3 text-sm text-foreground md:grid-cols-3 md:gap-4">
                {digestItems.map((item, index) => (
                  <li key={item} className="panel-shell-muted rounded-xl px-4 py-4">
                    <span className="card-eyebrow block">
                      Mục 0{index + 1}
                    </span>
                    <span className="mt-2 block leading-6 text-foreground/88">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel-shell bg-background/70 p-6 md:p-7">
              <p className="ant-label text-muted-foreground">
                Đăng ký nhận bản tổng hợp
              </p>
              <div className="mt-4 space-y-4">
                {submitted ? (
                  <Alert className="rounded-xl border-emerald-500/20 bg-emerald-500/10">
                    <AlertTitle>Đã ghi nhận email</AlertTitle>
                    <AlertDescription>
                      Khi hệ thống gửi bản tổng hợp đầu tiên, email xác nhận sẽ xuất hiện trước.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@domain.com"
                      required
                      className="h-12 rounded-md border-border bg-card"
                    />
                    <Button type="submit" variant="default" size="lg" className="w-full rounded-md">
                      Nhận bản tổng hợp
                    </Button>
                  </form>
                )}
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Mỗi tuần một lần. Không gửi dồn, không dùng cho mục đích khác.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSignup;
