import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  RuleSeverity,
  RuleProductizationMode,
  UserRole,
  ContentStatus,
  AssetStatus,
  ReportStatus,
  CommunityPostStatus,
  GuestbookEntryStatus,
  EventStatus,
  PushJobStatus,
  VowStatus,
  VowType,
  GuideCategory,
  DownloadCategory,
} from "../src/generated/prisma/client.js";
import { nanoid } from "nanoid";
import * as argon2 from "argon2";
import { resolveDevAdminSeedConfig } from "../src/common/seed/dev-admin-seed-config.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run prisma seed.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

interface RuleData {
  ruleKey: string;
  title: string;
  canonicalWording: string;
  severity: RuleSeverity;
  productizationMode: RuleProductizationMode;
  safeLaneRefs?: string[];
  avoidItems?: string[];
  shortReason?: string;
  sourceReference?: string;
  referenceOnly?: boolean;
  sortOrder: number;
}

interface GroupData {
  groupKey: string;
  title: string;
  summary: string;
  sortOrder: number;
  versionNote?: string;
  rules: RuleData[];
}

const ENVIRONMENT_RULES_DATA: GroupData[] = [
  {
    groupKey: "time-rules",
    title: "Quy tắc về thời gian",
    summary: "Hướng dẫn chọn thời điểm phù hợp để niệm kinh, tránh các khung giờ không thuận lợi.",
    sortOrder: 1,
    rules: [
      {
        ruleKey: "time-early-morning",
        title: "Niệm kinh buổi sáng sớm",
        canonicalWording: "Buổi sáng sớm (từ 5h-7h) là thời điểm rất tốt để niệm kinh. Tâm còn thanh tịnh, không bị các lo toan trong ngày chi phối.",
        severity: RuleSeverity.ADVISORY,
        productizationMode: RuleProductizationMode.SAFE_LANE_SUGGESTION,
        shortReason: "Tâm thanh tịnh, ít bị phân tâm",
        sortOrder: 1,
      },
      {
        ruleKey: "time-evening-practice",
        title: "Niệm kinh buổi tối",
        canonicalWording: "Buổi tối (từ 19h-21h) cũng là thời điểm phù hợp. Nên niệm xong trước khi đi ngủ để tâm an định.",
        severity: RuleSeverity.ADVISORY,
        productizationMode: RuleProductizationMode.SAFE_LANE_SUGGESTION,
        shortReason: "Giúp tâm an định trước khi ngủ",
        sortOrder: 2,
      },
      {
        ruleKey: "time-lunar-special",
        title: "Ngày mùng 1 và 15 âm lịch",
        canonicalWording: "Ngày mùng 1 và ngày 15 âm lịch là những ngày tốt để tăng cường công phu. Có thể tăng số biến niệm nếu điều kiện cho phép.",
        severity: RuleSeverity.QUALITY_GUIDANCE,
        productizationMode: RuleProductizationMode.CHECKLIST_ITEM,
        shortReason: "Ngày tốt theo truyền thống tu tập",
        sortOrder: 3,
      },
      {
        ruleKey: "time-avoid-late-night",
        title: "Tránh niệm quá khuya",
        canonicalWording: "Không nên niệm kinh quá khuya (sau 23h) vì dễ mệt mỏi, ảnh hưởng đến chất lượng công phu. Nếu cần, nên niệm thầm.",
        severity: RuleSeverity.CAUTION,
        productizationMode: RuleProductizationMode.WARNING_CARD,
        avoidItems: ["Niệm ra tiếng sau 23h", "Cố gắng hoàn thành số biến khi quá mệt"],
        shortReason: "Tránh ảnh hưởng sức khỏe và chất lượng tu tập",
        sortOrder: 4,
      },
    ],
  },
  {
    groupKey: "place-rules",
    title: "Quy tắc về địa điểm",
    summary: "Hướng dẫn chọn nơi phù hợp để thực hành, đảm bảo sự trang nghiêm và thanh tịnh.",
    sortOrder: 2,
    rules: [
      {
        ruleKey: "place-clean-quiet",
        title: "Chọn nơi sạch sẽ, yên tĩnh",
        canonicalWording: "Nên chọn nơi sạch sẽ, gọn gàng, yên tĩnh để niệm kinh. Có thể là phòng riêng, bàn thờ Phật, hoặc góc nhà được dọn dẹp ngăn nắp.",
        severity: RuleSeverity.ADVISORY,
        productizationMode: RuleProductizationMode.CHECKLIST_ITEM,
        safeLaneRefs: ["Phòng riêng", "Góc thờ Phật", "Góc nhà yên tĩnh"],
        shortReason: "Giúp tập trung và giữ tâm thanh tịnh",
        sortOrder: 1,
      },
      {
        ruleKey: "place-avoid-bathroom",
        title: "Không niệm trong nhà vệ sinh",
        canonicalWording: "Tuyệt đối không niệm kinh ra tiếng trong nhà vệ sinh, phòng tắm. Nếu đang trong tình huống bất khả kháng, chỉ được niệm thầm trong tâm.",
        severity: RuleSeverity.STRONG_GUARDRAIL,
        productizationMode: RuleProductizationMode.WARNING_CARD,
        avoidItems: ["Niệm ra tiếng trong nhà vệ sinh", "Mang kinh sách vào nhà vệ sinh"],
        safeLaneRefs: ["Niệm thầm trong tâm nếu bất khả kháng"],
        shortReason: "Giữ sự tôn kính với kinh Phật",
        sortOrder: 2,
      },
      {
        ruleKey: "place-public-silent",
        title: "Nơi công cộng nên niệm thầm",
        canonicalWording: "Khi ở nơi công cộng như văn phòng, phương tiện giao thông, hoặc nơi đông người, nên niệm thầm để không ảnh hưởng người khác.",
        severity: RuleSeverity.ADVISORY,
        productizationMode: RuleProductizationMode.SAFE_LANE_SUGGESTION,
        safeLaneRefs: ["Niệm thầm trong tâm", "Sử dụng xâu chuỗi để đếm"],
        shortReason: "Tránh ảnh hưởng người xung quanh",
        sortOrder: 3,
      },
    ],
  },
  {
    groupKey: "food-body-rules",
    title: "Quy tắc về ăn uống và thân thể",
    summary: "Hướng dẫn về chế độ ăn uống và trạng thái thân thể khi tu tập.",
    sortOrder: 3,
    rules: [
      {
        ruleKey: "food-before-practice",
        title: "Ăn nhẹ trước khi niệm",
        canonicalWording: "Không nên niệm kinh khi bụng quá đói hoặc quá no. Nên ăn nhẹ, đủ no trước khi tu tập. Tránh ăn các thực phẩm nặng mùi như hành, tỏi trước khi niệm.",
        severity: RuleSeverity.ADVISORY,
        productizationMode: RuleProductizationMode.CHECKLIST_ITEM,
        avoidItems: ["Hành sống", "Tỏi sống", "Thức ăn nặng mùi"],
        shortReason: "Giữ hơi thở thanh khiết khi niệm",
        sortOrder: 1,
      },
      {
        ruleKey: "food-fasting-days",
        title: "Ngày ăn chay",
        canonicalWording: "Những ngày mùng 1, 15, và các ngày lễ lớn nên ăn chay để tăng cường công đức. Tuy nhiên, đây là khuyến khích, không bắt buộc.",
        severity: RuleSeverity.QUALITY_GUIDANCE,
        productizationMode: RuleProductizationMode.DRAWER_NOTE,
        shortReason: "Tăng cường công đức tu tập",
        sortOrder: 2,
      },
      {
        ruleKey: "body-hygiene-before",
        title: "Vệ sinh thân thể trước khi niệm",
        canonicalWording: "Nên rửa tay, súc miệng sạch sẽ trước khi niệm kinh. Nếu có điều kiện, nên tắm rửa hoặc thay quần áo sạch.",
        severity: RuleSeverity.ADVISORY,
        productizationMode: RuleProductizationMode.CHECKLIST_ITEM,
        safeLaneRefs: ["Rửa tay", "Súc miệng", "Thay quần áo sạch nếu có thể"],
        shortReason: "Thể hiện sự tôn kính",
        sortOrder: 3,
      },
      {
        ruleKey: "body-menstruation",
        title: "Phụ nữ trong kỳ kinh nguyệt",
        canonicalWording: "Phụ nữ trong kỳ kinh nguyệt vẫn có thể niệm kinh bình thường. Chỉ nên niệm thầm và tránh lạy Phật trong những ngày nặng nhất.",
        severity: RuleSeverity.ADVISORY,
        productizationMode: RuleProductizationMode.DRAWER_NOTE,
        safeLaneRefs: ["Niệm thầm", "Tránh lạy Phật những ngày nặng"],
        shortReason: "Vẫn có thể tu tập với điều chỉnh phù hợp",
        sortOrder: 4,
      },
    ],
  },
  {
    groupKey: "posture-hygiene-rules",
    title: "Quy tắc về tư thế và vệ sinh",
    summary: "Hướng dẫn về tư thế đúng và vệ sinh khi tu tập.",
    sortOrder: 4,
    rules: [
      {
        ruleKey: "posture-sitting",
        title: "Tư thế ngồi niệm",
        canonicalWording: "Nên ngồi thẳng lưng, thoải mái khi niệm kinh. Có thể ngồi trên ghế hoặc ngồi xếp bằng tùy sức khỏe. Không cần ép buộc tư thế kiết già nếu không quen.",
        severity: RuleSeverity.ADVISORY,
        productizationMode: RuleProductizationMode.SAFE_LANE_SUGGESTION,
        safeLaneRefs: ["Ngồi ghế thẳng lưng", "Ngồi xếp bằng", "Ngồi bán già"],
        shortReason: "Tư thế thoải mái giúp duy trì công phu lâu dài",
        sortOrder: 1,
      },
      {
        ruleKey: "posture-lying-down",
        title: "Niệm khi nằm",
        canonicalWording: "Có thể niệm thầm khi nằm nghỉ, nhưng không nên coi đây là tư thế chính thức. Khi khỏe mạnh nên ngồi niệm.",
        severity: RuleSeverity.CAUTION,
        productizationMode: RuleProductizationMode.DRAWER_NOTE,
        safeLaneRefs: ["Niệm thầm trong tâm khi nằm"],
        shortReason: "Tư thế nằm chỉ dùng khi sức khỏe không cho phép ngồi",
        sortOrder: 2,
      },
      {
        ruleKey: "hygiene-scriptures",
        title: "Giữ gìn kinh sách",
        canonicalWording: "Kinh sách phải được đặt ở nơi cao ráo, sạch sẽ. Không đặt dưới đất, không để đồ vật khác đè lên. Khi đọc xong nên đóng lại gọn gàng.",
        severity: RuleSeverity.STRONG_GUARDRAIL,
        productizationMode: RuleProductizationMode.CHECKLIST_ITEM,
        avoidItems: ["Đặt kinh sách dưới đất", "Để đồ đè lên kinh sách"],
        shortReason: "Thể hiện sự tôn kính với kinh Phật",
        sortOrder: 3,
      },
    ],
  },
  {
    groupKey: "special-location-cautions",
    title: "Lưu ý về địa điểm đặc biệt",
    summary: "Hướng dẫn khi thực hành tại các địa điểm có tính chất đặc biệt.",
    sortOrder: 5,
    rules: [
      {
        ruleKey: "location-temple",
        title: "Niệm kinh tại chùa",
        canonicalWording: "Khi niệm kinh tại chùa, nên tuân thủ quy định của chùa. Nếu chùa có khóa lễ chung thì nên tham gia cùng đại chúng.",
        severity: RuleSeverity.ADVISORY,
        productizationMode: RuleProductizationMode.DRAWER_NOTE,
        shortReason: "Tuân thủ quy định nơi tu tập chung",
        sortOrder: 1,
      },
      {
        ruleKey: "location-hospital",
        title: "Niệm kinh tại bệnh viện",
        canonicalWording: "Tại bệnh viện, nên niệm thầm để không ảnh hưởng bệnh nhân khác. Có thể niệm trong tâm hoặc sử dụng tai nghe để nghe pháp âm nhẹ nhàng.",
        severity: RuleSeverity.ADVISORY,
        productizationMode: RuleProductizationMode.SAFE_LANE_SUGGESTION,
        safeLaneRefs: ["Niệm thầm trong tâm", "Sử dụng tai nghe"],
        shortReason: "Tránh ảnh hưởng người khác khi ở bệnh viện",
        sortOrder: 2,
      },
      {
        ruleKey: "location-cemetery",
        title: "Niệm kinh tại nghĩa trang",
        canonicalWording: "Khi viếng mộ, có thể niệm kinh hồi hướng cho người đã mất. Nên niệm các bài kinh ngắn như Chú Đại Bi, Tâm Kinh, hoặc niệm danh hiệu Phật.",
        severity: RuleSeverity.ADVISORY,
        productizationMode: RuleProductizationMode.DRAWER_NOTE,
        safeLaneRefs: ["Chú Đại Bi", "Tâm Kinh", "Niệm Phật hiệu"],
        shortReason: "Hồi hướng công đức cho người đã mất",
        sortOrder: 3,
      },
    ],
  },
  {
    groupKey: "non-interpretive-cautions",
    title: "Lưu ý không nên tự diễn giải",
    summary: "Các hiện tượng cần tham vấn thầy, không tự suy đoán hoặc product hóa.",
    sortOrder: 6,
    rules: [
      {
        ruleKey: "non-interpretive-dreams",
        title: "Giấc mơ khi tu tập",
        canonicalWording: "Trong quá trình tu tập có thể xuất hiện các giấc mơ đặc biệt. Không nên tự diễn giải hay đoán ý nghĩa. Nếu lo lắng, nên tham vấn thầy.",
        severity: RuleSeverity.REFERENCE_ONLY,
        productizationMode: RuleProductizationMode.DO_NOT_AUTOMATE,
        referenceOnly: true,
        sourceReference: "Không có công cụ tự động diễn giải giấc mơ",
        sortOrder: 1,
      },
      {
        ruleKey: "non-interpretive-numbers",
        title: "Các con số xuất hiện",
        canonicalWording: "Nếu thấy các con số lặp lại hoặc đặc biệt trong tu tập, không nên tự gán ý nghĩa. Đây là hiện tượng cần tham vấn thầy nếu lo lắng.",
        severity: RuleSeverity.REFERENCE_ONLY,
        productizationMode: RuleProductizationMode.DO_NOT_AUTOMATE,
        referenceOnly: true,
        sourceReference: "Không có công cụ tự động diễn giải con số",
        sortOrder: 2,
      },
      {
        ruleKey: "non-interpretive-lights",
        title: "Hiện tượng ánh sáng",
        canonicalWording: "Nếu trong lúc niệm thấy các hiện tượng ánh sáng, không nên tự diễn giải là tốt hay xấu. Tiếp tục tu tập bình thường và tham vấn thầy nếu cần.",
        severity: RuleSeverity.REFERENCE_ONLY,
        productizationMode: RuleProductizationMode.DO_NOT_AUTOMATE,
        referenceOnly: true,
        sourceReference: "Không có công cụ tự động diễn giải hiện tượng tu tập",
        sortOrder: 3,
      },
      {
        ruleKey: "non-interpretive-incense",
        title: "Tro hương và ngọn lửa",
        canonicalWording: "Hình dạng tro hương hay ngọn lửa khi thắp hương không nên được tự diễn giải. Đây thuần túy là hiện tượng vật lý, không mang ý nghĩa siêu nhiên cần giải mã.",
        severity: RuleSeverity.REFERENCE_ONLY,
        productizationMode: RuleProductizationMode.DO_NOT_AUTOMATE,
        referenceOnly: true,
        sourceReference: "Không có công cụ tự động diễn giải hiện tượng tro hương",
        sortOrder: 4,
      },
    ],
  },
];

