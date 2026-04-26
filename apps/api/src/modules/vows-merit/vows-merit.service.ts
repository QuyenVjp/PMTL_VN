import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { nanoid } from "nanoid";
import type { AuditContext } from "../../platform/audit/audit.service.js";
import { mapVowToAdminItem } from "./vows-merit.mapper.js";
import { VowsMeritRepository } from "./vows-merit.repository.js";
import type {
  AssistedEntryHistoryQuery,
  AssistedEntryInput,
  AssistedProgressEntryInput,
  LifeReleaseEntryInput,
  MemberSearchQuery,
} from "./vows-merit.schemas.js";

@Injectable()
export class VowsMeritService {
  constructor(private readonly repo: VowsMeritRepository) {}

  async adminAssistedEntryHistory(query: AssistedEntryHistoryQuery) {
    const { data, total } = await this.repo.findManyVows(query);
    return {
      data: data.map(mapVowToAdminItem),
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

  async adminSearchMembers(query: MemberSearchQuery) {
    const data = await this.repo.searchMembers(query);
    return { data };
  }

  async adminCreateAssistedEntry(input: AssistedEntryInput, adminId: string, auditContext: AuditContext) {
    const member = await this.repo.findMemberByPublicId(input.memberPublicId);
    if (!member) throw new NotFoundException("Thành viên không tồn tại");

    const vow = await this.repo.createVow(input, member.id, nanoid(21), {
      context: auditContext,
      action: "admin.vow.create",
      resource: "vow",
      metadata: {
        assistedEntry: true,
        ownerUserId: member.id,
        ownerPublicId: member.publicId,
        actorUserId: adminId,
        memberPublicId: input.memberPublicId,
        vowType: input.vowType,
        assistReason: input.assistReason,
      },
    });

    return mapVowToAdminItem(vow);
  }

  async adminCreateLifeReleaseEntry(input: LifeReleaseEntryInput, adminId: string, auditContext: AuditContext) {
    const member = await this.repo.findMemberByPublicId(input.memberPublicId);
    if (!member) throw new NotFoundException("Thành viên không tồn tại");

    const journal = await this.repo.createLifeReleaseJournal(input, member.id, adminId, nanoid(21), {
      context: auditContext,
      action: "admin.life_release.create",
      resource: "life_release_journal",
      metadata: {
        assistedEntry: true,
        ownerUserId: member.id,
        ownerPublicId: member.publicId,
        actorUserId: adminId,
        memberPublicId: input.memberPublicId,
        animalType: input.animalType,
        quantity: input.quantity,
        assistReason: input.assistReason,
      },
    });

    return journal;
  }

  async adminAddAssistedProgress(input: AssistedProgressEntryInput, adminId: string, auditContext: AuditContext) {
    const member = await this.repo.findMemberByPublicId(input.memberPublicId);
    if (!member) throw new NotFoundException("Thành viên không tồn tại");

    const result = await this.repo.addAssistedProgress(input, member.id, ({ before, after, autoCompleted }) => ({
      context: auditContext,
      action: "admin.vow.progress",
      resource: "vow",
      metadata: {
        assistedEntry: true,
        ownerUserId: member.id,
        ownerPublicId: member.publicId,
        actorUserId: adminId,
        memberPublicId: input.memberPublicId,
        vowPublicId: input.vowPublicId,
        addCount: input.addCount,
        note: input.note ?? null,
        assistReason: input.assistReason,
        previousState: {
          currentCount: before.currentCount,
          status: before.status,
        },
        newState: {
          currentCount: after.currentCount,
          status: after.status,
          autoCompleted,
        },
      },
    }));
    if (!result) throw new NotFoundException("Nguyện lực không tồn tại");
    if (result.kind === "inactive") {
      throw new BadRequestException("Chỉ có thể nhập hộ tiến độ cho nguyện lực đang thực hiện");
    }

    return mapVowToAdminItem(result.after);
  }

  async adminGetMemberVows(memberPublicId: string) {
    const member = await this.repo.findMemberByPublicId(memberPublicId);
    if (!member) throw new NotFoundException("Thành viên không tồn tại");

    const vows = await this.repo.findVowsByUserId(member.id);
    return { data: vows, member: { publicId: member.publicId, displayName: member.displayName } };
  }
}
