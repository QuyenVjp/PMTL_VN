'use client'

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon } from "@/components/icons/ZenIcons";

const sections = [
  {
    id: "quan-the-am",
    question: "1. Quán Thế Âm Bồ Tát Là Ai?",
    answer: `Quán Thế Âm Bồ Tát — còn gọi là Quan Âm, Quán Tự Tại — là vị Bồ Tát của Đại Từ Đại Bi, phổ cứu nhân gian khó khăn, sở hữu vô lượng trí tuệ và thần thông.

Ngài đã thành Phật từ vô lượng kiếp trước, hiệu là "Chánh Pháp Minh Như Lai", nhưng vì tình thương chúng sinh mà hiện thân Bồ Tát trở lại. Cùng Văn Thù, Phổ Hiền, Địa Tạng — Ngài là một trong "Tứ Đại Bồ Tát".

Tại Tây Phương Cực Lạc, Ngài đồng hành cùng Phật A Di Đà và Bồ Tát Đại Thế Chí — ba vị hợp thành "Tây Phương Tam Thánh". Ngài có mối nhân duyên sâu sắc với chúng sinh Ta Bà: hữu cảm tức ứng, không nguyện không theo — đó là ý nghĩa câu "Gia gia A Di Đà, hộ hộ Quán Thế Âm".

Trải qua lịch sử, Ngài đã hóa thân vô số — từ Lưu Tát Ha (Đông Tấn), Đại Hòa Thượng Bảo Chí Công (Nam Triều) cho đến Tăng Già Đại Sư đời Đường. Mỗi hóa thân đều mang theo thần thông và kỳ tích chấn động.`,
  },
  {
    id: "lu-master",
    question: "2. Giới Thiệu Sư Phụ Lư Quân Hoành",
    answer: `Ngài tên Lư Quân Hoành, là người Hoa Kiều sống tại Úc, là đại diện cho cư sĩ tu tại gia. Ngài thành lập Đài Phát thanh Đông Phương để truyền bá Phật Pháp ở Úc và khắp nơi trên thế giới, nên được mọi người gọi là Đài Trưởng Lư.

Nhận được sự khai thị của Quán Thế Âm Bồ Tát, có thần thông có thể xem được quá khứ, hiện tại và tương lai của một người thông qua ngày tháng năm sinh. Đài Trưởng Lư giúp chúng sanh hiểu nhân biết quả, biết niệm Kinh Phật và sám hối. Thông qua đó có thể hoá giải oán kết, tai nạn, rủi ro, bệnh tật trong cuộc sống mà mỗi một người nào cũng sẽ gặp phải.

Ngoài ra, khi còn tại thế, Ngài còn là Chủ tịch Hội đồng Quản trị của tổ chức Từ thiện Truyền thông Đông Phương-Úc; là thân sỹ hòa bình ở Úc; là chuyên gia tâm lý người Úc có bằng cấp cao; là Dato của Malaysia; là giáo sư thỉnh giảng danh dự tại Đại học Siena, Ý; là Giáo sư thỉnh giảng danh dự tại Đại học Phật giáo Quốc tế; và là giảng viên về Phật giáo và Triết học tại Đại học West Scotland, Vương quốc Anh.
`
  },
  {
    id: "phap-mon",
    question: "3. Pháp Môn Tâm Linh Là Gì?",
    answer: `Pháp Môn Tâm Linh được Quán Thế Âm Bồ Tát truyền thụ cho chúng sanh.

Gồm Năm Đại Pháp Bảo:
- Niệm Kinh,
- Phát nguyện,
- Phóng sanh,
- Đọc Bạch Thoại Phật Pháp,
- Và Đại Sám Hối.

Đây là tâm nguyện từ bi của Quán Thế Âm Bồ Tát dành cho chúng sinh thời hiện đại, thuộc Phật Giáo Đại Thừa và phù hợp với căn cơ con người ngày nay.

Pháp Môn giúp:
• Thoát khỏi đau khổ, bệnh tật, phiền não
• Hóa giải mâu thuẫn, nghiệt chướng oan gia
• Nâng cao trí tuệ và phúc đức bản thân
• Siêu độ người thân đã khuất

Nhờ hiệu quả linh nghiệm nhanh chóng, chỉ trong vài năm đã có hàng triệu tín đồ tu học trên toàn thế giới.`,
  },
  {
    id: "five-dharmas",
    question: "4. Ngũ Đại Pháp Bảo Tu Học",
answer: `**Niệm Kinh** — Bài tập niệm Kinh hằng ngày bao gồm: Chú Đại Bi, Tâm Kinh, Chú Vãng Sanh và Lễ Phật Đại Sám Hối Văn làm nền tảng chính. Bài tập bắt buộc thực hiện hằng ngày để tăng năng lượng cho bản thân và là yêu cầu căn bản khi nhập môn Pháp Môn Tâm Linh.

**Phát Nguyện** — Ở trước Bồ Tát thầm niệm hoặc khấn xin Bồ Tát phù hộ, giải quyết những bối rối, phiền não, tai nạn. Sau khi nguyện toại thực hiện, cần giữ đúng lời hứa và thực hành theo khả năng.

**Phóng Sinh** — Đại diện của sự từ bi. Phóng sanh giúp tích lũy công đức và kéo dài tuổi thọ.

**Đọc Bạch Thoại Phật Pháp** — Bạch thoại nghĩa là diễn giải theo cách đơn giản, dễ hiểu. Đài Trưởng Lư Quân Hoành dùng cả cuộc đời để diễn giải triết lý Phật giáo uyên thâm thành những câu chuyện đơn giản, giúp người đọc hiểu được hàm ý sâu xa, buông bỏ chấp niệm và sống tích cực.

**Đại Sám Hối** — Mỗi con người chúng ta ai cũng đã từng có lỗi lầm; nhận thức và sửa đổi sẽ giúp loại bỏ tham-sân-si-mạn-nghi, sống trong năng lượng tích cực và nhẹ nhàng. Sám hối hàng ngày giúp tiêu trừ nghiệp chướng và nhắc nhở bản thân không phạm sai lầm cũ.`,
  },
  {
    id: "niem-kinh",
    question: "5. Niệm Kinh gồm những gì?",
    answer: `Bài tập niệm Kinh hằng ngày bao gồm: Chú Đại Bi, Tâm Kinh, Chú Vãng Sanh và Lễ Phật Đại Sám Hối Văn làm nền tảng chính. Bài tập bắt buộc thực hiện hằng ngày để tăng năng lượng cho bản thân, là yêu cầu căn bản khi nhập môn Pháp Môn Tâm Linh.`,
  },
  {
    id: "ngoi-nha-nho",
    question: "6. Ngôi Nhà Nhỏ là gì?",
    answer: `Ngôi Nhà Nhỏ là tổ hợp Kinh Văn Kinh điển của Phật giáo, bao gồm:
- 27 biến Chú Đại Bi,
- 49 biến Tâm Kinh,
- 84 biến Chú vãng sanh,
- Và 87 biến Thất Phật Diệt Tội Chân Ngôn.

- Thông qua Ngôi Nhà Nhỏ để trả nợ cho oan gia trái chủ mà mình đã mắc nợ từ vô lượng kiếp trước hoặc kiếp này bằng cách niệm Kinh
- Giúp cho mối quan hệ trong cuộc sống, gia đình, học tập, làm việc được cải thiện.
- Hoá giải các tai nạn, bệnh tật và điều xui rủi sẽ gặp phải.
- Niệm tổ hợp Kinh Văn Ngôi Nhà Nhỏ giúp siêu độ vong linh trên người chúng ta hoặc người thân.
- Tự bản thân có thể cứu lấy mình mà không cần tốn thời gian và tiền bạc để nhờ vả người khác.`,
  },
  {
    id: "phat-nguyen-phong-sanh",
    question: "7. Phát nguyện và Phóng sanh là gì?",
    answer: `Phát nguyện chính là ở trước Bồ Tát thầm niệm hoặc khấn xin Bồ Tát phù hộ, xin Bồ Tát hiển linh, giải quyết những bối rối, những phiền não, đại hoạ, tai nạn nhỏ, đồng thời bản thân sẽ: nguyện ăn chay, nguyện phóng sanh, nguyện làm việc thiện hay nguyện giữ giới hạnh v…vv

Hoàn nguyện là khi Bồ Tát giúp quý vị thực hiện được mong muốn của mình, quý vị cần phải giữ đúng lời hứa ban đầu và thực hành theo, chỉ cần làm những gì có thể, biểu đạt thành ý là được. Nếu như trước đây phát nguyện ăn chay độ người v..vv thì nhất định phải kiên trì làm tiếp, thì đó chính là đã hoàn nguyện rồi.

Phóng sanh là đại diện của sự từ bi. Phóng sanh giúp ta tích lũy công đức và kéo dài tuổi thọ.`,
  },
  {
    id: "bach-thoai-phat-phap",
    question: "8. Bạch Thoại Phật Pháp là gì?",
    answer: `Bạch Thoại nghĩa là diễn giải theo cách đơn giản, dễ hiểu. Đài Trưởng Lư Quân Hoành đã dùng cả cuộc đời mình để diễn giải triết lý Phật giáo uyên thâm thành những câu chuyện đơn giản và gần gũi với đời sống hàng ngày. Giúp người đọc có thể hiểu được hàm ý uyên sâu trong triết lý Phật, từ đó giác ngộ và hiểu được nhiều điều trong cuộc sống, giúp chúng ta buông bỏ những cố chấp, những chấp niệm hư ảo và sống một cuộc sống tích cực, không vụ lợi.`,
  },
  {
    id: "dai-sam-hoi",
    question: "9. Đại Sám Hối là gì?",
    answer: `Mỗi con người chúng ta ai cũng đã từng có lỗi lầm, nhưng việc nhận thức rằng bản thân đã làm sai và phải sửa đổi sẽ khiến con người thay đổi vượt bậc, khiến chúng ta tránh xa được tham - sân - si - mạn - nghi, loại bỏ được phiền não, sống trong năng lượng tích cực và nhẹ nhàng hơn.

Sám hối hằng ngày giúp chúng ta tiêu trừ nghiệp chướng và nhắc nhở bản thân không phạm phải sai lầm cũ.`,
  },
];

