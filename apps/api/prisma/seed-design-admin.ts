import { PrismaPg } from "@prisma/adapter-pg";
import {
  AltarConditionStatus,
  AltarItemType,
  AltarProtocolType,
  BuddhistEventStatus,
  BuddhistEventType,
  CharityInteractionType,
  CharityType,
  ContentStatus,
  EventDeliveryMode,
  FraudAlertSeverity,
  FraudAlertType,
  LhDottingStatus,
  LhRecitationType,
  LhStatus,
  LifeReleaseRecordStatus,
  LifeReleaseRecordType,
  MediaCollectionType,
  MediaItemType,
  PredatorySpecies,
  PrismaClient,
  SacredFormApplicantStatus,
  SacredFormPrerequisiteStatus,
  SacredFormType,
  WhitelistingCriteriaType,
  WhitelistStatus,
  WisdomEntryType,
} from "../src/generated/prisma/client.js";

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://pmtl:pmtl@localhost:55432/pmtl";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const now = new Date();
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

async function seedDesignAdminData() {
  const admin = await prisma.user.findUnique({ where: { email: "admin@pmtl.local" } });
  const nonAdminUser = await prisma.user.findFirst({
    where: { role: "MEMBER" },
    orderBy: { createdAt: "asc" },
  });

  if (!admin) {
    throw new Error("Cần chạy prisma/seed.ts trước để có admin seed.");
  }

  const member = nonAdminUser ?? admin;

  await seedWisdom(admin.id);
  await seedMediaCollections(admin.id);
  await seedDharmaCompliance(admin.id, member.id);
  await seedEvents(admin.id, member.id);
  await seedLifeLiberation(member.id, admin.id);
  await seedLittleHouse(member.id);
  await seedSacredForms(member.id);
  await seedAltarManagement(member.id);

  await printSummary();
}

async function seedWisdom(authorId: string) {
  await prisma.wisdomAuthorityProfile.upsert({
    where: { publicId: "seed-wisdom-authority-bach-thoai" },
    update: {
      name: "Ban biên tập Bạch thoại",
      title: "Nguồn kiểm chứng",
      description: "Profile mẫu để admin kiểm tra provenance và trạng thái nguồn.",
      sourceFamily: "BTPP-LIBRARY-CANON",
      isActive: true,
    },
    create: {
      publicId: "seed-wisdom-authority-bach-thoai",
      name: "Ban biên tập Bạch thoại",
      title: "Nguồn kiểm chứng",
      description: "Profile mẫu để admin kiểm tra provenance và trạng thái nguồn.",
      sourceFamily: "BTPP-LIBRARY-CANON",
      isActive: true,
    },
  });

  const entries = [
    {
      publicId: "seed-wisdom-entry-bach-thoai-video",
      title: "Bạch thoại Phật pháp: học cách giữ tâm thanh tịnh",
      slug: "bach-thoai-giu-tam-thanh-tinh",
      entryType: WisdomEntryType.BACH_THOAI,
      sourceFamily: "BTPP-LIBRARY-CANON",
      sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      sourceCode: "BTPP-SEED-001",
      tags: ["bach-thoai", "video", "source-first"],
      status: ContentStatus.PUBLISHED,
    },
    {
      publicId: "seed-wisdom-entry-khai-thi-draft",
      title: "Khai thị: kiểm chứng nguồn trước khi xuất bản",
      slug: "khai-thi-kiem-chung-nguon-truoc-khi-xuat-ban",
      entryType: WisdomEntryType.KHAI_THI,
      sourceFamily: "SOURCE_PROVENANCE_MATRIX",
      sourceUrl: "https://example.local/source/khai-thi",
      sourceCode: "WISDOM-SEED-REVIEW",
      tags: ["khai-thi", "review"],
      status: ContentStatus.DRAFT,
    },
  ];

  for (const entry of entries) {
    await prisma.wisdomEntry.upsert({
      where: { publicId: entry.publicId },
      update: {
        title: entry.title,
        slug: entry.slug,
        entryType: entry.entryType,
        sourceFamily: entry.sourceFamily,
        sourceUrl: entry.sourceUrl,
        sourceCode: entry.sourceCode,
        originalText: "Seed theo design để kiểm tra workflow nguồn gốc và biên tập.",
        translatedText: "Nội dung mẫu có dấu, dùng cho admin QA.",
        tags: entry.tags,
        status: entry.status,
        publishedAt: entry.status === ContentStatus.PUBLISHED ? now : null,
        firstPublishedAt: entry.status === ContentStatus.PUBLISHED ? now : null,
      },
      create: {
        ...entry,
        originalText: "Seed theo design để kiểm tra workflow nguồn gốc và biên tập.",
        translatedText: "Nội dung mẫu có dấu, dùng cho admin QA.",
        authorId,
        publishedAt: entry.status === ContentStatus.PUBLISHED ? now : null,
        firstPublishedAt: entry.status === ContentStatus.PUBLISHED ? now : null,
      },
    });
  }
}

