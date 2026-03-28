import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type {
  AdminUpdateCommunityPostInput,
  AdminUpdateGuestbookInput,
  CommunityPostQuery,
  CreateCommunityPostInput,
  CreateGuestbookEntryInput,
  GuestbookQuery,
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
}
