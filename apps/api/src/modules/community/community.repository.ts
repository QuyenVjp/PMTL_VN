import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type {
  AdminUpdateCommunityPostInput,
  AdminUpdateGuestbookInput,
  CommunityPostQuery,
  CreateCommunityPostInput,
  CreateGuestbookEntryInput,
  GuestbookQuery,
  CreateVolunteerInput,
  UpdateVolunteerInput,
  VolunteerQuery,
  CommentQuery,
  CreateCommentInput,
  CreateReportInput,
} from "./community.schemas.js";

const AUTHOR_PUBLIC_SELECT = {
  select: { publicId: true, displayName: true },
} as const;

const AUTHOR_ADMIN_SELECT = {
  select: { publicId: true, displayName: true, email: true },
} as const;

@Injectable()
export class CommunityRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── Posts ──────────────────────────────────────────────────────────────

  async findManyPublishedPosts(query: CommunityPostQuery) {
    const where: Record<string, unknown> = { status: "APPROVED", isHidden: false };
    if (query.search) where.content = { contains: query.search, mode: "insensitive" };

    const [data, total] = await Promise.all([
      this.prisma.communityPost.findMany({
        where,
        include: { author: AUTHOR_PUBLIC_SELECT },
        orderBy: { createdAt: "desc" },
        take: query.limit,
        skip: query.offset,
      }),
      this.prisma.communityPost.count({ where }),
    ]);

    return { data, total };
  }

  async findPublicPostByPublicId(publicId: string) {
    return this.prisma.communityPost.findFirst({
      where: { publicId, status: "APPROVED", isHidden: false },
      include: { author: AUTHOR_PUBLIC_SELECT },
    });
  }

  async createPost(input: CreateCommunityPostInput, authorId: string, publicId: string) {
    return this.prisma.communityPost.create({
      data: { publicId, content: input.content, authorId, status: "PENDING" },
    });
  }

  async findManyAdminPosts(query: CommunityPostQuery) {
    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;
    if (query.search) where.content = { contains: query.search, mode: "insensitive" };

    const [data, total] = await Promise.all([
      this.prisma.communityPost.findMany({
        where,
        include: { author: AUTHOR_ADMIN_SELECT },
        orderBy: { createdAt: "desc" },
        take: query.limit,
        skip: query.offset,
      }),
      this.prisma.communityPost.count({ where }),
    ]);

    return { data, total };
  }

  async findAdminPostByPublicId(publicId: string) {
    return this.prisma.communityPost.findUnique({
      where: { publicId },
      include: { author: AUTHOR_ADMIN_SELECT },
    });
  }

  async updatePostStatus(publicId: string, input: AdminUpdateCommunityPostInput) {
    return this.prisma.communityPost.update({
      where: { publicId },
      data: { status: input.status, isHidden: input.status === "HIDDEN" },
    });
  }

  async updatePost(publicId: string, data: { isPinned?: boolean; isHidden?: boolean }) {
    return this.prisma.communityPost.update({
      where: { publicId },
      data,
    });
  }

  async deletePost(publicId: string) {
    return this.prisma.communityPost.delete({
      where: { publicId },
    });
  }

  // ── Guestbook ──────────────────────────────────────────────────────────

  async findManyAdminGuestbook(query: GuestbookQuery) {
    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.guestbookEntry.findMany({
        where,
        include: {
          author: AUTHOR_ADMIN_SELECT,
          approvedBy: { select: { publicId: true, displayName: true } },
        },
        orderBy: { createdAt: "desc" },
        take: query.limit,
        skip: query.offset,
      }),
      this.prisma.guestbookEntry.count({ where }),
    ]);

    return { data, total };
  }

  async findAdminGuestbookEntryByPublicId(publicId: string) {
    return this.prisma.guestbookEntry.findUnique({
      where: { publicId },
      include: {
        author: AUTHOR_ADMIN_SELECT,
        approvedBy: { select: { publicId: true, displayName: true } },
      },
    });
  }

  async createGuestbookEntry(input: CreateGuestbookEntryInput, authorId: string, publicId: string) {
    return this.prisma.guestbookEntry.create({
      data: { publicId, content: input.content, authorId, status: "PENDING" },
    });
  }

  async updateGuestbookStatus(
    entry: { publicId: string; approvedById: string | null; approvedAt: Date | null },
    input: AdminUpdateGuestbookInput,
    adminId: string,
  ) {
    return this.prisma.guestbookEntry.update({
      where: { publicId: entry.publicId },
      data: {
        status: input.status,
        approvedById: input.status === "APPROVED" ? adminId : entry.approvedById,
        approvedAt: input.status === "APPROVED" ? new Date() : entry.approvedAt,
      },
    });
  }

  async deleteGuestbookEntry(publicId: string) {
    return this.prisma.guestbookEntry.delete({
      where: { publicId },
    });
  }

  // ── Hearts ─────────────────────────────────────────────────────────────

  async findHeart(postId: string, userId: string) {
    return this.prisma.communityHeart.findUnique({
      where: { postId_userId: { postId, userId } },
    });
  }

  async toggleHeart(postId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.communityHeart.findUnique({
        where: { postId_userId: { postId, userId } },
      });

      if (existing) {
        await tx.communityHeart.delete({
          where: { postId_userId: { postId, userId } },
        });
        const post = await tx.communityPost.update({
          where: { id: postId },
          data: { heartCount: { decrement: 1 } },
        });
        return { hearted: false, heartCount: post.heartCount };
      }

      await tx.communityHeart.create({
        data: { postId, userId },
      });
      const post = await tx.communityPost.update({
        where: { id: postId },
        data: { heartCount: { increment: 1 } },
      });
      return { hearted: true, heartCount: post.heartCount };
    });
  }

  // ── Comments ──────────────────────────────────────────────────────────

  async findManyComments(postId: string, query: CommentQuery) {
    const where = { postId, isHidden: false };

    const [data, total] = await Promise.all([
      this.prisma.communityComment.findMany({
        where,
        include: {
          author: { select: { publicId: true, displayName: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "desc" },
        take: query.limit,
        skip: query.offset,
      }),
      this.prisma.communityComment.count({ where }),
    ]);

    return { data, total };
  }

  async createComment(postId: string, input: CreateCommentInput, authorId: string, publicId: string) {
    return this.prisma.$transaction(async (tx) => {
      const comment = await tx.communityComment.create({
        data: { publicId, postId, authorId, content: input.content },
      });
      await tx.communityPost.update({
        where: { id: postId },
        data: { commentCount: { increment: 1 } },
      });
      return comment;
    });
  }

  // ── Reports ───────────────────────────────────────────────────────────

  async createReport(
    targetType: string,
    targetId: string,
    input: CreateReportInput,
    reporterUserId: string,
    publicId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const report = await tx.moderationReport.create({
        data: {
          publicId,
          reporterUserId,
          targetType,
          targetId,
          reasonCode: input.reasonCode,
          description: input.description ?? null,
        },
      });
      await tx.communityPost.update({
        where: { id: targetId },
        data: { reportCount: { increment: 1 } },
      });
      return report;
    });
  }

  // ── Public Guestbook ──────────────────────────────────────────────────

  async findManyPublicGuestbook(query: GuestbookQuery) {
    const where = { status: "APPROVED" as const };

    const [data, total] = await Promise.all([
      this.prisma.guestbookEntry.findMany({
        where,
        include: {
          author: { select: { publicId: true, displayName: true } },
        },
        orderBy: { createdAt: "desc" },
        take: query.limit,
        skip: query.offset,
      }),
      this.prisma.guestbookEntry.count({ where }),
    ]);

    return { data, total };
  }

  // ── Volunteers ─────────────────────────────────────────────────────────

  async findManyVolunteers(query: VolunteerQuery) {
    const where: Record<string, unknown> = {};
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.search) {
      where.OR = [
        { displayName: { contains: query.search, mode: "insensitive" } },
        { role: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.volunteer.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        take: query.limit,
        skip: query.offset,
      }),
      this.prisma.volunteer.count({ where }),
    ]);

    return { data, total };
  }

  async findVolunteerByPublicId(publicId: string) {
    return this.prisma.volunteer.findUnique({
      where: { publicId },
    });
  }

  async createVolunteer(input: CreateVolunteerInput, publicId: string) {
    return this.prisma.volunteer.create({
      data: {
        publicId,
        displayName: input.displayName,
        role: input.role,
        avatarUrl: input.avatarUrl ?? null,
        phone: input.phone ?? null,
        zaloLink: input.zaloLink ?? null,
        bio: input.bio ?? null,
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive ?? true,
      },
    });
  }

  async updateVolunteer(publicId: string, input: UpdateVolunteerInput) {
    const data: Record<string, unknown> = {};
    if (input.displayName !== undefined) data.displayName = input.displayName;
    if (input.role !== undefined) data.role = input.role;
    if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl ?? null;
    if (input.phone !== undefined) data.phone = input.phone ?? null;
    if (input.zaloLink !== undefined) data.zaloLink = input.zaloLink ?? null;
    if (input.bio !== undefined) data.bio = input.bio ?? null;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
    if (input.isActive !== undefined) data.isActive = input.isActive;

    return this.prisma.volunteer.update({
      where: { publicId },
      data,
    });
  }

  async deleteVolunteer(publicId: string) {
    return this.prisma.volunteer.delete({
      where: { publicId },
    });
  }
}
