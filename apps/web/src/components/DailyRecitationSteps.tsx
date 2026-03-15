'use client'

import { motion } from "framer-motion";
import { BookOpen, Flame, HeartHandshake, ScrollText, CheckCircle2, Download, ShieldCheck, HeartPulse, Sparkles, Sprout, Wind, Link } from "lucide-react";

// Định nghĩa các bước
const steps = [
  {
    id: 1,
    title: "Tịnh Khẩu Nghiệp Chân Ngôn",
    icon: Wind,
    count: "7 Biến",
    content: "Chuẩn bị tâm thanh tịnh, niệm Tịnh Khẩu Nghiệp Chân Ngôn 7 lần để bắt đầu công khóa.",
    color: "text-sky-400",
    bg: "bg-sky-400/10",
  },
  {
    id: 2,
    title: "Thắp Hương (Hoặc Tâm Hương)",
    icon: Flame,
    content: "• Có bàn thờ Phật Pháp Môn Tâm Linh: Thắp hương theo quy trình lễ Phật.\n• Không có bàn thờ: Chắp tay thắp tâm hương.\n\nLưu ý quan trọng: KHÔNG quỳ hay đốt nhang nếu bàn thờ không đúng Pháp Môn Tâm Linh.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    id: 3,
    title: "Cảm Tạ Quán Thế Âm Bồ Tát",
    icon: HeartHandshake,
    count: "3 Biến",
    content: "Đọc: 'Nam mô Đại Từ Đại Bi Cứu Khổ Cứu Nạn Quảng Đại Linh Cảm Quán Thế Âm Bồ Tát Ma Ha Tát'",
    color: "text-rose-400",
    bg: "bg-rose-400/10",
  },
  {
    id: 4,
    title: "Niệm Kinh Văn & Chú Nhỏ",
    icon: ScrollText,
    content: "Đây là phần cốt lõi của bài tập hàng ngày. Thông thường bắt đầu bằng Chú Đại Bi.",
    color: "text-gold",
    bg: "bg-gold/10",
    subItems: [
      {
        name: "Chú Đại Bi (Thiên Thủ Thiên Nhãn...)",
        count: "3-7 Biến",
        desc: "Thỉnh cầu Bồ Tát phù hộ cho con (Tên) thân thể khỏe mạnh, tăng cường công lực.",
        icon: ShieldCheck,
      },
      {
        name: "Tâm Kinh (Bát Nhã Ba La Mật Đa...)",
        count: "3-7 Biến",
        desc: "Thỉnh cầu Bồ Tát khai mở trí tuệ, bình tĩnh, tiêu trừ phiền não cho con (Tên).",
        icon: Sparkles,
      },
      {
        name: "Lễ Phật Đại Sám Hối Văn",
        count: "1-7 Biến",
        desc: "Thỉnh cầu Bồ Tát giúp con sám hối và tiêu trừ nghiệp chướng, khai mở trí tuệ.",
        icon: HeartPulse,
      },
      {
        name: "Chú Vãng Sanh",
        count: "21, 27, 49 Biến",
        desc: "Giúp siêu độ tiểu vong linh vì mình mà chết, vãng sinh Tịnh Độ.",
        icon: Sprout,
      },
      {
        name: "Giải Kết Chú",
        count: "21, 27, 49 Biến",
        desc: "Hóa giải ác duyên với người thân, bạn bè, đối tác hoặc đồng nghiệp.",
        icon: Link,
      },
    ]
  },
  {
    id: 5,
    title: "Bổ Khuyết Chân Ngôn",
    icon: BookOpen,
    count: "3 hoặc 7 Biến",
    content: "Niệm sau khi hoàn thành toàn bộ Kinh Văn Bài Tập (không cần niệm sau mỗi loại kinh).",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    id: 6,
    title: "Thất Phật Diệt Tội Chân Ngôn",
    icon: Sparkles,
    count: "3 Biến",
    content: "Diệt trừ tội lỗi, giúp tâm hồn thanh tịnh sau khi niệm kinh.",
    color: "text-indigo-400",
    bg: "bg-indigo-400/10",
  },
  {
    id: 7,
    title: "Kết Thúc & Cảm Tạ",
    icon: CheckCircle2,
    content: "Cảm tạ 'Nam Mô Đại Từ Đại Bi Cứu Khổ Cứu Nạn Quảng Đại Linh Cảm Quán Thế Âm Bồ Tát Ma Ha Tát' phù hộ cho con (Tên)",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
];

const DailyRecitationSteps = () => {
  return (
    <section className=" relative overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-gold/5 rounded-full blur-[100px] -translate-x-1/2" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] translate-x-1/2" />
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 mb-6 text-gold text-xs font-semibold tracking-widest uppercase">
            <ScrollText className="w-4 h-4" /> 每日功課步驟 (初學者)
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6 leading-tight">
            Các Bước Niệm Kinh <br />
            <span className="gold-gradient-text">Bài Tập Hàng Ngày</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Dành cho người mới bắt đầu. Hãy tuân thủ đúng thứ tự và số biến để việc niệm kinh đạt được công đức và sự thanh tịnh tốt nhất.
          </p>
        </motion.div>

        {/* Timeline Steps */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-6 md:left-12 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/30 to-transparent" />

          <div className="space-y-12 md:space-y-16">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative flex items-start group"
              >
                {/* Connector Node */}
                <div className="flex-shrink-0 w-12 text-center md:w-24 flex items-center justify-center relative z-10">
                  <div className={`w-12 h-12 rounded-2xl ${step.bg} border-2 border-background flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 ring-4 ring-background`}>
                    <step.icon className={`w-6 h-6 ${step.color}`} strokeWidth={1.5} />
                  </div>
                </div>

                {/* Content Card */}
                <div className="ml-4 md:ml-8 flex-1">
                  <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 md:p-8 hover:border-gold/30 hover:bg-card/80 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-gold/5 relative overflow-hidden">

                    <div className="relative z-10">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="text-xl md:text-2xl font-display text-foreground group-hover:text-gold transition-colors">
                          {step.title}
                        </h3>
                        {step.count && (
                          <span className="px-3 py-1 rounded-full bg-secondary text-xs font-mono font-medium text-muted-foreground border border-border/50">
                            {step.count}
                          </span>
                        )}
                      </div>

                      <div className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap mb-4">
                        {step.content}
                      </div>

                      {/* Sub Items (Lõi Kinh Văn) */}
                      {step.subItems && (
                        <div className="mt-6 space-y-4">
                          {step.subItems.map((sub, i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-xl bg-background/50 border border-border/50 hover:border-gold/20 transition-colors">
                              <div className={`mt-1 w-8 h-8 rounded-full ${step.bg} flex items-center justify-center shrink-0`}>
                                <sub.icon className={`w-4 h-4 ${step.color}`} strokeWidth={2} />
                              </div>
                              <div>
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <h4 className="font-medium text-foreground text-sm">{sub.name}</h4>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20">
                                    {sub.count}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed italic border-l-2 border-border/50 pl-3 py-1">
                                  {sub.desc}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer Note & Download */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 p-8 rounded-3xl bg-gradient-to-br from-gold/10 via-background to-secondary/30 border border-gold/20 text-center relative overflow-hidden"
        >
          {/* Subtle pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }} />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mb-6 text-gold shrink-0 ring-4 ring-gold/10">
              <Download className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <h4 className="text-2xl font-display text-foreground mb-3">Tài Liệu Hướng Dẫn Kèm Theo</h4>
            <p className="text-muted-foreground text-sm mb-8 max-w-lg">
              Bạn có thể tải xuống bản PDF &quot;Hướng dẫn niệm kinh bài tập hàng ngày&quot; để thuận tiện xem và thực hành mỗi ngày mọi lúc mọi nơi.
            </p>
            <button className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gold text-black font-semibold tracking-wide hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:-translate-y-1 transition-all duration-300">
              <Download className="w-5 h-5" />
              Tải Xuống Bản In (PDF)
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DailyRecitationSteps;
