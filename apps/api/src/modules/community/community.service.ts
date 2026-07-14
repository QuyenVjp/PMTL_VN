import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { nanoid } from "nanoid";
import pino from "pino";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
import { CharityFirewallService } from "../dharma-compliance/services/charity-firewall.service.js";
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
  CreateTestimonialInput,
  TestimonialQuery,
} from "./community.schemas.js";
import {
  TESTIMONIAL_DISCLAIMER_TEXT,
  TESTIMONIAL_PROHIBITED_TERMS_PATTERN,
} from "./community.schemas.js";

@Injectable()
export class CommunityService {
  private readonly logger = pino({ name: CommunityService.name });

  constructor(
    private readonly repo: CommunityRepository,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly charityFirewall: CharityFirewallService,
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

  async createPost(input: CreateCommunityPostInput, userId: string, auditCtx: AuditContext) {
    // Anti-scam donation filter — design/03-domains/community/USE_CASES/anti-scam-donation-filter.md
    // Save first as PENDING, then run scan. Auto-hide silently if bank account detected (anti-evasion).
    const post = await this.repo.createPost(input, userId, nanoid());

    try {
      const scanResult = await this.charityFirewall.scanContent(
        userId,
        "POST",
        post.publicId,
        input.content,
        auditCtx,
      );
      if (scanResult.hasViolation && !scanResult.whitelistedMatch) {
        await this.repo.updatePost(post.publicId, { isHidden: true });
        this.logger.warn(
          { userId, postPublicId: post.publicId, detectedPatterns: scanResult.detectedPatterns },
          "community.post.scam-scan.auto-hidden",
        );
        // Return silently — do NOT tell the user their post was hidden (anti-evasion design)
      } else {
        this.logger.info({ userId, postPublicId: post.publicId }, "community.post.scam-scan.passed");
      }
    } catch (err) {
      // Scan failure must not block the write path — log and continue
      this.logger.error({ err, userId, postPublicId: post.publicId }, "community.post.scam-scan.error — scan skipped");
    }

    await this.audit.append(auditCtx, "content.create", "CommunityPost", post.publicId);

    return post;
  }

  // ── Public social endpoints ────────────────────────────────────────

  async toggleHeart(postPublicId: string, userId: string, auditCtx: AuditContext) {
    const post = await this.repo.findPublicPostByPublicId(postPublicId);
    if (!post) throw new NotFoundException("Không tìm thấy bài đăng");

    const result = await this.repo.toggleHeart(post.id, userId);

    await this.audit.append(
      auditCtx,
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

  async createComment(
    postPublicId: string,
    input: CreateCommentInput,
    userId: string,
    auditCtx: AuditContext,
  ) {
    const post = await this.repo.findPublicPostByPublicId(postPublicId);
    if (!post) throw new NotFoundException("Không tìm thấy bài đăng");

    const comment = await this.repo.createComment(post.id, input, userId, nanoid());

    // Anti-scam donation filter on comments — auto-hide silently if bank account detected
    try {
      const scanResult = await this.charityFirewall.scanContent(
        userId,
        "COMMENT",
        comment.publicId,
        input.content,
        auditCtx,
      );
      if (scanResult.hasViolation && !scanResult.whitelistedMatch) {
        await this.repo.hideComment(comment.publicId);
        this.logger.warn(
          { userId, commentPublicId: comment.publicId, detectedPatterns: scanResult.detectedPatterns },
          "community.comment.scam-scan.auto-hidden",
        );
      }
    } catch (err) {
      this.logger.error({ err, userId, commentPublicId: comment.publicId }, "community.comment.scam-scan.error — scan skipped");
    }

    await this.audit.append(auditCtx, "community.comment.create", "CommunityComment", comment.publicId);

    return comment;
  }

  async reportPost(
    postPublicId: string,
    input: CreateReportInput,
    userId: string,
    auditCtx: AuditContext,
  ) {
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
      auditCtx,
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

  async publicCreateGuestbookEntry(input: CreateGuestbookEntryInput, userId: string, auditCtx: AuditContext) {
    const entry = await this.repo.createGuestbookEntry(input, userId, nanoid());

    await this.audit.append(
      auditCtx,
      "community.guestbook.create",
      "GuestbookEntry",
      entry.publicId,
    );

    return entry;
  }

  // ── Admin post endpoints ───────────────────────────────────────────

  async adminListPosts(query: CommunityPostQuery) {
    const { data, total } = await this.repo.findManyAdminPosts(query);
    // Phase 4.2 batch 2: canary list shape — rides inside transport `data`.
    // Do NOT return legacy ListEnvelope { data, meta.pagination } (double-wraps on wire).
    return {
      items: data.map(mapPostToAdminItem),
      pagination: {
        total,
        limit: query.limit,
        offset: query.offset,
        hasMore: query.offset + query.limit < total,
      },
    };
  }

  async adminGetPost(publicId: string) {
    const post = await this.repo.findAdminPostByPublicId(publicId);
    if (!post) throw new NotFoundException("Không tìm thấy bài đăng");
    return mapPostToAdminItem(post);
  }

  async adminUpdatePostStatus(publicId: string, input: AdminUpdateCommunityPostInput, auditCtx: AuditContext) {
    const post = await this.repo.findAdminPostByPublicId(publicId);
    if (!post) throw new NotFoundException("Không tìm thấy bài đăng");

    const updated = await this.repo.updatePostStatus(publicId, input);

    await this.audit.append(
      auditCtx,
      "admin.community_post.update",
      "CommunityPost",
      publicId,
      { previousStatus: post.status, newStatus: input.status },
    );

    return updated;
  }

  async adminDeletePost(publicId: string, auditCtx: AuditContext) {
    const post = await this.repo.findAdminPostByPublicId(publicId);
    if (!post) throw new NotFoundException("Không tìm thấy bài đăng");

    await this.repo.deletePost(publicId);

    await this.audit.append(
      auditCtx,
      "admin.community_post.delete",
      "CommunityPost",
      publicId,
      { status: post.status },
    );
  }

  // ── Admin post actions ──────────────────────────────────────────────

  async adminPinPost(publicId: string, auditCtx: AuditContext) {
    const post = await this.repo.findAdminPostByPublicId(publicId);
    if (!post) throw new NotFoundException("Không tìm thấy bài đăng");

    await this.repo.updatePost(publicId, { isPinned: true });

    await this.audit.append(
      auditCtx,
      "admin.community_post.update",
      "community_post",
      publicId,
    );

    return { data: { publicId, pinned: true } };
  }

  async adminUnpinPost(publicId: string, auditCtx: AuditContext) {
    const post = await this.repo.findAdminPostByPublicId(publicId);
    if (!post) throw new NotFoundException("Không tìm thấy bài đăng");

    await this.repo.updatePost(publicId, { isPinned: false });

    await this.audit.append(
      auditCtx,
      "admin.community_post.update",
      "community_post",
      publicId,
    );

    return { data: { publicId, pinned: false } };
  }

  async adminHidePost(publicId: string, auditCtx: AuditContext) {
    const post = await this.repo.findAdminPostByPublicId(publicId);
    if (!post) throw new NotFoundException("Không tìm thấy bài đăng");

    await this.repo.updatePost(publicId, { isHidden: true });

    await this.audit.append(
      auditCtx,
      "admin.community_post.update",
      "community_post",
      publicId,
    );

    return { data: { publicId, hidden: true } };
  }

  async adminRestorePost(publicId: string, auditCtx: AuditContext) {
    const post = await this.repo.findAdminPostByPublicId(publicId);
    if (!post) throw new NotFoundException("Không tìm thấy bài đăng");

    await this.repo.updatePost(publicId, { isHidden: false });

    await this.audit.append(
      auditCtx,
      "admin.community_post.update",
      "community_post",
      publicId,
    );

    return { data: { publicId, hidden: false } };
  }

  // ── Admin guestbook endpoints ──────────────────────────────────────

  async adminListGuestbook(query: GuestbookQuery) {
    const { data, total } = await this.repo.findManyAdminGuestbook(query);
    // Phase 4.2 batch 2: canary list shape — rides inside transport `data`.
    // Do NOT return legacy ListEnvelope { data, meta.pagination } (double-wraps on wire).
    return {
      items: data.map(mapGuestbookEntryToAdminItem),
      pagination: {
        total,
        limit: query.limit,
        offset: query.offset,
        hasMore: query.offset + query.limit < total,
      },
    };
  }

  async adminGetGuestbookEntry(publicId: string) {
    const entry = await this.repo.findAdminGuestbookEntryByPublicId(publicId);
    if (!entry) throw new NotFoundException("Không tìm thấy bản ghi sổ lưu bút");
    return mapGuestbookEntryToAdminItem(entry);
  }

  async adminCreateGuestbookEntry(input: CreateGuestbookEntryInput, userId: string, auditCtx: AuditContext) {
    const entry = await this.repo.createGuestbookEntry(input, userId, nanoid());

    await this.audit.append(
      auditCtx,
      "admin.guestbook.create",
      "GuestbookEntry",
      entry.publicId,
    );

    return entry;
  }

  async adminUpdateGuestbookStatus(publicId: string, input: AdminUpdateGuestbookInput, adminId: string, auditCtx: AuditContext) {
    const entry = await this.repo.findAdminGuestbookEntryByPublicId(publicId);
    if (!entry) throw new NotFoundException("Không tìm thấy bản ghi sổ lưu bút");

    const updated = await this.repo.updateGuestbookStatus(
      { publicId, approvedById: entry.approvedById, approvedAt: entry.approvedAt },
      input,
      adminId,
    );

    await this.audit.append(
      auditCtx,
      "admin.guestbook.update",
      "GuestbookEntry",
      publicId,
      { previousStatus: entry.status, newStatus: input.status },
    );

    return updated;
  }

  async adminDeleteGuestbookEntry(publicId: string, auditCtx: AuditContext) {
    const entry = await this.repo.findAdminGuestbookEntryByPublicId(publicId);
    if (!entry) throw new NotFoundException("Không tìm thấy bản ghi sổ lưu bút");

    await this.repo.deleteGuestbookEntry(publicId);

    await this.audit.append(
      auditCtx,
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

  async adminCreateVolunteer(input: CreateVolunteerInput, auditCtx: AuditContext) {
    const volunteer = await this.repo.createVolunteer(input, nanoid());

    await this.audit.append(
      auditCtx,
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

  async adminUpdateVolunteer(publicId: string, input: UpdateVolunteerInput, auditCtx: AuditContext) {
    const volunteer = await this.repo.findVolunteerByPublicId(publicId);
    if (!volunteer) throw new NotFoundException("Không tìm thấy tình nguyện viên");

    const updated = await this.repo.updateVolunteer(publicId, input);

    await this.audit.append(
      auditCtx,
      "content.update",
      "volunteer",
      publicId,
    );

    return updated;
  }

  async adminDeleteVolunteer(publicId: string, auditCtx: AuditContext) {
    const volunteer = await this.repo.findVolunteerByPublicId(publicId);
    if (!volunteer) throw new NotFoundException("Không tìm thấy tình nguyện viên");

    await this.repo.deleteVolunteer(publicId);

    await this.audit.append(
      auditCtx,
      "content.delete",
      "volunteer",
      publicId,
    );
  }

  async adminActivateVolunteer(publicId: string, auditCtx: AuditContext) {
    const volunteer = await this.repo.findVolunteerByPublicId(publicId);
    if (!volunteer) throw new NotFoundException("Không tìm thấy tình nguyện viên");

    await this.repo.updateVolunteer(publicId, { isActive: true });

    await this.audit.append(
      auditCtx,
      "admin.volunteer.update",
      "volunteer",
      publicId,
    );

    return { data: { publicId, isActive: true } };
  }

  async adminDeactivateVolunteer(publicId: string, auditCtx: AuditContext) {
    const volunteer = await this.repo.findVolunteerByPublicId(publicId);
    if (!volunteer) throw new NotFoundException("Không tìm thấy tình nguyện viên");

    await this.repo.updateVolunteer(publicId, { isActive: false });

    await this.audit.append(
      auditCtx,
      "admin.volunteer.update",
      "volunteer",
      publicId,
    );

    return { data: { publicId, isActive: false } };
  }

  // ── Testimonial disclaimer auto-inject ─────────────────────────────────
  // Design: design/03-domains/community/USE_CASES/USE_CASE_TESTIMONIAL_DISCLAIMER_AUTO_INJECT.md

  async createTestimonial(
    input: CreateTestimonialInput,
    userId: string,
    auditCtx: AuditContext,
  ) {
    const requiresDisclaimer = input.authorRole === "VOLUNTEER" || input.authorRole === "ORGANIZER";

    if (requiresDisclaimer && !input.disclaimerAcknowledge) {
      throw new BadRequestException({
        code: "disclaimer_not_acknowledged",
        message: "Phụng sự viên phải xác nhận đã đọc và chấp nhận lời miễn trừ trách nhiệm trước khi đăng bài.",
      });
    }

    // Scan body for prohibited fundraising/scam terms
    if (TESTIMONIAL_PROHIBITED_TERMS_PATTERN.test(input.body)) {
      this.logger.warn({ userId, contentType: input.contentType }, "community.testimonial.flagged — prohibited terms detected");
      throw new BadRequestException({
        code: "prohibited_terms_detected",
        message: "Nội dung chứa từ ngữ bị cấm (quyên góp, chuyển khoản, tài khoản riêng). Vui lòng chỉnh sửa lại.",
      });
    }

    const originalBodyLength = input.body.length;
    let finalBody = input.body;
    let disclaimerInjected = false;

    if (requiresDisclaimer) {
      // Idempotency: do not double-inject if disclaimer already present at end
      if (!input.body.trimEnd().endsWith(TESTIMONIAL_DISCLAIMER_TEXT.trim())) {
        finalBody = `${input.body}\n\n---\n\n${TESTIMONIAL_DISCLAIMER_TEXT}`;
        disclaimerInjected = true;
      } else {
        disclaimerInjected = true; // already has it
      }
    }

    const testimonial = await this.prisma.communityTestimonial.create({
      data: {
        publicId: nanoid(),
        authorId: userId,
        title: input.title,
        body: finalBody,
        originalBodyLength,
        contentType: input.contentType,
        authorRole: input.authorRole,
        disclaimerInjected,
        disclaimerText: requiresDisclaimer ? TESTIMONIAL_DISCLAIMER_TEXT : "",
        coverImage: input.coverImage ?? null,
        tags: input.tags,
        status: "PUBLISHED",
        visibility: "PUBLIC",
      },
    });

    await this.audit.append(
      auditCtx,
      "community.testimonial.published",
      "CommunityTestimonial",
      testimonial.publicId,
      { contentType: input.contentType, disclaimerInjected, originalBodyLength },
    );

    this.logger.info(
      { userId, testimonialPublicId: testimonial.publicId, contentType: input.contentType, disclaimerInjected },
      "community.testimonial.created",
    );

    return {
      publicId: testimonial.publicId,
      disclaimer: requiresDisclaimer ? TESTIMONIAL_DISCLAIMER_TEXT : null,
    };
  }

  async listTestimonials(query: TestimonialQuery) {
    const where: Prisma.CommunityTestimonialWhereInput = { status: "PUBLISHED", visibility: "PUBLIC" };
    if (query.contentType) where.contentType = query.contentType;

    const [data, total] = await Promise.all([
      this.prisma.communityTestimonial.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: query.limit,
        skip: query.offset,
        select: {
          publicId: true,
          title: true,
          body: true,
          contentType: true,
          authorRole: true,
          disclaimerInjected: true,
          tags: true,
          viewCount: true,
          likeCount: true,
          createdAt: true,
          author: { select: { publicId: true, displayName: true } },
        },
      }),
      this.prisma.communityTestimonial.count({ where }),
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
}
