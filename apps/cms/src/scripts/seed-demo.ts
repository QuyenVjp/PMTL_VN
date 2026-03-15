import { getPayload } from "payload";

import config from "@/payload.config";
import { getLogger, withError } from "@/services/logger.service";

const logger = getLogger("scripts:seed-demo");
import { wrapLexicalContent } from "@/hooks/lexical-migration";

type WhereEquals = {
  equals: string;
};

async function upsertByField<TData extends Record<string, unknown>>(input: {
  payload: Awaited<ReturnType<typeof getPayload>>;
  collection: Parameters<Awaited<ReturnType<typeof getPayload>>["find"]>[0]["collection"];
  field: string;
  value: string;
  data: TData;
}) {
  const result = await input.payload.find({
    collection: input.collection,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      [input.field]: {
        equals: input.value,
      } as WhereEquals,
    },
  });

  const existing = result.docs[0];

  if (existing) {
    return input.payload.update({
      collection: input.collection,
      id: existing.id,
      data: input.data,
      overrideAccess: true,
    });
  }

  return input.payload.create({
    collection: input.collection,
    data: input.data,
    draft: false,
    overrideAccess: true,
  });
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

async function seedUsers(payload: Awaited<ReturnType<typeof getPayload>>) {
  const users = [
    {
      email: "admin@pmtl.local",
      password: "PmtlAdmin!123",
      fullName: "PMTL Super Admin",
      role: "super-admin" as const,
    },
    {
      email: "editor@pmtl.local",
      password: "PmtlEditor!123",
      fullName: "PMTL Editor",
      role: "editor" as const,
    },
    {
      email: "moderator@pmtl.local",
      password: "PmtlModerator!123",
      fullName: "PMTL Moderator",
      role: "moderator" as const,
    },
    {
      email: "member@pmtl.local",
      password: "PmtlMember!123",
      fullName: "Phat tu Thanh Tam",
      role: "member" as const,
    },
  ];

  const created = [];

  for (const user of users) {
    const existing = await payload.find({
      collection: "users",
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        email: {
          equals: user.email,
        },
      },
    });

    if (existing.docs[0]) {
      created.push(existing.docs[0]);
      continue;
    }

    const next = await payload.create({
      collection: "users",
      overrideAccess: true,
      data: {
        publicId: "",
        email: user.email,
        password: user.password,
        fullName: user.fullName,
        role: user.role,
        isBlocked: false,
        bio: "Tai khoan du lieu mau de smoke test PMTL_VN.",
      },
    });

    created.push(next);
  }

  return {
    superAdmin: created[0],
    editor: created[1],
    moderator: created[2],
    member: created[3],
  };
}

async function seedGlobals(payload: Awaited<ReturnType<typeof getPayload>>) {
  await payload.updateGlobal({
    slug: "site-settings",
    data: {
      siteName: "PMTL_VN",
      siteDescription: "Kho noi dung tu hoc, doc kinh, niem chu va cong dong PMTL_VN.",
      supportEmail: "support@pmtl.local",
      supportPhone: "0900 000 000",
      defaultMetaTitle: "PMTL_VN",
      defaultMetaDescription: "Du lieu mau phuc vu smoke test va demo production-like.",
    },
    overrideAccess: true,
  });

  await payload.updateGlobal({
    slug: "homepage",
    data: {
      heroTitle: "Phap Mon Tam Linh Viet Nam",
      heroDescription: "Kho noi dung tu hoc va thuc hanh Phat phap duoc chuan hoa tren Payload CMS.",
      featuredSectionTitle: "Noi dung noi bat",
      latestSectionTitle: "Bai viet moi",
      studySectionTitle: "Khong gian tu hoc",
    },
    overrideAccess: true,
  }).catch(() => null);
}

