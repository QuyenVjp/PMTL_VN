import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, RuleSeverity, RuleProductizationMode } from "../src/generated/prisma/client.js";
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

async function main() {
  try {
    await seedDevAdminUser();
    await seedEnvironmentRules();
  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