async function seedMediaCollections(createdById: string) {
  const cover = await prisma.mediaAsset.findFirst({
    where: { publicId: { startsWith: "seed-media-media-library-collection-cover" } },
    orderBy: { publicId: "asc" },
  });
  const video = await prisma.mediaAsset.findFirst({
    where: { publicId: "seed-media-video-intro-phap-mon" },
  });

  const collection = await prisma.mediaCollection.upsert({
    where: { publicId: "seed-media-collection-design-gallery" },
    update: {
      title: "Thư viện pháp môn: bộ sưu tập kiểm thử",
      slug: "thu-vien-phap-mon-bo-suu-tap-kiem-thu",
      description: "Collection seed từ MEDIA-LIBRARY-CONTENT-INVENTORY để test picker, detail sheet và item ordering.",
      collectionType: MediaCollectionType.MIXED_GALLERY,
      coverMediaId: cover?.id ?? null,
      sourceNote: "design/03-domains/content/REFERENCES/MEDIA-LIBRARY-CONTENT-INVENTORY.MD",
      featured: true,
      sortOrder: 1,
      status: ContentStatus.PUBLISHED,
      publishedAt: now,
      firstPublishedAt: now,
    },
    create: {
      publicId: "seed-media-collection-design-gallery",
      title: "Thư viện pháp môn: bộ sưu tập kiểm thử",
      slug: "thu-vien-phap-mon-bo-suu-tap-kiem-thu",
      description: "Collection seed từ MEDIA-LIBRARY-CONTENT-INVENTORY để test picker, detail sheet và item ordering.",
      collectionType: MediaCollectionType.MIXED_GALLERY,
      coverMediaId: cover?.id ?? null,
      sourceNote: "design/03-domains/content/REFERENCES/MEDIA-LIBRARY-CONTENT-INVENTORY.MD",
      featured: true,
      sortOrder: 1,
      status: ContentStatus.PUBLISHED,
      createdById,
      publishedAt: now,
      firstPublishedAt: now,
    },
  });

  if (cover) {
    await prisma.mediaCollectionItem.upsert({
      where: { publicId: "seed-media-collection-item-cover" },
      update: {
        collectionId: collection.id,
        itemType: MediaItemType.IMAGE,
        mediaAssetId: cover.id,
        title: "Ảnh đại diện bộ sưu tập",
        caption: "Ảnh mẫu dùng để kiểm tra preview trong admin.",
        ownerModule: "content.media-library",
        ownerPublicRef: collection.publicId,
        sortOrder: 1,
      },
      create: {
        publicId: "seed-media-collection-item-cover",
        collectionId: collection.id,
        itemType: MediaItemType.IMAGE,
        mediaAssetId: cover.id,
        title: "Ảnh đại diện bộ sưu tập",
        caption: "Ảnh mẫu dùng để kiểm tra preview trong admin.",
        ownerModule: "content.media-library",
        ownerPublicRef: collection.publicId,
        sortOrder: 1,
      },
    });
  }

  if (video) {
    await prisma.mediaCollectionItem.upsert({
      where: { publicId: "seed-media-collection-item-video" },
      update: {
        collectionId: collection.id,
        itemType: MediaItemType.UPLOADED_VIDEO,
        mediaAssetId: video.id,
        title: "Video giới thiệu pháp môn",
        caption: "Video mẫu để test playlist và media sheet.",
        ownerModule: "content.media-library",
        ownerPublicRef: collection.publicId,
        sortOrder: 2,
      },
      create: {
        publicId: "seed-media-collection-item-video",
        collectionId: collection.id,
        itemType: MediaItemType.UPLOADED_VIDEO,
        mediaAssetId: video.id,
        title: "Video giới thiệu pháp môn",
        caption: "Video mẫu để test playlist và media sheet.",
        ownerModule: "content.media-library",
        ownerPublicRef: collection.publicId,
        sortOrder: 2,
      },
    });
  }
}

