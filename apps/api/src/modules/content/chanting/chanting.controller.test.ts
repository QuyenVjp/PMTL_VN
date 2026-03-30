import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { Test, type TestingModule } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../../../app.module.js";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import {
  chantEnvironmentRuleGroupResponseSchema,
  chantEnvironmentRulesPageResponseSchema,
} from "../../../../packages/shared/src/schemas/content.js";
import {
  RuleProductizationMode,
  RuleSeverity,
} from "../../../generated/prisma/client.js";

interface SeedRule {
  publicId: string;
  ruleKey: string;
  title: string;
  canonicalWording: string;
  severity: RuleSeverity;
  productizationMode: RuleProductizationMode;
  shortReason: string;
  sortOrder: number;
  sourceReference?: string;
  referenceOnly?: boolean;
  safeLaneRefs?: string[];
}

interface SeedGroup {
  publicId: string;
  groupKey:
    | "time-rules"
    | "place-rules"
    | "food-body-rules"
    | "posture-hygiene-rules"
    | "special-location-cautions"
    | "non-interpretive-cautions";
  title: string;
  summary: string;
  sortOrder: number;
  rules: SeedRule[];
}

describe("Chanting Environment Rules API", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api");
    await app.init();

    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.cleanDatabase();

    const groups: SeedGroup[] = [
      {
        publicId: "group-time-rules",
        groupKey: "time-rules",
        title: "Quy tắc về thời gian",
        summary: "Chọn thời điểm phù hợp để niệm kinh.",
        sortOrder: 1,
        rules: [
          {
            publicId: "rule-time-before-start",
            ruleKey: "time-before-start",
            title: "Chuẩn bị thời gian phù hợp",
            canonicalWording: "Nên chọn khung giờ yên tĩnh trước khi bắt đầu thời khóa niệm.",
            severity: RuleSeverity.ADVISORY,
            productizationMode: RuleProductizationMode.CHECKLIST_ITEM,
            shortReason: "Giúp tâm ổn định hơn trước khi niệm.",
            sortOrder: 1,
          },
          {
            publicId: "rule-time-pause-fatigue",
            ruleKey: "time-pause-fatigue",
            title: "Tạm dừng khi quá mệt",
            canonicalWording: "Nếu cơ thể quá mệt hoặc đầu óc không còn tỉnh táo thì nên tạm dừng.",
            severity: RuleSeverity.CAUTION,
            productizationMode: RuleProductizationMode.CHECKLIST_ITEM,
            shortReason: "Tránh niệm kinh trong trạng thái gắng sức thiếu tỉnh táo.",
            sortOrder: 2,
          },
          {
            publicId: "rule-time-safe-silent",
            ruleKey: "time-safe-silent",
            title: "Ưu tiên niệm thầm khi hoàn cảnh không thuận",
            canonicalWording: "Nếu hoàn cảnh không đủ yên tĩnh thì ưu tiên niệm thầm để giữ sự trang nghiêm.",
            severity: RuleSeverity.QUALITY_GUIDANCE,
            productizationMode: RuleProductizationMode.SAFE_LANE_SUGGESTION,
            shortReason: "Giữ được công phu mà không làm phiền người khác.",
            sortOrder: 3,
          },
        ],
      },
      {
        publicId: "group-place-rules",
        groupKey: "place-rules",
        title: "Quy tắc về địa điểm",
        summary: "Chọn nơi phù hợp để thực hành.",
        sortOrder: 2,
        rules: [
          {
            publicId: "rule-place-clean",
            ruleKey: "place-clean-quiet",
            title: "Chọn nơi sạch sẽ và yên tĩnh",
            canonicalWording: "Nơi thực hành nên gọn gàng, sạch sẽ và đủ yên tĩnh để giữ tâm chuyên chú.",
            severity: RuleSeverity.ADVISORY,
            productizationMode: RuleProductizationMode.CHECKLIST_ITEM,
            shortReason: "Không gian ổn định giúp công phu bền hơn.",
            sortOrder: 1,
          },
        ],
      },
      {
        publicId: "group-food-body-rules",
        groupKey: "food-body-rules",
        title: "Quy tắc về ăn uống và thân thể",
        summary: "Chuẩn bị thân thể trước khi tu tập.",
        sortOrder: 3,
        rules: [
          {
            publicId: "rule-body-clean",
            ruleKey: "body-clean-before-practice",
            title: "Giữ thân thể sạch sẽ",
            canonicalWording: "Nên rửa tay, súc miệng và sắp xếp thân thể gọn gàng trước khi niệm.",
            severity: RuleSeverity.ADVISORY,
            productizationMode: RuleProductizationMode.CHECKLIST_ITEM,
            shortReason: "Thể hiện sự tôn kính và giúp tâm dễ an.",
            sortOrder: 1,
          },
        ],
      },
      {
        publicId: "group-posture-hygiene-rules",
        groupKey: "posture-hygiene-rules",
        title: "Quy tắc về tư thế và vệ sinh",
        summary: "Giữ tư thế ổn định khi thực hành.",
        sortOrder: 4,
        rules: [
          {
            publicId: "rule-posture-sitting",
            ruleKey: "posture-sitting-straight",
            title: "Ngồi vững và thoải mái",
            canonicalWording: "Nên chọn tư thế ngồi ổn định, thẳng lưng và không gò ép cơ thể.",
            severity: RuleSeverity.ADVISORY,
            productizationMode: RuleProductizationMode.DRAWER_NOTE,
            shortReason: "Giúp duy trì thời khóa lâu hơn mà không sinh khó chịu.",
            sortOrder: 1,
          },
        ],
      },
      {
        publicId: "group-special-location-cautions",
        groupKey: "special-location-cautions",
        title: "Lưu ý về địa điểm đặc biệt",
        summary: "Ứng xử phù hợp tại những địa điểm có tính chất riêng.",
        sortOrder: 5,
        rules: [
          {
            publicId: "rule-location-hospital",
            ruleKey: "location-hospital",
            title: "Niệm tại bệnh viện",
            canonicalWording: "Ở bệnh viện nên ưu tiên niệm thầm để không ảnh hưởng bệnh nhân khác.",
            severity: RuleSeverity.ADVISORY,
            productizationMode: RuleProductizationMode.SAFE_LANE_SUGGESTION,
            safeLaneRefs: ["Niệm thầm trong tâm", "Giữ âm lượng ở mức tối thiểu"],
            shortReason: "Giữ sự tôn trọng với không gian chữa bệnh.",
            sortOrder: 1,
          },
        ],
      },
      {
        publicId: "group-non-interpretive-cautions",
        groupKey: "non-interpretive-cautions",
        title: "Lưu ý không nên tự diễn giải",
        summary: "Các hiện tượng cần giữ ở mức tham khảo, không tự product hóa.",
        sortOrder: 6,
        rules: [
          {
            publicId: "rule-non-interpretive-dreams",
            ruleKey: "non-interpretive-dreams",
            title: "Giấc mơ khi tu tập",
            canonicalWording: "Không nên tự diễn giải các giấc mơ phát sinh trong quá trình tu tập.",
            severity: RuleSeverity.REFERENCE_ONLY,
            productizationMode: RuleProductizationMode.DO_NOT_AUTOMATE,
            shortReason: "Đây là phần chỉ nên tham khảo, không nên suy diễn.",
            sourceReference: "Cần tham vấn thầy khi lo lắng về hiện tượng này.",
            referenceOnly: true,
            sortOrder: 1,
          },
        ],
      },
    ];

    for (const group of groups) {
      await prisma.chantEnvironmentRuleGroup.create({
        data: {
          publicId: group.publicId,
          groupKey: group.groupKey,
          title: group.title,
          summary: group.summary,
          sortOrder: group.sortOrder,
          rules: {
            create: group.rules.map((rule) => ({
              publicId: rule.publicId,
              ruleKey: rule.ruleKey,
              title: rule.title,
              canonicalWording: rule.canonicalWording,
              severity: rule.severity,
              productizationMode: rule.productizationMode,
              shortReason: rule.shortReason,
              sourceReference: rule.sourceReference ?? null,
              referenceOnly: rule.referenceOnly ?? false,
              safeLaneRefs: rule.safeLaneRefs ?? [],
              avoidItems: [],
              sortOrder: rule.sortOrder,
            })),
          },
        },
      });
    }
  });

  afterAll(async () => {
    await prisma.cleanDatabase();
    await app.close();
  });

  it("returns the page aggregate with canonical sections", async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const response = await request(server).get(
      "/api/content/chanting/environment-rules",
    );
    const rawBody: unknown = response.body;

    expect(response.status).toBe(200);
    const body = chantEnvironmentRulesPageResponseSchema.parse(rawBody);
    expect(body.intro.title).toBe(
      "Lưu ý môi trường và thời gian niệm kinh",
    );
    expect(body.groupCards).toHaveLength(6);
    expect(body.groups).toHaveLength(6);
    expect(body.quickChecklist.beforeYouStart.length).toBeGreaterThan(0);
    expect(body.quickChecklist.whenToPause).toContain("Tạm dừng khi quá mệt");
    expect(body.quickChecklist.safeLaneSuggestions).toContain(
      "Ưu tiên niệm thầm khi hoàn cảnh không thuận",
    );
    expect(body.specialLocationHighlights).toEqual([
      {
        topic: "Niệm tại bệnh viện",
        summary:
          "Ở bệnh viện nên ưu tiên niệm thầm để không ảnh hưởng bệnh nhân khác.",
      },
    ]);
    expect(body.referenceOnlyCautions).toEqual([
      {
        topic: "Giấc mơ khi tu tập",
        summary:
          "Không nên tự diễn giải các giấc mơ phát sinh trong quá trình tu tập.",
        ctaLabel: "Xem chi tiết",
        ctaHref:
          "/niem-kinh/luu-y-moi-truong-va-thoi-gian#non-interpretive-dreams",
      },
    ]);
  });

  it("returns one canonical group with rule details", async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const response = await request(server).get(
      "/api/content/chanting/environment-rules/non-interpretive-cautions",
    );
    const rawBody: unknown = response.body;

    expect(response.status).toBe(200);
    const body = chantEnvironmentRuleGroupResponseSchema.parse(rawBody);
    expect(body.groupKey).toBe("non-interpretive-cautions");
    expect(body.rules).toHaveLength(1);
    expect(body.rules[0]).toMatchObject({
      ruleKey: "non-interpretive-dreams",
      severity: "reference_only",
      productizationMode: "do_not_automate",
      referenceOnly: true,
    });
  });

  it("returns 404 for an unknown groupKey", async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const response = await request(server).get(
      "/api/content/chanting/environment-rules/invalid-group-key",
    );

    expect(response.status).toBe(404);
  });
});