async function seedEditorial(payload: Awaited<ReturnType<typeof getPayload>>) {
  const categoryPrayer = await upsertByField({
    payload,
    collection: "categories",
    field: "slug",
    value: "niem-phat",
    data: {
      publicId: "",
      name: "Niem Phat",
      slug: "niem-phat",
      description: "Chu de ve thuc hanh niem Phat va giu tam an dinh.",
      isActive: true,
      order: 1,
    },
  });

  const categoryFamily = await upsertByField({
    payload,
    collection: "categories",
    field: "slug",
    value: "gia-dinh",
    data: {
      publicId: "",
      name: "Gia Dinh",
      slug: "gia-dinh",
      description: "Noi dung tu hoc gan voi doi song gia dinh.",
      isActive: true,
      order: 2,
    },
  });

  const tagRelease = await upsertByField({
    payload,
    collection: "tags",
    field: "slug",
    value: "buong-xa",
    data: {
      publicId: "",
      name: "Buong xa",
      slug: "buong-xa",
      description: "Tu khoa ve su buong xa va chuyen hoa noi tam.",
      isActive: true,
    },
  });

  const tagCompassion = await upsertByField({
    payload,
    collection: "tags",
    field: "slug",
    value: "tu-bi",
    data: {
      publicId: "",
      name: "Tu bi",
      slug: "tu-bi",
      description: "Noi dung huong ve tam tu bi.",
      isActive: true,
    },
  });

  const posts = [];

  for (let index = 1; index <= 24; index += 1) {
    const category = index % 2 === 0 ? categoryPrayer : categoryFamily;
    const tag = index % 2 === 0 ? tagRelease : tagCompassion;

    const post = await upsertByField({
      payload,
      collection: "posts",
      field: "slug",
      value: `khai-thi-mau-${index}`,
      data: {
        publicId: "",
        postType: index % 4 === 0 ? "transcript" : "article",
        sourceRef: `SRC-${1000 + index}`,
        title: `Bai khai thi mau ${index}`,
        slug: `khai-thi-mau-${index}`,
        content: wrapLexicalContent(
          `Day la noi dung bai viet mau so ${index}. Chu de tap trung vao buong xa, niem Phat va doi song gia dinh.`,
        ),
        excerptOverride: `Tom tat bai viet mau so ${index}.`,
        primaryCategory: category.id,
        categories: [category.id],
        tags: [tag.id],
        source: {
          sourceName: "Thu vien PMTL",
          sourceTitle: `Nguon noi dung ${index}`,
          sourceUrl: `https://example.com/posts/${index}`,
        },
        series: {
          seriesKey: "hanh-tri-hang-ngay",
          seriesNumber: index,
        },
        eventContext: {
          location: "TP. Ho Chi Minh",
        },
        postFlags: {
          featured: index <= 4,
          allowComments: true,
        },
        publishedAt: daysAgo(index),
      },
    });

    posts.push(post);
  }

  const event = await upsertByField({
    payload,
    collection: "events",
    field: "title",
    value: "Khoa tu mua xuan",
    data: {
      publicId: "",
      title: "Khoa tu mua xuan",
      description: "Su kien tu hoc mau de smoke test.",
      content: wrapLexicalContent("Chuong trinh phap dam, niem Phat va chia se kinh nghiem tu hoc."),
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      timeString: "08:00",
      location: "TP. Thu Duc",
      type: "retreat",
      speaker: "Ban Bien Tap PMTL",
      language: "vi",
      link: "https://example.com/events/xuan",
      eventStatus: "upcoming",
    },
  });

  await upsertByField({
    payload,
    collection: "beginnerGuides",
    field: "title",
    value: "Huong dan nhap mon",
      data: {
        publicId: "",
        title: "Huong dan nhap mon",
        description: "Loi vao co ban cho nguoi moi.",
        content: wrapLexicalContent("Bat dau tu viec giu tam an, doc bai ngan va tap niem Phat moi ngay."),
        guideType: "starter",
        details: [{ title: "Buoc 1", content: "An dinh hoi tho" }],
        duration: "10 phut",
        stepNumber: 1,
        iconName: "lotus",
      order: 1,
    },
  });

  await upsertByField({
    payload,
    collection: "downloads",
    field: "title",
    value: "Tai lieu huong dan niem Phat",
    data: {
      publicId: "",
      title: "Tai lieu huong dan niem Phat",
      description: "Ban PDF mau cho muc tai ve.",
      externalURL: "https://example.com/downloads/niem-phat.pdf",
      fileType: "pdf",
      category: "tai-lieu",
      groupYear: 2026,
      groupLabel: "Tai lieu co ban",
      sortOrder: 1,
      isNew: true,
      isUpdating: false,
      fileSizeMB: 1.2,
    },
  });

  await upsertByField({
    payload,
    collection: "hubPages",
    field: "slug",
    value: "tu-hoc-can-ban",
    data: {
      publicId: "",
      title: "Tu hoc can ban",
      slug: "tu-hoc-can-ban",
      description: "Trang hub tong hop bai viet, tai lieu va huong dan co ban.",
      visualTheme: "teal",
      menuLabel: "Tu hoc can ban",
      menuIconName: "lotus",
      blocks: [],
      curatedPosts: posts.slice(0, 3).map((post) => post.id),
      downloads: [],
      showInMenu: true,
      sortOrder: 1,
    },
  });

  return {
    categories: [categoryPrayer, categoryFamily],
    tags: [tagRelease, tagCompassion],
    posts,
    event,
  };
}