async function seedDharmaCompliance(adminId: string, memberId: string) {
  const charity = await prisma.charityWhitelist.upsert({
    where: { publicId: "seed-charity-whitelist-phong-sanh" },
    update: {
      name: "Nhóm phóng sinh minh bạch PMTL",
      charityType: CharityType.ANIMAL_WELFARE,
      registrationNumber: "PMTL-SEED-PS-001",
      country: "VN",
      bankAccounts: ["9704-0000-0000-001"],
      website: "https://example.local/phong-sinh-minh-bach",
      contactEmail: "phong-sinh@example.local",
      verificationScore: 92,
      status: WhitelistStatus.VERIFIED,
      verifiedAt: now,
      verifiedById: adminId,
      lastAuditAt: now,
      notes: "Seed cho CharityFirewallInterceptor và màn Tuân thủ Pháp luật.",
    },
    create: {
      publicId: "seed-charity-whitelist-phong-sanh",
      name: "Nhóm phóng sinh minh bạch PMTL",
      charityType: CharityType.ANIMAL_WELFARE,
      registrationNumber: "PMTL-SEED-PS-001",
      country: "VN",
      bankAccounts: ["9704-0000-0000-001"],
      website: "https://example.local/phong-sinh-minh-bach",
      contactEmail: "phong-sinh@example.local",
      verificationScore: 92,
      status: WhitelistStatus.VERIFIED,
      verifiedAt: now,
      verifiedById: adminId,
      lastAuditAt: now,
      notes: "Seed cho CharityFirewallInterceptor và màn Tuân thủ Pháp luật.",
    },
  });

  for (const [index, criteriaType] of [
    WhitelistingCriteriaType.LEGAL_REGISTRATION,
    WhitelistingCriteriaType.FINANCIAL_TRANSPARENCY,
    WhitelistingCriteriaType.NO_FRAUD_HISTORY,
  ].entries()) {
    await prisma.charityWhitelistingRule.upsert({
      where: { publicId: `seed-charity-rule-${index + 1}` },
      update: {
        charityId: charity.id,
        criteriaType,
        satisfied: true,
        evidenceUrl: "https://example.local/evidence",
        verifiedAt: now,
        verifiedById: adminId,
        notes: "Tiêu chí seed đã xác minh.",
      },
      create: {
        publicId: `seed-charity-rule-${index + 1}`,
        charityId: charity.id,
        criteriaType,
        satisfied: true,
        evidenceUrl: "https://example.local/evidence",
        verifiedAt: now,
        verifiedById: adminId,
        notes: "Tiêu chí seed đã xác minh.",
      },
    });
  }

  await prisma.fraudDetectionAlert.upsert({
    where: { publicId: "seed-fraud-alert-bank-account" },
    update: {
      charityId: charity.id,
      reportedById: memberId,
      alertType: FraudAlertType.ACCOUNT_ANOMALY,
      severity: FraudAlertSeverity.HIGH,
      detectedContent: "Tin nhắn seed có số tài khoản chưa được whitelist để test cảnh báo.",
      matchedAccount: "9704-9999-9999-999",
      isWhitelisted: false,
      isAppealable: true,
      autoDeleted: true,
    },
    create: {
      publicId: "seed-fraud-alert-bank-account",
      charityId: charity.id,
      reportedById: memberId,
      alertType: FraudAlertType.ACCOUNT_ANOMALY,
      severity: FraudAlertSeverity.HIGH,
      detectedContent: "Tin nhắn seed có số tài khoản chưa được whitelist để test cảnh báo.",
      matchedAccount: "9704-9999-9999-999",
      isWhitelisted: false,
      isAppealable: true,
      autoDeleted: true,
    },
  });

  await prisma.userCharityInteraction.upsert({
    where: { publicId: "seed-charity-interaction-life-release" },
    update: {
      userId: memberId,
      charityId: charity.id,
      interactionType: CharityInteractionType.LIFE_RELEASE,
      referenceId: "seed-life-release-record-group",
      amount: 0,
      currency: "VND",
      verified: true,
      verifiedAt: now,
    },
    create: {
      publicId: "seed-charity-interaction-life-release",
      userId: memberId,
      charityId: charity.id,
      interactionType: CharityInteractionType.LIFE_RELEASE,
      referenceId: "seed-life-release-record-group",
      amount: 0,
      currency: "VND",
      verified: true,
      verifiedAt: now,
    },
  });
}

