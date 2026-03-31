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
  CreateVolunteerInput,
  UpdateVolunteerInput,
  VolunteerQuery,
  CommentQuery,
  CreateCommentInput,
  CreateReportInput,
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

  // ── Public social endpoints ────────────────────────────────────────

  async toggleHeart(postPublicId: string, userId: string) {
    const post = await this.repo.findPublicPostByPublicId(postPublicId);
    if (!post) throw new NotFoundException("Không tìm thấy bài đăng");

    const result = await this.repo.toggleHeart(post.id, userId);

    await this.audit.append(
      { actorId: userId, actorType: "user" },
      result.hearted ? "community.heart.add" : "community.heart.remove",
      "CommunityPost",
      postPublicId,
    );

    return { data: result };
  }

  async listComments(postPublicId: string, query: CommentQuery) {
    const post = await this.repo.findPublicPostByPublicId(postPublicId);
    if (!post) throw new NotFoundException("Không tìm thấy bài đăng");

    const { data, total } = await this.repo.findManyComments(post.id, query);
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

  async createComment(postPublicId: string, input: CreateCommentInput, userId: string) {
    const post = await this.repo.findPublicPostByPublicId(postPublicId);
    if (!post) throw new NotFoundException("Không tìm thấy bài đăng");

    const comment = await this.repo.createComment(post.id, input, userId, nanoid());

    await this.audit.append(
      { actorId: userId, actorType: "user" },
      "community.comment.create",
      "CommunityComment",
      comment.publicId,
    );

    return comment;
  }

  async reportPost(postPublicId: string, input: CreateReportInput, userId: string) {
    const post = await this.repo.findPublicPostByPublicId(postPublicId);
    if (!post) throw new NotFoundException("Không tìm thấy bài đăng");

    const report = await this.repo.createReport(
      "community_post",
      post.id,
      input,
      userId,
      nanoid(),
    );

    await this.audit.append(
      { actorId: userId, actorType: "user" },
      "community.report.create",
      "ModerationReport",
      report.publicId,
      { targetType: "community_post", targetId: postPublicId },
    );

    return { data: { publicId: report.publicId } };
  }

  // ── Public guestbook endpoints ────────────────────────────────────

  async publicListGuestbook(query: GuestbookQuery) {
    const { data, total } = await this.repo.findManyPublicGuestbook(query);
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

  async publicCreateGuestbookEntry(input: CreateGuestbookEntryInput, userId: string) {
    const entry = await this.repo.createGuestbookEntry(input, userId, nanoid());

    await this.audit.append(
      { actorId: userId, actorType: "user" },
      "community.guestbook.create",
      "GuestbookEntry",
      entry.publicId,
    );

    return entry;
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

  // ── Admin post actions ──────────────────────────────────────────────

  async adminPinPost(publicId: string, adminId: string) {
    const post = await this.repo.findAdminPostByPublicId(publicId);
    if (!post) throw new NotFoundException("Không tìm thấy bài đăng");

    await this.repo.updatePost(publicId, { isPinned: true });

    await this.audit.append(
      { actorId: adminId, actorType: "admin" },
      "admin.community_post.update",
      "community_post",
      publicId,
    );

    return { data: { publicId, pinned: true } };
  }

  async adminUnpinPost(publicId: string, adminId: string) {
    const post = await this.repo.findAdminPostByPublicId(publicId);
    if (!post) throw new NotFoundException("Không tìm thấy bài đăng");

    await this.repo.updatePost(publicId, { isPinned: false });

    await this.audit.append(
      { actorId: adminId, actorType: "admin" },
      "admin.community_post.update",
      "community_post",
      publicId,
    );

    return { data: { publicId, pinned: false } };
  }

  async adminHidePost(publicId: string, adminId: string) {
    const post = await this.repo.findAdminPostByPublicId(publicId);
    if (!post) throw new NotFoundException("Không tìm thấy bài đăng");

    await this.repo.updatePost(publicId, { isHidden: true });

    await this.audit.append(
      { actorId: adminId, actorType: "admin" },
      "admin.community_post.update",
      "community_post",
      publicId,
    );

    return { data: { publicId, hidden: true } };
  }

  async adminRestorePost(publicId: string, adminId: string) {
    const post = await this.repo.findAdminPostByPublicId(publicId);
    if (!post) throw new NotFoundException("Không tìm thấy bài đăng");

    await this.repo.updatePost(publicId, { isHidden: false });

    await this.audit.append(
      { actorId: adminId, actorType: "admin" },
      "admin.community_post.update",
      "community_post",
      publicId,
    );

    return { data: { publicId, hidden: false } };
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

  // ── Admin volunteer endpoints ───────────────────────────────────────

  async adminListVolunteers(query: VolunteerQuery) {
    const { data, total } = await this.repo.findManyVolunteers(query);
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

  async adminCreateVolunteer(input: CreateVolunteerInput, adminId: string) {
    const volunteer = await this.repo.createVolunteer(input, nanoid());

    await this.audit.append(
      { actorId: adminId, actorType: "admin" },
      "content.create",
      "volunteer",
      volunteer.publicId,
    );

    return volunteer;
  }

  async adminGetVolunteer(publicId: string) {
    const volunteer = await this.repo.findVolunteerByPublicId(publicId);
    if (!volunteer) throw new NotFoundException("Không tìm thấy tình nguyện viên");
    return volunteer;
  }

  async adminUpdateVolunteer(publicId: string, input: UpdateVolunteerInput, adminId: string) {
    const volunteer = await this.repo.findVolunteerByPublicId(publicId);
    if (!volunteer) throw new NotFoundException("Không tìm thấy tình nguyện viên");

    const updated = await this.repo.updateVolunteer(publicId, input);

    await this.audit.append(
      { actorId: adminId, actorType: "admin" },
      "content.update",
      "volunteer",
      publicId,
    );

    return updated;
  }

  async adminDeleteVolunteer(publicId: string, adminId: string) {
    const volunteer = await this.repo.findVolunteerByPublicId(publicId);
    if (!volunteer) throw new NotFoundException("Không tìm thấy tình nguyện viên");

    await this.repo.deleteVolunteer(publicId);

    await this.audit.append(
      { actorId: adminId, actorType: "admin" },
      "content.delete",
      "volunteer",
      publicId,
    );
  }

  async adminActivateVolunteer(publicId: string, adminId: string) {
    const volunteer = await this.repo.findVolunteerByPublicId(publicId);
    if (!volunteer) throw new NotFoundException("Không tìm thấy tình nguyện viên");

    await this.repo.updateVolunteer(publicId, { isActive: true });

    await this.audit.append(
      { actorId: adminId, actorType: "admin" },
      "admin.volunteer.update",
      "volunteer",
      publicId,
    );

    return { data: { publicId, isActive: true } };
  }

  async adminDeactivateVolunteer(publicId: string, adminId: string) {
    const volunteer = await this.repo.findVolunteerByPublicId(publicId);
    if (!volunteer) throw new NotFoundException("Không tìm thấy tình nguyện viên");

    await this.repo.updateVolunteer(publicId, { isActive: false });

    await this.audit.append(
      { actorId: adminId, actorType: "admin" },
      "admin.volunteer.update",
      "volunteer",
      publicId,
    );

    return { data: { publicId, isActive: false } };
  }
}
