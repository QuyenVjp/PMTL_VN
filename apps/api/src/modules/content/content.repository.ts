import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { ContentStatus, Prisma } from "../../generated/prisma/client.js";

export interface CreatePostData {
  publicId: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  content: Record<string, unknown>;
  authorId: string;
  featuredImageId?: string | null;
}

export interface UpdatePostData {
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: Record<string, unknown>;
  featuredImageId?: string | null;
  status?: ContentStatus;
  publishedAt?: Date | null;
}

@Injectable()
export class ContentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePostData) {
    return this.prisma.post.create({
      data: {
        publicId: data.publicId,
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        content: data.content as Prisma.InputJsonValue,
        authorId: data.authorId,
        featuredImageId: data.featuredImageId,
        status: "DRAFT",
      },
      include: {
        author: {
          select: {
            publicId: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async findByPublicId(publicId: string) {
    return this.prisma.post.findUnique({
      where: { publicId },
      include: {
        author: {
          select: {
            publicId: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            publicId: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async findMany(options: {
    status?: ContentStatus;
    authorId?: string;
    page: number;
    limit: number;
  }) {
    const where: Prisma.PostWhereInput = {};
    
    if (options.status) {
      where.status = options.status;
    }
    if (options.authorId) {
      where.authorId = options.authorId;
    }

    const [posts, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              publicId: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      this.prisma.post.count({ where }),
    ]);

    return { posts, total };
  }

  async update(publicId: string, data: UpdatePostData) {
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.content !== undefined) updateData.content = data.content as Prisma.InputJsonValue;
    if (data.featuredImageId !== undefined) updateData.featuredImageId = data.featuredImageId;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.publishedAt !== undefined) updateData.publishedAt = data.publishedAt;

    return this.prisma.post.update({
      where: { publicId },
      data: updateData,
      include: {
        author: {
          select: {
            publicId: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async delete(publicId: string) {
    return this.prisma.post.delete({
      where: { publicId },
    });
  }

  async slugExists(slug: string, excludeId?: string) {
    const post = await this.prisma.post.findFirst({
      where: {
        slug,
        ...(excludeId && { publicId: { not: excludeId } }),
      },
    });
    return !!post;
  }
}
