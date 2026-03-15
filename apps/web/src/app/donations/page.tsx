'use client';

import { useState } from "react";
import { motion } from "framer-motion";

import { HeartIcon } from "@/components/icons/ZenIcons";

const ShieldIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GlobeIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const ChartIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <line x1="12" y1="2" x2="12" y2="22" />
    <path d="M17 5h4v14h-4" />
    <path d="M3 9h4v10H3" />
  </svg>
);

const HandshakeIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M17 12h4v8h-7V9M7 12H3v8h7V9M9 9L7 7M15 9l2-2M9 9l2 2M15 9l-2 2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BookIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const expenseCategories = [
  { label: "Hoạt động in ấn kinh sách", percent: 35, color: "bg-amber-500" },
  { label: "Website & công nghệ", percent: 20, color: "bg-blue-500" },
  { label: "Phóng sinh tập thể", percent: 18, color: "bg-green-500" },
  { label: "Pháp hội & sự kiện", percent: 15, color: "bg-purple-500" },
  { label: "Vận hành Quán Âm Đường", percent: 12, color: "bg-red-500" },
];

const transparencyItems = [
  { icon: "chart", title: "Báo Cáo Tài Chính Công Khai", description: "Mọi khoản thu chi được công khai minh bạch, kiểm toán bởi đội ngũ tình nguyện viên." },
  { icon: "handshake", title: "100% Tình Nguyện", description: "Tất cả nhân sự hoạt động hoàn toàn tình nguyện, không lương, không lợi nhuận." },
  { icon: "book", title: "Kinh Sách Miễn Phí", description: "Toàn bộ kinh sách, tài liệu tu học đều phát hành miễn phí — không bao giờ thu phí." },
  { icon: "globe", title: "Phi Lợi Nhuận Quốc Tế", description: "Đăng ký tổ chức phi lợi nhuận tại Úc, và hoạt động thiện nguyện tại 30+ quốc gia." },
];

const donationTiers = [
  { amount: "Một Tượng Phật", description: "Tượng Phật Quán Thế Âm hoặc Bồ Tát — để sử dụng tại Quán Âm Đường.", highlight: false },
  { amount: "Cuốn Kinh Sách", description: "In sắc nét, bìa cứng — phát miễn phí cho những ai đến tu học.", highlight: false },
  { amount: "Bộ Hương & Nến", description: "Hương thơm, nến cúng — dùng hàng ngày cho bàn thờ tại Quán Âm Đường.", highlight: true },
  { amount: "Tấm Ngôi Nhà Nhỏ", description: "Giấy vàng in kinh sẵn — để những đồng tu niệm kinh tại nhà.", highlight: false },
];

const faq = [
  { q: "Có bắt buộc đóng góp không?", a: "Không. Pháp Môn Tâm Linh hoàn toàn miễn phí. Đóng góp là tự nguyện và tùy tâm. Bạn không cần đóng góp gì để tu học hay nhận tài liệu." },
  { q: "Tại sao không nhận tiền trực tiếp?", a: "Để tuân thủ nguyên tắc 'liễm tài' — không lợi dụng tiền bạc. Chúng tôi chỉ chấp nhận các phật cụ cụ thể (tượng, kinh sách, hương cúng) để phục vụ hoạt động tu học, không bao giờ tiền mặt hay chuyển khoản." },
  { q: "Tôi có thể đóng góp bằng cách nào?", a: "Để hỗ trợ, bạn có thể mua các phật cụ (tượng Phật, kinh sách, hương, v.v.) và gửi cho admin qua Zalo. Hoặc bạn có thể đóng góp bằng thời gian: làm tình nguyện viên, phiên dịch, chia sẻ Phật pháp với người thân." },
  { q: "Ngoài phật cụ, tôi có thể đóng góp gì?", a: "Rất nhiều cách: tình nguyện tại Quán Âm Đường, phiên dịch kinh sách, hỗ trợ kỹ thuật website, chia sẻ Phật pháp với bạn bè, hoặc đơn giản niệm kinh hồi hướng cho chúng sinh." },
];