async function seedEnvironmentRules() {
  console.log("Seeding chant environment rules...");

  for (const groupData of ENVIRONMENT_RULES_DATA) {
    const groupPayload = {
      title: groupData.title,
      summary: groupData.summary,
      sortOrder: groupData.sortOrder,
      ...(groupData.versionNote ? { versionNote: groupData.versionNote } : {}),
    };

    const group = await prisma.chantEnvironmentRuleGroup.upsert({
      where: { groupKey: groupData.groupKey },
      update: groupPayload,
      create: {
        publicId: nanoid(21),
        groupKey: groupData.groupKey,
        ...groupPayload,
      },
    });

    console.log(`  Created/updated group: ${groupData.groupKey}`);

    for (const ruleData of groupData.rules) {
      const rulePayload = {
        title: ruleData.title,
        canonicalWording: ruleData.canonicalWording,
        severity: ruleData.severity,
        productizationMode: ruleData.productizationMode,
        safeLaneRefs: ruleData.safeLaneRefs || [],
        avoidItems: ruleData.avoidItems || [],
        referenceOnly: ruleData.referenceOnly || false,
        sortOrder: ruleData.sortOrder,
        ...(ruleData.shortReason ? { shortReason: ruleData.shortReason } : {}),
        ...(ruleData.sourceReference
          ? { sourceReference: ruleData.sourceReference }
          : {}),
      };

      await prisma.chantEnvironmentRule.upsert({
        where: { ruleKey: ruleData.ruleKey },
        update: rulePayload,
        create: {
          publicId: nanoid(21),
          groupId: group.id,
          ruleKey: ruleData.ruleKey,
          ...rulePayload,
        },
      });
    }

    console.log(`    Seeded ${groupData.rules.length} rules`);
  }

  console.log("Environment rules seeding complete.");
}

async function seedDevAdminUser() {
  const config = resolveDevAdminSeedConfig();

  if (!config.enabled) {
    console.log("Dev admin seeding is disabled for this environment.");
    return;
  }

  const passwordHash = await argon2.hash(config.password);
  const now = new Date();

  await prisma.user.upsert({
    where: { email: config.email },
    update: {
      passwordHash,
      displayName: config.displayName,
      role: config.role,
      status: "ACTIVE",
      emailVerifiedAt: now,
    },
    create: {
      publicId: nanoid(21),
      email: config.email,
      passwordHash,
      displayName: config.displayName,
      role: config.role,
      status: "ACTIVE",
      emailVerifiedAt: now,
    },
  });

  console.log(`Dev admin seeded: ${config.email} (${config.role})`);
}

type SeedUserSpec = {
  email: string;
  displayName: string;
  role: UserRole;
};

const SEED_EDITOR_USERS: SeedUserSpec[] = [
  { email: "editor.daily-practice@pmtl.local", displayName: "Biên tập Kinh Bài Tập", role: UserRole.ADMIN },
  { email: "editor.self-cultivation@pmtl.local", displayName: "Biên tập Kinh Văn Tự Tu", role: UserRole.ADMIN },
  { email: "editor.life-release@pmtl.local", displayName: "Biên tập Phóng Sanh", role: UserRole.ADMIN },
  { email: "editor.little-house@pmtl.local", displayName: "Biên tập Ngôi Nhà Nhỏ", role: UserRole.ADMIN },
  { email: "editor.media-library@pmtl.local", displayName: "Biên tập Thư viện", role: UserRole.ADMIN },
  { email: "editor.sutras@pmtl.local", displayName: "Biên tập Kinh Sách", role: UserRole.ADMIN },
  { email: "editor.guides@pmtl.local", displayName: "Biên tập Hướng dẫn", role: UserRole.ADMIN },
  { email: "ops.calendar@pmtl.local", displayName: "Điều phối Lịch sự kiện", role: UserRole.ADMIN },
  { email: "moderator.ops@pmtl.local", displayName: "Điều phối Kiểm duyệt", role: UserRole.ADMIN },
];

type SeedPostSpec = {
  publicId: string;
  slug: string;
  title: string;
  excerpt: string;
  status: ContentStatus;
  authorEmail: string;
  content: Record<string, unknown>;
};

const SEED_POSTS: SeedPostSpec[] = [
  {
    publicId: "seed-post-daily-practice-bat-dau",
    slug: "kinh-bai-tap-bat-dau",
    title: "Kinh Bài Tập Hằng Ngày: Bắt đầu đúng cách",
    excerpt: "Giới thiệu lộ trình khởi đầu, phân biệt các surface và checklist cơ bản.",
    status: ContentStatus.PUBLISHED,
    authorEmail: "editor.daily-practice@pmtl.local",
    content: {
      routeRef: "/kinh-bai-tap/bat-dau",
      sourceRef: "design/03-domains/content/REFERENCES/DAILY-PRACTICE-CONTENT-INVENTORY.MD",
      blocks: [
        { type: "hero_intro", text: "Kinh Bài Tập là công khóa hằng ngày cho member." },
        { type: "quick_summary", text: "Đi đều mỗi ngày, không ép quá sức." },
      ],
    },
  },
  {
    publicId: "seed-post-daily-practice-luu-y",
    slug: "kinh-bai-tap-luu-y-thoi-gian-dia-diem",
    title: "Kinh Bài Tập: Lưu ý thời gian và địa điểm",
    excerpt: "Tổng hợp quy tắc thời gian, nơi chốn và guardrails khi niệm.",
    status: ContentStatus.PUBLISHED,
    authorEmail: "editor.daily-practice@pmtl.local",
    content: {
      routeRef: "/kinh-bai-tap/luu-y/thoi-gian-va-dia-diem",
      sourceRef: "design/03-domains/content/REFERENCES/DAILY-PRACTICE-CONTENT-INVENTORY.MD",
      blocks: [
        { type: "time_place_rules", text: "Ưu tiên khung giờ sớm và tối phù hợp." },
        { type: "warning_list", text: "Không niệm ở nơi ô uế hoặc thời điểm bất lợi." },
      ],
    },
  },
  {
    publicId: "seed-post-life-release-basic-ritual",
    slug: "phong-sanh-nghi-thuc-co-ban",
    title: "Phóng Sanh: Nghi thức cơ bản",
    excerpt: "Chuỗi bước chuẩn từ cung thỉnh, tụng niệm đến thả loài vật.",
    status: ContentStatus.PUBLISHED,
    authorEmail: "editor.life-release@pmtl.local",
    content: {
      routeRef: "/huong-dan/phong-sanh/nghi-thuc-co-ban",
      sourceRef: "design/03-domains/content/REFERENCES/LIFE-RELEASE-CONTENT-INVENTORY.MD",
      blocks: [
        { type: "step_sequence", text: "7 bước nghi thức phóng sanh cơ bản." },
        { type: "chant_count_matrix", text: "Chú Đại Bi, Tâm Kinh, Thất Phật Diệt Tội." },
      ],
    },
  },
  {
    publicId: "seed-post-life-release-faq",
    slug: "phong-sanh-hoi-dap-thuong-gap",
    title: "Phóng Sanh: Hỏi đáp thường gặp",
    excerpt: "FAQ chuẩn cho các tình huống thực tế khi thực hành phóng sanh.",
    status: ContentStatus.DRAFT,
    authorEmail: "editor.life-release@pmtl.local",
    content: {
      routeRef: "/huong-dan/phong-sanh/hoi-dap",
      sourceRef: "design/03-domains/content/REFERENCES/LIFE-RELEASE-CONTENT-INVENTORY.MD",
      blocks: [
        { type: "faq_block", text: "Có thể niệm trên đường đi không?" },
        { type: "faq_block", text: "Nếu có loài vật tử vong thì xử lý thế nào?" },
      ],
    },
  },
  {
    publicId: "seed-post-media-library-hub",
    slug: "thu-vien-phap-mon-hub",
    title: "Thư viện pháp môn: Hub nội dung ảnh và video",
    excerpt: "Tổng hợp collection, playlist và album theo inventory canon.",
    status: ContentStatus.PUBLISHED,
    authorEmail: "editor.media-library@pmtl.local",
    content: {
      routeRef: "/thu-vien/phap-mon",
      sourceRef: "design/03-domains/content/REFERENCES/MEDIA-LIBRARY-CONTENT-INVENTORY.MD",
      blocks: [
        { type: "collection_grid", text: "Video playlist và photo album theo chủ đề." },
      ],
    },
  },
];

