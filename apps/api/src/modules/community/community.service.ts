import { Injectable, NotFoundException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { AuditService } from "../../platform/audit/audit.service.js";
import type {
  CreateCommunityPostInput,
  CommunityPostQuery,
  AdminUpdateCommunityPostInput,
  CreateGuestbookEntryInput,
  GuestbookQuery,
  AdminUpdateGuestbookInput,
} from "./community.schemas.js";

@Injectable()
export class CommunityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ── Public post endpoints ──────────────────────────────────────────

  async listPosts(query: CommunityPostQuery) {
    const where: Record<string, unknown> = { status: "APPROVED", isHidden: false };

    if (query.search) {
      where.content = { contains: query.search, mode: "insensitive" };
    }

    const [data, total] = await Promise.all([
      this.prisma.communityPost.findMany({
        where,
        include: { author: { select: { publicId: true, displayName: true } } },
        orderBy: { createdAt: "desc" },
        take: query.limit,
        skip: query.offset,
      }),
      this.prisma.communityPost.count({ where }),
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

  async getPostById(publicId: string) {
    const post = await this.prisma.communityPost.findFirst({
      where: { publicId, status: "APPROVED", isHidden: false },
      include: { author: { select: { publicId: true, displayName: true } } },
    });

    if (!post) {
      throw new NotFoundException("Không tìm thấy bài đăng");
    }

    return post;
  }

  async createPost(input: CreateCommunityPostInput, userId: string) {
    const post = await this.prisma.communityPost.create({
      data: {
        publicId: nanoid(),
        content: input.content,
        authorId: userId,
        status: "PENDING",
      },
    });

    await this.audit.append(
      { actorId: userId, actorType: "user" },
      "content.create",
      "CommunityPost",
      post.publicId,
    );

    return post;
  }

  // ── Admin post endpoints ───────────────────────────────────────────

  async adminListPosts(query: CommunityPostQuery) {
    const where: Record<string, unknown> = {};

    if (query.status) {
      where.status = query.status;
    }
    if (query.search) {
      where.content = { contains: query.search, mode: "insensitive" };
    }

    const [data, total] = await Promise.all([
      this.prisma.communityPost.findMany({
        where,
        include: { author: { select: { publicId: true, displayName: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: query.limit,
        skip: query.offset,
      }),
      this.prisma.communityPost.count({ where }),
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

  async adminGetPost(publicId: string) {
    const post = await this.prisma.communityPost.findUnique({
      where: { publicId },
      include: { author: { select: { publicId: true, displayName: true, email: true } } },
    });

    if (!post) {
      throw new NotFoundException("Không tìm thấy bài đăng");
    }

    return post;
  }

  async adminUpdatePostStatus(publicId: string, input: AdminUpdateCommunityPostInput, adminId: string) {
    const post = await this.prisma.communityPost.findUnique({ where: { publicId } });

    if (!post) {
      throw new NotFoundException("Không tìm thấy bài đăng");
    }

    const updated = await this.prisma.communityPost.update({
      where: { publicId },
      data: {
        status: input.status,
        isHidden: input.status === "HIDDEN",
      },
    });

    await this.audit.append(
      { actorId: adminId, actorType: "admin" },
      "admin.community_post.update",
      "CommunityPost",
      publicId,
      { previousStatus: post.status, newStatus: input.status },
    );

    return updated;
  }

  // ── Admin guestbook endpoints ──────────────────────────────────────

  async adminListGuestbook(query: GuestbookQuery) {
    const where: Record<string, unknown> = {};

    if (query.status) {
      where.status = query.status;
    }

    const [data, total] = await Promise.all([
      this.prisma.guestbookEntry.findMany({
        where,
        include: { author: { select: { publicId: true, displayName: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: query.limit,
        skip: query.offset,
      }),
      this.prisma.guestbookEntry.count({ where }),
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

  async adminGetGuestbookEntry(publicId: string) {
    const entry = await this.prisma.guestbookEntry.findUnique({
      where: { publicId },
      include: {
        author: { select: { publicId: true, displayName: true, email: true } },
        approvedBy: { select: { publicId: true, displayName: true } },
      },
    });

    if (!entry) {
      throw new NotFoundException("Không tìm thấy bản ghi sổ lưu bút");
    }

    return entry;
  }

  async adminCreateGuestbookEntry(input: CreateGuestbookEntryInput, userId: string) {
    const entry = await this.prisma.guestbookEntry.create({
      data: {
        publicId: nanoid(),
        content: input.content,
        authorId: userId,
        status: "PENDING",
      },
    });

    await this.audit.append(
      { actorId: userId, actorType: "user" },
      "admin.guestbook.create",
      "GuestbookEntry",
      entry.publicId,
    );

    return entry;
  }

  async adminUpdateGuestbookStatus(publicId: string, input: AdminUpdateGuestbookInput, adminId: string) {
    const entry = await this.prisma.guestbookEntry.findUnique({ where: { publicId } });

    if (!entry) {
      throw new NotFoundException("Không tìm thấy bản ghi sổ lưu bút");
    }

    const updated = await this.prisma.guestbookEntry.update({
      where: { publicId },
      data: {
        status: input.status,
        approvedById: input.status === "APPROVED" ? adminId : entry.approvedById,
        approvedAt: input.status === "APPROVED" ? new Date() : entry.approvedAt,
      },
    });

    await this.audit.append(
      { actorId: adminId, actorType: "admin" },
      "admin.guestbook.update",
      "GuestbookEntry",
      publicId,
      { previousStatus: entry.status, newStatus: input.status },
    );

    return updated;
  }
}
