import { Injectable, NotFoundException, ForbiddenException, ConflictException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { ContentRepository } from "./content.repository.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
import { StorageService } from "../../platform/storage/storage.service.js";
import { mapPostToResponse } from "./content.mapper.js";
import { canCreatePost, canDeletePost, canEditPost, canPublishPost, getPublicStatuses } from "./content.policy.js";
import type {
  CreatePostRequest, UpdatePostRequest, ListPostsQuery,
  GuideQuery, CreateGuideRequest, UpdateGuideRequest,
  DownloadQuery, CreateDownloadRequest, UpdateDownloadRequest,
} from "./content.schemas.js";
import { type UserRole, type ContentStatus, type Prisma, GuideCategory, DownloadCategory } from "../../generated/prisma/client.js";

@Injectable()
export class ContentService {
  constructor(
    private readonly repository: ContentRepository,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly storage: StorageService,
  ) {}

  async listPosts(query: ListPostsQuery, userRole?: UserRole) {
    // Public access only sees published
    const status = userRole && canCreatePost(userRole) ? query.status : "PUBLISHED";

    const { posts, total } = await this.repository.findMany({
      status: status as ContentStatus | undefined,
      authorId: query.authorId,
      page: query.page,
      limit: query.limit,
    });

    const items = await Promise.all(
      posts.map(async (post) => {
        const featuredImageUrl = post.featuredImageId
          ? (await this.storage.getAsset(post.featuredImageId))?.url
          : null;
        return mapPostToResponse(post, featuredImageUrl);
      }),
    );

    return {
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async getPost(publicIdOrSlug: string, userRole?: UserRole) {
    const post = publicIdOrSlug.length === 21
      ? await this.repository.findByPublicId(publicIdOrSlug)
      : await this.repository.findBySlug(publicIdOrSlug);

    if (!post) {
      throw new NotFoundException("Bài viết không tồn tại");
    }

    // Check access for non-published posts
    const publicStatuses = getPublicStatuses();
    if (!publicStatuses.includes(post.status) && (!userRole || !canCreatePost(userRole))) {
      throw new NotFoundException("Bài viết không tồn tại");
    }

    const featuredImageUrl = post.featuredImageId
      ? (await this.storage.getAsset(post.featuredImageId))?.url
      : null;

    return mapPostToResponse(post, featuredImageUrl);
  }

  async createPost(
    input: CreatePostRequest,
    authorId: string,
    userRole: UserRole,
    auditContext: AuditContext,
  ) {
    if (!canCreatePost(userRole)) {
      throw new ForbiddenException("Không có quyền tạo bài viết");
    }

    const publicId = nanoid(21);
    const slug = input.slug || this.generateSlug(input.title, publicId);

    // Check slug uniqueness
    if (await this.repository.slugExists(slug)) {
      throw new ConflictException("Slug đã tồn tại");
    }

    // Bug 2 fix: post creation + audit in same transaction
    const post = await this.prisma.$transaction(async (tx) => {
      const created = await tx.post.create({
        data: {
          id: nanoid(21),
          publicId,
          slug,
          title: input.title,
          content: input.content as Prisma.InputJsonValue,
          authorId,
          status: "DRAFT",
          ...(input.excerpt !== undefined && { excerpt: input.excerpt }),
          ...(input.featuredImageId !== undefined && { featuredImageId: input.featuredImageId }),
        },
        include: { author: { select: { publicId: true, displayName: true, avatarUrl: true } } },
      });
      await this.audit.appendInTransaction(tx, auditContext, "content.create", "post", publicId);
      return created;
    });

    const featuredImageUrl = post.featuredImageId
      ? (await this.storage.getAsset(post.featuredImageId))?.url
      : null;

    return mapPostToResponse(post, featuredImageUrl);
  }

  async updatePost(
    publicId: string,
    input: UpdatePostRequest,
    userId: string,
    userRole: UserRole,
    auditContext: AuditContext,
  ) {
    const post = await this.repository.findByPublicId(publicId);
    
    if (!post) {
      throw new NotFoundException("Bài viết không tồn tại");
    }

    if (!canEditPost(userRole, post.authorId, userId)) {
      throw new ForbiddenException("Không có quyền sửa bài viết này");
    }

    // Check slug uniqueness if changing
    if (input.slug && input.slug !== post.slug) {
      if (await this.repository.slugExists(input.slug, publicId)) {
        throw new ConflictException("Slug đã tồn tại");
      }
    }

    // Bug 2 fix: post update + audit in same transaction
    const updated = await this.prisma.$transaction(async (tx) => {
      const postUpdateData: Record<string, unknown> = {};
      if (input.title !== undefined) postUpdateData.title = input.title;
      if (input.slug !== undefined) postUpdateData.slug = input.slug;
      if (input.excerpt !== undefined) postUpdateData.excerpt = input.excerpt;
      if (input.content !== undefined) postUpdateData.content = input.content as Prisma.InputJsonValue;
      if (input.featuredImageId !== undefined) postUpdateData.featuredImageId = input.featuredImageId;

      const result = await tx.post.update({
        where: { publicId },
        data: postUpdateData,
        include: { author: { select: { publicId: true, displayName: true, avatarUrl: true } } },
      });
      await this.audit.appendInTransaction(tx, auditContext, "content.update", "post", publicId);
      return result;
    });

    const featuredImageUrl = updated.featuredImageId
      ? (await this.storage.getAsset(updated.featuredImageId))?.url
      : null;

    return mapPostToResponse(updated, featuredImageUrl);
  }

  async publishPost(publicId: string, userRole: UserRole, auditContext: AuditContext) {
    if (!canPublishPost(userRole)) {
      throw new ForbiddenException("Không có quyền xuất bản");
    }

    const post = await this.repository.findByPublicId(publicId);
    
    if (!post) {
      throw new NotFoundException("Bài viết không tồn tại");
    }

    if (post.status === "PUBLISHED") {
      throw new ConflictException("Bài viết đã được xuất bản");
    }

    // Bug 2 fix: publish + audit in same transaction
    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.post.update({
        where: { publicId },
        data: { status: "PUBLISHED", publishedAt: new Date() },
        include: { author: { select: { publicId: true, displayName: true, avatarUrl: true } } },
      });
      await this.audit.appendInTransaction(tx, auditContext, "content.publish", "post", publicId);
      return result;
    });

    const featuredImageUrl = updated.featuredImageId
      ? (await this.storage.getAsset(updated.featuredImageId))?.url
      : null;

    return mapPostToResponse(updated, featuredImageUrl);
  }

  async deletePost(
    publicId: string,
    userId: string,
    userRole: UserRole,
    auditContext: AuditContext,
  ) {
    const post = await this.repository.findByPublicId(publicId);
    if (!post) {
      throw new NotFoundException("Bài viết không tồn tại");
    }
    if (!canDeletePost(userRole) && !canEditPost(userRole, post.authorId, userId)) {
      throw new ForbiddenException("Không có quyền xoá bài viết này");
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.post.delete({ where: { publicId } });
      await this.audit.appendInTransaction(tx, auditContext, "content.delete", "post", publicId);
    });

    return { success: true };
  }

  private generateSlug(title: string, publicId: string): string {
    const base = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 50);

    return `${base}-${publicId.substring(0, 8)}`;
  }

  // ======================== Guide methods ========================

  async listGuides(query: GuideQuery, userRole?: UserRole) {
    const where: Prisma.BeginnerGuideWhereInput = {};
    const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";
    const status = isAdmin ? query.status : "PUBLISHED";
    if (status) where.status = status as ContentStatus;
    if (query.category) where.category = query.category as GuideCategory;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { excerpt: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.beginnerGuide.findMany({
        where,
        include: { author: { select: { publicId: true, displayName: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.beginnerGuide.count({ where }),
    ]);

    return {
      data,
      meta: { pagination: { total, limit: query.limit, offset: query.offset, hasMore: query.offset + query.limit < total } },
    };
  }

  async getGuide(publicIdOrSlug: string, userRole?: UserRole) {
    const guide = await this.prisma.beginnerGuide.findFirst({
      where: { OR: [{ publicId: publicIdOrSlug }, { slug: publicIdOrSlug }] },
      include: { author: { select: { publicId: true, displayName: true, avatarUrl: true } } },
    });
    if (!guide) throw new NotFoundException("Bài hướng dẫn không tồn tại");
    const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";
    if (!isAdmin && guide.status !== "PUBLISHED") {
      throw new NotFoundException("Bài hướng dẫn không tồn tại");
    }
    return guide;
  }

  async createGuide(input: CreateGuideRequest, userId: string, auditContext: AuditContext) {
    const publicId = nanoid(21);
    const slug = input.slug || this.generateSlug(input.title, publicId);

    // Check slug uniqueness
    const existing = await this.prisma.beginnerGuide.findUnique({ where: { slug } });
    if (existing) throw new ConflictException("Slug đã tồn tại");

    const guide = await this.prisma.beginnerGuide.create({
      data: {
        id: nanoid(21),
        publicId,
        title: input.title,
        slug,
        content: input.content as Prisma.InputJsonValue,
        category: input.category as GuideCategory,
        status: "DRAFT",
        authorId: userId,
        ...(input.excerpt !== undefined && { excerpt: input.excerpt }),
      },
      include: { author: { select: { publicId: true, displayName: true, avatarUrl: true } } },
    });

    await this.audit.append(auditContext, "content.create", "beginner_guide", publicId);
    return guide;
  }

  async updateGuide(publicId: string, input: UpdateGuideRequest, auditContext: AuditContext) {
    const guide = await this.prisma.beginnerGuide.findUnique({ where: { publicId } });
    if (!guide) throw new NotFoundException("Bài hướng dẫn không tồn tại");

    if (input.slug && input.slug !== guide.slug) {
      const existing = await this.prisma.beginnerGuide.findUnique({ where: { slug: input.slug } });
      if (existing) throw new ConflictException("Slug đã tồn tại");
    }

    const updated = await this.prisma.beginnerGuide.update({
      where: { publicId },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.content !== undefined && { content: input.content as Prisma.InputJsonValue }),
        ...(input.excerpt !== undefined && { excerpt: input.excerpt }),
        ...(input.category !== undefined && { category: input.category as GuideCategory }),
      },
      include: { author: { select: { publicId: true, displayName: true, avatarUrl: true } } },
    });

    await this.audit.append(auditContext, "content.update", "beginner_guide", publicId);
    return updated;
  }

  async publishGuide(publicId: string, auditContext: AuditContext) {
    const guide = await this.prisma.beginnerGuide.findUnique({ where: { publicId } });
    if (!guide) throw new NotFoundException("Bài hướng dẫn không tồn tại");
    if (guide.status === "PUBLISHED") throw new ConflictException("Bài hướng dẫn đã được xuất bản");

    const updated = await this.prisma.beginnerGuide.update({
      where: { publicId },
      data: { status: "PUBLISHED", publishedAt: new Date() },
      include: { author: { select: { publicId: true, displayName: true, avatarUrl: true } } },
    });

    await this.audit.append(auditContext, "content.publish", "beginner_guide", publicId);
    return updated;
  }

  async unpublishGuide(publicId: string, auditContext: AuditContext) {
    const guide = await this.prisma.beginnerGuide.findUnique({ where: { publicId } });
    if (!guide) throw new NotFoundException("Bài hướng dẫn không tồn tại");
    if (guide.status !== "PUBLISHED") throw new ConflictException("Bài hướng dẫn chưa được xuất bản");

    const updated = await this.prisma.beginnerGuide.update({
      where: { publicId },
      data: { status: "DRAFT", publishedAt: null },
      include: { author: { select: { publicId: true, displayName: true, avatarUrl: true } } },
    });

    await this.audit.append(auditContext, "content.unpublish", "beginner_guide", publicId);
    return updated;
  }

  async deleteGuide(publicId: string, auditContext: AuditContext) {
    const guide = await this.prisma.beginnerGuide.findUnique({ where: { publicId } });
    if (!guide) throw new NotFoundException("Bài hướng dẫn không tồn tại");

    await this.prisma.beginnerGuide.delete({ where: { publicId } });
    await this.audit.append(auditContext, "content.delete", "beginner_guide", publicId);
    return { success: true };
  }

  // ======================== Download methods ========================

  async adminListDownloads(query: DownloadQuery) {
    const where: Prisma.DownloadWhereInput = {};
    if (query.status) where.status = query.status as ContentStatus;
    if (query.category) where.category = query.category as DownloadCategory;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.download.findMany({
        where,
        include: { uploader: { select: { publicId: true, displayName: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.download.count({ where }),
    ]);

    return {
      data,
      meta: { pagination: { total, limit: query.limit, offset: query.offset, hasMore: query.offset + query.limit < total } },
    };
  }

  async adminGetDownload(publicId: string) {
    const download = await this.prisma.download.findUnique({
      where: { publicId },
      include: { uploader: { select: { publicId: true, displayName: true, avatarUrl: true } } },
    });
    if (!download) throw new NotFoundException("Tài liệu không tồn tại");
    return download;
  }

  async adminCreateDownload(input: CreateDownloadRequest, userId: string, auditContext: AuditContext) {
    const publicId = nanoid(21);

    const download = await this.prisma.download.create({
      data: {
        id: nanoid(21),
        publicId,
        title: input.title,
        category: input.category as DownloadCategory,
        fileUrl: input.fileUrl,
        fileType: input.fileType,
        fileSize: input.fileSize,
        status: "DRAFT",
        uploaderId: userId,
        ...(input.description !== undefined && { description: input.description }),
      },
      include: { uploader: { select: { publicId: true, displayName: true, avatarUrl: true } } },
    });

    await this.audit.append(auditContext, "content.create", "download", publicId);
    return download;
  }

  async adminUpdateDownload(publicId: string, input: UpdateDownloadRequest, auditContext: AuditContext) {
    const download = await this.prisma.download.findUnique({ where: { publicId } });
    if (!download) throw new NotFoundException("Tài liệu không tồn tại");

    const updated = await this.prisma.download.update({
      where: { publicId },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.category !== undefined && { category: input.category as DownloadCategory }),
        ...(input.fileUrl !== undefined && { fileUrl: input.fileUrl }),
        ...(input.fileType !== undefined && { fileType: input.fileType }),
        ...(input.fileSize !== undefined && { fileSize: input.fileSize }),
      },
      include: { uploader: { select: { publicId: true, displayName: true, avatarUrl: true } } },
    });

    await this.audit.append(auditContext, "content.update", "download", publicId);
    return updated;
  }

  async adminDeleteDownload(publicId: string, auditContext: AuditContext) {
    const download = await this.prisma.download.findUnique({ where: { publicId } });
    if (!download) throw new NotFoundException("Tài liệu không tồn tại");

    await this.prisma.download.delete({ where: { publicId } });
    await this.audit.append(auditContext, "content.delete", "download", publicId);
    return { success: true };
  }

  async adminPublishDownload(publicId: string, auditContext: AuditContext) {
    const download = await this.prisma.download.findUnique({ where: { publicId } });
    if (!download) throw new NotFoundException("Tài liệu không tồn tại");
    if (download.status === "PUBLISHED") throw new ConflictException("Tài liệu đã được xuất bản");

    const updated = await this.prisma.download.update({
      where: { publicId },
      data: { status: "PUBLISHED", publishedAt: new Date() },
      include: { uploader: { select: { publicId: true, displayName: true, avatarUrl: true } } },
    });

    await this.audit.append(auditContext, "content.publish", "download", publicId);
    return updated;
  }
}
