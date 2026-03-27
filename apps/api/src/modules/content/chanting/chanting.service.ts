import { Injectable, NotFoundException } from "@nestjs/common";
import { ChantingRepository } from "./chanting.repository.js";
import { mapGroupToResponse } from "./chanting.mapper.js";
import type {
  ChantEnvironmentRulesPageResponse,
  ChantEnvironmentRuleGroupResponse,
  GroupKey,
} from "./chanting.schemas.js";

@Injectable()
export class ChantingService {
  constructor(private readonly repository: ChantingRepository) {}

  /**
   * GET /content/chanting/environment-rules
   * Returns full page aggregate for /niem-kinh/luu-y-moi-truong-va-thoi-gian
   */
  async getEnvironmentRulesPage(): Promise<ChantEnvironmentRulesPageResponse> {
    const groups = await this.repository.findAllGroups();
    const ruleCounts = await this.repository.countRulesByGroup();

    // Map groups to response
    const mappedGroups = groups.map(mapGroupToResponse);

    // Build group cards
    const groupCards = groups.map((g) => ({
      groupKey: g.groupKey as GroupKey,
      title: g.title,
      summary: g.summary,
      ruleCount: ruleCounts[g.groupKey] || 0,
    }));

    // Find latest update across all groups
    const latestUpdate = groups.reduce(
      (latest, g) => (g.updatedAt > latest ? g.updatedAt : latest),
      new Date(0),
    );

    // Extract special location highlights from special-location-cautions group
    const specialLocationGroup = groups.find((g) => g.groupKey === "special-location-cautions");
    const specialLocationHighlights = specialLocationGroup
      ? specialLocationGroup.rules.slice(0, 3).map((r) => ({
          topic: r.title,
          summary: r.canonicalWording.substring(0, 150) + (r.canonicalWording.length > 150 ? "..." : ""),
        }))
      : [];

    // Extract reference-only cautions from non-interpretive-cautions group
    const nonInterpretiveGroup = groups.find((g) => g.groupKey === "non-interpretive-cautions");
    const referenceOnlyCautions = nonInterpretiveGroup
      ? nonInterpretiveGroup.rules
          .filter((r) => r.referenceOnly)
          .slice(0, 4)
          .map((r) => ({
            topic: r.title,
            summary: r.canonicalWording.substring(0, 100) + (r.canonicalWording.length > 100 ? "..." : ""),
            ctaLabel: "Xem chi tiết",
            ctaHref: `/niem-kinh/luu-y-moi-truong-va-thoi-gian#${r.ruleKey}`,
          }))
      : [];

    // Build quick checklist from rules marked as checklist_item
    const checklistItems = groups
      .flatMap((g) => g.rules)
      .filter((r) => r.productizationMode === "CHECKLIST_ITEM");

    const beforeYouStart = checklistItems
      .filter((r) => r.ruleKey.includes("before") || r.sortOrder < 3)
      .slice(0, 5)
      .map((r) => r.title);

    const whenToPause = checklistItems
      .filter((r) => r.ruleKey.includes("pause") || r.ruleKey.includes("stop"))
      .slice(0, 4)
      .map((r) => r.title);

    const safeLaneSuggestions = groups
      .flatMap((g) => g.rules)
      .filter((r) => r.productizationMode === "SAFE_LANE_SUGGESTION")
      .slice(0, 4)
      .map((r) => r.title);

    return {
      intro: {
        title: "Lưu ý môi trường và thời gian niệm kinh",
        summary:
          "Hướng dẫn về thời gian, địa điểm, và các điều kiện phù hợp để thực hành niệm kinh đạt hiệu quả cao nhất.",
        updatedAt: latestUpdate.toISOString(),
      },
      groupCards,
      groups: mappedGroups,
      quickChecklist: {
        beforeYouStart: beforeYouStart.length > 0 ? beforeYouStart : ["Chọn nơi yên tĩnh", "Vệ sinh thân thể sạch sẽ"],
        whenToPause:
          whenToPause.length > 0
            ? whenToPause
            : ["Khi quá mệt mỏi", "Khi có việc gấp cần giải quyết"],
        safeLaneSuggestions:
          safeLaneSuggestions.length > 0
            ? safeLaneSuggestions
            : ["Niệm thầm khi ở nơi công cộng", "Giảm số biến khi sức khỏe không tốt"],
      },
      specialLocationHighlights,
      referenceOnlyCautions,
      relatedGuideRefs: [
        {
          title: "Kinh Bài Tập Hằng Ngày",
          href: "/kinh-bai-tap",
          surface: "daily_practice",
        },
        {
          title: "Ngôi Nhà Nhỏ",
          href: "/ngoi-nha-nho",
          surface: "little_house",
        },
        {
          title: "Kinh Văn Tự Tu",
          href: "/kinh-van-tu-tu",
          surface: "self_cultivation",
        },
      ],
    };
  }

  /**
   * GET /content/chanting/environment-rules/:groupKey
   * Returns a single rule group with full rules
   */
  async getEnvironmentRuleGroup(groupKey: string): Promise<ChantEnvironmentRuleGroupResponse> {
    const group = await this.repository.findGroupByKey(groupKey);

    if (!group) {
      throw new NotFoundException(`Nhóm quy tắc '${groupKey}' không tồn tại`);
    }

    return mapGroupToResponse(group);
  }
}
