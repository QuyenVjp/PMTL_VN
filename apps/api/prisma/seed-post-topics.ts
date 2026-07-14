import { PrismaPg } from "@prisma/adapter-pg";
import { nanoid } from "nanoid";
import { PrismaClient } from "../src/generated/prisma/client.js";

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://pmtl:pmtl@localhost:55432/pmtl";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

interface TopicSeed {
  name: string;
  description?: string;
  children?: TopicSeed[];
}

const topics: TopicSeed[] = [
  {
    name: "Khái quát triết lý và Phật lý vô vi",
    description: "Triết học và nhận thức chung.",
    children: [
      {
        name: "Bản chất và Tôn chỉ hoạt động",
        children: [
          { name: "Hoằng pháp lợi sanh" },
          { name: "Gieo nhân lành, tinh tấn niệm kinh" },
          { name: "Rời xa ba đường ác, hướng tới an lạc và giải thoát" },
        ],
      },
      {
        name: "Trị tâm và Giác ngộ",
        children: [
          { name: "Phá trừ vọng tâm và vô minh" },
          { name: "Định nghĩa về Giác ngộ" },
          { name: "Lau chùi bản tính bằng Giới - Định - Tuệ" },
        ],
      },
    ],
  },
  {
    name: "Năm đại pháp bảo",
    description: "Các phương pháp thực hành cốt lõi.",
    children: [
      {
        name: "Niệm Kinh",
        children: [
          {
            name: "Ba trụ cột Kinh văn quan trọng nhất",
            children: [
              { name: "Chú Đại Bi" },
              { name: "Tâm Kinh" },
              { name: "Lễ Phật Đại Sám Hối Văn" },
            ],
          },
          {
            name: "Các bài Chú bổ trợ và công năng đặc thù",
            children: [
              { name: "Chú Giải Kết" },
              { name: "Tiêu Tai Cát Tường Thần Chú" },
              { name: "Chuẩn Đề Thần Chú" },
              { name: "Chú Vãng Sanh" },
              { name: "Đại Kiết Tường Thiên Nữ Chú" },
              { name: "Thất Phật Diệt Tội Chân Ngôn" },
              { name: "Công Đức Bảo Sơn Thần Chú" },
              { name: "Thánh Vô Lượng Thọ Quyết Định Quang Minh Vương Đà La Ni" },
            ],
          },
          {
            name: "Khuyến nghị bài tập hằng ngày cho từng đối tượng",
            children: [
              { name: "Bài tập cơ bản cho người mới bắt đầu" },
              { name: "Bài tập tăng thọ cho người lớn tuổi" },
              { name: "Bài tập đặc biệt cho người mắc bệnh nặng" },
            ],
          },
        ],
      },
      {
        name: "Niệm Ngôi Nhà Nhỏ",
        children: [
          { name: "Bản chất và cấu trúc Ngôi Nhà Nhỏ" },
          {
            name: "Các loại đối tượng kính tặng Ngôi Nhà Nhỏ",
            children: [
              { name: "Người cần kinh của bản thân" },
              { name: "Thai nhi của ai đó" },
              { name: "Người đã mất" },
              { name: "Người cần kinh trong ngôi nhà" },
              { name: "Hóa giải oán kết" },
            ],
          },
          {
            name: "Giao thức và kỹ thuật thực hành Ngôi Nhà Nhỏ",
            children: [
              { name: "Quy chuẩn in ấn" },
              { name: "Quy tắc chấm đỏ" },
              { name: "Rào chắn thời tiết và thời gian khi trì tụng" },
              { name: "Nghi thức khấn cầu trước khi đốt" },
              { name: "Dọn dẹp bàn thờ và xử lý sớ viết sai" },
              { name: "Giải mã kết quả siêu độ qua giấc mơ" },
            ],
          },
        ],
      },
      {
        name: "Phóng Sinh",
        children: [
          { name: "Bản chất công đức phóng sinh" },
          {
            name: "Nghi thức thực hành phóng sinh",
            children: [
              { name: "Tự phóng sinh tiêu tai cho chính mình" },
              { name: "Phóng sinh thay cho người khác" },
              { name: "Phóng sinh cá cho Sư Phụ Lư Quân Hoành" },
              { name: "Niệm kinh hồi hướng và báo cáo công đức" },
            ],
          },
        ],
      },
      {
        name: "Phát Nguyện",
        children: [
          { name: "Tự lượng sức mình để phát nguyện" },
          { name: "Khấn xin nguyện vọng tương xứng với nguyện lực" },
        ],
      },
      {
        name: "Đọc Bạch Thoại Phật Pháp",
        children: [
          { name: "Vận dụng Phật pháp vào đời sống" },
          { name: "Chuyển hóa nhận thức và đạt an lạc nhân gian" },
        ],
      },
    ],
  },
  {
    name: "Phân cấp tài liệu và các chương trình khai thị",
    description: "Học thuật và nghe nhìn.",
    children: [
      {
        name: "Hệ thống Kinh sách và Văn bản Khai thị",
        children: [
          { name: "Bạch Thoại Phật Pháp" },
          { name: "Phật Ngôn Phật Ngữ" },
          { name: "Khai thị cho đệ tử" },
          { name: "Giải đáp thắc mắc qua thư" },
          { name: "Tóm tắt khai thị Pháp hội" },
        ],
      },
      {
        name: "Các Chương Trình Phát Thanh Trực Tiếp của Đài Trưởng",
        children: [
          { name: "Huyền Nghệ Vấn Đáp" },
          { name: "Huyền Nghệ Tổng Hợp" },
          { name: "Lời Nói Thẳng" },
          { name: "Phật Học Vấn Đáp" },
        ],
      },
      {
        name: "Giáo trình Huyền Học Nhập Môn",
        children: [
          { name: "Nhất Mệnh Nhì Vận Tam Phong Thủy" },
          { name: "Thiên Địa Nhân" },
          { name: "Thế Giới Đồ Đằng" },
        ],
      },
    ],
  },
  {
    name: "Thiết lập bàn thờ và các biểu mẫu giao thức",
    description: "Nghi lễ thực hành tại gia.",
    children: [
      {
        name: "Bàn thờ Phật",
        children: [
          { name: "Quy trình thiết lập bàn thờ tại gia" },
          { name: "Thiết lập Bàn Thờ Nhỏ" },
          { name: "Giao thức dâng hương và lên đèn hằng ngày" },
          { name: "Quy tắc an toàn từ trường" },
        ],
      },
      {
        name: "Các giao thức Thăng Văn",
        children: [
          { name: "Thăng Văn Đổi Tên" },
          { name: "Thăng Văn Khuyến Đạo" },
        ],
      },
    ],
  },
  {
    name: "Danh mục tra cứu sự việc đời sống",
    description: "Ứng dụng thực tế cuộc sống.",
    children: [
      {
        name: "Gia đình và Tình cảm",
        children: [
          { name: "Giải quyết mâu thuẫn gia đình" },
          { name: "Hóa giải oán kết, nợ tình, nợ tiền kiếp" },
          { name: "Cầu con và siêu độ vong nhi" },
        ],
      },
      {
        name: "Sức khỏe và Trị bệnh",
        children: [
          { name: "Nhận biết và chữa trị bệnh thể xác" },
          { name: "Nhận biết và hóa giải bệnh tâm linh" },
          { name: "Ứng dụng phóng sinh và trì tụng cho bệnh nan y" },
        ],
      },
      {
        name: "Học nghiệp và Sự nghiệp",
        children: [
          { name: "Cầu sự nghiệp thuận lợi" },
          { name: "Cầu học tập tiến bộ" },
        ],
      },
      {
        name: "Tín ngưỡng và Đời sống hằng ngày",
        children: [
          { name: "Ăn chay" },
          { name: "Nghiệp sát sinh" },
          { name: "Hóa giải hạn tuổi" },
          { name: "Giấc mơ" },
          { name: "Đốt vàng mã" },
          { name: "Phong thủy và bùa ngải" },
          { name: "Dây chuyền Bồ Tát" },
        ],
      },
    ],
  },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

async function upsertTopic(topic: TopicSeed, parentId: string | null, parentPath: string | null, level: number, sortOrder: number) {
  const slugBase = slugify(topic.name);
  const slug = parentPath ? `${parentPath}-${slugBase}`.slice(0, 180) : slugBase;
  const path = parentPath ? `${parentPath}/${slugBase}` : slugBase;

  const row = await prisma.postCategory.upsert({
    where: { slug },
    update: {
      name: topic.name,
      description: topic.description ?? null,
      parentId,
      level,
      path,
      sortOrder,
    },
    create: {
      publicId: nanoid(21),
      name: topic.name,
      slug,
      description: topic.description ?? null,
      parentId,
      level,
      path,
      sortOrder,
    },
  });

  for (const [index, child] of (topic.children ?? []).entries()) {
    await upsertTopic(child, row.id, path, level + 1, index);
  }
}

async function main() {
  for (const [index, topic] of topics.entries()) {
    await upsertTopic(topic, null, null, 0, index);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