const DESIGN_INVENTORY_POSTS: SeedPostSpec[] = [
  {
    publicId: "seed-post-daily-practice-steps-newbie",
    slug: "kinh-bai-tap-cac-buoc-cho-nguoi-moi",
    title: "Kinh Bài Tập: Các bước cho người mới",
    excerpt: "Flow theo stepper từ Tịnh Khẩu đến Thất Phật Diệt Tội theo inventory canon.",
    status: ContentStatus.PUBLISHED,
    authorEmail: "editor.daily-practice@pmtl.local",
    content: {
      routeRef: "/kinh-bai-tap/cac-buoc/cho-nguoi-moi",
      sourceRef: "design/03-domains/content/REFERENCES/DAILY-PRACTICE-CONTENT-INVENTORY.MD",
      blocks: [{ type: "step_sequence" }, { type: "core_plan_matrix" }, { type: "warning_list" }],
    },
  },
  {
    publicId: "seed-post-daily-practice-note-technique",
    slug: "kinh-bai-tap-luu-y-cach-niem-dung",
    title: "Kinh Bài Tập: Cách niệm đúng",
    excerpt: "Lưu ý nhịp niệm, phát âm, và guardrail gián đoạn khi công khóa.",
    status: ContentStatus.PUBLISHED,
    authorEmail: "editor.daily-practice@pmtl.local",
    content: {
      routeRef: "/kinh-bai-tap/luu-y/cach-niem-dung",
      sourceRef: "design/03-domains/content/REFERENCES/DAILY-PRACTICE-CONTENT-INVENTORY.MD",
      blocks: [{ type: "do_dont_grid" }, { type: "warning_list" }],
    },
  },
  {
    publicId: "seed-post-daily-practice-faq",
    slug: "kinh-bai-tap-cau-hoi-thuong-gap",
    title: "Kinh Bài Tập: Câu hỏi thường gặp",
    excerpt: "FAQ thực hành thường gặp cho member mới bắt đầu.",
    status: ContentStatus.PUBLISHED,
    authorEmail: "editor.daily-practice@pmtl.local",
    content: {
      routeRef: "/kinh-bai-tap/luu-y/cau-hoi-thuong-gap",
      sourceRef: "design/03-domains/content/REFERENCES/DAILY-PRACTICE-CONTENT-INVENTORY.MD",
      blocks: [{ type: "faq_block" }],
    },
  },
  {
    publicId: "seed-post-daily-practice-scenario-newbie",
    slug: "kinh-bai-tap-theo-tinh-huong-nguoi-moi",
    title: "Kinh Bài Tập: Preset cho người mới",
    excerpt: "Preset khởi đầu với cường độ nhẹ, giữ đều công khóa.",
    status: ContentStatus.PUBLISHED,
    authorEmail: "editor.daily-practice@pmtl.local",
    content: {
      routeRef: "/kinh-bai-tap/theo-tinh-huong/nguoi-moi",
      sourceRef: "design/03-domains/content/REFERENCES/DAILY-PRACTICE-CONTENT-INVENTORY.MD",
      blocks: [{ type: "scenario_selector" }, { type: "core_plan_matrix" }],
    },
  },
  {
    publicId: "seed-post-daily-practice-scenario-work-study",
    slug: "kinh-bai-tap-theo-tinh-huong-cong-viec-hoc-hanh",
    title: "Kinh Bài Tập: Preset công việc học hành",
    excerpt: "Preset ưu tiên độ tập trung và nhịp thực hành phù hợp lịch bận.",
    status: ContentStatus.PUBLISHED,
    authorEmail: "editor.daily-practice@pmtl.local",
    content: {
      routeRef: "/kinh-bai-tap/theo-tinh-huong/cong-viec-hoc-hanh",
      sourceRef: "design/03-domains/content/REFERENCES/DAILY-PRACTICE-CONTENT-INVENTORY.MD",
      blocks: [{ type: "scenario_selector" }],
    },
  },
  {
    publicId: "seed-post-daily-practice-scenario-elderly",
    slug: "kinh-bai-tap-theo-tinh-huong-nguoi-cao-tuoi",
    title: "Kinh Bài Tập: Preset người cao tuổi",
    excerpt: "Preset giảm tải, ưu tiên bình an và thực hành bền vững.",
    status: ContentStatus.PUBLISHED,
    authorEmail: "editor.daily-practice@pmtl.local",
    content: {
      routeRef: "/kinh-bai-tap/theo-tinh-huong/nguoi-cao-tuoi",
      sourceRef: "design/03-domains/content/REFERENCES/DAILY-PRACTICE-CONTENT-INVENTORY.MD",
      blocks: [{ type: "scenario_selector" }, { type: "warning_list" }],
    },
  },
  {
    publicId: "seed-post-daily-practice-scenario-severe-illness",
    slug: "kinh-bai-tap-theo-tinh-huong-benh-nang",
    title: "Kinh Bài Tập: Preset bệnh nặng",
    excerpt: "Preset có guardrail mạnh, không thay thế tư vấn y khoa.",
    status: ContentStatus.DRAFT,
    authorEmail: "editor.daily-practice@pmtl.local",
    content: {
      routeRef: "/kinh-bai-tap/theo-tinh-huong/benh-nang",
      sourceRef: "design/03-domains/content/REFERENCES/DAILY-PRACTICE-CONTENT-INVENTORY.MD",
      blocks: [{ type: "warning_list" }, { type: "scenario_selector" }],
    },
  },
  {
    publicId: "seed-post-daily-practice-practice-entry",
    slug: "kinh-bai-tap-thuc-hanh",
    title: "Kinh Bài Tập: Bắt đầu thực hành",
    excerpt: "Cổng vào workflow thực hành với checklist ngày hôm nay.",
    status: ContentStatus.PUBLISHED,
    authorEmail: "editor.daily-practice@pmtl.local",
    content: {
      routeRef: "/kinh-bai-tap/thuc-hanh",
      sourceRef: "design/03-domains/content/REFERENCES/DAILY-PRACTICE-CONTENT-INVENTORY.MD",
      blocks: [{ type: "today_checklist_preview" }, { type: "advisory_context_card" }],
    },
  },
  {
    publicId: "seed-post-self-cultivation-start",
    slug: "kinh-van-tu-tu-bat-dau",
    title: "Kinh Văn Tự Tu: Bắt đầu",
    excerpt: "Giới thiệu surface Kinh Văn Tự Tu và boundary với các surface khác.",
    status: ContentStatus.PUBLISHED,
    authorEmail: "editor.self-cultivation@pmtl.local",
    content: {
      routeRef: "/kinh-van-tu-tu/bat-dau",
      sourceRef: "design/03-domains/content/REFERENCES/DAILY-PRACTICE-CONTENT-INVENTORY.MD",
      blocks: [{ type: "comparison_table" }, { type: "download_panel" }],
    },
  },
  {
    publicId: "seed-post-self-cultivation-usage",
    slug: "kinh-van-tu-tu-cach-dung",
    title: "Kinh Văn Tự Tu: Cách dùng",
    excerpt: "Checklist vận hành và các trường hợp sử dụng chính.",
    status: ContentStatus.PUBLISHED,
    authorEmail: "editor.self-cultivation@pmtl.local",
    content: {
      routeRef: "/kinh-van-tu-tu/cach-dung",
      sourceRef: "design/03-domains/content/REFERENCES/DAILY-PRACTICE-CONTENT-INVENTORY.MD",
      blocks: [{ type: "checklist_card" }],
    },
  },
  {
    publicId: "seed-post-self-cultivation-storage",
    slug: "kinh-van-tu-tu-bao-quan",
    title: "Kinh Văn Tự Tu: Bảo quản",
    excerpt: "Quy tắc giữ gìn và lưu trữ kinh văn đúng chuẩn.",
    status: ContentStatus.PUBLISHED,
    authorEmail: "editor.self-cultivation@pmtl.local",
    content: {
      routeRef: "/kinh-van-tu-tu/bao-quan",
      sourceRef: "design/03-domains/content/REFERENCES/DAILY-PRACTICE-CONTENT-INVENTORY.MD",
      blocks: [{ type: "warning_list" }],
    },
  },
  {
    publicId: "seed-post-life-release-self",
    slug: "phong-sanh-cho-ban-than",
    title: "Phóng Sanh: Cho bản thân",
    excerpt: "Mẫu khấn chuẩn cho trường hợp tự phóng sanh.",
    status: ContentStatus.PUBLISHED,
    authorEmail: "editor.life-release@pmtl.local",
    content: {
      routeRef: "/huong-dan/phong-sanh/cho-ban-than",
      sourceRef: "design/03-domains/content/REFERENCES/LIFE-RELEASE-CONTENT-INVENTORY.MD",
      blocks: [{ type: "ritual_variant" }],
    },
  },
  {
    publicId: "seed-post-life-release-for-other",
    slug: "phong-sanh-cho-nguoi-khac",
    title: "Phóng Sanh: Cho người khác",
    excerpt: "Mẫu khấn và guardrail cho case hồi hướng giúp người khác.",
    status: ContentStatus.PUBLISHED,
    authorEmail: "editor.life-release@pmtl.local",
    content: {
      routeRef: "/huong-dan/phong-sanh/cho-nguoi-khac",
      sourceRef: "design/03-domains/content/REFERENCES/LIFE-RELEASE-CONTENT-INVENTORY.MD",
      blocks: [{ type: "ritual_variant" }, { type: "warning_list" }],
    },
  },
  {
    publicId: "seed-post-life-release-prep",
    slug: "phong-sanh-luu-y-va-chuan-bi",
    title: "Phóng Sanh: Lưu ý và chuẩn bị",
    excerpt: "Checklist trước khi đi, trên đường đi và tại địa điểm thực hành.",
    status: ContentStatus.PUBLISHED,
    authorEmail: "editor.life-release@pmtl.local",
    content: {
      routeRef: "/huong-dan/phong-sanh/luu-y-va-chuan-bi",
      sourceRef: "design/03-domains/content/REFERENCES/LIFE-RELEASE-CONTENT-INVENTORY.MD",
      blocks: [{ type: "required_items" }, { type: "checklist_card" }],
    },
  },
  {
    publicId: "seed-post-life-release-handle-mortality",
    slug: "phong-sanh-xu-ly-khi-co-loai-vat-tu-vong",
    title: "Phóng Sanh: Xử lý khi có loài vật tử vong",
    excerpt: "Matrix số biến Chú Vãng Sanh theo từng loài.",
    status: ContentStatus.PUBLISHED,
    authorEmail: "editor.life-release@pmtl.local",
    content: {
      routeRef: "/huong-dan/phong-sanh/xu-ly-khi-co-loai-vat-tu-vong",
      sourceRef: "design/03-domains/content/REFERENCES/LIFE-RELEASE-CONTENT-INVENTORY.MD",
      blocks: [{ type: "species_count_matrix" }, { type: "faq_block" }],
    },
  },
  {
    publicId: "seed-post-little-house-start",
    slug: "ngoi-nha-nho-bat-dau",
    title: "Ngôi Nhà Nhỏ: Bắt đầu",
    excerpt: "Giới thiệu surface, 4 loại biến và dụng cụ bắt buộc.",
    status: ContentStatus.PUBLISHED,
    authorEmail: "editor.little-house@pmtl.local",
    content: {
      routeRef: "/ngoi-nha-nho/bat-dau",
      sourceRef: "design/03-domains/content/REFERENCES/LITTLE-HOUSE-CONTENT-INVENTORY.MD",
      blocks: [{ type: "ritual_structure" }, { type: "required_items" }],
    },
  },
  {
    publicId: "seed-post-little-house-chanting-notes",
    slug: "ngoi-nha-nho-tri-tung-luu-y",
    title: "Ngôi Nhà Nhỏ: Lưu ý trước khi trì tụng",
    excerpt: "Các lưu ý giờ giấc, điều kiện và chuẩn bị trước khi niệm.",
    status: ContentStatus.PUBLISHED,
    authorEmail: "editor.little-house@pmtl.local",
    content: {
      routeRef: "/ngoi-nha-nho/tri-tung/luu-y",
      sourceRef: "design/03-domains/content/REFERENCES/LITTLE-HOUSE-CONTENT-INVENTORY.MD",
      blocks: [{ type: "warning_list" }, { type: "do_dont_grid" }],
    },
  },
  {
    publicId: "seed-post-little-house-steps",
    slug: "ngoi-nha-nho-tri-tung-cac-buoc",
    title: "Ngôi Nhà Nhỏ: Trình tự các bước",
    excerpt: "Flow 7 bước từ điền thông tin đến hoàn thành tờ kinh.",
    status: ContentStatus.PUBLISHED,
    authorEmail: "editor.little-house@pmtl.local",
    content: {
      routeRef: "/ngoi-nha-nho/tri-tung/cac-buoc",
      sourceRef: "design/03-domains/content/REFERENCES/LITTLE-HOUSE-CONTENT-INVENTORY.MD",
      blocks: [{ type: "step_sequence" }, { type: "script_block" }],
    },
  },
  {
    publicId: "seed-post-little-house-red-dot",
    slug: "ngoi-nha-nho-tri-tung-cham-do",
    title: "Ngôi Nhà Nhỏ: Cách chấm đỏ",
    excerpt: "Chuẩn chấm đỏ đúng/sai và checklist tránh lỗi thường gặp.",
    status: ContentStatus.DRAFT,
    authorEmail: "editor.little-house@pmtl.local",
    content: {
      routeRef: "/ngoi-nha-nho/tri-tung/cham-do",
      sourceRef: "design/03-domains/content/REFERENCES/LITTLE-HOUSE-CONTENT-INVENTORY.MD",
      blocks: [{ type: "image_compare" }, { type: "warning_list" }],
    },
  },
  {
    publicId: "seed-post-little-house-burning-process",
    slug: "ngoi-nha-nho-dot-va-hau-xu-ly-quy-trinh-dot",
    title: "Ngôi Nhà Nhỏ: Quy trình đốt",
    excerpt: "HowTo 8 bước đốt tờ kinh và xử lý tro đúng chuẩn.",
    status: ContentStatus.PUBLISHED,
    authorEmail: "editor.little-house@pmtl.local",
    content: {
      routeRef: "/ngoi-nha-nho/dot-va-hau-xu-ly/quy-trinh-dot",
      sourceRef: "design/03-domains/content/REFERENCES/LITTLE-HOUSE-CONTENT-INVENTORY.MD",
      blocks: [{ type: "step_sequence" }, { type: "required_items" }, { type: "warning_list" }],
    },
  },
  {
    publicId: "seed-post-little-house-burning-notes",
    slug: "ngoi-nha-nho-dot-va-hau-xu-ly-luu-y-dot",
    title: "Ngôi Nhà Nhỏ: Lưu ý khi đốt",
    excerpt: "Danh sách việc không được làm và được phép làm khi đốt.",
    status: ContentStatus.PUBLISHED,
    authorEmail: "editor.little-house@pmtl.local",
    content: {
      routeRef: "/ngoi-nha-nho/dot-va-hau-xu-ly/luu-y-dot",
      sourceRef: "design/03-domains/content/REFERENCES/LITTLE-HOUSE-CONTENT-INVENTORY.MD",
      blocks: [{ type: "do_dont_grid" }, { type: "warning_list" }],
    },
  },
  {
    publicId: "seed-post-little-house-lookup-quantity",
    slug: "ngoi-nha-nho-tra-cuu-so-luong",
    title: "Ngôi Nhà Nhỏ: Tra cứu số lượng theo tình huống",
    excerpt: "Case matrix số lượng tờ theo từng bối cảnh thực hành.",
    status: ContentStatus.PUBLISHED,
    authorEmail: "editor.little-house@pmtl.local",
    content: {
      routeRef: "/ngoi-nha-nho/tra-cuu/so-luong",
      sourceRef: "design/03-domains/content/REFERENCES/LITTLE-HOUSE-CONTENT-INVENTORY.MD",
      blocks: [{ type: "case_matrix" }],
    },
  },
  {
    publicId: "seed-post-little-house-lookup-faq",
    slug: "ngoi-nha-nho-tra-cuu-hoi-dap",
    title: "Ngôi Nhà Nhỏ: Hỏi đáp",
    excerpt: "FAQ chuẩn hóa cho các câu hỏi thực hành phổ biến.",
    status: ContentStatus.PUBLISHED,
    authorEmail: "editor.little-house@pmtl.local",
    content: {
      routeRef: "/ngoi-nha-nho/tra-cuu/hoi-dap",
      sourceRef: "design/03-domains/content/REFERENCES/LITTLE-HOUSE-CONTENT-INVENTORY.MD",
      blocks: [{ type: "faq_block" }],
    },
  },
];