// Render chuỗi text có **bold** thành JSX
function renderAnswer(text: string) {
  return text.split('\n\n').map((para, i) => {
    // Tách phần bold khỏi phần thường
    const parts = para.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className="text-muted-foreground leading-loose text-sm mb-3 last:mb-0 whitespace-pre-line">
        {parts.map((part, j) =>
          part.startsWith('**') && part.endsWith('**') ? (
            <strong key={j} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
          ) : (
            <span key={j}>{part}</span>
          )
        )}
      </p>
    );
  });
}

const AboutSection = () => {
  const [openId, setOpenId] = useState<string | null>("quan-the-am");

  return (
    <section className="section-shell">
      <div className="section-frame">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="section-kicker mb-3">Giới Thiệu</p>
            <h2 className="section-title mb-6 md:text-4xl">
              Pháp Môn Tâm Linh<br />
              <span className="text-gold-dim">Hướng Dẫn Tu Học</span>
            </h2>
            <div className="zen-divider w-20 mb-6" />
            <p className="panel-shell-muted mb-8 rounded-xl border-l-2 border-l-gold/20 px-6 py-5 text-base italic leading-loose text-muted-foreground">
              Nguyện rằng sẽ càng có thêm nhiều chúng sinh hữu duyên có thể lên được chiếc thuyền cứu độ của Quán Thế Âm Bồ Tát, tâm hồn thanh tịnh, thoát khổ an vui, tiêu trừ nghiệp chướng, siêu độ hữu duyên, trả sạch oán kết, quảng độ chúng sinh, đồng đăng cực lạc.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {[
                { label: "Đồng Tu Toàn Cầu", value: "Hàng triệu" },
                { label: "Năm Hoằng Pháp", value: "20+" },
                { label: "Quán Âm Đường", value: "Toàn Cầu" },
              ].map((stat) => (
                <div key={stat.label} className="panel-shell-muted text-center p-4">
                  <p className="font-display text-xl text-foreground mb-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground leading-tight">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-3"
          >
            {sections.map((sec) => (
              <div key={sec.id} className="panel-shell overflow-hidden">
                <button
                  onClick={() => setOpenId(openId === sec.id ? null : sec.id)}
                  className="w-full flex items-center justify-between p-5 text-left group"
                >
                  <span className="font-display text-lg text-foreground transition-colors duration-200 group-hover:text-gold-dim">
                    {sec.question}
                  </span>
                  <motion.span
                    animate={{ rotate: openId === sec.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 ml-4 text-muted-foreground"
                  >
                    <ChevronDownIcon />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {openId === sec.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border/70 px-5 pb-5 pt-4">
                        {renderAnswer(sec.answer)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            <div className="panel-shell-muted p-4 text-sm text-muted-foreground">
              <p className="mb-1 font-medium text-foreground">Địa chỉ Văn phòng Đài Đông Phương:</p>
              <p>2A Holden Street, Ashfield NSW 2131 Australia</p>
              <p className="mt-1">
                <a href="tel:+61292832758" className="text-gold hover:underline">+61 2 9283 2758</a>
                {" · "}
                <a href="https://xlch.org/" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">xlch.org</a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
