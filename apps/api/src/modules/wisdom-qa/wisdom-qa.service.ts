import { Injectable } from "@nestjs/common";
import { CacheService } from "../../common/cache/cache.service.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { Q161_RULE_PACK } from "./q161-rule-pack.data.js";
import { parseQ161RulePackWithMini } from "./q161-rule-pack.mini-schema.js";
import type {
  AskQuestionInput,
  Q161RulePackResponse,
  SubmitAnswerInput,
  WisdomQaQuery,
} from "./wisdom-qa.schemas.js";

@Injectable()
export class WisdomQaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  listQuestions(query: WisdomQaQuery) {
    return { data: [], total: 0, page: query.page, pageSize: query.pageSize };
  }

  getQuestionById(id: string) {
    return { id, message: "Chức năng đang phát triển" };
  }

  askQuestion(input: AskQuestionInput, actorId: string) {
    return { id: actorId, title: input.title, message: "Chức năng đang phát triển" };
  }

  submitAnswer(input: SubmitAnswerInput, actorId: string) {
    return { id: actorId, questionId: input.questionId, message: "Chức năng đang phát triển" };
  }

  async getQ161RulePack(): Promise<Q161RulePackResponse> {
    return this.cacheService.getOrSet("wisdom:q161:rule-pack:v1", 60 * 30, async () => {
      // Keep this read-only pack in Wisdom owner module.
      const payload = parseQ161RulePackWithMini(Q161_RULE_PACK);
      return await Promise.resolve(payload);
    });
  }
}