type SeedMediaSpec = {
  publicId: string;
  filename: string;
  mimeType: string;
  size: number;
  storageKey: string;
  url: string;
  width?: number;
  height?: number;
  status: AssetStatus;
  uploaderEmail: string;
  metadata: Record<string, unknown>;
};

const SEED_MEDIA_ASSETS: SeedMediaSpec[] = [
  {
    publicId: "seed-media-video-intro-phap-mon",
    filename: "video-gioi-thieu-phap-mon.mp4",
    mimeType: "video/mp4",
    size: 48_500_000,
    storageKey: "media-library/video-gioi-thieu-phap-mon.mp4",
    url: "http://127.0.0.1:3001/media/media-library/video-gioi-thieu-phap-mon.mp4",
    status: AssetStatus.READY,
    uploaderEmail: "editor.media-library@pmtl.local",
    metadata: { collection: "video_playlist", sourceRef: "MEDIA-LIBRARY-CONTENT-INVENTORY" },
  },
  {
    publicId: "seed-media-photo-phap-hoi-01",
    filename: "anh-phap-hoi-01.jpg",
    mimeType: "image/jpeg",
    size: 2_400_000,
    storageKey: "media-library/anh-phap-hoi-01.jpg",
    url: "http://127.0.0.1:3001/media/media-library/anh-phap-hoi-01.jpg",
    width: 1920,
    height: 1080,
    status: AssetStatus.READY,
    uploaderEmail: "editor.media-library@pmtl.local",
    metadata: { collection: "photo_album", sourceRef: "MEDIA-LIBRARY-CONTENT-INVENTORY" },
  },
  {
    publicId: "seed-media-checklist-phong-sanh",
    filename: "checklist-phong-sanh-printable.pdf",
    mimeType: "application/pdf",
    size: 620_000,
    storageKey: "downloads/checklist-phong-sanh-printable.pdf",
    url: "http://127.0.0.1:3001/media/downloads/checklist-phong-sanh-printable.pdf",
    status: AssetStatus.READY,
    uploaderEmail: "editor.life-release@pmtl.local",
    metadata: { type: "download_panel", sourceRef: "LIFE-RELEASE-CONTENT-INVENTORY" },
  },
];