async function seedEvents(organizerId: string, memberId: string) {
  const event = await prisma.buddhistEvent.upsert({
    where: { publicId: "seed-buddhist-event-life-liberation" },
    update: {
      organizerId,
      title: "Life Liberation Practice Day",
      titleVi: "Ngày thực hành phóng sinh minh bạch",
      description: "Seed theo events design để kiểm tra lịch, đăng ký và check-in.",
      eventType: BuddhistEventType.LIFE_LIBERATION,
      deliveryMode: EventDeliveryMode.HYBRID,
      status: BuddhistEventStatus.REGISTRATION_OPEN,
      startAt: nextWeek,
      endAt: new Date(nextWeek.getTime() + 2 * 60 * 60 * 1000),
      locationName: "Hồ sinh thái PMTL",
      locationAddress: "Khu vực kiểm thử nội bộ",
      onlineUrl: "https://example.local/events/life-liberation",
      maxAttendees: 108,
      isFree: true,
      recitationTarget: "Đại Bi Chú 108 biến",
    },
    create: {
      publicId: "seed-buddhist-event-life-liberation",
      organizerId,
      title: "Life Liberation Practice Day",
      titleVi: "Ngày thực hành phóng sinh minh bạch",
      description: "Seed theo events design để kiểm tra lịch, đăng ký và check-in.",
      eventType: BuddhistEventType.LIFE_LIBERATION,
      deliveryMode: EventDeliveryMode.HYBRID,
      status: BuddhistEventStatus.REGISTRATION_OPEN,
      startAt: nextWeek,
      endAt: new Date(nextWeek.getTime() + 2 * 60 * 60 * 1000),
      locationName: "Hồ sinh thái PMTL",
      locationAddress: "Khu vực kiểm thử nội bộ",
      onlineUrl: "https://example.local/events/life-liberation",
      maxAttendees: 108,
      isFree: true,
      recitationTarget: "Đại Bi Chú 108 biến",
    },
  });

  await prisma.eventRegistration.upsert({
    where: { eventId_userId: { eventId: event.id, userId: memberId } },
    update: { status: "REGISTERED", checkedInAt: null },
    create: { eventId: event.id, userId: memberId, status: "REGISTERED" },
  });

  const existingAudit = await prisma.eventAuditLog.findFirst({
    where: { eventId: event.id, action: "seed.created" },
  });
  if (!existingAudit) {
    await prisma.eventAuditLog.create({
      data: {
        eventId: event.id,
        actor: "seed",
        action: "seed.created",
        details: "Tạo sự kiện mẫu từ design events.",
      },
    });
  }
}

