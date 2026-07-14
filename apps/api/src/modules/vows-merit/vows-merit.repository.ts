import { Injectable } from "@nestjs/common";
import { Prisma, VowType } from "../../generated/prisma/client.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { AuditAction } from "../../platform/audit/audit.schemas.js";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
import type {
  AssistedEntryHistoryQuery,
  AssistedEntryInput,
  AssistedProgressEntryInput,
  LifeReleaseEntryInput,
  MemberSearchQuery,
} from "./vows-merit.schemas.js";

const USER_SUMMARY_SELECT = {
  select: { publicId: true, displayName: true, email: true, avatarUrl: true },
} as const;

type VowWithUser = Prisma.VowGetPayload<{ include: { user: typeof USER_SUMMARY_SELECT } }>;

interface AssistedAuditInput {
  context: AuditContext;
  action: AuditAction;
  resource: string;
  metadata: Record<string, unknown>;
}

@Injectable()
export class VowsMeritRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

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

  async createVow(input: AssistedEntryInput, memberId: string, publicId: string, audit: AssistedAuditInput) {
    return this.prisma.$transaction(async (tx) => {
      const vow = await tx.vow.create({
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

      await this.audit.appendInTransaction(
        tx,
        audit.context,
        audit.action,
        audit.resource,
        vow.publicId,
        audit.metadata,
      );
      return vow;
    });
  }

  async createLifeReleaseJournal(
    input: LifeReleaseEntryInput,
    memberId: string,
    actorUserId: string,
    publicId: string,
    audit: AssistedAuditInput,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const journal = await tx.lifeReleaseJournal.create({
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

      await this.audit.appendInTransaction(
        tx,
        audit.context,
        audit.action,
        audit.resource,
        journal.publicId,
        audit.metadata,
      );
      return journal;
    });
  }

  async findVowsByUserId(userId: string) {
    return this.prisma.vow.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async addAssistedProgress(
    input: AssistedProgressEntryInput,
    memberId: string,
    buildAudit: (result: {
      before: VowWithUser;
      after: VowWithUser;
      autoCompleted: boolean;
    }) => AssistedAuditInput,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const vow = await tx.vow.findFirst({
        where: { publicId: input.vowPublicId, userId: memberId },
        include: { user: USER_SUMMARY_SELECT },
      });
      if (!vow) return null;
      if (vow.status !== "ACTIVE") return { kind: "inactive" as const, vow };

      const updated = await tx.vow.update({
        where: { id: vow.id },
        data: { currentCount: { increment: input.addCount } },
        include: { user: USER_SUMMARY_SELECT },
      });

      const completed =
        updated.targetCount !== null && updated.currentCount >= updated.targetCount;
      const finalVow = completed
        ? await tx.vow.update({
            where: { id: updated.id },
            data: { status: "COMPLETED" },
            include: { user: USER_SUMMARY_SELECT },
          })
        : updated;

      const progressAudit = buildAudit({ before: vow, after: finalVow, autoCompleted: completed });
      await this.audit.appendInTransaction(
        tx,
        progressAudit.context,
        progressAudit.action,
        progressAudit.resource,
        finalVow.publicId,
        progressAudit.metadata,
      );

      return { kind: "updated" as const, before: vow, after: finalVow, autoCompleted: completed };
    });
  }
}