const DESIGN_INVENTORY_MEDIA_ASSETS: SeedMediaSpec[] = [
  {
    publicId: "seed-media-daily-practice-guide-pdf",
    filename: "huong-dan-kinh-bai-tap-nguoi-moi.pdf",
    mimeType: "application/pdf",
    size: 1_200_000,
    storageKey: "downloads/huong-dan-kinh-bai-tap-nguoi-moi.pdf",
    url: "http://127.0.0.1:3001/media/downloads/huong-dan-kinh-bai-tap-nguoi-moi.pdf",
    status: AssetStatus.READY,
    uploaderEmail: "editor.daily-practice@pmtl.local",
    metadata: { routeRef: "/kinh-bai-tap/bat-dau", sourceRef: "DAILY-PRACTICE-CONTENT-INVENTORY" },
  },
  {
    publicId: "seed-media-daily-practice-checklist",
    filename: "checklist-cong-khoa-hang-ngay.pdf",
    mimeType: "application/pdf",
    size: 540_000,
    storageKey: "downloads/checklist-cong-khoa-hang-ngay.pdf",
    url: "http://127.0.0.1:3001/media/downloads/checklist-cong-khoa-hang-ngay.pdf",
    status: AssetStatus.READY,
    uploaderEmail: "editor.daily-practice@pmtl.local",
    metadata: { routeRef: "/kinh-bai-tap/thuc-hanh", sourceRef: "DAILY-PRACTICE-CONTENT-INVENTORY" },
  },
  {
    publicId: "seed-media-life-release-ritual-pdf",
    filename: "nghi-thuc-phong-sanh-pmtl.pdf",
    mimeType: "application/pdf",
    size: 780_000,
    storageKey: "downloads/nghi-thuc-phong-sanh-pmtl.pdf",
    url: "http://127.0.0.1:3001/media/downloads/nghi-thuc-phong-sanh-pmtl.pdf",
    status: AssetStatus.READY,
    uploaderEmail: "editor.life-release@pmtl.local",
    metadata: { routeRef: "/huong-dan/phong-sanh/nghi-thuc-co-ban", sourceRef: "LIFE-RELEASE-CONTENT-INVENTORY" },
  },
  {
    publicId: "seed-media-life-release-khan-card",
    filename: "mau-khan-phong-sanh-card.pdf",
    mimeType: "application/pdf",
    size: 420_000,
    storageKey: "downloads/mau-khan-phong-sanh-card.pdf",
    url: "http://127.0.0.1:3001/media/downloads/mau-khan-phong-sanh-card.pdf",
    status: AssetStatus.READY,
    uploaderEmail: "editor.life-release@pmtl.local",
    metadata: { routeRef: "/huong-dan/phong-sanh/cho-ban-than", sourceRef: "LIFE-RELEASE-CONTENT-INVENTORY" },
  },
  {
    publicId: "seed-media-little-house-front",
    filename: "nha-nho-mat-truoc.jpg",
    mimeType: "image/jpeg",
    size: 1_900_000,
    storageKey: "little-house/nha-nho-mat-truoc.jpg",
    url: "http://127.0.0.1:3001/media/little-house/nha-nho-mat-truoc.jpg",
    width: 1600,
    height: 900,
    status: AssetStatus.READY,
    uploaderEmail: "editor.little-house@pmtl.local",
    metadata: { routeRef: "/ngoi-nha-nho/bat-dau", sourceRef: "LITTLE-HOUSE-CONTENT-INVENTORY" },
  },
  {
    publicId: "seed-media-little-house-back",
    filename: "nha-nho-mat-sau.jpg",
    mimeType: "image/jpeg",
    size: 1_820_000,
    storageKey: "little-house/nha-nho-mat-sau.jpg",
    url: "http://127.0.0.1:3001/media/little-house/nha-nho-mat-sau.jpg",
    width: 1600,
    height: 900,
    status: AssetStatus.READY,
    uploaderEmail: "editor.little-house@pmtl.local",
    metadata: { routeRef: "/ngoi-nha-nho/bat-dau", sourceRef: "LITTLE-HOUSE-CONTENT-INVENTORY" },
  },
  {
    publicId: "seed-media-little-house-red-dot-correct",
    filename: "cham-do-dung.jpg",
    mimeType: "image/jpeg",
    size: 1_100_000,
    storageKey: "little-house/cham-do-dung.jpg",
    url: "http://127.0.0.1:3001/media/little-house/cham-do-dung.jpg",
    width: 1280,
    height: 720,
    status: AssetStatus.READY,
    uploaderEmail: "editor.little-house@pmtl.local",
    metadata: { routeRef: "/ngoi-nha-nho/tri-tung/cham-do", sourceRef: "LITTLE-HOUSE-CONTENT-INVENTORY" },
  },
  {
    publicId: "seed-media-little-house-burn-process",
    filename: "dot-goc-phai.jpg",
    mimeType: "image/jpeg",
    size: 1_450_000,
    storageKey: "little-house/dot-goc-phai.jpg",
    url: "http://127.0.0.1:3001/media/little-house/dot-goc-phai.jpg",
    width: 1280,
    height: 720,
    status: AssetStatus.READY,
    uploaderEmail: "editor.little-house@pmtl.local",
    metadata: { routeRef: "/ngoi-nha-nho/dot-va-hau-xu-ly/quy-trinh-dot", sourceRef: "LITTLE-HOUSE-CONTENT-INVENTORY" },
  },
  {
    publicId: "seed-media-little-house-27-template",
    filename: "mau-in-nha-nho-27-bien.pdf",
    mimeType: "application/pdf",
    size: 680_000,
    storageKey: "downloads/mau-in-nha-nho-27-bien.pdf",
    url: "http://127.0.0.1:3001/media/downloads/mau-in-nha-nho-27-bien.pdf",
    status: AssetStatus.READY,
    uploaderEmail: "editor.little-house@pmtl.local",
    metadata: { routeRef: "/ngoi-nha-nho/tra-cuu/in-an", sourceRef: "LITTLE-HOUSE-CONTENT-INVENTORY" },
  },
  {
    publicId: "seed-media-little-house-49-template",
    filename: "mau-in-nha-nho-49-bien.pdf",
    mimeType: "application/pdf",
    size: 720_000,
    storageKey: "downloads/mau-in-nha-nho-49-bien.pdf",
    url: "http://127.0.0.1:3001/media/downloads/mau-in-nha-nho-49-bien.pdf",
    status: AssetStatus.READY,
    uploaderEmail: "editor.little-house@pmtl.local",
    metadata: { routeRef: "/ngoi-nha-nho/tra-cuu/in-an", sourceRef: "LITTLE-HOUSE-CONTENT-INVENTORY" },
  },
  {
    publicId: "seed-media-media-library-collection-cover-1",
    filename: "video-phap-mon-cover.jpg",
    mimeType: "image/jpeg",
    size: 890_000,
    storageKey: "media-library/covers/video-phap-mon-cover.jpg",
    url: "http://127.0.0.1:3001/media/media-library/covers/video-phap-mon-cover.jpg",
    width: 1200,
    height: 675,
    status: AssetStatus.READY,
    uploaderEmail: "editor.media-library@pmtl.local",
    metadata: { routeRef: "/thu-vien/phap-mon", sourceRef: "MEDIA-LIBRARY-CONTENT-INVENTORY" },
  },
  {
    publicId: "seed-media-media-library-collection-cover-2",
    filename: "anh-phap-hoi-cover.jpg",
    mimeType: "image/jpeg",
    size: 930_000,
    storageKey: "media-library/covers/anh-phap-hoi-cover.jpg",
    url: "http://127.0.0.1:3001/media/media-library/covers/anh-phap-hoi-cover.jpg",
    width: 1200,
    height: 675,
    status: AssetStatus.READY,
    uploaderEmail: "editor.media-library@pmtl.local",
    metadata: { routeRef: "/thu-vien/phap-mon", sourceRef: "MEDIA-LIBRARY-CONTENT-INVENTORY" },
  },
];

async function ensureSeedUsers() {
  const config = resolveDevAdminSeedConfig();
  const passwordHash = await argon2.hash(config.password);
  const now = new Date();

  const usersByEmail = new Map<string, { id: string; publicId: string; displayName: string }>();

  const allUsers: SeedUserSpec[] = [
    ...SEED_EDITOR_USERS,
    { email: config.email, displayName: config.displayName, role: config.role },
  ];

  for (const spec of allUsers) {
    const user = await prisma.user.upsert({
      where: { email: spec.email },
      update: {
        displayName: spec.displayName,
        role: spec.role,
        status: "ACTIVE",
        emailVerifiedAt: now,
      },
      create: {
        publicId: nanoid(21),
        email: spec.email,
        passwordHash,
        displayName: spec.displayName,
        role: spec.role,
        status: "ACTIVE",
        emailVerifiedAt: now,
      },
      select: { id: true, publicId: true, displayName: true },
    });

    usersByEmail.set(spec.email, user);
  }

  return usersByEmail;
}

async function seedFeatureFlags() {
  const flags = [
    { key: "admin.dashboard.live", enabled: true, description: "Bật dashboard lấy dữ liệu thật" },
    { key: "admin.health.extended", enabled: true, description: "Bật health extended cho admin" },
    { key: "admin.media.workspace", enabled: true, description: "Bật workspace media asset thật" },
    { key: "search.meilisearch.enabled", enabled: true, description: "Search authority dùng Meilisearch" },
  ];

  for (const flag of flags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: { enabled: flag.enabled, description: flag.description },
      create: { key: flag.key, enabled: flag.enabled, description: flag.description },
    });
  }

  console.log(`Seeded ${flags.length} feature flags.`);
}

async function seedPosts(usersByEmail: Map<string, { id: string; publicId: string; displayName: string }>) {
  const allPosts = [...SEED_POSTS, ...DESIGN_INVENTORY_POSTS];

  for (const spec of allPosts) {
    const author = usersByEmail.get(spec.authorEmail);
    if (!author) {
      throw new Error(`Không tìm thấy tác giả seed: ${spec.authorEmail}`);
    }

    const existing = await prisma.post.findFirst({
      where: {
        OR: [{ publicId: spec.publicId }, { slug: spec.slug }],
      },
      select: { publicId: true },
    });

    if (existing) {
      await prisma.post.update({
        where: { publicId: existing.publicId },
        data: {
          publicId: spec.publicId,
          slug: spec.slug,
          title: spec.title,
          status: spec.status,
          content: spec.content,
          authorId: author.id,
          publishedAt: spec.status === ContentStatus.PUBLISHED ? new Date() : null,
        },
      });
      continue;
    }

    await prisma.post.create({
      data: {
        publicId: spec.publicId,
        slug: spec.slug,
        title: spec.title,
        status: spec.status,
        content: spec.content,
        authorId: author.id,
        publishedAt: spec.status === ContentStatus.PUBLISHED ? new Date() : null,
      },
    });
  }

  console.log(`Seeded ${allPosts.length} posts from design inventories.`);
}

async function seedMediaAssets(usersByEmail: Map<string, { id: string; publicId: string; displayName: string }>) {
  const allAssets = [...SEED_MEDIA_ASSETS, ...DESIGN_INVENTORY_MEDIA_ASSETS];

  for (const spec of allAssets) {
    const uploader = usersByEmail.get(spec.uploaderEmail);
    if (!uploader) {
      throw new Error(`Không tìm thấy uploader seed: ${spec.uploaderEmail}`);
    }

    await prisma.mediaAsset.upsert({
      where: { publicId: spec.publicId },
      update: {
        filename: spec.filename,
        mimeType: spec.mimeType,
        size: spec.size,
        storageKey: spec.storageKey,
        url: spec.url,
        width: spec.width ?? null,
        height: spec.height ?? null,
        status: spec.status,
        uploaderId: uploader.id,
        metadata: spec.metadata,
      },
      create: {
        publicId: spec.publicId,
        filename: spec.filename,
        mimeType: spec.mimeType,
        size: spec.size,
        storageKey: spec.storageKey,
        url: spec.url,
        width: spec.width ?? null,
        height: spec.height ?? null,
        status: spec.status,
        uploaderId: uploader.id,
        metadata: spec.metadata,
      },
    });
  }

  console.log(`Seeded ${allAssets.length} media assets.`);
}

async function seedModerationReports(usersByEmail: Map<string, { id: string; publicId: string; displayName: string }>) {
  const moderator = usersByEmail.get("moderator.ops@pmtl.local");
  const reporter = usersByEmail.get("editor.daily-practice@pmtl.local");

  if (!moderator || !reporter) {
    throw new Error("Thiếu user seed cho moderation reports.");
  }

  const reports = [
    {
      publicId: "seed-report-post-daily-practice-01",
      targetType: "post",
      targetId: "seed-post-daily-practice-bat-dau",
      reasonCode: "misinformation",
      description: "Cần rà soát wording phần lưu ý giờ giấc để tránh hiểu sai.",
      status: ReportStatus.PENDING,
      decisionBy: null,
      decisionAt: null,
      decisionNote: null,
    },
    {
      publicId: "seed-report-post-life-release-01",
      targetType: "post",
      targetId: "seed-post-life-release-faq",
      reasonCode: "other",
      description: "Đề nghị bổ sung ví dụ thực tế cho phần FAQ.",
      status: ReportStatus.RESOLVED_IGNORE,
      decisionBy: moderator.id,
      decisionAt: new Date(),
      decisionNote: "Nội dung hợp lệ, chỉ cần tăng chất lượng ở đợt cập nhật tiếp theo.",
    },
  ];

  for (const report of reports) {
    await prisma.moderationReport.upsert({
      where: { publicId: report.publicId },
      update: {
        reporterUserId: reporter.id,
        targetType: report.targetType,
        targetId: report.targetId,
        reasonCode: report.reasonCode,
        description: report.description,
        status: report.status,
        decisionBy: report.decisionBy,
        decisionAt: report.decisionAt,
        decisionNote: report.decisionNote,
      },
      create: {
        publicId: report.publicId,
        reporterUserId: reporter.id,
        targetType: report.targetType,
        targetId: report.targetId,
        reasonCode: report.reasonCode,
        description: report.description,
        status: report.status,
        decisionBy: report.decisionBy,
        decisionAt: report.decisionAt,
        decisionNote: report.decisionNote,
      },
    });
  }

  console.log(`Seeded ${reports.length} moderation reports.`);
}

