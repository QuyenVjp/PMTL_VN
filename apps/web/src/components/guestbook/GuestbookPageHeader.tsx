'use client'

import { motion } from 'framer-motion'

export default function GuestbookPageHeader() {
  return (
    <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_340px]">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-7 shadow-ant md:p-9"
      >
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-gold">Sổ Lưu Bút & Hỏi Đáp</p>
        <h1 className="mb-4 max-w-3xl font-display text-4xl leading-tight text-foreground md:text-5xl">
          Một bàn viết chung cho lời nhắn, cảm ngộ và câu hỏi tu học
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Thay vì một diễn đàn ồn ào, đây là không gian dạng thư phòng: anh có thể để lại lời lưu bút, nêu một thắc mắc ngắn,
          hoặc đọc phản hồi của cộng đồng theo nhịp nhẹ và dễ theo dõi hơn.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {[
            'Gửi nhanh, không rối',
            'Hiển thị ngay cho cộng đồng',
            'Ban Quản Trị phản hồi khi cần',
          ].map((item) => (
            <span key={item} className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
              {item}
            </span>
          ))}
        </div>
      </motion.section>

      <motion.aside
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="grid gap-4"
      >
        <div className="rounded-2xl border border-border bg-card p-5 shadow-ant">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">Cách dùng thông minh</p>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><span className="font-semibold text-foreground">Lưu bút</span> để lại lời cảm niệm hoặc chúc nguyện.</p>
            <p><span className="font-semibold text-foreground">Câu hỏi</span> dùng cho thắc mắc ngắn, rõ ý, dễ phản hồi.</p>
            <p><span className="font-semibold text-foreground">Lưu trữ</span> giúp đọc lại theo tháng như một nhật ký cộng đồng.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gold/15 bg-gold/5 p-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">Tinh thần không gian</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Viết ngắn, rõ, chân thành. Ưu tiên câu hỏi thật sự cần tháo gỡ và lời nhắn có ích cho người đọc sau.
          </p>
        </div>
      </motion.aside>
    </div>
  )
}
