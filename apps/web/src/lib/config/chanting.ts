export const CHANTING_ADMIN_COPY = {
  collectionName: "Niệm Kinh · Lịch Trình Niệm",
  itemComponent: "Plan Item",
  pageEyebrow: "Niệm Kinh Hằng Ngày",
  pageTitle: "Công Khóa Hôm Nay",
  pageDescription:
    "Mở bài cần niệm, giữ tiến độ trong ngày và hành trì gọn nhẹ ở bất cứ đâu.",
} as const;

export const DEFAULT_CHANTING_GUIDELINES = {
  title: 'Những Điều Cần Lưu Ý Khi Niệm Kinh',
  summary: 'Những nhắc nhở ngắn giúp anh giữ sự trang nghiêm và niệm đúng pháp.',
  sections: [
    {
      id: 1,
      title: 'Thời gian niệm kinh',
      body: '<p>Nên niệm vào ban ngày hoặc đầu buổi tối. Tránh khoảng 2 giờ đến 5 giờ sáng và giữ tâm ổn định trước khi bắt đầu.</p>',
      order: 1,
    },
    {
      id: 2,
      title: 'Khi di chuyển hoặc ở nơi công cộng',
      body: '<p>Khi đi xe, tàu hoặc ở nơi công cộng, có thể niệm thầm các chú ngắn. Nếu tâm chưa ổn hoặc hoàn cảnh không thuận, nên chọn bài ngắn và giữ tâm thanh tịnh.</p>',
      order: 2,
    },
    {
      id: 3,
      title: 'Giữ thân tâm trang nghiêm',
      body: '<p>Ưu tiên nơi sạch sẽ, thân thể gọn gàng, phát âm rõ ràng. Nếu đang ở hoàn cảnh bất tiện, hãy niệm ngắn gọn và khởi tâm cung kính.</p>',
      order: 3,
    },
  ],
} as const