async function seedLifeLiberation(userId: string, sponsorId: string) {
  const record = await prisma.lifeReleaseRecord.upsert({
    where: { publicId: "seed-life-release-record-group" },
    update: {
      userId,
      recordType: LifeReleaseRecordType.GROUP,
      status: LifeReleaseRecordStatus.IN_PROGRESS,
      releaseDate: tomorrow,
      locationName: "Hồ sinh thái PMTL",
      locationCoords: "10.7769,106.7009",
      merit: "Hồi hướng công đức cho chúng sinh hữu duyên.",
      notes: "Seed kiểm tra predatory species guard và proxy silence lock.",
    },
    create: {
      publicId: "seed-life-release-record-group",
      userId,
      recordType: LifeReleaseRecordType.GROUP,
      status: LifeReleaseRecordStatus.IN_PROGRESS,
      releaseDate: tomorrow,
      locationName: "Hồ sinh thái PMTL",
      locationCoords: "10.7769,106.7009",
      merit: "Hồi hướng công đức cho chúng sinh hữu duyên.",
      notes: "Seed kiểm tra predatory species guard và proxy silence lock.",
    },
  });

  const existingAnimal = await prisma.releaseAnimalEntry.findFirst({
    where: { recordId: record.id, species: PredatorySpecies.FISH },
  });
  if (!existingAnimal) {
    await prisma.releaseAnimalEntry.create({
      data: {
        recordId: record.id,
        species: PredatorySpecies.FISH,
        quantity: 108,
        sourceLocation: "Cơ sở được whitelist",
        isPredatory: false,
        notes: "Loài không săn mồi, phù hợp checklist môi trường.",
      },
    });
  }

  const existingProxy = await prisma.proxyLifeRelease.findFirst({
    where: { recordId: record.id, sponsorId, beneficiary: "Gia đình người đăng ký" },
  });
  if (!existingProxy) {
    await prisma.proxyLifeRelease.create({
      data: {
        recordId: record.id,
        sponsorId,
        beneficiary: "Gia đình người đăng ký",
        merit: "Hồi hướng theo mẫu proxy life release.",
      },
    });
  }
}

async function seedLittleHouse(userId: string) {
  const record = await prisma.lhRecord.upsert({
    where: { publicId: "seed-lh-record-review-queue" },
    update: {
      userId,
      beneficiaryName: "Người thân hữu duyên",
      status: LhStatus.CHANTED,
      vowText: "Seed kiểm tra workflow Sớ / Ngôi Nhà Nhỏ.",
      draftedAt: now,
      signedAt: now,
      chantedAt: now,
      burnedAt: null,
      cancelledAt: null,
    },
    create: {
      publicId: "seed-lh-record-review-queue",
      userId,
      beneficiaryName: "Người thân hữu duyên",
      status: LhStatus.CHANTED,
      vowText: "Seed kiểm tra workflow Sớ / Ngôi Nhà Nhỏ.",
      draftedAt: now,
      signedAt: now,
      chantedAt: now,
    },
  });

  const recitations = [
    [LhRecitationType.DA_BEI_ZHOU, 27],
    [LhRecitationType.HEART_SUTRA, 49],
    [LhRecitationType.REPENTANCE, 84],
    [LhRecitationType.NAMO_AMITABHA, 87],
  ] as const;

  for (const [recitationType, count] of recitations) {
    const exists = await prisma.lhRecitation.findFirst({
      where: { lhRecordId: record.id, recitationType },
    });
    if (!exists) {
      await prisma.lhRecitation.create({
        data: {
          lhRecordId: record.id,
          recitationType,
          count,
          sessionDate: now,
          chanterName: "Seed member",
        },
      });
    }
  }

  const dotting = await prisma.lhDottingSession.findFirst({ where: { lhRecordId: record.id } });
  if (!dotting) {
    await prisma.lhDottingSession.create({
      data: {
        lhRecordId: record.id,
        status: LhDottingStatus.IN_PROGRESS,
        operatorName: "Admin seed",
        notes: "Phiên chấm đỏ mẫu để kiểm tra queue.",
      },
    });
  }

  const fraud = await prisma.lhFraud.findFirst({ where: { lhRecordId: record.id, reason: "seed.review" } });
  if (!fraud) {
    await prisma.lhFraud.create({
      data: {
        lhRecordId: record.id,
        reason: "seed.review",
        severity: "MEDIUM",
        resolution: "Đang chờ kiểm duyệt.",
      },
    });
  }
}