async function seedAuditLogs(usersByEmail: Map<string, { id: string; publicId: string; displayName: string }>) {
  const actor = usersByEmail.get("moderator.ops@pmtl.local");
  if (!actor) {
    throw new Error("Thiếu user seed cho audit logs.");
  }

  const logs = [
    {
      id: "seed-audit-admin-dashboard-01",
      action: "admin.dashboard.view",
      resource: "dashboard",
      resourceId: "admin/system/dashboard-stats",
      metadata: { source: "seed", note: "Initial dashboard data seeded from design inventory." },
    },
    {
      id: "seed-audit-content-publish-01",
      action: "content.post.publish",
      resource: "post",
      resourceId: "seed-post-daily-practice-bat-dau",
      metadata: { source: "seed", title: "Kinh Bài Tập Hằng Ngày: Bắt đầu đúng cách" },
    },
  ];

  for (const log of logs) {
    await prisma.auditLog.upsert({
      where: { id: log.id },
      update: {
        actorId: actor.id,
        actorType: "admin",
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId,
        metadata: log.metadata,
      },
      create: {
        id: log.id,
        actorId: actor.id,
        actorType: "admin",
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId,
        metadata: log.metadata,
      },
    });
  }

  console.log(`Seeded ${logs.length} audit logs.`);
}

async function seedSessions(usersByEmail: Map<string, { id: string; publicId: string; displayName: string }>) {
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);
  const revokedAt = new Date(Date.now() - 1000 * 60 * 60 * 24);

  let createdCount = 0;
  for (const [email, user] of usersByEmail.entries()) {
    const normalized = email.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

    await prisma.session.upsert({
      where: { refreshToken: `seed-session-active-${normalized}` },
      update: {
        userId: user.id,
        userAgent: "seed/active-session",
        ipAddress: "127.0.0.1",
        expiresAt,
        revokedAt: null,
      },
      create: {
        userId: user.id,
        refreshToken: `seed-session-active-${normalized}`,
        userAgent: "seed/active-session",
        ipAddress: "127.0.0.1",
        expiresAt,
        revokedAt: null,
      },
    });

    await prisma.session.upsert({
      where: { refreshToken: `seed-session-revoked-${normalized}` },
      update: {
        userId: user.id,
        userAgent: "seed/revoked-session",
        ipAddress: "127.0.0.1",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
        revokedAt,
      },
      create: {
        userId: user.id,
        refreshToken: `seed-session-revoked-${normalized}`,
        userAgent: "seed/revoked-session",
        ipAddress: "127.0.0.1",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
        revokedAt,
      },
    });

    createdCount += 2;
  }

  console.log(`Seeded ${createdCount} sessions.`);
}

