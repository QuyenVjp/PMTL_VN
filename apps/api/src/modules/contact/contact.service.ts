import { Injectable, NotFoundException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
import type {
  SubmitContactInput,
  ContactQuery,
  VolunteerQuery,
  CreateVolunteerInput,
  UpdateVolunteerInput,
  UpdateContactInfoInput,
} from "./contact.schemas.js";

@Injectable()
export class ContactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ── Existing contact form methods ──────────────────────────────────

  submit(input: SubmitContactInput) {
    return { id: "placeholder", name: input.name, subject: input.subject };
  }

  listContacts(query: ContactQuery) {
    return { data: [], total: 0, page: query.page, pageSize: query.pageSize };
  }

  getContactById(id: string) {
    return { id, message: "Chức năng đang phát triển" };
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

    const volunteer = await this.prisma.volunteer.update({
      where: { publicId },
      data: input,
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
      info = await this.prisma.contactInfo.update({
        where: { id: existing.id },
        data: {
          ...rest,
          ...(socialLinks !== undefined ? { socialLinks } : {}),
        },
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
