import { Injectable, NotFoundException, ForbiddenException, ConflictException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { ContentRepository } from "./content.repository.js";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
import { StorageService } from "../../platform/storage/storage.service.js";
import { mapPostToResponse } from "./content.mapper.js";
import { canCreatePost, canEditPost, canPublishPost, getPublicStatuses } from "./content.policy.js";
import type { CreatePostInput, UpdatePostInput, ListPostsQuery } from "./content.schemas.js";
import type { UserRole, ContentStatus } from "../../generated/prisma/client.js";

@Injectable()
export class ContentService {
  constructor(
    private readonly repository: ContentRepository,
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
    input: CreatePostInput,
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

    const post = await this.repository.create({
      publicId,
      slug,
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      authorId,
      featuredImageId: input.featuredImageId,
    });

    await this.audit.append(auditContext, "content.create", "post", publicId);

    const featuredImageUrl = post.featuredImageId
      ? (await this.storage.getAsset(post.featuredImageId))?.url
      : null;

    return mapPostToResponse(post, featuredImageUrl);
  }

  async updatePost(
    publicId: string,
    input: UpdatePostInput,
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

    const updated = await this.repository.update(publicId, {
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt,
      content: input.content,
      featuredImageId: input.featuredImageId,
    });

    await this.audit.append(auditContext, "content.update", "post", publicId);

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

    const updated = await this.repository.update(publicId, {
      status: "PUBLISHED",
      publishedAt: new Date(),
    });

    await this.audit.append(auditContext, "content.publish", "post", publicId);

    const featuredImageUrl = updated.featuredImageId
      ? (await this.storage.getAsset(updated.featuredImageId))?.url
      : null;

    return mapPostToResponse(updated, featuredImageUrl);
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
}
