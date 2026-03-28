import { Injectable, NotFoundException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
import type {
  AssistedEntryInput,
  AssistedEntryHistoryQuery,
  LifeReleaseEntryInput,
  MemberSearchQuery,
} from "./vows-merit.schemas.js";

@Injectable()
export class VowsMeritService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async adminAssistedEntryHistory(query: AssistedEntryHistoryQuery) {
    const [data, total] = await Promise.all([
      this.prisma.vow.findMany({
        include: {
          user: { select: { publicId: true, displayName: true, email: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.vow.count(),
    ]);

    return {
      data,
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

  async adminSearchMembers(query: MemberSearchQuery) {
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { displayName: { contains: query.search, mode: "insensitive" } },
          { email: { contains: query.search, mode: "insensitive" } },
        ],
      },
      select: {
        publicId: true,
        displayName: true,
        email: true,
        avatarUrl: true,
      },
      take: query.limit,
      orderBy: { displayName: "asc" },
    });

    return { data: users };
  }

  async adminCreateAssistedEntry(input: AssistedEntryInput, adminId: string, auditContext: AuditContext) {
    // Find member by publicId
    const member = await this.prisma.user.findUnique({
      where: { publicId: input.memberPublicId },
      select: { id: true, publicId: true, displayName: true },
    });
    if (!member) throw new NotFoundException("Thành viên không tồn tại");

    const publicId = nanoid(21);

    const vow = await this.prisma.vow.create({
      data: {
        publicId,
        userId: member.id,
        vowType: input.vowType as any,
        description: input.description,
        targetCount: input.targetCount,
        currentCount: 0,
        status: "ACTIVE",
        startDate: new Date(input.startDate),
      },
      include: {
        user: { select: { publicId: true, displayName: true, email: true, avatarUrl: true } },
      },
    });

    await this.audit.append(auditContext, "admin.vow.create", "vow", publicId, {
      memberPublicId: input.memberPublicId,
      vowType: input.vowType,
    });

    return vow;
  }

  async adminCreateLifeReleaseEntry(input: LifeReleaseEntryInput, adminId: string, auditContext: AuditContext) {
    // Find member by publicId
    const member = await this.prisma.user.findUnique({
      where: { publicId: input.memberPublicId },
      select: { id: true, publicId: true, displayName: true },
    });
    if (!member) throw new NotFoundException("Thành viên không tồn tại");

    const publicId = nanoid(21);

    const journal = await this.prisma.lifeReleaseJournal.create({
      data: {
        publicId,
        userId: member.id,
        journalDate: new Date(input.journalDate),
        animalType: input.animalType,
        quantity: input.quantity,
        location: input.location,
        note: input.note,
        actorUserId: adminId,
      },
      include: {
        user: { select: { publicId: true, displayName: true, email: true, avatarUrl: true } },
      },
    });

    await this.audit.append(auditContext, "admin.life_release.create", "life_release_journal", publicId, {
      memberPublicId: input.memberPublicId,
      animalType: input.animalType,
      quantity: input.quantity,
    });

    return journal;
  }

  async adminGetMemberVows(memberPublicId: string) {
    const member = await this.prisma.user.findUnique({
      where: { publicId: memberPublicId },
      select: { id: true, publicId: true, displayName: true },
    });
    if (!member) throw new NotFoundException("Thành viên không tồn tại");

    const vows = await this.prisma.vow.findMany({
      where: { userId: member.id },
      orderBy: { createdAt: "desc" },
    });

    return { data: vows, member: { publicId: member.publicId, displayName: member.displayName } };
  }
}
