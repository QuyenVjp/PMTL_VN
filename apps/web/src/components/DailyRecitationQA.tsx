'use client'

import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";

// Since it's a static text, we present it nicely as a list.

const qaData = [
  {
    id: "qa-1",
    question: "Thế nào là công khóa?",
    answer: [
      "Tụng kinh có thể phân thành công khóa, Ngôi Nhà Nhỏ, và kinh văn tự tu; ba loại mỗi loại đều có công dụng riêng, không thể thay thế cho nhau.",
      "Công khóa là chỉ những kinh văn mỗi ngày nhất định phải tụng, như 3 biến Chú Đại Bi, 3 biến Tâm Kinh, 1 biến Lễ Phật Đại Sám Hối Văn, 21 biến Chú Vãng Sinh.",
      "Công khóa cũng quan trọng như mỗi ngày cần ăn cơm, giống như chi tiêu sinh hoạt hằng ngày; Ngôi Nhà Nhỏ giống như trả nợ mua nhà hoặc các khoản nợ thiếu. Số biến kinh văn dùng làm công khóa không được tính vào kinh văn của “Ngôi Nhà Nhỏ”, phải tách riêng phần cầu nguyện và tính riêng số biến kinh văn. Kinh văn tự tu tương đương với quỹ dự phòng, tiền dưỡng lão, có thể dùng khi cấp thiết hoặc lúc tuổi già lâm chung để trợ giúp cho chính mình.",
    ],
    cn: [
      "1）念经可分为功课、小房子、自修经文，三者各有作用，不可互相替代。",
      "2）功课是指每天必须念诵的经文，如3遍《大悲咒》，3遍《心经》，1遍《礼佛大忏悔文》，21遍《往生咒》。",
      "3）功课就如每天需要吃饭一样重要，就像日常支出的开销；小房子就如还房贷或者欠款... （详见原文）",
    ],
  },
  {
    id: "qa-2",
    question: "Khi tụng công khóa cần chú ý điều gì?",
    answer: [
      "Tụng kinh như đun một ấm nước; nếu ngắt quãng thì nước sẽ nguội, không thể đun sôi. Vì vậy, kinh văn đã định làm công khóa thì nhất định phải mỗi ngày hoàn thành. Thà rằng tự định công khóa thấp một chút, ví dụ mỗi ngày tụng 7 biến Chú Đại Bi, thì mỗi ngày nhất định phải làm được; nếu tụng thêm thì tính riêng.",
      "Nếu có tình huống đặc biệt có thể không hoàn thành, có thể thưa trước với Bồ Tát và làm công khóa sớm hơn.",
      "Nếu tạm thời không kịp làm, cũng phải thưa với Bồ Tát: 'Cầu xin Đại Từ Đại Bi Quán Thế Âm Bồ Tát tha thứ cho con xxx, công khóa hôm nay con sẽ hoàn thành vào ngày mai.'",
      "Dù bận rộn thế nào, mỗi ngày ít nhất cũng phải bảo đảm có tụng kinh, dù chỉ tụng vài biến Chú Đại Bi cũng được.",
      "Nếu là đại kinh như Lễ Phật Đại Sám Hối Văn, khi bù lại tốt nhất nên chia ra vài ngày để bù, không nên một lần bù quá nhiều; mỗi ngày Lễ Phật Đại Sám Hối Văn tốt nhất không vượt quá 7 biến.",
      "Công khóa mỗi ngày tốt nhất nên hoàn thành đúng giờ, đúng nơi; tốt nhất có thể ngồi trước bàn Phật tại nhà, định tâm an tĩnh mà tụng, như vậy hiệu quả là tốt nhất.",
    ]
  },
  {
    id: "qa-3",
    question: "Về địa điểm và thời gian tụng kinh có điều gì cần lưu ý?",
    answer: [
      "Tuyệt đối không được tụng kinh trong nhà vệ sinh, phòng tắm và những nơi ô uế, hoặc nơi có khí trường không tốt.",
      "Nằm (trừ khi nam nữ cùng nằm chung giường), ngồi (không bắt chéo chân), đứng đều có thể tụng kinh. Trên đường đi làm, trên xe, tàu điện ngầm khi khí trường tốt đều có thể tụng kinh, vì vậy có thể tận dụng thời gian rời rạc để tu hành.",
      "Ban ngày tụng kinh hiệu quả là tốt nhất; cố gắng tụng xong trước 10 giờ tối vào những ngày trời quang. Nếu gặp thời tiết âm u mưa gió, sấm sét thì Tâm Kinh và Chú Vãng Sinh nên cố gắng tụng xong vào ban ngày; nếu tối muộn tụng mà cảm thấy không thoải mái thì phải tạm dừng. Từ 2 giờ đến 5 giờ sáng không nên tụng kinh.",
      "Gần bệnh viện, nghĩa trang, lò mổ và những nơi âm khí nặng, tốt nhất chỉ tụng Chú Đại Bi. Nếu ban ngày thời tiết không tốt hoặc sau khi mặt trời lặn, tuyệt đối không nên tụng Tâm Kinh và Chú Vãng Sinh.",
    ]
  }
];

export default function DailyRecitationQA() {
  return (
    <section className="py-20 bg-zen-surface relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 mb-6 text-gold text-xs font-semibold tracking-widest uppercase">
            <HelpCircle className="w-4 h-4" /> Khai Thị Của Sư Phụ
          </div>
          <h2 className="font-display text-3xl md:text-5xl text-foreground mb-6">
            Khai Thị Về <span className="gold-gradient-text">Công Khóa Tụng Kinh</span>
          </h2>
          <p className="text-muted-foreground md:text-lg">
            Những lưu ý quan trọng và giải đáp thắc mắc thường gặp khi bắt đầu thực hành công khóa hàng ngày.
          </p>
        </motion.div>

        <div className="space-y-6">
          {qaData.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-background rounded-2xl p-6 md:p-8 border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl md:text-2xl font-display text-gold mb-4 flex gap-3">
                <span className="text-2xl font-bold">Q.</span>
                <span>{item.question}</span>
              </h3>
              <div className="space-y-4 text-muted-foreground ml-8">
                {item.answer.map((para, i) => (
                  <p key={i} className="leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
