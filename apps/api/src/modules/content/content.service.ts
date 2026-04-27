import { Injectable, NotFoundException, ForbiddenException, ConflictException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { ContentRepository } from "./content.repository.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { CacheService } from "../../common/cache/cache.service.js";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
import { StorageService } from "../../platform/storage/storage.service.js";
import { mapPostToResponse } from "./content.mapper.js";
import { canCreatePost, canDeletePost, canEditPost, canPublishPost, canUnpublishPost, getPublicStatuses } from "./content.policy.js";
import { SearchService } from "../search/search.service.js";
import type {
  CreatePostRequest, UpdatePostRequest, ListPostsQuery,
  GuideQuery, CreateGuideRequest, UpdateGuideRequest,
  DownloadQuery, CreateDownloadRequest, UpdateDownloadRequest,
  BeginnerGuidePublicQuery, DownloadPublicQuery,
  TypedContentPayload, ContentBlockType,
} from "./content.schemas.js";
import { typedContentPayloadSchema } from "./content.schemas.js";
import { type UserRole, type ContentStatus, type Prisma, type Post, type PostType, GuideCategory, DownloadCategory } from "../../generated/prisma/client.js";

type PostAuditSnapshot = Pick<
  Post,
  "title" | "slug" | "postType" | "sourceRef" | "content" | "featuredImageId" | "primaryCategoryId" | "featured" | "allowComments" | "status"
>;

function slugConflictException() {
  return new ConflictException({
    code: "platform.conflict",
    message: "Slug này đã được dùng.",
    detail: {
      properties: { slug: { errors: ["Slug này đã được dùng."] } },
      fieldErrors: { slug: "Slug này đã được dùng." },
      fields: ["slug"],
    },
  });
}

function hasJsonChanged(before: unknown, after: unknown): boolean {
  return JSON.stringify(before ?? null) !== JSON.stringify(after ?? null);
}

function buildPostUpdateAuditMetadata(previous: PostAuditSnapshot, input: UpdatePostRequest) {
  const changedFields: string[] = [];
  const before: Record<string, unknown> = {};
  const after: Record<string, unknown> = {};

  const track = (field: keyof PostAuditSnapshot, nextValue: unknown) => {
    const previousValue = previous[field];
    if (previousValue === nextValue) return;
    changedFields.push(field);
    before[field] = previousValue;
    after[field] = nextValue;
  };

  if (input.title !== undefined) track("title", input.title);
  if (input.slug !== undefined) track("slug", input.slug);
  if (input.postType !== undefined) track("postType", input.postType);
  if (input.sourceRef !== undefined) track("sourceRef", input.sourceRef);
  if (input.featuredImageId !== undefined) track("featuredImageId", input.featuredImageId);
  if (input.primaryCategoryId !== undefined) track("primaryCategoryId", input.primaryCategoryId);
  if (input.featured !== undefined) track("featured", input.featured);
  if (input.allowComments !== undefined) track("allowComments", input.allowComments);
  if (input.content !== undefined && hasJsonChanged(previous.content, input.content)) {
    changedFields.push("content");
    before.content = "[content snapshot omitted]";
    after.content = "[content snapshot omitted]";
  }

  return { changedFields, before, after };
}

@Injectable()
export class ContentService {
  constructor(
    private readonly repository: ContentRepository,
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
    private readonly audit: AuditService,
    private readonly storage: StorageService,
    private readonly searchService: SearchService,
  ) {}

  async listPosts(query: ListPostsQuery, userRole?: UserRole) {
    // Public access only sees published
    const status = userRole && canCreatePost(userRole) ? query.status : "PUBLISHED";

    const { posts, total } = await this.repository.findMany({
      status: status as ContentStatus | undefined,
      postType: query.postType as PostType | undefined,
      authorId: query.authorId,
      categoryId: query.categoryId,
      featured: query.featured,
      page: query.page,
      limit: query.limit,
    });

    const items = await Promise.all(
      posts.map(async (post) => {
        const featuredImageUrl = await this.storage.resolveAssetUrlById(post.featuredImageId);
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
    const post = await this.repository.findByPublicIdOrSlug(publicIdOrSlug);

    if (!post) {
      throw new NotFoundException("Bài viết không tồn tại");
    }

    // Check access for non-published posts
    const publicStatuses = getPublicStatuses();
    if (!publicStatuses.includes(post.status) && (!userRole || !canCreatePost(userRole))) {
      throw new NotFoundException("Bài viết không tồn tại");
    }

    const featuredImageUrl = await this.storage.resolveAssetUrlById(post.featuredImageId);

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
      throw slugConflictException();
    }
    const featuredImageId = await this.normalizeFeaturedImageId(input.featuredImageId);

    // Bug 2 fix: post creation + audit in same transaction
    const post = await this.prisma.$transaction(async (tx) => {
      const created = await tx.post.create({
        data: {
          id: nanoid(21),
          publicId,
          slug,
          title: input.title,
          postType: (input.postType ?? "ARTICLE") as PostType,
          content: input.content as Prisma.InputJsonValue,
          authorId,
          status: "DRAFT",
          ...(input.sourceRef !== undefined && { sourceRef: input.sourceRef }),
          ...(featuredImageId !== undefined && { featuredImageId }),
          ...(input.primaryCategoryId !== undefined && { primaryCategoryId: input.primaryCategoryId }),
          ...(input.featured !== undefined && { featured: input.featured }),
          ...(input.allowComments !== undefined && { allowComments: input.allowComments }),
          ...(input.tagIds?.length && {
            tags: { create: input.tagIds.map((tagId) => ({ tagId })) },
          }),
        },
        include: {
          author: { select: { publicId: true, displayName: true, avatarUrl: true } },
          primaryCategory: { select: { publicId: true, name: true, slug: true } },
          tags: { include: { tag: { select: { publicId: true, name: true, slug: true } } } },
        },
      });
      await this.audit.appendInTransaction(tx, auditContext, "content.create", "post", publicId);
      return created;
    });

    const featuredImageUrl = await this.storage.resolveAssetUrlById(post.featuredImageId);

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
        throw slugConflictException();
      }
    }
    const featuredImageId = await this.normalizeFeaturedImageId(input.featuredImageId);
    const auditMetadata = buildPostUpdateAuditMetadata(post, {
      ...input,
      ...(featuredImageId !== undefined ? { featuredImageId } : {}),
    });

    // Bug 2 fix: post update + audit in same transaction
    const updated = await this.prisma.$transaction(async (tx) => {
      const postUpdateData: Prisma.PostUpdateInput = {};
      if (input.title !== undefined) postUpdateData.title = input.title;
      if (input.slug !== undefined) postUpdateData.slug = input.slug;
      if (input.postType !== undefined) postUpdateData.postType = input.postType as PostType;
      if (input.sourceRef !== undefined) postUpdateData.sourceRef = input.sourceRef;
      if (input.content !== undefined) postUpdateData.content = input.content as Prisma.InputJsonValue;
      if (featuredImageId !== undefined) {
        postUpdateData.featuredImage = featuredImageId
          ? { connect: { id: featuredImageId } }
          : { disconnect: true };
      }
      if (input.featured !== undefined) postUpdateData.featured = input.featured;
      if (input.allowComments !== undefined) postUpdateData.allowComments = input.allowComments;
      if (input.primaryCategoryId !== undefined) {
        postUpdateData.primaryCategory = input.primaryCategoryId
          ? { connect: { id: input.primaryCategoryId } }
          : { disconnect: true };
      }
      if (input.tagIds !== undefined) {
        postUpdateData.tags = {
          deleteMany: {},
          create: input.tagIds.map((tagId) => ({ tagId })),
        };
      }

      const result = await tx.post.update({
        where: { publicId },
        data: postUpdateData,
        include: {
          author: { select: { publicId: true, displayName: true, avatarUrl: true } },
          primaryCategory: { select: { publicId: true, name: true, slug: true } },
          tags: { include: { tag: { select: { publicId: true, name: true, slug: true } } } },
        },
      });
      await this.audit.appendInTransaction(tx, auditContext, "content.update", "post", publicId, auditMetadata);
      return result;
    });

    const featuredImageUrl = await this.storage.resolveAssetUrlById(updated.featuredImageId);

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
    this.parseTypedContentForPublish(post.content, "Bài viết");

    // Bug 2 fix: publish + audit in same transaction
    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.post.update({
        where: { publicId },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
          ...(post.firstPublishedAt ? {} : { firstPublishedAt: new Date() }),
        },
        include: {
          author: { select: { publicId: true, displayName: true, avatarUrl: true } },
          primaryCategory: { select: { publicId: true, name: true, slug: true } },
          tags: { include: { tag: { select: { publicId: true, name: true, slug: true } } } },
        },
      });
      await this.audit.appendInTransaction(tx, auditContext, "content.publish", "post", publicId, {
        before: { status: post.status, publishedAt: post.publishedAt?.toISOString() ?? null },
        after: { status: "PUBLISHED" },
      });
      return result;
    });

    const featuredImageUrl = await this.storage.resolveAssetUrlById(updated.featuredImageId);

    void this.searchService.indexDocument("posts", {
      id: updated.publicId,
      title: updated.title,
      excerpt: "",
      href: `/bai-viet/${updated.slug}`,
      publishedAt: updated.publishedAt?.toISOString() ?? null,
    });

    return mapPostToResponse(updated, featuredImageUrl);
  }

  async unpublishPost(
    publicId: string,
    mode: "keepDraft" | "replaceDraftWithPublished",
    userRole: UserRole,
    auditContext: AuditContext,
  ) {
    if (!canUnpublishPost(userRole)) {
      throw new ForbiddenException("Không có quyền gỡ xuất bản");
    }

    const post = await this.repository.findByPublicId(publicId);
    if (!post) throw new NotFoundException("Bài viết không tồn tại");
    if (post.status !== "PUBLISHED") {
      throw new ConflictException("Bài viết chưa ở trạng thái xuất bản");
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.post.update({
        where: { publicId },
        data: { status: "DRAFT", publishedAt: null },
        include: {
          author: { select: { publicId: true, displayName: true, avatarUrl: true } },
          primaryCategory: { select: { publicId: true, name: true, slug: true } },
          tags: { include: { tag: { select: { publicId: true, name: true, slug: true } } } },
        },
      });
      await this.audit.appendInTransaction(tx, auditContext, "content.unpublish", "post", publicId, {
        mode,
        before: { status: post.status, publishedAt: post.publishedAt?.toISOString() ?? null },
        after: { status: "DRAFT", publishedAt: null },
      });
      return result;
    });

    const featuredImageUrl = await this.storage.resolveAssetUrlById(updated.featuredImageId);

    void this.searchService.removeDocument("posts", updated.publicId);

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
      await this.audit.appendInTransaction(tx, auditContext, "content.delete", "post", publicId, {
        title: post.title,
        slug: post.slug,
        status: post.status,
      });
    });

    void this.searchService.removeDocument("posts", publicId);

    return { success: true };
  }

  async checkSlugAvailability(slug: string, type: "POST" | "GUIDE", excludePublicId?: string): Promise<{ available: boolean }> {
    if (type === "POST") {
      const exists = await this.repository.slugExists(slug, excludePublicId);
      return { available: !exists };
    }
    // GUIDE
    const existing = await this.prisma.beginnerGuide.findFirst({
      where: { slug, ...(excludePublicId && { publicId: { not: excludePublicId } }) },
    });
    return { available: !existing };
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

  private async normalizeFeaturedImageId(value: string | null | undefined): Promise<string | null | undefined> {
    if (value === undefined) return undefined;
    if (value === null) return null;
    if (value.trim().length === 0) return null;
    const asset = await this.storage.getAsset(value);
    if (!asset) {
      throw new NotFoundException("Ảnh đại diện không tồn tại");
    }
    // posts.featured_image_id references MediaAsset.id (internal id), not publicId.
    return asset.id;
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
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.beginnerGuide.findMany({
        where,
        include: {
          author: { select: { publicId: true, displayName: true, avatarUrl: true } },
          coverMedia: { select: { publicId: true, url: true } },
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.beginnerGuide.count({ where }),
    ]);

    const mapped = await Promise.all(
      data.map(async (guide) => ({
        ...guide,
        coverMediaPublicId: guide.coverMedia?.publicId ?? null,
        coverImageUrl: (await this.storage.resolveAssetUrl(guide.coverMedia?.publicId)) ?? guide.coverMedia?.url ?? null,
      })),
    );

    return {
      data: mapped,
      meta: { pagination: { total, limit: query.limit, offset: query.offset, hasMore: query.offset + query.limit < total } },
    };
  }

  async getGuide(publicIdOrSlug: string, userRole?: UserRole) {
    const guide = await this.prisma.beginnerGuide.findFirst({
      where: { OR: [{ publicId: publicIdOrSlug }, { slug: publicIdOrSlug }] },
      include: {
        author: { select: { publicId: true, displayName: true, avatarUrl: true } },
        coverMedia: { select: { publicId: true, url: true } },
      },
    });
    if (!guide) throw new NotFoundException("Bài hướng dẫn không tồn tại");
    const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";
    if (!isAdmin && guide.status !== "PUBLISHED") {
      throw new NotFoundException("Bài hướng dẫn không tồn tại");
    }
    return {
      ...guide,
      coverMediaPublicId: guide.coverMedia?.publicId ?? null,
      coverImageUrl: (await this.storage.resolveAssetUrl(guide.coverMedia?.publicId)) ?? guide.coverMedia?.url ?? null,
    };
  }

  async createGuide(input: CreateGuideRequest, userId: string, auditContext: AuditContext) {
    const publicId = nanoid(21);
    const slug = input.slug || this.generateSlug(input.title, publicId);

    // Check slug uniqueness
    const existing = await this.prisma.beginnerGuide.findUnique({ where: { slug } });
    if (existing) throw slugConflictException();

    const coverMediaId = await this.resolveMediaIdByPublicId(input.coverMediaPublicId);

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
        ...(coverMediaId !== undefined && { coverMediaId }),
        ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
        ...(input.versionNote !== undefined && { versionNote: input.versionNote }),
      },
      include: {
        author: { select: { publicId: true, displayName: true, avatarUrl: true } },
        coverMedia: { select: { publicId: true, url: true } },
      },
    });

    await this.audit.append(auditContext, "content.create", "beginner_guide", publicId);
    return {
      ...guide,
      coverMediaPublicId: guide.coverMedia?.publicId ?? null,
      coverImageUrl: (await this.storage.resolveAssetUrl(guide.coverMedia?.publicId)) ?? guide.coverMedia?.url ?? null,
    };
  }

  async updateGuide(publicId: string, input: UpdateGuideRequest, auditContext: AuditContext) {
    const guide = await this.prisma.beginnerGuide.findUnique({ where: { publicId } });
    if (!guide) throw new NotFoundException("Bài hướng dẫn không tồn tại");

    if (input.slug && input.slug !== guide.slug) {
      const existing = await this.prisma.beginnerGuide.findUnique({ where: { slug: input.slug } });
      if (existing) throw slugConflictException();
    }

    const coverMediaId = await this.resolveMediaIdByPublicId(input.coverMediaPublicId);

    const updated = await this.prisma.beginnerGuide.update({
      where: { publicId },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.content !== undefined && { content: input.content as Prisma.InputJsonValue }),
        ...(coverMediaId !== undefined && { coverMediaId }),
        ...(input.category !== undefined && { category: input.category as GuideCategory }),
        ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
        ...(input.versionNote !== undefined && { versionNote: input.versionNote }),
      },
      include: {
        author: { select: { publicId: true, displayName: true, avatarUrl: true } },
        coverMedia: { select: { publicId: true, url: true } },
      },
    });

    await this.audit.append(auditContext, "content.update", "beginner_guide", publicId);
    return {
      ...updated,
      coverMediaPublicId: updated.coverMedia?.publicId ?? null,
      coverImageUrl: (await this.storage.resolveAssetUrl(updated.coverMedia?.publicId)) ?? updated.coverMedia?.url ?? null,
    };
  }

  async publishGuide(publicId: string, auditContext: AuditContext) {
    const guide = await this.prisma.beginnerGuide.findUnique({ where: { publicId } });
    if (!guide) throw new NotFoundException("Bài hướng dẫn không tồn tại");
    if (guide.status === "PUBLISHED") throw new ConflictException("Bài hướng dẫn đã được xuất bản");
    const parsedContent = this.parseTypedContentForPublish(guide.content, "Bài hướng dẫn");
    this.assertGuideRequiredBlocks(guide.category, parsedContent);

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
        include: {
          uploader: { select: { publicId: true, displayName: true, avatarUrl: true } },
          fileMedia: { select: { publicId: true, url: true, mimeType: true, size: true } },
          thumbnailMedia: { select: { publicId: true, url: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.download.count({ where }),
    ]);

    const mapped = await Promise.all(
      data.map(async (download) => ({
        ...download,
        fileMediaPublicId: download.fileMedia?.publicId ?? null,
        thumbnailMediaPublicId: download.thumbnailMedia?.publicId ?? null,
        thumbnailUrl:
          (await this.storage.resolveAssetUrl(download.thumbnailMedia?.publicId)) ?? download.thumbnailMedia?.url ?? null,
      })),
    );

    return {
      data: mapped,
      meta: { pagination: { total, limit: query.limit, offset: query.offset, hasMore: query.offset + query.limit < total } },
    };
  }

  async adminGetDownload(publicId: string) {
    const download = await this.prisma.download.findUnique({
      where: { publicId },
      include: {
        uploader: { select: { publicId: true, displayName: true, avatarUrl: true } },
        fileMedia: { select: { publicId: true, url: true, mimeType: true, size: true } },
        thumbnailMedia: { select: { publicId: true, url: true } },
      },
    });
    if (!download) throw new NotFoundException("Tài liệu không tồn tại");
    return {
      ...download,
      fileMediaPublicId: download.fileMedia?.publicId ?? null,
      thumbnailMediaPublicId: download.thumbnailMedia?.publicId ?? null,
      thumbnailUrl:
        (await this.storage.resolveAssetUrl(download.thumbnailMedia?.publicId)) ?? download.thumbnailMedia?.url ?? null,
    };
  }

  async adminCreateDownload(input: CreateDownloadRequest, userId: string, auditContext: AuditContext) {
    const publicId = nanoid(21);
    const fileMediaId = await this.resolveMediaIdByPublicId(input.fileMediaPublicId);
    const thumbnailMediaId = await this.resolveMediaIdByPublicId(input.thumbnailMediaPublicId);
    const fileAsset = input.fileMediaPublicId ? await this.storage.getAsset(input.fileMediaPublicId) : null;

    const download = await this.prisma.download.create({
      data: {
        id: nanoid(21),
        publicId,
        title: input.title,
        category: input.category as DownloadCategory,
        fileUrl: input.fileUrl || fileAsset?.url || "",
        fileType: input.fileType || fileAsset?.mimeType || "application/octet-stream",
        fileSize: input.fileSize || fileAsset?.size || 0,
        ...(fileMediaId !== undefined && { fileMediaId }),
        ...(thumbnailMediaId !== undefined && { thumbnailMediaId }),
        status: "DRAFT",
        uploaderId: userId,
        ...(input.description !== undefined && { description: input.description }),
      },
      include: {
        uploader: { select: { publicId: true, displayName: true, avatarUrl: true } },
        fileMedia: { select: { publicId: true, url: true, mimeType: true, size: true } },
        thumbnailMedia: { select: { publicId: true, url: true } },
      },
    });

    await this.audit.append(auditContext, "content.create", "download", publicId);
    return {
      ...download,
      fileMediaPublicId: download.fileMedia?.publicId ?? null,
      thumbnailMediaPublicId: download.thumbnailMedia?.publicId ?? null,
      thumbnailUrl:
        (await this.storage.resolveAssetUrl(download.thumbnailMedia?.publicId)) ?? download.thumbnailMedia?.url ?? null,
    };
  }

  async adminUpdateDownload(publicId: string, input: UpdateDownloadRequest, auditContext: AuditContext) {
    const download = await this.prisma.download.findUnique({ where: { publicId } });
    if (!download) throw new NotFoundException("Tài liệu không tồn tại");
    const fileMediaId = await this.resolveMediaIdByPublicId(input.fileMediaPublicId);
    const thumbnailMediaId = await this.resolveMediaIdByPublicId(input.thumbnailMediaPublicId);
    const fileAsset = input.fileMediaPublicId ? await this.storage.getAsset(input.fileMediaPublicId) : null;

    const updated = await this.prisma.download.update({
      where: { publicId },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.category !== undefined && { category: input.category as DownloadCategory }),
        ...(input.fileUrl !== undefined && { fileUrl: input.fileUrl || fileAsset?.url || download.fileUrl }),
        ...(input.fileType !== undefined && { fileType: input.fileType || fileAsset?.mimeType || download.fileType }),
        ...(input.fileSize !== undefined && { fileSize: input.fileSize || fileAsset?.size || download.fileSize }),
        ...(fileMediaId !== undefined && { fileMediaId }),
        ...(thumbnailMediaId !== undefined && { thumbnailMediaId }),
      },
      include: {
        uploader: { select: { publicId: true, displayName: true, avatarUrl: true } },
        fileMedia: { select: { publicId: true, url: true, mimeType: true, size: true } },
        thumbnailMedia: { select: { publicId: true, url: true } },
      },
    });

    await this.audit.append(auditContext, "content.update", "download", publicId);
    return {
      ...updated,
      fileMediaPublicId: updated.fileMedia?.publicId ?? null,
      thumbnailMediaPublicId: updated.thumbnailMedia?.publicId ?? null,
      thumbnailUrl:
        (await this.storage.resolveAssetUrl(updated.thumbnailMedia?.publicId)) ?? updated.thumbnailMedia?.url ?? null,
    };
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
    if (!download.fileUrl || !download.fileType || download.fileSize < 0) {
      throw new ConflictException("Tài liệu chưa đủ dữ liệu file để xuất bản");
    }

    const updated = await this.prisma.download.update({
      where: { publicId },
      data: { status: "PUBLISHED", publishedAt: new Date() },
      include: { uploader: { select: { publicId: true, displayName: true, avatarUrl: true } } },
    });

    await this.audit.append(auditContext, "content.publish", "download", publicId);
    return updated;
  }

  // ======================== Public beginner-guide read methods ========================

  async publicListBeginnerGuides(query: BeginnerGuidePublicQuery) {
    const cacheKey = `content:public:beginner-guides:list:${query.limit}:${query.offset}:${query.category ?? "all"}`;
    return this.cacheService.getOrSet(cacheKey, 300, async () => {
      const where: Prisma.BeginnerGuideWhereInput = { status: "PUBLISHED" };
      if (query.category) where.category = query.category as GuideCategory;

      const [data, total] = await Promise.all([
        this.prisma.beginnerGuide.findMany({
          where,
          include: {
            author: { select: { publicId: true, displayName: true, avatarUrl: true } },
            coverMedia: { select: { publicId: true, url: true } },
          },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
          skip: query.offset,
          take: query.limit,
        }),
        this.prisma.beginnerGuide.count({ where }),
      ]);

      const items = await Promise.all(
        data.map(async (guide) => ({
          publicId: guide.publicId,
          title: guide.title,
          slug: guide.slug,
          category: guide.category,
          sortOrder: guide.sortOrder,
          coverImageUrl:
            (await this.storage.resolveAssetUrl(guide.coverMedia?.publicId)) ?? guide.coverMedia?.url ?? null,
          author: {
            displayName: guide.author.displayName,
            avatarUrl: guide.author.avatarUrl,
          },
          publishedAt: guide.publishedAt?.toISOString() ?? null,
        })),
      );

      return {
        data: items,
        meta: {
          pagination: {
            total,
            limit: query.limit,
            offset: query.offset,
            hasMore: query.offset + query.limit < total,
          },
        },
      };
    });
  }

  async publicGetBeginnerGuide(slugOrPublicId: string) {
    const cacheKey = `content:public:beginner-guide:${slugOrPublicId}`;
    return this.cacheService.getOrSet(cacheKey, 300, async () => {
      const guide = await this.prisma.beginnerGuide.findFirst({
        where: {
          OR: [{ publicId: slugOrPublicId }, { slug: slugOrPublicId }],
          status: "PUBLISHED",
        },
        include: {
          author: { select: { publicId: true, displayName: true, avatarUrl: true } },
          coverMedia: { select: { publicId: true, url: true } },
        },
      });
      if (!guide) throw new NotFoundException("Bài hướng dẫn không tồn tại");

      return {
        publicId: guide.publicId,
        title: guide.title,
        slug: guide.slug,
        content: guide.content as Record<string, unknown>,
        category: guide.category,
        sortOrder: guide.sortOrder,
        versionNote: guide.versionNote,
        coverImageUrl:
          (await this.storage.resolveAssetUrl(guide.coverMedia?.publicId)) ?? guide.coverMedia?.url ?? null,
        author: {
          displayName: guide.author.displayName,
          avatarUrl: guide.author.avatarUrl,
        },
        publishedAt: guide.publishedAt?.toISOString() ?? null,
        updatedAt: guide.updatedAt.toISOString(),
      };
    });
  }

  // ======================== Public download read methods ========================

  async publicListDownloads(query: DownloadPublicQuery) {
    const cacheKey = `content:public:downloads:list:${query.limit}:${query.offset}:${query.category ?? "all"}`;
    return this.cacheService.getOrSet(cacheKey, 300, async () => {
      const where: Prisma.DownloadWhereInput = { status: "PUBLISHED" };
      if (query.category) where.category = query.category as DownloadCategory;

      const [data, total] = await Promise.all([
        this.prisma.download.findMany({
          where,
          include: {
            uploader: { select: { publicId: true, displayName: true, avatarUrl: true } },
            fileMedia: { select: { publicId: true, url: true, mimeType: true, size: true } },
            thumbnailMedia: { select: { publicId: true, url: true } },
          },
          orderBy: { createdAt: "desc" },
          skip: query.offset,
          take: query.limit,
        }),
        this.prisma.download.count({ where }),
      ]);

      const items = await Promise.all(
        data.map(async (download) => ({
          publicId: download.publicId,
          title: download.title,
          description: download.description,
          category: download.category,
          fileUrl: download.fileMedia?.url ?? download.fileUrl,
          fileType: download.fileMedia?.mimeType ?? download.fileType,
          fileSize: download.fileMedia?.size ?? download.fileSize,
          thumbnailUrl:
            (await this.storage.resolveAssetUrl(download.thumbnailMedia?.publicId)) ?? download.thumbnailMedia?.url ?? null,
          publishedAt: download.publishedAt?.toISOString() ?? null,
        })),
      );

      return {
        data: items,
        meta: {
          pagination: {
            total,
            limit: query.limit,
            offset: query.offset,
            hasMore: query.offset + query.limit < total,
          },
        },
      };
    });
  }

  async publicGetDownload(publicId: string) {
    const cacheKey = `content:public:download:${publicId}`;
    return this.cacheService.getOrSet(cacheKey, 300, async () => {
      const download = await this.prisma.download.findFirst({
        where: { publicId, status: "PUBLISHED" },
        include: {
          uploader: { select: { publicId: true, displayName: true, avatarUrl: true } },
          fileMedia: { select: { publicId: true, url: true, mimeType: true, size: true } },
          thumbnailMedia: { select: { publicId: true, url: true } },
        },
      });
      if (!download) throw new NotFoundException("Tài liệu không tồn tại");

      return {
        publicId: download.publicId,
        title: download.title,
        description: download.description,
        category: download.category,
        fileUrl: download.fileMedia?.url ?? download.fileUrl,
        fileType: download.fileMedia?.mimeType ?? download.fileType,
        fileSize: download.fileMedia?.size ?? download.fileSize,
        thumbnailUrl:
          (await this.storage.resolveAssetUrl(download.thumbnailMedia?.publicId)) ?? download.thumbnailMedia?.url ?? null,
        publishedAt: download.publishedAt?.toISOString() ?? null,
        createdAt: download.createdAt.toISOString(),
      };
    });
  }

  // ======================== Public chant-items read method ========================

  async publicListChantItems() {
    return this.cacheService.getOrSet("content:public:chant-items:v1", 300, async () => {
      const groups = await this.prisma.chantEnvironmentRuleGroup.findMany({
        include: {
          rules: {
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { sortOrder: "asc" },
      });

      return {
        data: groups.map((group) => ({
          groupKey: group.groupKey,
          title: group.title,
          summary: group.summary,
          rules: group.rules.map((rule) => ({
            ruleKey: rule.ruleKey,
            title: rule.title,
            canonicalWording: rule.canonicalWording,
            severity: rule.severity.toLowerCase(),
            productizationMode: rule.productizationMode.toLowerCase(),
            safeLaneRefs: rule.safeLaneRefs.length > 0 ? rule.safeLaneRefs : undefined,
            avoidItems: rule.avoidItems.length > 0 ? rule.avoidItems : undefined,
            shortReason: rule.shortReason,
            sourceReference: rule.sourceReference,
            referenceOnly: rule.referenceOnly,
          })),
          lastReviewedAt: group.lastReviewedAt.toISOString(),
        })),
      };
    });
  }

  private async resolveMediaIdByPublicId(publicId: string | null | undefined): Promise<string | null | undefined> {
    if (publicId === undefined) return undefined;
    if (publicId === null) return null;
    if (publicId.trim().length === 0) return null;
    const asset = await this.storage.getAsset(publicId);
    if (!asset) {
      throw new NotFoundException("Media không tồn tại");
    }
    return asset.id;
  }

  private parseTypedContentForPublish(content: unknown, resourceLabel: string): TypedContentPayload {
    const parsed = typedContentPayloadSchema.safeParse(content);
    if (!parsed.success) {
      throw new ConflictException(
        `${resourceLabel} chưa đạt cấu trúc block chuẩn để xuất bản (blocks[] + type hợp lệ).`,
      );
    }
    return parsed.data;
  }

  private assertGuideRequiredBlocks(category: GuideCategory, content: TypedContentPayload): void {
    const requiredByCategory: Record<GuideCategory, ContentBlockType[]> = {
      BEGINNER: ["RICH_TEXT", "FAQ_BLOCK"],
      DAILY_PRACTICE: ["SCRIPT_BLOCK", "WARNING_LIST", "FAQ_BLOCK"],
      LITTLE_HOUSE: ["SCRIPT_BLOCK", "WARNING_LIST", "STEP_SEQUENCE", "IMAGE_COMPARE", "FAQ_BLOCK"],
      LIFE_RELEASE: ["WARNING_LIST", "STEP_SEQUENCE", "FAQ_BLOCK"],
      GENERAL: ["RICH_TEXT"],
      ALTAR_SETUP: ["RICH_TEXT", "STEP_SEQUENCE", "FAQ_BLOCK"],
      ALTAR_OFFERINGS: ["RICH_TEXT", "WARNING_LIST", "FAQ_BLOCK"],
      ALTAR_MAINTENANCE: ["RICH_TEXT", "STEP_SEQUENCE", "WARNING_LIST", "FAQ_BLOCK"],
      HEART_INCENSE: ["RICH_TEXT", "WARNING_LIST", "FAQ_BLOCK"],
    };

    const required = requiredByCategory[category] ?? [];
    const blockTypes = new Set(content.blocks.map((block) => block.type));
    const missing = required.filter((type) => !blockTypes.has(type));

    if (missing.length > 0) {
      throw new ConflictException(
        `Bài hướng dẫn thiếu block bắt buộc cho category ${category}: ${missing.join(", ")}`,
      );
    }
  }
}