async function seedWebhookDeliveries() {
  const deliveries = [
    {
      provider: "stripe",
      eventId: "seed-stripe-payment-completed-1",
      eventType: "payment.completed",
      status: "PROCESSED",
      metadata: { source: "seed", domain: "vows-merit" },
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
    {
      provider: "stripe",
      eventId: "seed-stripe-payment-failed-1",
      eventType: "payment.failed",
      status: "FAILED",
      metadata: { source: "seed", domain: "vows-merit", reason: "card_declined" },
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
    {
      provider: "cloudflare",
      eventId: "seed-cf-cache-purge-1",
      eventType: "cache.purge",
      status: "PROCESSED",
      metadata: { source: "seed", domain: "content" },
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
  ];

  for (const delivery of deliveries) {
    await prisma.webhookDelivery.upsert({
      where: { provider_eventId: { provider: delivery.provider, eventId: delivery.eventId } },
      update: {
        eventType: delivery.eventType,
        status: delivery.status,
        metadata: delivery.metadata,
        expiresAt: delivery.expiresAt,
      },
      create: delivery,
    });
  }

  console.log(`Seeded ${deliveries.length} webhook deliveries.`);
}

async function seedRateLimitRecords() {
  const now = new Date();
  const records = [
    {
      key: "seed:auth:login:127.0.0.1",
      endpoint: "/api/auth/login",
      count: 2,
      windowStart: new Date(now.getTime() - 1000 * 60 * 10),
      expiresAt: new Date(now.getTime() + 1000 * 60 * 50),
    },
    {
      key: "seed:content:posts:list:127.0.0.1",
      endpoint: "/api/content/posts",
      count: 14,
      windowStart: new Date(now.getTime() - 1000 * 60 * 5),
      expiresAt: new Date(now.getTime() + 1000 * 60 * 55),
    },
  ];

  for (const record of records) {
    await prisma.rateLimitRecord.upsert({
      where: {
        key_endpoint_windowStart: {
          key: record.key,
          endpoint: record.endpoint,
          windowStart: record.windowStart,
        },
      },
      update: { count: record.count, expiresAt: record.expiresAt },
      create: record,
    });
  }

  console.log(`Seeded ${records.length} rate-limit records.`);
}

// ============================================================================
// COMMUNITY POSTS SEED
// ============================================================================

async function seedCommunityPosts(usersByEmail: Map<string, { id: string; publicId: string; displayName: string }>) {
  const users = Array.from(usersByEmail.values());
  const posts = [
    { content: "Hôm nay mình bắt đầu trì tụng Đại Bi Chú, cảm giác tâm rất nhẹ nhàng và bình an. Xin chia sẻ cùng các bạn đồng tu.", status: CommunityPostStatus.APPROVED, heartCount: 12, commentCount: 3 },
    { content: "Xin hỏi các anh chị, khi niệm kinh vào buổi tối có cần thắp nhang không ạ? Mình mới bắt đầu tu tập nên chưa rõ lắm.", status: CommunityPostStatus.APPROVED, heartCount: 5, commentCount: 8 },
    { content: "Chia sẻ kinh nghiệm phóng sanh cuối tuần vừa rồi tại hồ Tây. Đã phóng sanh được 50 con cá chép và 100 con ốc.", status: CommunityPostStatus.APPROVED, heartCount: 24, commentCount: 6 },
    { content: "Mình muốn tìm bạn đồng tu ở khu vực Quận 7, TP.HCM. Có ai quan tâm không ạ?", status: CommunityPostStatus.PENDING, heartCount: 0, commentCount: 0 },
    { content: "Xin cảm ơn ban quản trị PMTL đã tạo nền tảng này. Rất hữu ích cho việc tu tập hằng ngày.", status: CommunityPostStatus.APPROVED, heartCount: 31, commentCount: 2 },
    { content: "Hôm nay hoàn thành 108 biến Đại Bi Chú. Nguyện hồi hướng công đức cho tất cả chúng sanh.", status: CommunityPostStatus.APPROVED, heartCount: 18, commentCount: 4 },
    { content: "Nội dung vi phạm quy tắc cộng đồng - đã bị ẩn.", status: CommunityPostStatus.HIDDEN, heartCount: 0, commentCount: 0, isHidden: true, reportCount: 3 },
    { content: "Có ai biết cách set up bàn thờ nhỏ trong phòng trọ không? Mình ở trọ nên không gian hạn chế.", status: CommunityPostStatus.APPROVED, heartCount: 9, commentCount: 11 },
  ];

  for (let i = 0; i < posts.length; i++) {
    const spec = posts[i];
    const author = users[i % users.length];
    const publicId = `cp_${nanoid(12)}`;

    await prisma.communityPost.upsert({
      where: { publicId },
      update: {},
      create: {
        publicId,
        authorId: author.id,
        content: spec.content,
        status: spec.status,
        heartCount: spec.heartCount,
        commentCount: spec.commentCount,
        reportCount: spec.reportCount ?? 0,
        isHidden: spec.isHidden ?? false,
      },
    });
  }

  console.log(`Seeded ${posts.length} community posts.`);
}

// ============================================================================
// GUESTBOOK ENTRIES SEED
// ============================================================================

async function seedGuestbookEntries(usersByEmail: Map<string, { id: string; publicId: string; displayName: string }>) {
  const users = Array.from(usersByEmail.values());
  const adminUser = users.find(u => u.displayName.includes("Admin")) ?? users[0];

  const entries = [
    { content: "Cảm ơn PMTL đã mang đến nơi tu tập online ấm áp. Con xin ghi sổ lưu niệm nhân dịp Vu Lan 2026.", status: GuestbookEntryStatus.APPROVED },
    { content: "Đã tham gia lễ phóng sanh ngày rằm tháng 7. Rất cảm động và ý nghĩa. Nguyện cho tất cả chúng sanh được an lạc.", status: GuestbookEntryStatus.APPROVED },
    { content: "Mình là Phật tử mới, được giới thiệu đến PMTL. Cảm giác như tìm được ngôi nhà tâm linh của mình.", status: GuestbookEntryStatus.APPROVED },
    { content: "Xin ghi nhận công đức của các phụng sự viên đã hỗ trợ buổi lễ Dược Sư cuối tuần qua.", status: GuestbookEntryStatus.PENDING },
    { content: "Lần đầu tiên sử dụng ứng dụng niệm kinh, rất tiện lợi. Mong PMTL ngày càng phát triển.", status: GuestbookEntryStatus.APPROVED },
    { content: "Nhân dịp Tết Nguyên Đán, con xin kính chúc quý Thầy và ban quản trị sức khoẻ, an lạc.", status: GuestbookEntryStatus.APPROVED },
  ];

  for (let i = 0; i < entries.length; i++) {
    const spec = entries[i];
    const author = users[i % users.length];
    const publicId = `gb_${nanoid(12)}`;

    await prisma.guestbookEntry.upsert({
      where: { publicId },
      update: {},
      create: {
        publicId,
        authorId: author.id,
        content: spec.content,
        status: spec.status,
        approvedById: spec.status === GuestbookEntryStatus.APPROVED ? adminUser.id : null,
        approvedAt: spec.status === GuestbookEntryStatus.APPROVED ? new Date() : null,
      },
    });
  }

  console.log(`Seeded ${entries.length} guestbook entries.`);
}

// ============================================================================
// CALENDAR EVENTS SEED
// ============================================================================

async function seedCalendarEvents(usersByEmail: Map<string, { id: string; publicId: string; displayName: string }>) {
  const users = Array.from(usersByEmail.values());
  const now = new Date();

  const events = [
    { title: "Lễ Phóng Sanh Rằm Tháng 4", description: "Buổi phóng sanh tập thể tại hồ Tây, Hà Nội. Mọi người tập trung lúc 6h sáng.", startAt: new Date(now.getTime() + 7 * 86400000), location: "Hồ Tây, Hà Nội", eventType: "special_practice_day", status: EventStatus.PUBLISHED },
    { title: "Khoá Tu Mùa Hè 2026", description: "Khoá tu 3 ngày tại chùa Hoằng Pháp. Đăng ký trước ngày 15/5.", startAt: new Date(now.getTime() + 30 * 86400000), endAt: new Date(now.getTime() + 33 * 86400000), location: "Chùa Hoằng Pháp, Hóc Môn, TP.HCM", eventType: "organizational", status: EventStatus.PUBLISHED },
    { title: "Lễ Vu Lan Báo Hiếu", description: "Đại lễ Vu Lan Báo Hiếu năm 2026. Chương trình bao gồm tụng kinh, thuyết pháp và cài hoa hồng.", startAt: new Date(now.getTime() + 60 * 86400000), location: "Đạo tràng PMTL", eventType: "lunar_recurrence", status: EventStatus.DRAFT },
    { title: "Buổi Chia Sẻ Pháp Thoại Online", description: "Pháp thoại trực tuyến chủ đề: Ứng dụng Phật pháp trong đời sống hiện đại.", startAt: new Date(now.getTime() + 3 * 86400000), location: "Zoom Meeting", eventType: "organizational", status: EventStatus.PUBLISHED },
    { title: "Ngày Vía Quan Thế Âm Bồ Tát", description: "Ngày 19/2 âm lịch - Kỷ niệm ngày Đản sanh của Đức Quan Thế Âm Bồ Tát.", startAt: new Date(now.getTime() + 14 * 86400000), eventType: "fixed_observance", status: EventStatus.PUBLISHED },
    { title: "Lớp Học Niệm Kinh Cho Người Mới", description: "Hướng dẫn cách niệm kinh cơ bản cho người mới bắt đầu tu tập.", startAt: new Date(now.getTime() + 5 * 86400000), location: "Phòng sinh hoạt PMTL", eventType: "organizational", status: EventStatus.PUBLISHED },
  ];

  for (let i = 0; i < events.length; i++) {
    const spec = events[i];
    const creator = users[i % users.length];
    const publicId = `evt_${nanoid(12)}`;

    await prisma.calendarEvent.upsert({
      where: { publicId },
      update: {},
      create: {
        publicId,
        title: spec.title,
        description: spec.description,
        startAt: spec.startAt,
        endAt: spec.endAt ?? null,
        location: spec.location ?? null,
        eventType: spec.eventType,
        status: spec.status,
        createdById: creator.id,
        publishedAt: spec.status === EventStatus.PUBLISHED ? new Date() : null,
      },
    });
  }

  console.log(`Seeded ${events.length} calendar events.`);
}

// ============================================================================
// VOLUNTEERS SEED
// ============================================================================

async function seedVolunteers() {
  const volunteers = [
    { displayName: "Thầy Minh Hạnh", role: "Trụ trì", bio: "Trụ trì đạo tràng PMTL, hướng dẫn tu tập và tổ chức các khoá tu.", sortOrder: 1 },
    { displayName: "Sư cô Diệu Liên", role: "Hướng dẫn tu tập", bio: "Phụ trách hướng dẫn tu tập cho Phật tử mới.", sortOrder: 2 },
    { displayName: "Nguyễn Văn An", role: "Phụng sự viên kỹ thuật", phone: "0901234567", zaloLink: "https://zalo.me/0901234567", bio: "Hỗ trợ kỹ thuật và vận hành hệ thống PMTL.", sortOrder: 3 },
    { displayName: "Trần Thị Bích", role: "Điều phối sự kiện", phone: "0912345678", bio: "Điều phối và tổ chức các sự kiện phóng sanh, khoá tu.", sortOrder: 4 },
    { displayName: "Lê Minh Tâm", role: "Phụng sự viên nội dung", bio: "Biên tập nội dung bài viết và hướng dẫn tu tập.", sortOrder: 5 },
    { displayName: "Phạm Thị Hương", role: "Tình nguyện viên", phone: "0923456789", bio: "Hỗ trợ tiếp đón Phật tử mới và tổ chức sinh hoạt cộng đồng.", sortOrder: 6, isActive: false },
  ];

  for (const spec of volunteers) {
    const publicId = `vol_${nanoid(12)}`;
    await prisma.volunteer.upsert({
      where: { publicId },
      update: {},
      create: {
        publicId,
        displayName: spec.displayName,
        role: spec.role,
        phone: spec.phone ?? null,
        zaloLink: spec.zaloLink ?? null,
        bio: spec.bio ?? null,
        sortOrder: spec.sortOrder,
        isActive: spec.isActive ?? true,
      },
    });
  }

  console.log(`Seeded ${volunteers.length} volunteers.`);
}

// ============================================================================
// CONTACT INFO SEED
// ============================================================================

async function seedContactInfo() {
  const publicId = "contact_pmtl_main";
  await prisma.contactInfo.upsert({
    where: { publicId },
    update: {},
    create: {
      publicId,
      title: "Phật Mẫu Tâm Linh",
      email: "lienhe@phatmautamlinh.vn",
      phone: "028-1234-5678",
      address: "123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
      socialLinks: {
        facebook: "https://facebook.com/phatmautamlinh",
        zalo: "https://zalo.me/phatmautamlinh",
        youtube: "https://youtube.com/@phatmautamlinh",
      },
    },
  });

  console.log("Seeded contact info.");
}

// ============================================================================
// PUSH JOBS SEED
// ============================================================================

async function seedPushJobs(usersByEmail: Map<string, { id: string; publicId: string; displayName: string }>) {
  const users = Array.from(usersByEmail.values());
  const now = new Date();

  const jobs = [
    { title: "Nhắc nhở niệm kinh buổi sáng", body: "Đã đến giờ niệm kinh buổi sáng. Hãy dành 15 phút cho tâm an lạc.", status: PushJobStatus.COMPLETED, targetAudience: "all_members", sentCount: 150, failedCount: 3 },
    { title: "Thông báo lễ phóng sanh", body: "Lễ phóng sanh rằm tháng 4 sẽ diễn ra vào Chủ nhật tuần này. Đăng ký tham gia ngay!", status: PushJobStatus.COMPLETED, targetAudience: "all_members", sentCount: 200, failedCount: 1 },
    { title: "Khoá tu mùa hè - Hạn đăng ký", body: "Chỉ còn 5 ngày để đăng ký Khoá Tu Mùa Hè 2026. Nhanh tay đăng ký!", status: PushJobStatus.PENDING, targetAudience: "active_members" },
    { title: "Cập nhật tính năng mới", body: "PMTL vừa ra mắt tính năng theo dõi tiến trình tu tập. Khám phá ngay!", status: PushJobStatus.FAILED, targetAudience: "all_members", sentCount: 0, failedCount: 180 },
    { title: "Chúc mừng Vu Lan", body: "Nhân mùa Vu Lan Báo Hiếu, xin kính chúc quý Phật tử sức khoẻ, an lạc.", status: PushJobStatus.PROCESSING, targetAudience: "all_members", sentCount: 80 },
  ];

  for (let i = 0; i < jobs.length; i++) {
    const spec = jobs[i];
    const creator = users[i % users.length];
    const publicId = `pj_${nanoid(12)}`;

    await prisma.pushJob.upsert({
      where: { publicId },
      update: {},
      create: {
        publicId,
        title: spec.title,
        body: spec.body,
        status: spec.status,
        targetAudience: spec.targetAudience,
        sentCount: spec.sentCount ?? 0,
        failedCount: spec.failedCount ?? 0,
        createdById: creator.id,
        processedAt: spec.status !== PushJobStatus.PENDING ? new Date(now.getTime() - 3600000) : null,
        completedAt: spec.status === PushJobStatus.COMPLETED ? new Date(now.getTime() - 1800000) : null,
      },
    });
  }

  console.log(`Seeded ${jobs.length} push jobs.`);
}

// ============================================================================
// BEGINNER GUIDES SEED
// ============================================================================

async function seedBeginnerGuides(usersByEmail: Map<string, { id: string; publicId: string; displayName: string }>) {
  const users = Array.from(usersByEmail.values());

  const guides = [
    { title: "Hướng dẫn bắt đầu tu tập tại nhà", slug: "huong-dan-bat-dau-tu-tap-tai-nha", category: GuideCategory.BEGINNER, excerpt: "Hướng dẫn từng bước cho người mới bắt đầu hành trì Phật pháp tại nhà.", status: ContentStatus.PUBLISHED },
    { title: "Cách set up bàn thờ Phật đơn giản", slug: "cach-setup-ban-tho-phat-don-gian", category: GuideCategory.BEGINNER, excerpt: "Hướng dẫn bày trí bàn thờ Phật phù hợp với không gian nhỏ.", status: ContentStatus.PUBLISHED },
    { title: "Kinh bài tập: Bắt đầu cho người mới", slug: "kinh-bai-tap-bat-dau-cho-nguoi-moi", category: GuideCategory.DAILY_PRACTICE, excerpt: "Giải thích Kinh bài tập là gì, bộ công khóa cơ bản cho người mới, và cách phân biệt với Ngôi Nhà Nhỏ, Kinh văn tự tu.", status: ContentStatus.PUBLISHED },
    { title: "Kinh bài tập: Các bước niệm cho người mới", slug: "kinh-bai-tap-cac-buoc-cho-nguoi-moi", category: GuideCategory.DAILY_PRACTICE, excerpt: "Sắp theo đúng trình tự các bước niệm cơ bản, từ phần mở đầu tới các bài chính và phần kết.", status: ContentStatus.PUBLISHED },
    { title: "Kinh bài tập: Cách niệm đúng và những điều cần tránh", slug: "kinh-bai-tap-cach-niem-dung", category: GuideCategory.DAILY_PRACTICE, excerpt: "Nhắc rõ cách đọc tên bài, cách chia buổi niệm, xử lý khi gián đoạn, và những điều cần tránh trong lúc hành trì.", status: ContentStatus.PUBLISHED },
    { title: "Kinh bài tập: Câu hỏi thường gặp", slug: "kinh-bai-tap-cau-hoi-thuong-gap", category: GuideCategory.DAILY_PRACTICE, excerpt: "Tổng hợp các câu hỏi người mới hay gặp về giờ giấc, số biến, cách bù bài và các lưu ý thực hành.", status: ContentStatus.DRAFT },
    { title: "Kinh bài tập: Theo từng trường hợp", slug: "kinh-bai-tap-theo-tung-truong-hop", category: GuideCategory.DAILY_PRACTICE, excerpt: "Gợi ý bài niệm và lưu ý theo từng hoàn cảnh như người mới, người cao tuổi, người bệnh nặng hoặc người bận rộn.", status: ContentStatus.PUBLISHED },
    { title: "Hướng dẫn thực hành Ngôi Nhà Nhỏ", slug: "huong-dan-thuc-hanh-ngoi-nha-nho", category: GuideCategory.LITTLE_HOUSE, excerpt: "Hướng dẫn chi tiết cách thực hành Ngôi Nhà Nhỏ theo đúng phương pháp.", status: ContentStatus.PUBLISHED },
    { title: "Cách đốt Ngôi Nhà Nhỏ đúng cách", slug: "cach-dot-ngoi-nha-nho-dung-cach", category: GuideCategory.LITTLE_HOUSE, excerpt: "Các bước chuẩn bị và đốt Ngôi Nhà Nhỏ an toàn và đúng nghi thức.", status: ContentStatus.PUBLISHED },
    { title: "Hướng dẫn phóng sanh đúng pháp", slug: "huong-dan-phong-sanh-dung-phap", category: GuideCategory.LIFE_RELEASE, excerpt: "Những điều cần biết khi phóng sanh: chọn vật, chọn địa điểm, và nghi thức.", status: ContentStatus.PUBLISHED },
    { title: "Phát nguyện phóng sanh - Ý nghĩa và cách thực hiện", slug: "phat-nguyen-phong-sanh-y-nghia", category: GuideCategory.LIFE_RELEASE, excerpt: "Giải thích ý nghĩa phát nguyện phóng sanh và cách lập nguyện đúng đắn.", status: ContentStatus.DRAFT },
  ];

  for (let i = 0; i < guides.length; i++) {
    const spec = guides[i];
    const author = users[i % users.length];
    const publicId = `bg_${nanoid(12)}`;

    await prisma.beginnerGuide.upsert({
      where: { slug: spec.slug },
      update: {
        title: spec.title,
        category: spec.category,
        status: spec.status,
      },
      create: {
        publicId,
        title: spec.title,
        slug: spec.slug,
        content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: spec.excerpt }] }] },
        category: spec.category,
        status: spec.status,
        authorId: author.id,
        publishedAt: spec.status === ContentStatus.PUBLISHED ? new Date() : null,
      },
    });
  }

  console.log(`Seeded ${guides.length} beginner guides.`);
}

