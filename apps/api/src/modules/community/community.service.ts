import { Injectable, NotFoundException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { AuditService } from "../../platform/audit/audit.service.js";
import { mapGuestbookEntryToAdminItem, mapPostToAdminItem } from "./community.mapper.js";
import { CommunityRepository } from "./community.repository.js";
import type {
  AdminUpdateCommunityPostInput,
  AdminUpdateGuestbookInput,
  CommunityPostQuery,
  CreateCommunityPostInput,
  CreateGuestbookEntryInput,
  GuestbookQuery,
} from "./community.schemas.js";

@Injectable()
export class CommunityService {
  constructor(
    private readonly repo: CommunityRepository,
    private readonly audit: AuditService,
  ) {}

  // ── Public post endpoints ──────────────────────────────────────────

  async listPosts(query: CommunityPostQuery) {
    const { data, total } = await this.repo.findManyPublishedPosts(query);
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
    const post = await this.repo.findPublicPostByPublicId(publicId);
    if (!post) throw new NotFoundException("Không tìm thấy bài đăng");
    return post;
  }

  async createPost(input: CreateCommunityPostInput, userId: string) {
    const post = await this.repo.createPost(input, userId, nanoid());

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
    const { data, total } = await this.repo.findManyAdminPosts(query);
    return {
      data: data.map(mapPostToAdminItem),
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
    const post = await this.repo.findAdminPostByPublicId(publicId);
    if (!post) throw new NotFoundException("Không tìm thấy bài đăng");
    return mapPostToAdminItem(post);
  }

  async adminUpdatePostStatus(publicId: string, input: AdminUpdateCommunityPostInput, adminId: string) {
    const post = await this.repo.findAdminPostByPublicId(publicId);
    if (!post) throw new NotFoundException("Không tìm thấy bài đăng");

    const updated = await this.repo.updatePostStatus(publicId, input);

    await this.audit.append(
      { actorId: adminId, actorType: "admin" },
      "admin.community_post.update",
      "CommunityPost",
      publicId,
      { previousStatus: post.status, newStatus: input.status },
    );

    return updated;
  }

  async adminDeletePost(publicId: string, adminId: string) {
    const post = await this.repo.findAdminPostByPublicId(publicId);
    if (!post) throw new NotFoundException("Không tìm thấy bài đăng");

    await this.repo.deletePost(publicId);

    await this.audit.append(
      { actorId: adminId, actorType: "admin" },
      "admin.community_post.delete",
      "CommunityPost",
      publicId,
      { status: post.status },
    );
  }

  // ── Admin guestbook endpoints ──────────────────────────────────────

  async adminListGuestbook(query: GuestbookQuery) {
    const { data, total } = await this.repo.findManyAdminGuestbook(query);
    return {
      data: data.map(mapGuestbookEntryToAdminItem),
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
    const entry = await this.repo.findAdminGuestbookEntryByPublicId(publicId);
    if (!entry) throw new NotFoundException("Không tìm thấy bản ghi sổ lưu bút");
    return mapGuestbookEntryToAdminItem(entry);
  }

  async adminCreateGuestbookEntry(input: CreateGuestbookEntryInput, userId: string) {
    const entry = await this.repo.createGuestbookEntry(input, userId, nanoid());

    await this.audit.append(
      { actorId: userId, actorType: "user" },
      "admin.guestbook.create",
      "GuestbookEntry",
      entry.publicId,
    );

    return entry;
  }

  async adminUpdateGuestbookStatus(publicId: string, input: AdminUpdateGuestbookInput, adminId: string) {
    const entry = await this.repo.findAdminGuestbookEntryByPublicId(publicId);
    if (!entry) throw new NotFoundException("Không tìm thấy bản ghi sổ lưu bút");

    const updated = await this.repo.updateGuestbookStatus(
      { publicId, approvedById: entry.approvedById, approvedAt: entry.approvedAt },
      input,
      adminId,
    );

    await this.audit.append(
      { actorId: adminId, actorType: "admin" },
      "admin.guestbook.update",
      "GuestbookEntry",
      publicId,
      { previousStatus: entry.status, newStatus: input.status },
    );

    return updated;
  }

  async adminDeleteGuestbookEntry(publicId: string, adminId: string) {
    const entry = await this.repo.findAdminGuestbookEntryByPublicId(publicId);
    if (!entry) throw new NotFoundException("Không tìm thấy bản ghi sổ lưu bút");

    await this.repo.deleteGuestbookEntry(publicId);

    await this.audit.append(
      { actorId: adminId, actorType: "admin" },
      "admin.guestbook.delete",
      "GuestbookEntry",
      publicId,
      { status: entry.status },
    );
  }
}
