import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { CacheService } from "../../common/cache/cache.service.js";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
import { EncryptionService } from "../../common/encryption/encryption.service.js";
import type {
  SubmitContactInput,
  ContactQuery,
  VolunteerQuery,
  CreateVolunteerInput,
  UpdateVolunteerInput,
  UpdateContactInfoInput,
} from "./contact.schemas.js";
import type { ContactSubmissionStatus } from "../../generated/prisma/enums.js";

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly cache: CacheService,
    private readonly encryption: EncryptionService,
  ) {}

  // ── Existing contact form methods ──────────────────────────────────

  async submit(input: SubmitContactInput) {
    // Encrypt PII fields — name and message are personal data under PDPA NĐ 13/2023.
    // email is NOT encrypted — admin needs it as a reply address (functional requirement).
    const encryptedName = this.encryption.encrypt(input.name);
    const encryptedMessage = this.encryption.encrypt(input.message);

    const submission = await this.prisma.contactSubmission.create({
      data: {
        name: encryptedName ?? input.name,
        email: input.email,
        subject: input.subject,
        message: encryptedMessage ?? input.message,
        status: "PENDING" as ContactSubmissionStatus,
      },
    });

    this.logger.log(`Contact submission created: ${submission.publicId}`);

    // Invalidate all contact list cache entries regardless of page/pageSize
    await this.cache.delByPrefix("contacts:list:");

    return { publicId: submission.publicId };
  }

  async listContacts(query: ContactQuery) {
    // Cache key based on query parameters
    const cacheKey = `contacts:list:${JSON.stringify(query)}`;
    
    // Try cache first
    const cached = await this.cache.getJson(cacheKey);
    if (cached) {
      return cached;
    }
    
    const where: Record<string, unknown> = {};
    if (query.subject) {
      where.subject = query.subject;
    }
    if (query.status) {
      where.status = query.status;
    }

    const skip = (query.page - 1) * query.pageSize;
    const [rows, total] = await Promise.all([
      this.prisma.contactSubmission.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: query.pageSize,
        select: {
          publicId: true,
          name: true,
          email: true,
          subject: true,
          message: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.contactSubmission.count({ where }),
    ]);

    // Decrypt PII fields — cache stores plaintext so callers always get readable data
    const data = rows.map((row) => ({
      ...row,
      name: this.encryption.decrypt(row.name) ?? row.name,
      message: this.encryption.decrypt(row.message) ?? row.message,
    }));

    const result = {
      data,
      total,
      page: query.page,
      pageSize: query.pageSize,
      totalPages: Math.ceil(total / query.pageSize),
    };

    // Cache for 120 seconds
    await this.cache.setJson(cacheKey, result, 120);

    return result;
  }

  async getContactById(publicId: string) {
    const submission = await this.prisma.contactSubmission.findUnique({
      where: { publicId },
    });

    if (!submission) {
      throw new NotFoundException("Liên hệ không tồn tại");
    }

    const name = this.encryption.decrypt(submission.name);
    const message = this.encryption.decrypt(submission.message);

    return {
      ...submission,
      name: name ?? submission.name,
      message: message ?? submission.message,
    };
  }

  // ── Volunteer CRUD ─────────────────────────────────────────────────

  async adminListVolunteers(query: VolunteerQuery) {
    const where: Record<string, unknown> = {};
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const [data, total] = await Promise.all([
      this.prisma.volunteer.findMany({
        where,
        orderBy: { sortOrder: "asc" },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.volunteer.count({ where }),
    ]);

    // Phase 4.2 batch 3a: canary list shape — rides inside transport `data`.
    return {
      items: data,
      pagination: {
        total,
        limit: query.limit,
        offset: query.offset,
        hasMore: query.offset + query.limit < total,
      },
    };
  }

  async adminGetVolunteer(publicId: string) {
    const volunteer = await this.prisma.volunteer.findUnique({
      where: { publicId },
    });
    if (!volunteer) {
      throw new NotFoundException("Tình nguyện viên không tồn tại");
    }
    return volunteer;
  }

  async adminCreateVolunteer(input: CreateVolunteerInput, auditCtx: AuditContext) {
    const volunteer = await this.prisma.volunteer.create({
      data: {
        publicId: nanoid(),
        displayName: input.displayName,
        role: input.role,
        phone: input.phone,
        zaloLink: input.zaloLink,
        bio: input.bio,
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive ?? true,
      },
    });

    await this.audit.append(auditCtx, "admin.volunteer.create", "volunteer", volunteer.publicId, {
      displayName: input.displayName,
      role: input.role,
    });

    return volunteer;
  }

  async adminUpdateVolunteer(publicId: string, input: UpdateVolunteerInput, auditCtx: AuditContext) {
    const existing = await this.prisma.volunteer.findUnique({ where: { publicId } });
    if (!existing) {
      throw new NotFoundException("Tình nguyện viên không tồn tại");
    }

    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input)) {
      if (v !== undefined) data[k] = v;
    }

    const volunteer = await this.prisma.volunteer.update({
      where: { publicId },
      data,
    });

    await this.audit.append(auditCtx, "admin.volunteer.update", "volunteer", publicId, {
      fields: Object.keys(input),
    });

    return volunteer;
  }

  async adminDeleteVolunteer(publicId: string, auditCtx: AuditContext) {
    const existing = await this.prisma.volunteer.findUnique({ where: { publicId } });
    if (!existing) {
      throw new NotFoundException("Tình nguyện viên không tồn tại");
    }

    await this.prisma.volunteer.delete({ where: { publicId } });

    await this.audit.append(auditCtx, "admin.volunteer.delete", "volunteer", publicId, {
      displayName: existing.displayName,
    });

    return { deleted: true };
  }

  // ── Public endpoints ────────────────────────────────────────────────

  async publicGetContactInfo() {
    const cacheKey = "contact-info:public";
    const cached = await this.cache.getJson(cacheKey);
    if (cached) {
      return cached;
    }

    const info = await this.prisma.contactInfo.findFirst();
    const result = info ?? { title: null, email: null, phone: null, address: null, socialLinks: null };

    await this.cache.setJson(cacheKey, result, 300);
    return result;
  }

  async publicListVolunteers() {
    const cacheKey = "volunteers:public";
    const cached = await this.cache.getJson(cacheKey);
    if (cached) {
      return cached;
    }

    // Public route: expose only safe display fields — phone must NOT be returned.
    // Contract: design/03-domains/contact/CONTRACTS.md → public response shape.
    const data = await this.prisma.volunteer.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        publicId:    true,
        displayName: true,
        role:        true,
        avatarUrl:   true,
        zaloLink:    true,
        bio:         true,
      },
    });

    await this.cache.setJson(cacheKey, data, 300);
    return data;
  }

  // ── Contact Info (singleton) ───────────────────────────────────────

  async adminGetContactInfo() {
    const info = await this.prisma.contactInfo.findFirst();
    return info ?? { title: null, email: null, phone: null, address: null, socialLinks: null };
  }

  async adminUpdateContactInfo(input: UpdateContactInfoInput, auditCtx: AuditContext) {
    const existing = await this.prisma.contactInfo.findFirst();

    const { socialLinks, ...rest } = input;
    let info;
    if (existing) {
      const updateData: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(rest)) {
        if (v !== undefined) updateData[k] = v;
      }
      if (socialLinks !== undefined) updateData.socialLinks = socialLinks;

      info = await this.prisma.contactInfo.update({
        where: { id: existing.id },
        data: updateData,
      });
    } else {
      info = await this.prisma.contactInfo.create({
        data: {
          publicId: nanoid(),
          title: rest.title ?? "",
          email: rest.email,
          phone: rest.phone,
          address: rest.address,
          socialLinks: socialLinks ?? {},
        },
      });
    }

    await this.audit.append(auditCtx, "admin.contact_info.update", "contact_info", info.publicId, {
      fields: Object.keys(input),
    });

    return info;
  }
}
