/**
 * Dream Journal Service — Engagement Module
 *
 * Design sources:
 *   - design/03-domains/engagement/USE_CASES/dream-journal-interpreter.md  (canonical: keyword-based interpreter)
 *   - design/03-domains/engagement/USE_CASES/USE_CASE_ABORTION_DREAM_STATE_MACHINE.md (abortion-child state)
 *
 * Phase A — schema.prisma DreamJournal model covers abortion-child tracking (abortionChildRelated,
 * childState, resolutionStatus, autoActionTriggered). The full keyword-interpreter design
 * (DreamKarmicSuggestion entity, mood field, DREAM_INTERPRETATION_RULES matrix) requires an
 * additive migration. That gap is documented below — this service uses Prisma ORM exclusively
 * (no raw SQL) and implements everything the current schema supports.
 *
 * SCHEMA GAP (needs migration before implementing fully):
 *   - DreamJournal.mood: "PEACEFUL" | "ANXIOUS" | "CONFUSED" | "JOYFUL" | "FEARFUL"
 *   - DreamKarmicSuggestion model (entryId, ruleKey, lhDebt, signalType, message, confirmed)
 */

import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { DreamAbortionChildState } from "../../generated/prisma/enums.js";

// ─── Keyword interpreter (design/dream-journal-interpreter.md §DreamInterpreterService) ──────────

export type DreamSignalType = "KARMIC_DEBT" | "PRACTICE_WARNING" | "GOOD_OUTCOME" | "NEUTRAL";

export interface DreamPattern {
  keywords: string[];
  signalType: DreamSignalType;
  lhDebt?: number;
  urgency?: "HIGH" | "CRITICAL";
  message: string;
  actionHint?: string;
  childProtectionAlert?: string;
}

export const DREAM_INTERPRETATION_RULES: DreamPattern[] = [
  {
    keywords: ["người mặc áo đen", "người đen", "bóng đen", "người lạ mặc đen"],
    signalType: "KARMIC_DEBT",
    lhDebt: 4,
    message: "Người mặc áo đen trong mơ thường là dấu hiệu oan gia trái chủ đang đến gần.",
    actionHint: "Nên làm thêm 4 tờ Ngôi Nhà Nhỏ để hóa giải.",
  },
  {
    keywords: ["người thân đã mất", "ông bà", "bố mẹ đã mất", "cố nội", "cố ngoại"],
    signalType: "KARMIC_DEBT",
    lhDebt: 7,
    message: "Người thân đã khuất xuất hiện trong mơ thường cần được siêu độ thêm.",
    actionHint: "Nên làm thêm 7 tờ Ngôi Nhà Nhỏ và phóng sinh hồi hướng cho các Ngài.",
  },
  {
    keywords: ["rụng răng dưới", "mất răng dưới", "gãy răng dưới"],
    signalType: "PRACTICE_WARNING",
    urgency: "CRITICAL",
    message:
      "Mơ rụng răng hàm DƯỚI là tín hiệu cực kỳ nguy hiểm — oan gia trái chủ đang ảnh hưởng trực tiếp đến con cháu trong gia đình.",
    actionHint:
      "Niệm Chú Giải Kết ít nhất 21 biến mỗi ngày trong 7 ngày liên tiếp. Kiểm điểm lỗi lầm gần đây.",
    childProtectionAlert:
      "Khẩn cấp: Làm ngay ít nhất 7 tờ NNN hồi hướng cho con/cháu trong gia đình. Niệm Chú Giải Kết 21 biến/ngày trong 7 ngày liên tiếp để bảo vệ thế hệ sau.",
  },
  {
    keywords: ["quả thối", "trái cây thối", "hoa quả hỏng", "cúng quả thối"],
    signalType: "PRACTICE_WARNING",
    message: "Hoa quả hỏng trong mơ báo hiệu có lỗi trong nghi thức dâng cúng.",
    actionHint: "Kiểm tra lại hoa quả trên bàn thờ — thay quả tươi và xem lại nghi thức.",
  },
  {
    keywords: ["em bé vui vẻ", "em bé cười", "trẻ sơ sinh khỏe mạnh rời đi"],
    signalType: "GOOD_OUTCOME",
    message: "Em bé vui vẻ rời đi trong mơ là dấu hiệu tốt — oan gia trái chủ đã được siêu thoát.",
    actionHint: "Tiếp tục duy trì tu tập — kết quả đang hiển thị.",
  },
];

