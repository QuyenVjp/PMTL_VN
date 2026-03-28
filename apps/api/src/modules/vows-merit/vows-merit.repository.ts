import { Injectable } from "@nestjs/common";
import { VowType } from "../../generated/prisma/client.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type {
  AssistedEntryHistoryQuery,
  AssistedEntryInput,
  LifeReleaseEntryInput,
  MemberSearchQuery,
} from "./vows-merit.schemas.js";

const USER_SUMMARY_SELECT = {
  select: { publicId: true, displayName: true, email: true, avatarUrl: true },
} as const;

@Injectable()
export class VowsMeritRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyVows(query: AssistedEntryHistoryQuery) {
    const [data, total] = await Promise.all([
      this.prisma.vow.findMany({
        include: { user: USER_SUMMARY_SELECT },
        orderBy: { createdAt: "desc" },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.vow.count(),
    ]);

    return { data, total };
  }

  async searchMembers(query: MemberSearchQuery) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { displayName: { contains: query.search, mode: "insensitive" } },
          { email: { contains: query.search, mode: "insensitive" } },
        ],
      },
      select: { publicId: true, displayName: true, email: true, avatarUrl: true },
      take: query.limit,
      orderBy: { displayName: "asc" },
    });
  }

  async findMemberByPublicId(publicId: string) {
    return this.prisma.user.findUnique({
      where: { publicId },
      select: { id: true, publicId: true, displayName: true },
    });
  }

  async createVow(input: AssistedEntryInput, memberId: string, publicId: string) {
    return this.prisma.vow.create({
      data: {
        publicId,
        userId: memberId,
        vowType: input.vowType as VowType,
        description: input.description,
        targetCount: input.targetCount,
        currentCount: 0,
        status: "ACTIVE",
        startDate: new Date(input.startDate),
      },
      include: { user: USER_SUMMARY_SELECT },
    });
  }

  async createLifeReleaseJournal(input: LifeReleaseEntryInput, memberId: string, actorUserId: string, publicId: string) {
    return this.prisma.lifeReleaseJournal.create({
      data: {
        publicId,
        userId: memberId,
        journalDate: new Date(input.journalDate),
        animalType: input.animalType,
        quantity: input.quantity,
        actorUserId,
        ...(input.location !== undefined && { location: input.location }),
        ...(input.note !== undefined && { note: input.note }),
      },
      include: { user: USER_SUMMARY_SELECT },
    });
  }

  async findVowsByUserId(userId: string) {
    return this.prisma.vow.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }
}