async function seedSacredForms(userId: string) {
  const template = await prisma.sacredFormTemplate.upsert({
    where: { publicId: "seed-sacred-template-name-change" },
    update: {
      formType: SacredFormType.VOW_FORM,
      titleVi: "Mẫu đơn phát nguyện đổi tên",
      titleZh: "改名发愿表",
      description: "Seed kiểm tra Đơn Pháp Bảo, prerequisite và probation.",
      prerequisitesDef: {
        items: ["Đã đọc hướng dẫn", "Có người kiểm chứng", "Chấp nhận thời gian probation"],
      },
      formSchema: {
        fields: ["currentName", "newName", "reason", "sourceReference"],
      },
      isActive: true,
    },
    create: {
      publicId: "seed-sacred-template-name-change",
      formType: SacredFormType.VOW_FORM,
      titleVi: "Mẫu đơn phát nguyện đổi tên",
      titleZh: "改名发愿表",
      description: "Seed kiểm tra Đơn Pháp Bảo, prerequisite và probation.",
      prerequisitesDef: {
        items: ["Đã đọc hướng dẫn", "Có người kiểm chứng", "Chấp nhận thời gian probation"],
      },
      formSchema: {
        fields: ["currentName", "newName", "reason", "sourceReference"],
      },
      isActive: true,
    },
  });

  const applicant = await prisma.formApplicant.upsert({
    where: { publicId: "seed-sacred-applicant-name-change" },
    update: {
      templateId: template.id,
      userId,
      status: SacredFormApplicantStatus.PROBATION,
      formData: {
        currentName: "Nguyễn Thiện Tâm",
        newName: "Nguyễn Tịnh Tâm",
        reason: "Seed kiểm tra probation và review.",
      },
      probationEndsAt: nextMonth,
      reviewNotes: "Hồ sơ mẫu đang trong thời gian probation.",
    },
    create: {
      publicId: "seed-sacred-applicant-name-change",
      templateId: template.id,
      userId,
      status: SacredFormApplicantStatus.PROBATION,
      formData: {
        currentName: "Nguyễn Thiện Tâm",
        newName: "Nguyễn Tịnh Tâm",
        reason: "Seed kiểm tra probation và review.",
      },
      probationEndsAt: nextMonth,
      reviewNotes: "Hồ sơ mẫu đang trong thời gian probation.",
    },
  });

  const prerequisite = await prisma.formPrerequisiteEntry.findFirst({
    where: { applicantId: applicant.id, name: "Đã đọc hướng dẫn" },
  });
  if (!prerequisite) {
    await prisma.formPrerequisiteEntry.create({
      data: {
        applicantId: applicant.id,
        name: "Đã đọc hướng dẫn",
        status: SacredFormPrerequisiteStatus.COMPLETED,
        completedAt: now,
        evidence: "seed/design-checklist",
      },
    });
  }

  const audit = await prisma.sacredFormAuditLog.findFirst({
    where: { applicantId: applicant.id, action: "seed.review" },
  });
  if (!audit) {
    await prisma.sacredFormAuditLog.create({
      data: {
        applicantId: applicant.id,
        actor: "seed",
        action: "seed.review",
        details: "Tạo hồ sơ mẫu để kiểm tra audit trail.",
      },
    });
  }

  await prisma.nameChangeProbation.upsert({
    where: { publicId: "seed-name-change-probation" },
    update: {
      formApplicantId: applicant.id,
      userId,
      oldDharmaName: "Thiện Tâm",
      newDharmaName: "Tịnh Tâm",
      probationStartDate: now,
      probationDurationDays: 100,
      probationEndDate: new Date(now.getTime() + 100 * 24 * 60 * 60 * 1000),
      isActive: true,
      restrictionDetails: "Seed kiểm tra probation timer.",
    },
    create: {
      publicId: "seed-name-change-probation",
      formApplicantId: applicant.id,
      userId,
      oldDharmaName: "Thiện Tâm",
      newDharmaName: "Tịnh Tâm",
      probationStartDate: now,
      probationDurationDays: 100,
      probationEndDate: new Date(now.getTime() + 100 * 24 * 60 * 60 * 1000),
      isActive: true,
      restrictionDetails: "Seed kiểm tra probation timer.",
    },
  });

  const disposal = await prisma.disposalPolarityRecord.findFirst({
    where: { formType: "VOW_FORM", polarity: "BURN_AFTER_COMPLETION" },
  });
  if (!disposal) {
    await prisma.disposalPolarityRecord.create({
      data: {
        formType: "VOW_FORM",
        polarity: "BURN_AFTER_COMPLETION",
        rationale: "Seed kiểm tra rule xử lý đơn theo polarity.",
        effectiveAt: now,
      },
    });
  }
}