// ============================================================================
// DOWNLOADS SEED
// ============================================================================

async function seedDownloads(usersByEmail: Map<string, { id: string; publicId: string; displayName: string }>) {
  const users = Array.from(usersByEmail.values());

  const downloads = [
    { title: "Hướng dẫn Kinh bài tập cho người mới (PDF)", category: DownloadCategory.GUIDE, fileUrl: "/files/huong-dan-kinh-bai-tap-nguoi-moi.pdf", fileType: "application/pdf", fileSize: 245000, status: ContentStatus.PUBLISHED },
    { title: "Bản in Ngôi Nhà Nhỏ (A4)", category: DownloadCategory.TEMPLATE, fileUrl: "/files/ngoi-nha-nho-a4.pdf", fileType: "application/pdf", fileSize: 180000, status: ContentStatus.PUBLISHED },
    { title: "Hướng dẫn phóng sanh (PDF)", category: DownloadCategory.GUIDE, fileUrl: "/files/huong-dan-phong-sanh.pdf", fileType: "application/pdf", fileSize: 320000, status: ContentStatus.PUBLISHED },
    { title: "Lịch âm 2026 - Ngày tốt tu tập", category: DownloadCategory.REFERENCE, fileUrl: "/files/lich-am-2026.pdf", fileType: "application/pdf", fileSize: 150000, status: ContentStatus.PUBLISHED },
    { title: "Kinh bài tập - Câu hỏi thường gặp (PDF)", category: DownloadCategory.FAQ, fileUrl: "/files/kinh-bai-tap-cau-hoi-thuong-gap.pdf", fileType: "application/pdf", fileSize: 95000, status: ContentStatus.DRAFT },
    { title: "Checklist công khóa hằng ngày", category: DownloadCategory.TEMPLATE, fileUrl: "/files/checklist-cong-khoa-hang-ngay.pdf", fileType: "application/pdf", fileSize: 42000, status: ContentStatus.PUBLISHED },
  ];

  for (let i = 0; i < downloads.length; i++) {
    const spec = downloads[i];
    const uploader = users[i % users.length];
    const publicId = `dl_${nanoid(12)}`;

    await prisma.download.upsert({
      where: { publicId },
      update: {},
      create: {
        publicId,
        title: spec.title,
        description: `Tài liệu: ${spec.title}`,
        category: spec.category,
        fileUrl: spec.fileUrl,
        fileType: spec.fileType,
        fileSize: spec.fileSize,
        status: spec.status,
        uploaderId: uploader.id,
        publishedAt: spec.status === ContentStatus.PUBLISHED ? new Date() : null,
      },
    });
  }

  console.log(`Seeded ${downloads.length} downloads.`);
}

// ============================================================================
// VOWS & LIFE RELEASE JOURNALS SEED
// ============================================================================

async function seedVowsAndJournals(usersByEmail: Map<string, { id: string; publicId: string; displayName: string }>) {
  const users = Array.from(usersByEmail.values());
  const now = new Date();

  const vows = [
    { vowType: VowType.LIFE_RELEASE, description: "Phát nguyện phóng sanh 1000 con vật trong năm 2026", targetCount: 1000, currentCount: 350, status: VowStatus.ACTIVE },
    { vowType: VowType.CHANTING, description: "Trì tụng 10.000 biến Đại Bi Chú", targetCount: 10000, currentCount: 3200, status: VowStatus.ACTIVE },
    { vowType: VowType.SUTRA_READING, description: "Đọc trọn bộ Kinh Địa Tạng trong 49 ngày", targetCount: 49, currentCount: 49, status: VowStatus.COMPLETED },
    { vowType: VowType.CUSTOM, description: "Ăn chay mỗi ngày rằm và mùng 1", targetCount: 24, currentCount: 8, status: VowStatus.ACTIVE },
    { vowType: VowType.LIFE_RELEASE, description: "Phóng sanh mỗi tháng một lần", targetCount: 12, currentCount: 4, status: VowStatus.ACTIVE },
  ];

  const createdVowIds: string[] = [];

  for (let i = 0; i < vows.length; i++) {
    const spec = vows[i];
    const user = users[i % users.length];
    const publicId = `vow_${nanoid(12)}`;

    const vow = await prisma.vow.upsert({
      where: { publicId },
      update: {},
      create: {
        publicId,
        userId: user.id,
        vowType: spec.vowType,
        description: spec.description,
        targetCount: spec.targetCount,
        currentCount: spec.currentCount,
        status: spec.status,
        startDate: new Date(now.getTime() - 90 * 86400000),
        endDate: spec.status === VowStatus.COMPLETED ? new Date(now.getTime() - 10 * 86400000) : null,
      },
    });

    createdVowIds.push(vow.id);
  }

  // Seed life release journals
  const journals = [
    { animalType: "Cá chép", quantity: 50, location: "Hồ Tây, Hà Nội", note: "Phóng sanh nhân ngày rằm tháng 3" },
    { animalType: "Ốc", quantity: 200, location: "Sông Sài Gòn", note: "Phóng sanh cuối tuần" },
    { animalType: "Chim sẻ", quantity: 20, location: "Công viên Lê Thị Riêng", note: "Phóng sanh ngày Phật đản" },
    { animalType: "Cá chép", quantity: 100, location: "Hồ Hoàn Kiếm", note: "Phóng sanh tập thể cùng đạo tràng" },
    { animalType: "Tôm", quantity: 500, location: "Biển Vũng Tàu", note: "Phóng sanh biển nhân lễ Vu Lan" },
  ];

  for (let i = 0; i < journals.length; i++) {
    const spec = journals[i];
    const user = users[i % users.length];
    const publicId = `lrj_${nanoid(12)}`;

    await prisma.lifeReleaseJournal.upsert({
      where: { publicId },
      update: {},
      create: {
        publicId,
        userId: user.id,
        vowId: createdVowIds[0] ?? null,
        journalDate: new Date(now.getTime() - (i + 1) * 7 * 86400000),
        animalType: spec.animalType,
        quantity: spec.quantity,
        location: spec.location,
        note: spec.note,
      },
    });
  }

  console.log(`Seeded ${vows.length} vows and ${journals.length} life release journals.`);
}

// ============================================================================
// PUSH SUBSCRIPTIONS SEED
// ============================================================================

async function seedPushSubscriptions(usersByEmail: Map<string, { id: string; publicId: string; displayName: string }>) {
  const users = Array.from(usersByEmail.values());

  for (let i = 0; i < Math.min(users.length, 3); i++) {
    const user = users[i];
    const publicId = `psub_${nanoid(12)}`;

    await prisma.pushSubscription.upsert({
      where: { publicId },
      update: {},
      create: {
        publicId,
        userId: user.id,
        endpoint: `https://fcm.googleapis.com/fcm/send/seed-endpoint-${i}`,
        isActive: true,
      },
    });
  }

  console.log(`Seeded push subscriptions.`);
}

async function printSeedSummary() {
  const [
    users,
    sessions,
    featureFlags,
    posts,
    mediaAssets,
    moderationReports,
    auditLogs,
    rateLimitRecords,
    webhookDeliveries,
    chantRuleGroups,
    chantRules,
    communityPosts,
    guestbookEntries,
    calendarEvents,
    volunteers,
    contactInfo,
    pushSubscriptions,
    pushJobs,
    beginnerGuides,
    downloads,
    vows,
    lifeReleaseJournals,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.session.count(),
    prisma.featureFlag.count(),
    prisma.post.count(),
    prisma.mediaAsset.count(),
    prisma.moderationReport.count(),
    prisma.auditLog.count(),
    prisma.rateLimitRecord.count(),
    prisma.webhookDelivery.count(),
    prisma.chantEnvironmentRuleGroup.count(),
    prisma.chantEnvironmentRule.count(),
    prisma.communityPost.count(),
    prisma.guestbookEntry.count(),
    prisma.calendarEvent.count(),
    prisma.volunteer.count(),
    prisma.contactInfo.count(),
    prisma.pushSubscription.count(),
    prisma.pushJob.count(),
    prisma.beginnerGuide.count(),
    prisma.download.count(),
    prisma.vow.count(),
    prisma.lifeReleaseJournal.count(),
  ]);

  console.log("Seed summary:");
  console.table({
    users,
    sessions,
    featureFlags,
    posts,
    mediaAssets,
    moderationReports,
    auditLogs,
    rateLimitRecords,
    webhookDeliveries,
    chantRuleGroups,
    chantRules,
    communityPosts,
    guestbookEntries,
    calendarEvents,
    volunteers,
    contactInfo,
    pushSubscriptions,
    pushJobs,
    beginnerGuides,
    downloads,
    vows,
    lifeReleaseJournals,
  });
}

async function main() {
  try {
    await seedDevAdminUser();
    const usersByEmail = await ensureSeedUsers();
    await seedSessions(usersByEmail);
    await seedFeatureFlags();
    await seedPosts(usersByEmail);
    await seedMediaAssets(usersByEmail);
    await seedModerationReports(usersByEmail);
    await seedAuditLogs(usersByEmail);
    await seedRateLimitRecords();
    await seedWebhookDeliveries();
    await seedEnvironmentRules();
    // New domain tables
    await seedCommunityPosts(usersByEmail);
    await seedGuestbookEntries(usersByEmail);
    await seedCalendarEvents(usersByEmail);
    await seedVolunteers();
    await seedContactInfo();
    await seedPushJobs(usersByEmail);
    await seedPushSubscriptions(usersByEmail);
    await seedBeginnerGuides(usersByEmail);
    await seedDownloads(usersByEmail);
    await seedVowsAndJournals(usersByEmail);
    await printSeedSummary();
  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
