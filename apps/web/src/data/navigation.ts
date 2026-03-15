export interface SubTopic {
  title: string;
  description: string;
}

export interface MotherTopic {
  id: string;
  title: string;
  subTopics: SubTopic[];
}

export const motherTopics: MotherTopic[] = [
  {
    id: "suc-khoe",
    title: "SỨC KHỎE & TRỊ BỆNH",
    subTopics: [
      { title: "Niệm Kinh Trị Bệnh", description: "Ghi chú: Phương pháp tụng niệm hỗ trợ chữa lành" },
      { title: "Phóng Sinh Giải Nghiệp", description: "Ghi chú: Cách phóng sinh đúng pháp để hóa giải nghiệp bệnh" },
      { title: "Sám Hối Nghiệp Chướng", description: "Ghi chú: Nghi thức sám hối để tiêu trừ bệnh tật" },
      { title: "Hồi Hướng Công Đức", description: "Ghi chú: Cách hồi hướng đúng pháp cho người bệnh" },
      { title: "Chay Tịnh & Dưỡng Sinh", description: "Ghi chú: Ăn chay và dưỡng sinh theo Phật pháp" },
      { title: "Tâm Bệnh & Tâm Dược", description: "Ghi chú: Chữa bệnh từ tâm, giải tỏa phiền não" },
    ],
  },
  {
    id: "hon-nhan",
    title: "HÔN NHÂN & GIA ĐẠO",
    subTopics: [
      { title: "Hóa Giải Oán Kết Vợ Chồng", description: "Ghi chú: Phương pháp hóa giải mâu thuẫn gia đình" },
      { title: "Cầu Duyên Lành", description: "Ghi chú: Niệm kinh và nghi thức cầu duyên" },
      { title: "Giữ Gìn Hạnh Phúc", description: "Ghi chú: Cách vun đắp hôn nhân bền vững" },
      { title: "Hiếu Đạo Với Cha Mẹ", description: "Ghi chú: Báo hiếu và chăm sóc cha mẹ" },
      { title: "Hóa Giải Tiểu Tam", description: "Ghi chú: Đối trị ngoại tình theo Phật pháp" },
      { title: "Ly Hôn & Giải Nghiệp", description: "Ghi chú: Cách xử lý và giải nghiệp khi chia tay" },
    ],
  },
  {
    id: "con-cai",
    title: "CON CÁI & CẦU CON",
    subTopics: [
      { title: "Cầu Con Theo Phật Pháp", description: "Ghi chú: Nghi thức và kinh điển cầu con" },
      { title: "Thai Giáo Tâm Linh", description: "Ghi chú: Nuôi dưỡng thai nhi bằng Phật pháp" },
      { title: "Giáo Dục Con Cái", description: "Ghi chú: Dạy con theo đạo đức Phật giáo" },
      { title: "Con Cái Bất Hiếu", description: "Ghi chú: Cách hóa giải nghiệp con cái" },
      { title: "Cầu Nguyện Cho Con", description: "Ghi chú: Kinh niệm hồi hướng cho con cái" },
      { title: "Sẩy Thai & Giải Oan", description: "Ghi chú: Siêu độ và giải oan cho thai nhi" },
    ],
  },
  {
    id: "su-nghiep",
    title: "SỰ NGHIỆP & TÀI VẬN",
    subTopics: [
      { title: "Cầu Tài Lộc", description: "Ghi chú: Niệm kinh và pháp môn cầu tài" },
      { title: "Giải Hạn Sao Xấu", description: "Ghi chú: Cách hóa giải vận hạn" },
      { title: "Kinh Doanh Thuận Lợi", description: "Ghi chú: Phật pháp hỗ trợ sự nghiệp" },
      { title: "Thi Cử Đỗ Đạt", description: "Ghi chú: Cầu nguyện cho học tập, thi cử" },
      { title: "Nợ Nần & Phá Sản", description: "Ghi chú: Giải quyết khó khăn tài chính" },
      { title: "Phong Thủy & Nhà Cửa", description: "Ghi chú: Bố trí không gian theo Phật pháp" },
    ],
  },
  {
    id: "nghi-thuc",
    title: "NGHI THỨC & TU TẬP",
    subTopics: [
      { title: "Công Khóa Hàng Ngày", description: "Ghi chú: Lịch trình tụng niệm mỗi ngày" },
      { title: "Niệm Phật & Trì Chú", description: "Ghi chú: Hướng dẫn niệm Phật đúng pháp" },
      { title: "Thiết Lập Bàn Thờ", description: "Ghi chú: Cách lập bàn thờ Phật tại gia" },
      { title: "Cúng Dường & Bố Thí", description: "Ghi chú: Phương pháp cúng dường đúng cách" },
      { title: "Phóng Sinh Đúng Pháp", description: "Ghi chú: Nghi thức phóng sinh chuẩn" },
      { title: "Hành Hương & Lễ Bái", description: "Ghi chú: Hướng dẫn hành hương tham bái" },
    ],
  },
];