export interface MatchedPattern {
  rule: DreamPattern;
  confidence: "HIGH";
}

export interface DreamAnalysis {
  matches: MatchedPattern[];
  totalLhDebtSuggested: number;
  // CRITICAL-urgency matches sorted first (server-side, per design spec)
  sortedMatches: MatchedPattern[];
}

function analyzeDream(description: string): DreamAnalysis {
  const matches: MatchedPattern[] = [];
  const lowerDesc = description.toLowerCase();

  for (const rule of DREAM_INTERPRETATION_RULES) {
    const matched = rule.keywords.some((kw) => lowerDesc.includes(kw.toLowerCase()));
    if (matched) {
      matches.push({ rule, confidence: "HIGH" });
    }
  }

  const totalLhDebtSuggested = matches
    .filter((m) => m.rule.signalType === "KARMIC_DEBT")
    .reduce((sum, m) => sum + (m.rule.lhDebt ?? 0), 0);

  // CRITICAL urgency sorted first — server-side per design spec
  const sortedMatches = [...matches].sort((a, b) => {
    if (a.rule.urgency === "CRITICAL" && b.rule.urgency !== "CRITICAL") return -1;
    if (b.rule.urgency === "CRITICAL" && a.rule.urgency !== "CRITICAL") return 1;
    return 0;
  });

  return { matches, totalLhDebtSuggested, sortedMatches };
}

// ─── Input / Output types ────────────────────────────────────────────────────

export interface CreateDreamJournalInput {
  dreamDate: string; // YYYY-MM-DD
  description: string; // max 2000 chars
  // Abortion-child state (supported by current schema)
  abortionChildRelated?: boolean;
  childState?: "WELL_DRESSED_HAPPY" | "LEAVING_PEACEFULLY" | "CRYING_DISTRESSED" | "POORLY_DRESSED" | "UNKNOWN";
}

