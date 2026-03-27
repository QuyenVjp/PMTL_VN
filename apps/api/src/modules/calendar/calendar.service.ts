import { Injectable } from "@nestjs/common";
import { CacheService } from "../../common/cache/cache.service.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { mapQ161ForCalendar } from "../wisdom-qa/q161-rule-pack.data.js";
import type {
  AdvisoryRuntimeStatusResponse,
  CreateEventInput,
  EventQuery,
  Q161CalendarRulePackResponse,
} from "./calendar.schemas.js";

@Injectable()
export class CalendarService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  listEvents(query: EventQuery) {
    return { data: [], total: 0, page: query.page, pageSize: query.pageSize };
  }

  getEventById(id: string) {
    return { id, message: "Chức năng đang phát triển" };
  }

  createEvent(input: CreateEventInput, actorId: string) {
    return { id: actorId, title: input.title, message: "Chức năng đang phát triển" };
  }

  async getQ161RulePack(): Promise<Q161CalendarRulePackResponse> {
    return this.cacheService.getOrSet("calendar:q161:rule-pack:v1", 60 * 30, async () => {
      const payload = mapQ161ForCalendar() as Q161CalendarRulePackResponse;
      return await Promise.resolve(payload);
    });
  }

  async getAdvisoryRuntimeStatus(): Promise<AdvisoryRuntimeStatusResponse> {
    // Touch DB through extended client so this endpoint also reflects DB connectivity lane.
    await this.prisma.extended.$queryRaw`SELECT 1`;

    return {
      generatedAt: new Date().toISOString(),
      cacheMode: "live",
    };
  }
}
