import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { ContentStatus, PostType, Prisma } from "../../generated/prisma/client.js";

export interface CreatePostData {
  publicId: string;
  slug: string;
  title: string;
  postType?: PostType;
  sourceRef?: string | null;
  excerpt?: string | null;
  content: Record<string, unknown>;
  authorId: string;
  featuredImageId?: string | null;
  primaryCategoryId?: string | null;
  tagIds?: string[];
  featured?: boolean;
  allowComments?: boolean;
}

export interface UpdatePostData {
  title?: string;
  slug?: string;
  postType?: PostType;
  sourceRef?: string | null;
  excerpt?: string | null;
  content?: Record<string, unknown>;
  featuredImageId?: string | null;
  primaryCategoryId?: string | null;
  tagIds?: string[];
  featured?: boolean;
  allowComments?: boolean;
  status?: ContentStatus;
  publishedAt?: Date | null;
}

@Injectable()
export class ContentRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly postInclude = {
    author: { select: { publicId: true, displayName: true, avatarUrl: true } },
    primaryCategory: { select: { publicId: true, name: true, slug: true } },
    tags: { include: { tag: { select: { publicId: true, name: true, slug: true } } } },
  } satisfies Prisma.PostInclude;

  async create(data: CreatePostData) {
    return this.prisma.post.create({
      data: {
        publicId: data.publicId,
        slug: data.slug,
        title: data.title,
        postType: data.postType ?? "ARTICLE",
        sourceRef: data.sourceRef,
        excerpt: data.excerpt,
        content: data.content as Prisma.InputJsonValue,
        authorId: data.authorId,
        featuredImageId: data.featuredImageId,
        primaryCategoryId: data.primaryCategoryId,
        featured: data.featured ?? false,
        allowComments: data.allowComments ?? true,
        status: "DRAFT",
        ...(data.tagIds?.length && {
          tags: { create: data.tagIds.map((tagId) => ({ tagId })) },
        }),
      },
      include: this.postInclude,
    });
  }

  async findByPublicId(publicId: string) {
    return this.prisma.post.findUnique({
      where: { publicId },
      include: this.postInclude,
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.post.findUnique({
      where: { slug },
      include: this.postInclude,
    });
  }

  async findMany(options: {
    status?: ContentStatus;
    postType?: PostType;
    authorId?: string;
    categoryId?: string;
    featured?: boolean;
    page: number;
    limit: number;
  }) {
    const where: Prisma.PostWhereInput = {};
    if (options.status) where.status = options.status;
    if (options.postType) where.postType = options.postType;
    if (options.authorId) where.authorId = options.authorId;
    if (options.categoryId) where.primaryCategoryId = options.categoryId;
    if (options.featured !== undefined) where.featured = options.featured;

    const [posts, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where,
        include: this.postInclude,
        orderBy: { createdAt: "desc" },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      this.prisma.post.count({ where }),
    ]);

    return { posts, total };
  }

  async update(publicId: string, data: UpdatePostData) {
    const { tagIds, ...rest } = data;

    const updateData: Prisma.PostUpdateInput = {};
    if (rest.title !== undefined) updateData.title = rest.title;
    if (rest.slug !== undefined) updateData.slug = rest.slug;
    if (rest.postType !== undefined) updateData.postType = rest.postType;
    if (rest.sourceRef !== undefined) updateData.sourceRef = rest.sourceRef;
    if (rest.excerpt !== undefined) updateData.excerpt = rest.excerpt;
    if (rest.content !== undefined) updateData.content = rest.content as Prisma.InputJsonValue;
    if (rest.featuredImageId !== undefined) {
      updateData.featuredImage = rest.featuredImageId
        ? { connect: { id: rest.featuredImageId } }
        : { disconnect: true };
    }
    if (rest.primaryCategoryId !== undefined) {
      updateData.primaryCategory = rest.primaryCategoryId
        ? { connect: { id: rest.primaryCategoryId } }
        : { disconnect: true };
    }
    if (rest.featured !== undefined) updateData.featured = rest.featured;
    if (rest.allowComments !== undefined) updateData.allowComments = rest.allowComments;
    if (rest.status !== undefined) updateData.status = rest.status;
    if (rest.publishedAt !== undefined) updateData.publishedAt = rest.publishedAt;

    // replace tags when provided
    if (tagIds !== undefined) {
      updateData.tags = {
        deleteMany: {},
        create: tagIds.map((tagId) => ({ tagId })),
      };
    }

    return this.prisma.post.update({
      where: { publicId },
      data: updateData,
      include: this.postInclude,
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
