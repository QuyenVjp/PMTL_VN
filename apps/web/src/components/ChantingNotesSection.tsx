'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const chantiingNotes = [
  {
    id: '1',
    title: 'Niệm kinh khi làm việc nhà',
    content: 'Nếu có thể thuộc kinh, bạn có thể niệm trong khi đi bộ, làm việc nhà, hoặc làm công việc đơn giản. Tuy nhiên, nếu có điều kiện niệm trước kinh sách thì càng tốt, năng lượng của kinh văn sẽ mạnh hơn.',
  },
  {
    id: '2',
    title: 'Không niệm kinh ở nơi ô uế',
    content: 'Tuyệt đối không được niệm kinh trong nhà vệ sinh, phòng tắm hoặc những nơi ô uế, có trường khí xấu. Cửa nhà vệ sinh trong nhà nên đóng thường xuyên để tránh ảnh hưởng đến phong thủy của ngôi nhà.',
  },
  {
    id: '3',
    title: 'Tránh niệm kinh khi chuẩn bị thực phẩm',
    content: 'Không nên niệm kinh khi dùng dao thái đồ ăn, đặc biệt là khi chuẩn bị món ăn mặn.',
  },
  {
    id: '4',
    title: 'Niệm kinh khi ăn chay',
    content: 'Khi ăn món chay, có thể niệm kinh. Nhưng nếu đang ăn thịt cá, tuyệt đối không niệm kinh.',
  },
  {
    id: '5',
    title: 'Chế độ ăn uống và ngũ vị tân',
    content: 'Người niệm kinh không nên ăn động vật còn sống, hải sản tươi sống. Ngoài ra, ăn ngũ vị tân (hành, tỏi, hẹ, kiệu, hành tây) cũng sẽ ảnh hưởng đến hiệu quả niệm kinh. Nếu đã ăn, nên súc miệng sạch sẽ và niệm vài biến "Tịnh Khẩu Nghiệp Chân Ngôn" và "Thất Phật Diệt Tội Chân Ngôn" trước khi niệm kinh.',
  },
  {
    id: '6',
    title: 'Phát âm rõ ràng, không niệm bằng ý niệm',
    content: 'Khi niệm kinh, có thể niệm nhanh nhưng cần phát âm rõ ràng, không ngân nga, không niệm bằng ý niệm. Vì trong kinh có rất nhiều danh hiệu Phật, Bồ Tát. Ví dụ như trong Chú Đại Bi có danh hiệu của 84 vị Bồ Tát, trong Lễ Phật Đại Sám Hối Văn có danh hiệu của 88 vị Phật, nếu niệm thiếu có thể bị xem là bất kính. Thông thường, niệm một biến Đại Bi Chú mất khoảng 1 phút, niệm một biến Lễ Phật Đại Sám Hối Văn mất khoảng 6 phút.',
  },
  {
    id: '7',
    title: 'Niệm kinh bằng tiếng địa phương',
    content: 'Có thể niệm kinh bằng tiếng địa phương của mình. Đối với những chữ có nhiều cách đọc, chỉ cần nhất quán một cách phát âm là được.',
  },
  {
    id: '8',
    title: 'Niệm kinh trong phòng ngủ',
    content: 'Phòng ngủ vợ chồng có thể niệm kinh, nhưng nếu trong ngày có sinh hoạt vợ chồng, thì ngày đó không nên niệm kinh trong phòng vì trường khí không tốt, là bất kính với Hộ Pháp Kinh Văn.',
  },
  {
    id: '9',
    title: 'Nằm trên giường niệm kinh',
    content: 'Nam nữ có thể niệm kinh khi nằm trên giường, nhưng hai người không được nằm gần nhau hoặc có ý niệm không trong sạch.',
  },
  {
    id: '10',
    title: 'Niệm kinh sáng sớm sau khi đánh răng',
    content: 'Sáng sớm sau khi đánh răng có thể nằm trên giường niệm kinh, nhưng nếu chưa đánh răng thì không nên niệm ra tiếng.',
  },
  {
    id: '11',
    title: 'Tư thế và vệ sinh cơ thể',
    content: 'Khi tay không sạch, cơ thể đung đưa, vắt chân hay có tư thế không trang nghiêm thì không nên niệm kinh.',
  },
  {
    id: '12',
    title: 'Niệm kinh tại nơi công cộng',
    content: 'Khi niệm kinh ở nơi công cộng như trên xe bus, tàu điện, đường đi làm, chỉ cần niệm thầm mà không cần khấn nguyện. Nếu đi qua những nơi có trường khí xấu, không nên niệm Tâm Kinh hay Chú Vãng Sanh, mà có thể niệm Đại Bi Chú hoặc các chú ngắn khác.',
  },
  {
    id: '13',
    title: 'Không cần ghi chép số lần niệm',
    content: 'Không cần ghi chép lại số lần đã niệm kinh trên giấy.',
  },
  {
    id: '14',
    title: 'Dùng máy đếm thay vì tràng hạt',
    content: 'Cư sĩ tại gia không nên đeo tràng hạt trên cổ, có thể dùng máy đếm số nhưng cần kiểm tra pin để tránh sai lệch số lần niệm.',
  },
  {
    id: '15',
    title: 'Niệm kinh khi có kỳ kinh nguyệt hoặc mang thai',
    content: 'Phụ nữ trong thời kỳ kinh nguyệt và phụ nữ mang thai vẫn có thể niệm kinh, nhưng nếu cảm thấy không khỏe thì có thể tạm dừng.',
  },
  {
    id: '16',
    title: 'Niệm kinh khi bế trẻ nhỏ',
    content: 'Khi bế trẻ nhỏ có thể niệm kinh, nhưng nếu trẻ đang ngủ thì không nên niệm trực tiếp trước mặt bé mà nên nghiêng người một chút.',
  },
  {
    id: '17',
    title: 'Thời gian niệm kinh tốt nhất',
    content: 'Niệm kinh vào ban ngày là tốt nhất. Nếu trời mưa bão, sấm sét thì không nên niệm Tâm Kinh và Vãng Sanh Chú. Hai kinh này nên hoàn thành trước 10 giờ tối. Nếu niệm vào buổi tối mà cảm thấy khó chịu thì nên dừng lại. Vào khoảng từ 2 giờ đến 5 giờ sáng cũng không nên niệm kinh.',
  },
  {
    id: '18',
    title: 'Cẩn trọng niệm kinh tại những địa điểm đặc biệt',
    content: 'Khi lái xe, đi tàu, vào chùa buổi tối, bệnh viện, nghĩa trang, đài tưởng niệm liệt sĩ, lò mổ, nhà hàng, khách sạn, ban công, hoặc đi dưới gốc cây to, cần cẩn trọng khi niệm kinh. Nếu niệm, chỉ nên niệm Đại Bi Chú và giữ tâm thanh tịnh, không có tâm tranh đấu, nếu không dễ gặp chuyện.',
  },
  {
    id: '19',
    title: 'Niệm kinh trên máy bay',
    content: 'Khi ngồi trên máy bay, có thể niệm bất kỳ kinh nào, vì trường khí trên không trung rất tốt.',
  },
  {
    id: '20',
    title: 'Niệm kinh khi phóng sanh',
    content: 'Khi phóng sanh, không nên hướng xuống nước mà nên hướng lên trời để niệm kinh.',
  },
  {
    id: '21',
    title: 'Đọc ba lần câu cuối của Tâm Kinh',
    content: 'Khi niệm Tâm Kinh, phải đọc ba lần câu cuối "Ma Ha Bát Nhã Ba La Mật Đa", vì đây là phiên bản theo sách "Phật Giáo Niệm Tụng Hợp Tập" của Chủ tịch Hiệp hội Phật giáo Trung Quốc Triệu Phác Sơ.',
  },
  {
    id: '22',
    title: 'Niệm kinh khi sử dụng mạng để hoằng pháp',
    content: 'Khi sử dụng mạng để hoằng pháp, có thể vừa đọc kinh vừa xem điện thoại. Nhưng nếu đang xem tin tức tiêu cực, tin đồn nhảm thì không nên niệm kinh.',
  },
  {
    id: '23',
    title: 'Lắng nghe pháp âm và tránh nhiều pháp môn',
    content: 'Nên thường xuyên nghe pháp âm của sư phụ, đọc Bạch Thoại Phật Pháp. Nếu sư phụ không dạy một bài kinh nào đó, thì không nên tự ý niệm để tránh tu hành sai lệch. Không nên niệm kinh từ nhiều pháp môn khác nhau cùng lúc để tránh mất hiệu quả.',
  },
  {
    id: '24',
    title: 'Khấn trước khi niệm kinh trong hoàn cảnh không thuận',
    content: 'Khi làm việc hoặc sử dụng kéo, dao, nếu cần niệm kinh, nhất định phải khấn trước: "Xin Quán Thế Âm Bồ Tát từ bi tha thứ cho con vì đang ở trong hoàn cảnh không thuận lợi để niệm kinh."',
  },
  {
    id: '25',
    title: 'Ánh sáng vàng khi niệm kinh',
    content: 'Khi niệm kinh, nếu thấy ánh sáng vàng hoặc ánh sáng rực rỡ, đó có thể là chư Phật Bồ Tát hoặc Thần Hộ Pháp thần. Nhưng nếu thấy ánh sáng xanh lá, có thể đó là dấu hiệu của vong linh đang đòi nợ.',
  },
  {
    id: '26',
    title: 'Triệu chứng khi niệm kinh',
    content: 'Nếu khi niệm kinh cảm thấy tê dại, đau đầu, có thể đó là vong linh của người cần kinh. Hãy nhanh chóng niệm Ngôi Nhà Nhỏ để trả nợ nghiệp.',
  },
  {
    id: '27',
    title: 'Cách ăn mặc phù hợp',
    content: 'Khi niệm kinh, nên ăn mặc chỉnh tề, không mặc quần áo đen toàn bộ, quần áo hở hang, vải lưới, hoặc có họa tiết bất cân xứng, rách rưới.',
  },
  {
    id: '28',
    title: 'Ánh sáng khi niệm kinh vào buổi tối',
    content: 'Khi niệm kinh vào buổi tối, không nên tắt hết đèn. Ánh sáng tốt nhất là màu ấm, không nên quá trắng sáng. Nếu có thể, nên bật một bóng đèn nhỏ suốt đêm để giúp trường khí của nhà tốt hơn.',
  },
  {
    id: '29',
    title: 'Nguyên tắc áp dụng cho tất cả bài kinh',
    content: 'Dù niệm kinh bài tập hàng ngày hay Ngôi Nhà Nhỏ, đều có thể áp dụng các nguyên tắc trên.',
  },
]

export function ChantingNotesSection() {
  return (
    <section className="py-12">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-display text-foreground mb-2">
          Những Điều Cần Lưu Ý Khi Niệm Kinh
        </h2>
        <p className="text-muted-foreground">
          29 nguyên tắc quan trọng giúp niệm kinh hiệu quả và đúng pháp
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-2">
        {chantiingNotes.map((note, index) => (
          <AccordionItem
            key={note.id}
            value={note.id}
            className="rounded-xl border bg-card px-4 data-[state=open]:bg-card/60 transition-colors"
          >
            <AccordionTrigger className="text-sm md:text-base font-medium text-foreground hover:text-amber-600 dark:hover:text-amber-400 py-3">
              <span className="flex items-center gap-3">
                <span className="text-xs md:text-sm font-bold text-amber-600 dark:text-amber-400 min-w-fit">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-left">{note.title}</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
              {note.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