async function seedCommunity(payload: Awaited<ReturnType<typeof getPayload>>, memberId: number | string, postId: number | string) {
  const communityPost = await upsertByField({
    payload,
    collection: "communityPosts",
    field: "slug",
    value: "chia-se-phat-phap-dau-tien",
    data: {
      publicId: "",
      title: "Chia se Phat phap dau tien",
      slug: "chia-se-phat-phap-dau-tien",
      content: "Hom nay con bat dau hanh tri va muon chia se cam nhan voi dao huu.",
      type: "story",
      category: "cam-nghiem",
      tags: [{ value: "niem-phat" }],
      authorUser: memberId,
      authorNameSnapshot: "Phat tu Thanh Tam",
      moderationStatus: "approved",
      spamScore: 0,
      reportCount: 0,
      pinned: false,
      isHidden: false,
    },
  });

  await upsertByField({
    payload,
    collection: "communityComments",
    field: "publicId",
    value: "seed-community-comment-1",
    data: {
      publicId: "seed-community-comment-1",
      post: communityPost.id,
      content: "Cam on dao huu da chia se. Chuc dao huu tinh tan.",
      authorUser: memberId,
      authorNameSnapshot: "Phat tu Thanh Tam",
      moderationStatus: "approved",
      spamScore: 0,
      reportCount: 0,
      isHidden: false,
    },
  });

  await upsertByField({
    payload,
    collection: "guestbookEntries",
    field: "publicId",
    value: "seed-guestbook-1",
    data: {
      publicId: "seed-guestbook-1",
      authorName: "Dao huu A",
      message: "Cam on quy thay va ban bien tap da duy tri kho noi dung rat huu ich.",
      country: "Viet Nam",
      entryType: "message",
      questionCategory: "tri-an",
      approvalStatus: "approved",
      submittedByUser: memberId,
    },
  });

  await upsertByField({
    payload,
    collection: "postComments",
    field: "publicId",
    value: "seed-post-comment-1",
    data: {
      publicId: "seed-post-comment-1",
      post: postId,
      content: "Con da doc bai nay va thay rat hop voi giai doan hien tai.",
      authorName: "Doc gia mau",
      moderationStatus: "approved",
      submittedByUser: memberId,
      submittedByIpHash: "seed-ip",
      isHidden: false,
    },
  });
}

async function seedChanting(payload: Awaited<ReturnType<typeof getPayload>>, memberId: number | string) {
  const chantItem = await upsertByField({
    payload,
    collection: "chantItems",
    field: "slug",
    value: "dai-bi-chu",
    data: {
      publicId: "",
      title: "Dai Bi Chu",
      slug: "dai-bi-chu",
      kind: "mantra",
      content: wrapLexicalContent("Nam mo ha ra da na da ra da da..."),
      openingPrayer: "Nguyen dem cong duc nay huong ve khap tat ca.",
      recommendedPresets: [{ label: "Co ban", target: 7 }],
    },
  });

  const chantPlan = await upsertByField({
    payload,
    collection: "chantPlans",
    field: "slug",
    value: "cong-phu-buoi-sang",
    data: {
      publicId: "",
      title: "Cong phu buoi sang",
      slug: "cong-phu-buoi-sang",
      planType: "daily",
      planItems: [{ chantItem: chantItem.id, target: 7, isOptional: false }],
    },
  });

  const lunarEvent = await upsertByField({
    payload,
    collection: "lunarEvents",
    field: "title",
    value: "Ngay via ram",
    data: {
      publicId: "",
      title: "Ngay via ram",
      recurrenceData: { lunarMonth: 1, lunarDay: 15, isLeapMonth: false },
      eventType: "special-day",
      priority: 1,
    },
  });

  await upsertByField({
    payload,
    collection: "lunarEventOverrides",
    field: "publicId",
    value: "seed-lunar-override-1",
    data: {
      publicId: "seed-lunar-override-1",
      lunarEvent: lunarEvent.id,
      chantItem: chantItem.id,
      mode: "append",
      target: 21,
      max: 21,
      priority: 1,
      note: "Ngay via nen tang so luong hanh tri.",
    },
  });

  await upsertByField({
    payload,
    collection: "chantPreferences",
    field: "publicId",
    value: "seed-chant-pref-1",
    data: {
      publicId: "seed-chant-pref-1",
      user: memberId,
      plan: chantPlan.id,
      enabledOptionalItems: [],
      targetsByItem: [{ chantItem: chantItem.id, target: 7 }],
      intentionsByItem: [{ chantItem: chantItem.id, intention: "Cau binh an cho gia dinh" }],
    },
  });

  await upsertByField({
    payload,
    collection: "practiceLogs",
    field: "publicId",
    value: "seed-practice-log-1",
    data: {
      publicId: "seed-practice-log-1",
      user: memberId,
      plan: chantPlan.id,
      practiceDate: new Date().toISOString(),
      itemStates: [{ chantItem: chantItem.id, completed: true, count: 7 }],
      sessionConfig: { durationMinutes: 18, notes: "Buoi cong phu mau." },
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      isCompleted: true,
    },
  });
}

