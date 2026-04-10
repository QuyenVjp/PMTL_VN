import { Injectable, NotFoundException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
import { mapVowToAdminItem } from "./vows-merit.mapper.js";
import { VowsMeritRepository } from "./vows-merit.repository.js";
import type {
  AssistedEntryHistoryQuery,
  AssistedEntryInput,
  LifeReleaseEntryInput,
  MemberSearchQuery,
} from "./vows-merit.schemas.js";

@Injectable()
export class VowsMeritService {
  constructor(
    private readonly repo: VowsMeritRepository,
    private readonly audit: AuditService,
  ) {}

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

    const vow = await this.repo.createVow(input, member.id, nanoid(21));

    // Canonical assisted-entry audit: MUST capture both the owner (member being assisted)
    // AND the actor (admin performing the action) as explicit fields. See
    // design/03-domains/vows-merit/CONTRACTS.md §assisted-entry-audit and DESIGN_GAP_ANALYSIS.md §2.
    await this.audit.append(auditContext, "admin.vow.create", "vow", vow.publicId, {
      assistedEntry: true,
      ownerUserId: member.id,
      ownerPublicId: member.publicId,
      actorUserId: adminId,
      memberPublicId: input.memberPublicId,
      vowType: input.vowType,
      assistReason: input.assistReason,
    });

    return mapVowToAdminItem(vow);
  }

  async adminCreateLifeReleaseEntry(input: LifeReleaseEntryInput, adminId: string, auditContext: AuditContext) {
    const member = await this.repo.findMemberByPublicId(input.memberPublicId);
    if (!member) throw new NotFoundException("Thành viên không tồn tại");

    const journal = await this.repo.createLifeReleaseJournal(input, member.id, adminId, nanoid(21));

    // Canonical assisted-entry audit: MUST capture both ownerUserId (member being assisted)
    // and actorUserId (admin) per design/03-domains/vows-merit/CONTRACTS.md §assisted-entry-audit.
    await this.audit.append(auditContext, "admin.life_release.create", "life_release_journal", journal.publicId, {
      assistedEntry: true,
      ownerUserId: member.id,
      ownerPublicId: member.publicId,
      actorUserId: adminId,
      memberPublicId: input.memberPublicId,
      animalType: input.animalType,
      quantity: input.quantity,
      assistReason: input.assistReason,
    });

    return journal;
  }

  async adminGetMemberVows(memberPublicId: string) {
    const member = await this.repo.findMemberByPublicId(memberPublicId);
    if (!member) throw new NotFoundException("Thành viên không tồn tại");

    const vows = await this.repo.findVowsByUserId(member.id);
    return { data: vows, member: { publicId: member.publicId, displayName: member.displayName } };
  }
}