export interface DreamJournalQuery {
  from?: string;
  to?: string;
  abortionChildOnly?: boolean;
  resolutionStatus?: string;
  limit: number;
  offset: number;
}

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class DreamJournalService {
  private readonly logger = new Logger(DreamJournalService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * POST /api/engagement/dream-journal
   * Saves a dream entry and returns keyword-based analysis (advisory).
   * IMPORTANT: KarmicDebt suggestions are NOT auto-added — user must confirm.
   */
  async createEntry(input: CreateDreamJournalInput, userId: string) {
    if (input.description && input.description.length > 2000) {
      throw new BadRequestException({ error: "description_too_long", message: "Tối đa 2000 ký tự." });
    }

    const dreamDate = new Date(input.dreamDate);
    if (dreamDate > new Date()) {
      throw new BadRequestException({ error: "invalid_date", message: "Ngày mơ không thể trong tương lai." });
    }

    // Determine resolution status from abortion child state
    let resolutionStatus = "UNRESOLVED";
    let autoActionTriggered = false;
    let autoActionNote: string | null = null;

    if (input.abortionChildRelated && input.childState) {
      const { resolvedState, autoAction } = this.resolveAbortionChildState(input.childState);
      resolutionStatus = resolvedState;
      autoActionTriggered = autoAction.triggered;
      autoActionNote = autoAction.note;
    }

    const record = await this.prisma.dreamJournal.create({
      data: {
        publicId: nanoid(21),
        userId,
        dreamDate,
        description: input.description ?? null,
        abortionChildRelated: input.abortionChildRelated ?? false,
        childState: input.childState
          ? (input.childState as DreamAbortionChildState)
          : null,
        resolutionStatus,
        autoActionTriggered,
        autoActionNote,
      },
    });

    // Keyword interpreter analysis (advisory — requires separate confirm endpoint to act)
    const analysis = input.description ? analyzeDream(input.description) : null;

    this.logger.log({
      msg: "dream_journal.created",
      userId,
      publicId: record.publicId,
      abortionChildRelated: record.abortionChildRelated,
      resolutionStatus,
      autoActionTriggered,
      karmicDebtSuggested: analysis?.totalLhDebtSuggested ?? 0,
    });

    return {
      entry: this.toDto(record),
      // Matches sorted CRITICAL first (server-side, per design spec)
      suggestions: analysis?.sortedMatches.map((m) => ({
        signalType: m.rule.signalType,
        urgency: m.rule.urgency ?? null,
        message: m.rule.message,
        actionHint: m.rule.actionHint ?? null,
        childProtectionAlert: m.rule.childProtectionAlert ?? null,
        lhDebt: m.rule.lhDebt ?? null,
        confirmed: false, // KarmicDebt NOT auto-added — user must confirm
      })) ?? [],
      totalLhDebtSuggested: analysis?.totalLhDebtSuggested ?? 0,
    };
  }

  async listEntries(userId: string, query: DreamJournalQuery) {
    const where: Record<string, unknown> = { userId };

    if (query.abortionChildOnly) {
      where["abortionChildRelated"] = true;
    }
    if (query.resolutionStatus) {
      where["resolutionStatus"] = query.resolutionStatus;
    }
    if (query.from || query.to) {
      where["dreamDate"] = {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.to ? { lte: new Date(query.to) } : {}),
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.dreamJournal.findMany({
        where,
        orderBy: { dreamDate: "desc" },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.dreamJournal.count({ where }),
    ]);

    return {
      data: data.map((r) => this.toDto(r)),
      meta: {
        pagination: {
          total,
          limit: query.limit,
          offset: query.offset,
          hasMore: query.offset + query.limit < total,
        },
      },
    };
  }

  async getEntry(publicId: string, userId: string) {
    const record = await this.prisma.dreamJournal.findFirst({
      where: { publicId, userId },
    });
    return record ? this.toDto(record) : null;
  }

  // ─── Abortion child state machine ───────────────────────────────────────────

  private resolveAbortionChildState(childState: string): {
    resolvedState: string;
    autoAction: { triggered: boolean; note: string | null };
  } {
    switch (childState) {
      case "WELL_DRESSED_HAPPY":
      case "LEAVING_PEACEFULLY":
        return {
          resolvedState: "RESOLVED",
          autoAction: { triggered: false, note: null },
        };
      case "CRYING_DISTRESSED":
      case "POORLY_DRESSED":
        return {
          resolvedState: "UNRESOLVED",
          autoAction: {
            triggered: true,
            note: "Thai nhi vẫn chưa siêu thoát — cần làm thêm 21 tờ NNN. Hãy xác nhận để thêm vào kế hoạch.",
          },
        };
      default:
        return {
          resolvedState: "UNRESOLVED",
          autoAction: { triggered: false, note: null },
        };
    }
  }

  private toDto(record: {
    publicId: string;
    dreamDate: Date;
    description: string | null;
    abortionChildRelated: boolean;
    childState: string | null;
    resolutionStatus: string | null;
    autoActionTriggered: boolean;
    autoActionNote: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      publicId: record.publicId,
      dreamDate: record.dreamDate.toISOString().slice(0, 10),
      description: record.description,
      abortionChildRelated: record.abortionChildRelated,
      childState: record.childState,
      resolutionStatus: record.resolutionStatus,
      autoActionTriggered: record.autoActionTriggered,
      autoActionNote: record.autoActionNote,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