export default function DonationsPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <>
      <main className="py-16">
        <div className="container mx-auto px-6">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center mb-12">
            <p className="text-gold text-sm font-medium tracking-widest uppercase mb-3">Liễm Tài — Không Lợi Dụng Tiền</p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">Hộ Trì Phật Pháp</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              &ldquo;不为经济目的，一切免费&rdquo; — Mọi thứ miễn phí. Chúng tôi <strong className="text-foreground">không nhận tiền</strong> — chỉ chấp nhận các phật cụ để hỗ trợ hoạt động tu học.
            </p>
          </motion.div>

          {/* Important Banner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-10 p-6 rounded-2xl bg-gradient-to-r from-gold/5 to-amber-500/5 border border-gold/10"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                <ShieldIcon className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h2 className="text-sm font-medium text-foreground mb-1"> Không Nhận Tiền — Chỉ Phật Cụ</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Theo nguyên tắc <strong>&ldquo;Liễm Tài&rdquo;</strong> (không lợi dụng tiền bạc), Pháp Môn Tâm Linh <strong className="text-foreground">hoàn toàn không nhận tiền</strong> từ bất kỳ ai.
                  Nếu bạn muốn hỗ trợ, vui lòng <strong>mua các phật cụ</strong> (tượng Phật, kinh sách, hương, v.v.) và gửi cho admin qua Zalo.
                  Mọi hoạt động tu học, tư vấn, tài liệu đều <strong className="text-foreground">hoàn toàn miễn phí</strong> — không có ngoại lệ.
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Transparency */}
              <section>
                <h2 className="font-display text-xl text-foreground mb-5 flex items-center gap-2">
                  <GlobeIcon className="w-5 h-5 text-gold" />
                  Nguyên Tắc Hoạt Động
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {transparencyItems.map((item) => {
                    const getIcon = () => {
                      const iconProps = { className: "w-5 h-5 text-gold" };
                      switch (item.icon) {
                        case "chart": return <ChartIcon {...iconProps} />;
                        case "handshake": return <HandshakeIcon {...iconProps} />;
                        case "book": return <BookIcon {...iconProps} />;
                        case "globe": return <GlobeIcon {...iconProps} />;
                        default: return <div className="w-5 h-5" />;
                      }
                    };
                    return (
                      <div key={item.title} className="p-4 rounded-xl bg-card border border-border">
                        <div className="mb-2">{getIcon()}</div>
                        <h3 className="text-sm font-medium text-foreground mb-1">{item.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Expense Breakdown */}
              <section>
                <h2 className="font-display text-xl text-foreground mb-5">Chi Phí Hoạt Động</h2>
                <div className="p-5 rounded-xl bg-card border border-border">
                  <div className="flex h-4 rounded-full overflow-hidden mb-4">
                    {expenseCategories.map((cat) => (
                      <div key={cat.label} className={`${cat.color} transition-all`} style={{ width: `${cat.percent}%` }} />
                    ))}
                  </div>
                  <div className="space-y-2.5">
                    {expenseCategories.map((cat) => (
                      <div key={cat.label} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${cat.color} shrink-0`} />
                        <span className="text-xs text-muted-foreground flex-1">{cat.label}</span>
                        <span className="text-xs text-foreground font-medium">{cat.percent}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* FAQ */}
              <section>
                <h2 className="font-display text-xl text-foreground mb-5">Câu Hỏi Thường Gặp</h2>
                <div className="space-y-2">
                  {faq.map((item, i) => (
                    <div key={i} className="rounded-xl bg-card border border-border overflow-hidden">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                        className="w-full flex items-center justify-between p-4 text-left"
                      >
                        <span className="text-sm text-foreground font-medium">{item.q}</span>
                        <motion.span animate={{ rotate: expandedFaq === i ? 180 : 0 }} className="text-muted-foreground ml-2 shrink-0">
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </motion.span>
                      </button>
                      {expandedFaq === i && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pb-4 border-t border-border/50 pt-3">
                          <p className="text-xs text-muted-foreground leading-relaxed">{item.a}</p>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Donation Tiers */}
              <div className="p-5 rounded-xl bg-card border border-border">
                <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                  <HeartIcon className="w-4 h-4 text-gold" />
                  Các Phật Cụ Cần Hỗ Trợ
                </h3>
                <div className="space-y-3">
                  {donationTiers.map((tier) => (
                    <div
                      key={tier.amount}
                      className={`p-3 rounded-lg border ${tier.highlight ? "border-gold/30 bg-gold/5" : "border-border/50 bg-secondary/50"
                        }`}
                    >
                      <p className={`text-sm font-medium ${tier.highlight ? "text-gold" : "text-foreground"}`}>
                        {tier.amount}
                        {tier.highlight && <span className="ml-2 text-xs text-gold/60">★ Phổ biến</span>}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{tier.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phật Cụ Support */}
              <div className="p-5 rounded-xl bg-card border border-border">
                <h3 className="text-sm font-medium text-foreground mb-4">Hỗ Trợ Bằng Phật Cụ</h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-secondary/50 border border-gold/10">
                    <p className="text-xs text-foreground font-medium mb-2">Các Phật Cụ Cần Hỗ Trợ</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Nếu bạn muốn đóng góp, vui lòng <strong>mua trực tiếp các phật cụ</strong> sau đó gửi cho admin qua Zalo:
                    </p>
                    <ul className="mt-2.5 space-y-1.5 text-xs text-muted-foreground">
                      <li>• Tượng Phật Quán Thế Âm, Bồ Tát</li>
                      <li>• Hương, nến cúng bàn thờ</li>
                      <li>• Sách kinh (in sắc nét, bìa cứng)</li>
                      <li>• Vòng cơm kinh bằng gỗ tốt</li>
                      <li>• Tấm Ngôi Nhà Nhỏ (giấy vàng in sẵn)</li>
                      <li>• Túi vải, túi xách cho kinh sách</li>
                      <li>• Mặt dây tâm linh bằng cánh sen, đá quý</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-gold/5 border border-gold/20">
                    <p className="text-xs text-foreground font-medium mb-1.5">Liên Hệ Gửi Phật Cụ</p>
                    <a
                      href="https://zalo.me/g/sjajsj328"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-gold text-black rounded-lg text-xs font-medium hover:bg-gold/90 transition-colors"
                    >
                      Chat Zalo
                    </a>
                    <p className="text-xs text-muted-foreground mt-2">
                      Hãy nói với admin rõ loại phật cụ bạn muốn gửi, để không trùng lặp.
                    </p>
                  </div>
                </div>
              </div>

              {/* Volunteer */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-gold/5 to-amber-500/5 border border-gold/10">
                <h3 className="text-sm font-medium text-foreground mb-2">Những Cách Khác Để Hỗ Trợ</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  Không cần mua phật cụ — bạn có thể đóng góp bằng thời gian và năng lực:
                </p>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li>• Tình nguyện viên tại Quán Âm Đường</li>
                  <li>• Phiên dịch kinh sách sang các ngôn ngữ khác</li>
                  <li>• Hỗ trợ kỹ thuật website, design, lập trình</li>
                  <li>• Chia sẻ Phật pháp với người thân / bạn bè</li>
                  <li>• Niệm kinh hồi hướng cho chúng sinh</li>
                  <li>• Lên lịch phóng sinh tập thể, pháp hội</li>
                </ul>
                <a
                  href="https://zalo.me/g/sjajsj328"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-gold/10 text-gold rounded-lg text-xs font-medium hover:bg-gold/20 transition-colors"
                >
                  Liên Hệ Qua Zalo
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