async function seedSutra(payload: Awaited<ReturnType<typeof getPayload>>, tagId: number | string) {
  const sutra = await upsertByField({
    payload,
    collection: "sutras",
    field: "slug",
    value: "kinh-a-di-da",
    data: {
      publicId: "",
      title: "Kinh A Di Da",
      slug: "kinh-a-di-da",
      description: "Ban kinh mau de test reader va search.",
      shortExcerpt: "Nhat tam bat loan, tam huong Tay Phuong.",
      translator: "Ban dich PMTL",
      reviewer: "Ban bien tap PMTL",
      tags: [tagId],
      isFeatured: true,
      sortOrder: 1,
    },
  });

  const volume = await upsertByField({
    payload,
    collection: "sutraVolumes",
    field: "publicId",
    value: "seed-sutra-volume-1",
    data: {
      publicId: "seed-sutra-volume-1",
      sutra: sutra.id,
      title: "Quyen 1",
      volumeNumber: 1,
      sortOrder: 1,
      description: "Quyen mo dau.",
    },
  });

  await upsertByField({
    payload,
    collection: "sutraChapters",
    field: "slug",
    value: "kinh-a-di-da-chuong-1",
    data: {
      publicId: "",
      sutra: sutra.id,
      volume: volume.id,
      title: "Chuong 1",
      slug: "kinh-a-di-da-chuong-1",
      chapterNumber: 1,
      content: wrapLexicalContent("Nhu thi nga van. Nhat thoi Phat tai Xa Ve Quoc..."),
      openingText: "Nam mo A Di Da Phat.",
      endingText: "Het chuong 1.",
      sortOrder: 1,
    },
  });
}

async function seedSystem(payload: Awaited<ReturnType<typeof getPayload>>, moderatorId: number | string) {
  await upsertByField({
    payload,
    collection: "pushJobs",
    field: "publicId",
    value: "seed-push-job-1",
    data: {
      publicId: "seed-push-job-1",
      kind: "content_update",
      status: "completed",
      message: "Da co them bai viet moi trong thu vien PMTL_VN.",
      url: "/search?q=khai+thi",
      tag: "seed-content-update",
      payload: {
        title: "PMTL_VN",
        body: "Da co them bai viet moi trong thu vien PMTL_VN.",
        recipientRoles: ["member"],
        excludeUserIds: [String(moderatorId)],
      },
      chunkSize: 100,
      sentCount: 0,
      failedCount: 0,
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
    },
  });
}

async function main() {
  const payload = await getPayload({ config });

  logger.info("Seeding globals");
  await seedGlobals(payload);
  logger.info("Seeding users");
  const users = await seedUsers(payload);
  logger.info("Seeding editorial");
  const editorial = await seedEditorial(payload);
  logger.info("Seeding community");
  await seedCommunity(payload, users.member!.id, editorial.posts[0]!.id);
  logger.info("Seeding chanting");
  await seedChanting(payload, users.member!.id);
  logger.info("Seeding sutra");
  await seedSutra(payload, editorial.tags[0]!.id);
  logger.info("Seeding system");
  await seedSystem(payload, users.moderator!.id);
  logger.info("Demo seed completed");

  process.stdout.write(
    `${JSON.stringify(
      {
        ok: true,
        credentials: {
          superAdmin: { email: "admin@pmtl.local", password: "PmtlAdmin!123" },
          moderator: { email: "moderator@pmtl.local", password: "PmtlModerator!123" },
          member: { email: "member@pmtl.local", password: "PmtlMember!123" },
        },
        seeded: {
          posts: editorial.posts.length,
          categories: editorial.categories.length,
          tags: editorial.tags.length,
        },
      },
      null,
      2,
    )}\n`,
  );

  process.exit(0);
}

void main().catch((error) => {
  logger.error(withError(undefined, error), "Demo seed failed");
  process.exit(1);
});