async function seedAltarManagement(userId: string) {
  const item = await prisma.altarItem.upsert({
    where: { publicId: "seed-altar-item-water-cup" },
    update: {
      userId,
      itemType: AltarItemType.WATER_CUP,
      name: "Ly nước Phật đài mẫu",
      condition: AltarConditionStatus.GOOD,
      acquisitionAt: now,
      notes: "Seed kiểm tra altar validation log.",
      isActive: true,
    },
    create: {
      publicId: "seed-altar-item-water-cup",
      userId,
      itemType: AltarItemType.WATER_CUP,
      name: "Ly nước Phật đài mẫu",
      condition: AltarConditionStatus.GOOD,
      acquisitionAt: now,
      notes: "Seed kiểm tra altar validation log.",
      isActive: true,
    },
  });

  const log = await prisma.altarValidationLog.findFirst({
    where: { altarItemId: item.id, protocolType: AltarProtocolType.WATER_REFRESH },
  });
  if (!log) {
    await prisma.altarValidationLog.create({
      data: {
        altarItemId: item.id,
        userId,
        protocolType: AltarProtocolType.WATER_REFRESH,
        passed: true,
        notes: "Đã thay nước theo checklist seed.",
        performedAt: now,
      },
    });
  }

  const template = await prisma.altarProtocolTemplate.findFirst({
    where: { protocolType: AltarProtocolType.WATER_REFRESH, titleVi: "Thay nước Phật đài hằng ngày" },
  });
  if (!template) {
    await prisma.altarProtocolTemplate.create({
      data: {
        protocolType: AltarProtocolType.WATER_REFRESH,
        titleVi: "Thay nước Phật đài hằng ngày",
        steps: [
          "Rửa tay sạch",
          "Thay nước bằng ly riêng",
          "Không dùng nước đã pha hoặc nước cũ",
        ],
        frequency: "DAILY",
        isActive: true,
      },
    });
  }
}

async function printSummary() {
  const summary = {
    wisdomEntries: await prisma.wisdomEntry.count(),
    wisdomAuthorityProfiles: await prisma.wisdomAuthorityProfile.count(),
    mediaCollections: await prisma.mediaCollection.count(),
    mediaCollectionItems: await prisma.mediaCollectionItem.count(),
    charityWhitelist: await prisma.charityWhitelist.count(),
    fraudDetectionAlerts: await prisma.fraudDetectionAlert.count(),
    buddhistEvents: await prisma.buddhistEvent.count(),
    lifeReleaseRecords: await prisma.lifeReleaseRecord.count(),
    releaseAnimalEntries: await prisma.releaseAnimalEntry.count(),
    lhRecords: await prisma.lhRecord.count(),
    lhFraud: await prisma.lhFraud.count(),
    sacredFormTemplates: await prisma.sacredFormTemplate.count(),
    formApplicants: await prisma.formApplicant.count(),
    altarItems: await prisma.altarItem.count(),
    altarProtocolTemplates: await prisma.altarProtocolTemplate.count(),
  };

  console.log("Design admin seed summary:");
  console.table(summary);
}

seedDesignAdminData()
  .catch((error) => {
    console.error("Error seeding design admin data:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
