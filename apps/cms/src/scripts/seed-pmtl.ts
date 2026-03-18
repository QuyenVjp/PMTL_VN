/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
// @ts-nocheck
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getPayload } from "payload";

import { wrapLexicalContent } from "@/hooks/lexical-migration";
import config from "@/payload.config";
import { getLogger, withError } from "@/services/logger.service";

const logger = getLogger("scripts:seed-pmtl");

type PayloadClient = Awaited<ReturnType<typeof getPayload>>;
type CollectionSlug = Parameters<PayloadClient["find"]>[0]["collection"];
type RecordLike = Record<string, unknown>;

type WhereEquals = {
  equals: string;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedAssetDirectory = path.resolve(__dirname, "seed-assets");

function daysAgo(days: number) {
  const value = new Date();
  value.setDate(value.getDate() - days);
  return value.toISOString();
}

function daysFromNow(days: number) {
  const value = new Date();
  value.setDate(value.getDate() + days);
  return value.toISOString();
}

function getRequiredValue<T>(value: T | undefined, label: string) {
  if (value === undefined) {
    throw new Error(`Missing required value: ${label}`);
  }

  return value;
}

function getDocumentId(document: unknown, label: string): number | string {
  if (!document || typeof document !== "object" || !("id" in document)) {
    throw new Error(`Missing document id: ${label}`);
  }

  const id = (document as { id: unknown }).id;

  if (typeof id !== "number" && typeof id !== "string") {
    throw new Error(`Invalid document id: ${label}`);
  }

  return id;
}

async function upsertByField<TData extends RecordLike>(input: {
  payload: PayloadClient;
  collection: CollectionSlug;
  field: string;
  value: string;
  data: TData;
  context?: Record<string, unknown>;
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
      context: input.context,
      overrideAccess: true,
    });
  }

  return input.payload.create({
    collection: input.collection,
    data: input.data,
    context: input.context,
    draft: false,
    overrideAccess: true,
  });
}

async function upsertMediaByFilename(input: {
  payload: PayloadClient;
  filename: string;
  filePath: string;
  data: RecordLike;
}) {
  const existing = await input.payload.find({
    collection: "media",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      filename: {
        equals: input.filename,
      },
    },
  });

  const document = existing.docs[0];

  if (document) {
    return input.payload.update({
      collection: "media",
      id: document.id,
      data: input.data,
      filePath: input.filePath,
      overwriteExistingFiles: true,
      overrideAccess: true,
    });
  }

  return input.payload.create({
    collection: "media",
    data: input.data,
    filePath: input.filePath,
    overrideAccess: true,
  });
}

async function clearCollection(payload: PayloadClient, collection: CollectionSlug) {
  while (true) {
    const result = await payload.find({
      collection,
      depth: 0,
      limit: 200,
      overrideAccess: true,
    });

    if (result.docs.length === 0) {
      return;
    }

    for (const document of result.docs) {
      await payload.delete({
        collection,
        id: document.id,
        overrideAccess: true,
      });
    }
  }
}

async function resetSeedCollections(payload: PayloadClient) {
  const collectionsToClear: CollectionSlug[] = [
    "auditLogs",
    "moderationReports",
    "requestGuards",
    "pushJobs",
    "pushSubscriptions",
    "sutraReadingProgress",
    "sutraBookmarks",
    "sutraGlossary",
    "sutraChapters",
    "sutraVolumes",
    "sutras",
    "practiceLogs",
    "chantPreferences",
    "lunarEventOverrides",
    "lunarEvents",
    "chantPlans",
    "chantItems",
    "guestbookEntries",
    "communityComments",
    "communityPosts",
    "hubPages",
    "downloads",
    "events",
    "postComments",
    "posts",
    "tags",
    "categories",
    "media",
    "beginnerGuides",
    "users",
  ];

  for (const collection of collectionsToClear) {
    logger.info({ collection }, "Resetting PMTL seed collection");
    await clearCollection(payload, collection);
  }
}

async function seedGlobals(payload: PayloadClient) {
  await payload.updateGlobal({
    slug: "site-settings",
    overrideAccess: true,
    data: {
      siteName: "Phap Mon Tam Linh Viet Nam",
      siteDescription:
        "Thu vien tu hoc PMTL_VN quy tu noi dung khai thi, niem kinh, phong sinh va thuc hanh ung dung cho doi song gia dinh Viet.",
      supportEmail: "admin@pmtl.local",
      supportPhone: "0938 168 108",
      defaultMetaTitle: "Phap Mon Tam Linh Viet Nam | Thu vien tu hoc va hanh tri",
      defaultMetaDescription:
        "Du lieu mau PMTL_VN duoc seed theo cau truc domain thuc te: khai thi, niem kinh, phong sinh, benh tat, gia dinh va cong viec.",
    },
  });

  await payload.updateGlobal({
    slug: "homepage",
    overrideAccess: true,
    data: {
      heroTitle: "Thu vien Phap Mon Tam Linh danh cho doi song Viet hien dai",
      heroDescription:
        "Khoi tao khong gian tu hoc co cau truc ro rang: bai khai thi ngan, huong dan nhap mon, lich su kien, niem chu va tai lieu ung dung theo tung chu de song.",
      heroPrimaryLabel: "Bat dau tu hoc",
      heroPrimaryHref: "/hub/tu-hoc-can-ban",
      featuredSectionTitle: "Chu de duoc doc nhieu",
      featuredSectionDescription:
        "Tap hop nhung bai viet, su kien va huong dan xoay quanh niem kinh, phong sinh, benh tat, gia dinh va nhan duyen.",
      latestSectionTitle: "Cap nhat moi trong thu vien",
      latestSectionDescription:
        "Thong tin moi duoc bien tap lai theo ngon ngu gan gu, de tim va phu hop voi cach doc tren web hien dai.",
      studySectionTitle: "Lo trinh tu hoc tung buoc",
      studySectionDescription:
        "Nguoi moi co the di tu nhap mon, thoi khoa niem chu, den doc kinh va thuc hanh hang ngay trong mot he thong nhat quan.",
      metaTitle: "PMTL_VN | Thu vien tu hoc tam linh Viet Nam",
      metaDescription:
        "Trang chu PMTL_VN voi noi dung khai thi, niem kinh, phong sinh, bai huong dan va su kien thuc hanh duoc seed san cho admin.",
    },
  });

  await payload.updateGlobal({
    slug: "navigation",
    overrideAccess: true,
    data: {
      items: [
        { label: "Khai thi", href: "/search?category=khai-thi-phat-phap", openInNewTab: false },
        { label: "Niem kinh", href: "/search?category=niem-kinh", openInNewTab: false },
        { label: "Phong sinh", href: "/search?category=phong-sinh", openInNewTab: false },
        { label: "Benh tat", href: "/search?category=benh-tat", openInNewTab: false },
        { label: "Gia dinh", href: "/search?category=cac-moi-quan-he", openInNewTab: false },
        { label: "Tai lieu", href: "/downloads", openInNewTab: false },
        { label: "Su kien", href: "/events", openInNewTab: false },
      ],
      ctaLabel: "Niem chu ngay",
      ctaHref: "/chanting",
    },
  });

  await payload.updateGlobal({
    slug: "sidebar-config",
    overrideAccess: true,
    data: {
      showSearch: true,
      showCategoryTree: true,
      showArchive: true,
      showLatestComments: true,
      showDownloadLinks: true,
      downloadLinks: [
        { label: "Cau an can ban (PDF)", href: "https://phapmontamlinh.vn/" },
        { label: "Thoi khoa niem Phat 21 ngay", href: "/downloads" },
        { label: "Tong hop huong dan nguoi moi", href: "/hub/tu-hoc-can-ban" },
      ],
      socialLinks: [
        { label: "Website", href: "https://phapmontamlinh.vn/" },
        { label: "YouTube", href: "https://www.youtube.com/" },
        { label: "Facebook", href: "https://www.facebook.com/" },
      ],
    },
  });

  await payload.updateGlobal({
    slug: "chanting-settings",
    overrideAccess: true,
    data: {
      pageTitle: "Niem chu va thuc hanh hang ngay",
      pageDescription:
        "Tap hop bai niem, preset so luong, huong dan dat tam y va lich nhac theo ngay via, ram, mung mot de nguoi moi de bat dau.",
      guidelineSections: [
        {
          title: "On dinh tam truoc khi niem",
          content: "Truoc moi thoi khoa, ngoi yen 1-2 phut, dieu hoa hoi tho va phat nguyen ro rang de giu nhip hanh tri deu.",
        },
        {
          title: "Dat muc tieu vua suc",
          content: "Bat dau tu muc 7 bien hoac 21 bien. Dieu quan trong la duy tri duoc trong nhieu ngay lien tiep thay vi dat muc qua cao.",
        },
        {
          title: "Ghi lai sau moi buoi",
          content: "Dung practice log de ghi nhan thoi gian, tong so bien va tam trang sau buoi niem de theo doi tien trinh.",
        },
      ],
      seo: {
        title: "PMTL_VN | Niem chu va ke hoach hanh tri",
        description: "Cau truc seed mau cho trang chanting voi huong dan, preset va ngay via am lich.",
      },
    },
  });
}

async function seedUsers(payload: PayloadClient, avatarId?: number | string) {
  const users = [
    {
      email: "admin@pmtl.local",
      password: "PmtlAdmin!123",
      fullName: "PMTL Super Admin",
      username: "pmtl-admin",
      dharmaName: "Tam Quang",
      role: "super-admin" as const,
      bio: "Quan tri tong the thu vien PMTL_VN va kiem thu luong du lieu.",
    },
    {
      email: "ops@pmtl.local",
      password: "PmtlOps!123",
      fullName: "PMTL Admin Van Hanh",
      username: "van-hanh",
      dharmaName: "An Hanh",
      role: "admin" as const,
      bio: "Phu trach van hanh danh muc, tai lieu va lich sinh hoat.",
    },
    {
      email: "editor@pmtl.local",
      password: "PmtlEditor!123",
      fullName: "PMTL Bien Tap",
      username: "bien-tap",
      dharmaName: "Minh Tinh",
      role: "editor" as const,
      bio: "Bien tap noi dung khai thi va huong dan tu hoc theo tung chu de song.",
    },
    {
      email: "moderator@pmtl.local",
      password: "PmtlModerator!123",
      fullName: "PMTL Dieu Phoi Cong Dong",
      username: "dieu-phoi",
      dharmaName: "Nhu Nghiem",
      role: "moderator" as const,
      bio: "Theo doi cong dong, duyet chia se va xu ly report.",
    },
    {
      email: "member@pmtl.local",
      password: "PmtlMember!123",
      fullName: "Phat tu Thanh Tam",
      username: "thanh-tam",
      dharmaName: "Lien Tam",
      role: "member" as const,
      bio: "Thanh vien demo de test hanh trinh doc bai, niem chu va binh luan.",
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

    const data = {
      publicId: "",
      email: user.email,
      password: user.password,
      fullName: user.fullName,
      username: user.username,
      dharmaName: user.dharmaName,
      role: user.role,
      isBlocked: false,
      bio: user.bio,
      avatar: avatarId,
      phone: "0900000000",
    };

    if (existing.docs[0]) {
      const updated = await payload.update({
        collection: "users",
        id: existing.docs[0].id,
        overrideAccess: true,
        data,
      });

      created.push(updated);
      continue;
    }

    const next = await payload.create({
      collection: "users",
      overrideAccess: true,
      data,
    });

    created.push(next);
  }

  return {
    superAdmin: created[0],
    admin: created[1],
    editor: created[2],
    moderator: created[3],
    member: created[4],
  };
}

async function seedMedia(payload: PayloadClient) {
  const lotusDawn = await upsertMediaByFilename({
    payload,
    filename: "lotus-dawn.svg",
    filePath: path.join(seedAssetDirectory, "lotus-dawn.svg"),
    data: {
      publicId: "",
      alt: "Minh hoa binh minh hoa sen cho hero PMTL",
      caption: "Visual hero cho thu vien PMTL_VN.",
    },
  });

  const chantingCircle = await upsertMediaByFilename({
    payload,
    filename: "chanting-circle.svg",
    filePath: path.join(seedAssetDirectory, "chanting-circle.svg"),
    data: {
      publicId: "",
      alt: "Do hoa vong tron niem chu va an tam",
      caption: "Su dung cho chanting, event recap va hub page.",
    },
  });

  const libraryAltar = await upsertMediaByFilename({
    payload,
    filename: "library-altar.svg",
    filePath: path.join(seedAssetDirectory, "library-altar.svg"),
    data: {
      publicId: "",
      alt: "Minh hoa thu vien tu hoc PMTL voi ban tho va gia sach",
      caption: "Anh bia cho hub page va tai lieu.",
    },
  });

  return {
    lotusDawn,
    chantingCircle,
    libraryAltar,
  };
}

async function seedEditorial(payload: PayloadClient, media: Awaited<ReturnType<typeof seedMedia>>) {
  const categoryInputs = [
    {
      slug: "khai-thi-phat-phap",
      name: "Khai thi Phat phap",
      description: "Nhung bai chia se ngan, ro va co tinh ung dung cho nguoi dang tim cach giu tam an trong doi song.",
      order: 1,
    },
    {
      slug: "niem-kinh",
      name: "Niem kinh",
      description: "Noi dung huong den doc kinh, niem Phat, giu nhip thoi khoa va on dinh noi tam.",
      order: 2,
    },
    {
      slug: "phong-sinh",
      name: "Phong sinh",
      description: "Huong dan phong sinh dung tam y, tranh hinh thuc va nhan manh tinh tu bi thiet thuc.",
      order: 3,
    },
    {
      slug: "benh-tat",
      name: "Benh tat",
      description: "Chu de lien quan den cau an, giu tam khi benh va cach ket hop thuc hanh tam linh voi cham soc doi song.",
      order: 4,
    },
    {
      slug: "cac-moi-quan-he",
      name: "Cac moi quan he",
      description: "Goi mo cach ung xu trong gia dinh, hon nhan, cong viec va quan he hang ngay.",
      order: 5,
    },
    {
      slug: "nhan-duyen-sinh-con",
      name: "Nhan duyen sinh con",
      description: "Noi dung huong ve tam ly, nhan duyen va su chuan bi noi tam cho hanh trinh sinh no.",
      order: 6,
    },
    {
      slug: "cong-viec-su-nghiep",
      name: "Cong viec su nghiep",
      description: "Ung dung tu hoc de giu tam sang trong moi truong lam viec va nhung giai doan bien dong.",
      order: 7,
    },
    {
      slug: "gia-dinh",
      name: "Gia dinh",
      description: "Noi dung dinh huong ve hieu kinh, tam thong cam va xay dung nep song on hoa.",
      order: 8,
    },
    {
      slug: "bai-thuoc-dan-gian",
      name: "Bai thuoc dan gian",
      description: "Tai lieu kham khao mang tinh kinh nghiem dan gian, di kem luu y uu tien an toan va tham van chuyen mon.",
      order: 9,
    },
  ];

  const categories = new Map<string, Awaited<ReturnType<typeof upsertByField>>>();

  for (const categoryInput of categoryInputs) {
    const category = await upsertByField({
      payload,
      collection: "categories",
      field: "slug",
      value: categoryInput.slug,
      data: {
        publicId: "",
        name: categoryInput.name,
        slug: categoryInput.slug,
        description: categoryInput.description,
        isActive: true,
        order: categoryInput.order,
      },
    });

    categories.set(categoryInput.slug, category);
  }

  const tagInputs = [
    ["an-dinh", "An dinh", "Giu tam yen va on dinh hoi tho trong sinh hoat hang ngay."],
    ["niem-phat", "Niem Phat", "Cac bai viet lien quan den nhat tam va tri danh hieu Phat."],
    ["chu-dai-bi", "Chu Dai Bi", "Noi dung thuc hanh va preset cho Dai Bi Chu."],
    ["tu-bi", "Tu bi", "Tinh than tu bi, nhan hau va chuyen hoa hanh vi."],
    ["buong-xa", "Buong xa", "Quan sat va buong nhung chap truoc gay met moi."],
    ["gia-dinh", "Gia dinh", "Ung dung Phat phap trong van de nha cua va than toc."],
    ["phong-sinh", "Phong sinh", "Nhac den tam nguyen, su can than va long tri an khi phong sinh."],
    ["cau-an", "Cau an", "Noi dung huong tam ve cau an, benh tat va binh an noi tam."],
    ["nhan-duyen", "Nhan duyen", "Lien quan den nhan duyen, tinh cam, hon nhan va sinh no."],
    ["su-nghiep", "Su nghiep", "Giu tam sang trong cong viec va su nghiep."],
    ["nguoi-moi", "Nguoi moi", "Danh cho nguoi moi vao thu vien va moi bat dau tu hoc."],
    ["doc-kinh", "Doc kinh", "Thoi quen doc kinh va tiep can kinh van de hieu de ap dung."],
  ] as const;

  const tags = new Map<string, Awaited<ReturnType<typeof upsertByField>>>();

  for (const [slug, name, description] of tagInputs) {
    const tag = await upsertByField({
      payload,
      collection: "tags",
      field: "slug",
      value: slug,
      data: {
        publicId: "",
        name,
        slug,
        description,
        isActive: true,
      },
    });

    tags.set(slug, tag);
  }

  const postBlueprints = [
    {
      title: "5 mon qua tinh than de giu tam an khi nha dang co bien dong",
      slug: "5-mon-qua-tinh-than-giu-tam-an",
      categorySlug: "khai-thi-phat-phap",
      tagSlugs: ["an-dinh", "buong-xa", "gia-dinh"],
      excerpt: "Bai mo dau cho nguoi moi, nhan vao viec quay ve hoi tho, giam phan ung nong va nuoi duong tam tri an.",
      body: "Bai viet nay tong hop 5 thao tac nho: dung lai 3 hoi tho, quan sat tam dang khoi len, nhac cau niem ngan, viet ra dieu can buong va ket thuc bang mot loi tri an. Cau truc nay phu hop cho nhung giai doan gia dinh co viec gap, con nguoi de xao dong va can mot diem tua don gian de quay ve.",
      postType: "article",
      featured: true,
      daysOffset: 1,
    },
    {
      title: "Niem kinh buoi sang cho nguoi moi: bat dau tu 10 phut moi ngay",
      slug: "niem-kinh-buoi-sang-10-phut",
      categorySlug: "niem-kinh",
      tagSlugs: ["niem-phat", "doc-kinh", "nguoi-moi"],
      excerpt: "Mot lo trinh ngan de nguoi moi khong bi ngop khi tiep can kinh van va thoi khoa.",
      body: "Goi y la chia 10 phut thanh 3 nhom: 2 phut tinh tam, 5 phut doc mot doan ngan, 3 phut ngoi yen va ghi nhan cam giac sau khi doc. Nhip nay de duy tri hon rat nhieu so voi viec co gang hoc qua nhieu ngay tu dau.",
      postType: "article",
      featured: true,
      daysOffset: 2,
    },
    {
      title: "Phong sinh khong hinh thuc: 4 dieu can nho truoc khi phat nguyen",
      slug: "phong-sinh-khong-hinh-thuc",
      categorySlug: "phong-sinh",
      tagSlugs: ["phong-sinh", "tu-bi", "an-dinh"],
      excerpt: "Phong sinh co y nghia khi di tu tam tu bi, su can than va khong bien thanh hanh vi phung phi.",
      body: "Neu khong chuan bi duoc dung cach, viec phong sinh co the tro thanh hinh thuc. Bai nay goi y 4 diem: chon noi phu hop, tranh tiep tay cho viec san bat, phat nguyen ngan gon va dung mot phan cong suc de cham soc nguoi dang kho ben canh minh.",
      postType: "source-note",
      featured: true,
      daysOffset: 3,
    },
    {
      title: "Khi doi dien benh tat, giu mot nep cau an thuc te va binh tinh",
      slug: "giu-nep-cau-an-thuc-te-khi-benh-tat",
      categorySlug: "benh-tat",
      tagSlugs: ["cau-an", "an-dinh", "tu-bi"],
      excerpt: "Thuc hanh tam linh can di cung viec theo doi suc khoe, khong thay the tu van y khoa.",
      body: "Noi dung nhan manh ba tang song song: theo doi dieu tri, dung cau an de on tam, va giu nep an uong nghi ngoi. Su binh tinh cua nguoi cham soc va nguoi benh la nen tang de viec hanh tri khong tro thanh ap luc moi.",
      postType: "article",
      featured: true,
      daysOffset: 4,
    },
    {
      title: "Lam sao de bot nong trong cac moi quan he than thiet",
      slug: "bot-nong-trong-cac-moi-quan-he-than-thiet",
      categorySlug: "cac-moi-quan-he",
      tagSlugs: ["gia-dinh", "buong-xa", "an-dinh"],
      excerpt: "Mot bai thuc hanh ngan cho nhung luc xung dot trong nha hoac giua nguoi than.",
      body: "Khi nong, tam thuong muon noi ngay cho he. Bai viet de xuat cach dat mot khoang dung truoc khi noi: 3 hoi tho, 1 cau niem ngan, 1 cau hoi ve muc dich cua minh. Chi can chuyen duoc mot nhan xet thanh mot cau hoi, khong khi da khac di rat nhieu.",
      postType: "transcript",
      featured: false,
      daysOffset: 5,
    },
    {
      title: "Nhan duyen sinh con va su chuan bi noi tam cua hai vo chong",
      slug: "nhan-duyen-sinh-con-va-chuan-bi-noi-tam",
      categorySlug: "nhan-duyen-sinh-con",
      tagSlugs: ["nhan-duyen", "gia-dinh", "cau-an"],
      excerpt: "Goc nhin tam linh o day la giu tam an, nuoi su ton trong nhau va giam ap luc vo hinh.",
      body: "Bai viet nhac rang hanh trinh sinh con can duoc nhin nhu mot qua trinh chung, khong day het ganh nang len mot nguoi. Viec cung nhau ngoi yen, ghi lai lo au va cung phat mot loi nguyen nho moi ngay co the giup xoa bot cam giac co doc.",
      postType: "article",
      featured: false,
      daysOffset: 6,
    },
    {
      title: "Cong viec met moi, tam de tan loan: cach lap lai mot nep binh tam luc giua ngay",
      slug: "lap-lai-nep-binh-tam-luc-giua-ngay",
      categorySlug: "cong-viec-su-nghiep",
      tagSlugs: ["su-nghiep", "an-dinh", "buong-xa"],
      excerpt: "Mot nghi thuc 7 phut cho nhan vien van phong hoac nguoi dang qua tai voi deadline.",
      body: "Goi y chia 7 phut thanh ba phan: roi man hinh, thu long vai, niem thinh 21 cau ngan, sau do quay lai viec bang mot muc tieu duy nhat. Day la cach dua tam ve mot diem, tranh roi vao tinh trang nhay lien tuc giua nhieu viec.",
      postType: "article",
      featured: false,
      daysOffset: 7,
    },
    {
      title: "Huong dan doc mot bai kinh ngan cho nguoi chua quen van kinh",
      slug: "huong-dan-doc-mot-bai-kinh-ngan",
      categorySlug: "niem-kinh",
      tagSlugs: ["doc-kinh", "nguoi-moi", "niem-phat"],
      excerpt: "Thay vi co gang hieu het, hay doc cham, danh dau cum tu cham den tam va ghi lai mot y ung dung.",
      body: "Neu moi bat dau, dieu kho nhat khong phai la thieu kinh van ma la thieu mot nhip doc hop ly. Bai nay de xuat cach doc 3 lan: lan mot nghe am, lan hai hieu nghia tong quat, lan ba tim mot dieu co the ap dung ngay trong gia dinh.",
      postType: "source-note",
      featured: false,
      daysOffset: 8,
    },
    {
      title: "Bai thuoc dan gian nen doc voi thai do nao",
      slug: "bai-thuoc-dan-gian-nen-doc-voi-thai-do-nao",
      categorySlug: "bai-thuoc-dan-gian",
      tagSlugs: ["cau-an", "an-dinh"],
      excerpt: "Tai lieu dan gian chi nen la kenh tham khao bo sung va phai di kem canh bao ro rang.",
      body: "Noi dung trong khu vuc nay duoc bien tap theo huong ton trong kinh nghiem dan gian nhung khong thay the y khoa. Muc tieu la giup doc gia giu tam binh tinh, biet cach tham khao va uu tien an toan cho ban than va gia dinh.",
      postType: "article",
      featured: false,
      daysOffset: 9,
    },
    {
      title: "Giu nep tri an cha me bang nhung viec nho moi tuan",
      slug: "giu-nep-tri-an-cha-me",
      categorySlug: "gia-dinh",
      tagSlugs: ["gia-dinh", "tu-bi", "an-dinh"],
      excerpt: "Tri an khong can long trong, ma can deu va co that trong nhung viec rat nho.",
      body: "Bai viet goi y mot lich tri an tuan: mot cuoc goi hoi tham, mot bua com cung nhau, mot viec giup nha khong doi hoi, va mot lan nhin lai cach minh dang noi chuyen voi cha me. Chuyen hoa quan he thuong den tu nhung thay doi nho nhat.",
      postType: "transcript",
      featured: false,
      daysOffset: 10,
    },
    {
      title: "21 ngay niem Dai Bi Chu de lap lai nhiep tam",
      slug: "21-ngay-niem-dai-bi-chu",
      categorySlug: "niem-kinh",
      tagSlugs: ["chu-dai-bi", "niem-phat", "nguoi-moi"],
      excerpt: "Ke hoach 21 ngay giup nguoi moi duy tri deu thay vi bung len roi dut doan.",
      body: "Ke hoach duoc thiet ke theo nhip tang dan: tuan dau 7 bien, tuan hai 14 bien, tuan ba 21 bien. Moi ngay chi can ghi 3 thong tin: da niem chua, niem luc nao, va tam trang truoc sau buoi niem co gi khac.",
      postType: "article",
      featured: false,
      daysOffset: 11,
    },
    {
      title: "Phong sinh va chuyen hoa tinh so huu trong tam",
      slug: "phong-sinh-va-chuyen-hoa-tinh-so-huu",
      categorySlug: "phong-sinh",
      tagSlugs: ["phong-sinh", "buong-xa", "tu-bi"],
      excerpt: "Bai viet nhan manh y nghia noi tam cua phong sinh: hoc buong cai tam muon chiem huu.",
      body: "Khi phong sinh, ta nhin lai xu huong muon nam giu moi thu theo y minh. Chinh su buong nhe ben trong, cung voi long ton trong su song, moi la phan quy gia nhat cua hanh tri nay. Khong can lam lon, chi can dung tam.",
      postType: "article",
      featured: false,
      daysOffset: 12,
    },
  ] as const;

  const posts = [];

  for (const [index, blueprint] of postBlueprints.entries()) {
    const category = categories.get(blueprint.categorySlug);
    const relatedCategory = categories.get(index % 2 === 0 ? "khai-thi-phat-phap" : "niem-kinh");
    const tagIds = blueprint.tagSlugs.map((slug) => tags.get(slug)?.id).filter(Boolean);
    const relatedCategories = [category?.id, relatedCategory?.id].filter(Boolean);
    const coverMedia = index % 3 === 0 ? media.lotusDawn.id : index % 3 === 1 ? media.chantingCircle.id : media.libraryAltar.id;

    const post = await upsertByField({
      payload,
      collection: "posts",
      field: "slug",
      value: blueprint.slug,
      data: {
        _status: "published",
        publicId: "",
        postType: blueprint.postType,
        sourceRef: `PMTL-${String(index + 1).padStart(3, "0")}`,
        title: blueprint.title,
        slug: blueprint.slug,
        content: wrapLexicalContent(blueprint.body),
        excerptOverride: blueprint.excerpt,
        primaryCategory: category?.id,
        categories: relatedCategories,
        tags: tagIds,
        postFlags: {
          featured: blueprint.featured,
          allowComments: true,
        },
        coverMedia,
        gallery: [media.lotusDawn.id, media.chantingCircle.id, media.libraryAltar.id],
        source: {
          sourceName: "PMTL seed",
          sourceTitle: "Tong hop bien tap theo chu de domain PMTL",
          sourceUrl: "https://phapmontamlinh.vn/",
        },
        series: {
          seriesKey: blueprint.categorySlug,
          seriesNumber: index + 1,
        },
        eventContext: {
          eventDate: daysAgo(blueprint.daysOffset),
          location: "Online / PMTL_VN",
        },
        seo: {
          title: blueprint.title,
          description: blueprint.excerpt,
        },
        commentCount: blueprint.slug === "5-mon-qua-tinh-than-giu-tam-an" ? 2 : 0,
        publishedAt: daysAgo(blueprint.daysOffset),
      },
    });

    posts.push(post);
  }

  const guideInputs = [
    {
      title: "Nguoi moi nen bat dau tu dau",
      guideType: "starter",
      duration: "15 phut",
      stepNumber: 1,
      order: 1,
      description: "Huong dan mo dau de khong bi ngop khi moi vao kho PMTL.",
      content: "Hay chon mot chu de dang sat voi doi song hien tai nhat thay vi co gang doc moi thu. Tu mot bai ngan, mot ghi chep, mot thoi khoa nho, nguoi moi se de tao nep hon.",
      details: [
        { title: "Chon mot chu de gan nhat", content: "Benh tat, gia dinh, cong viec hay niem kinh deu co hub rieng." },
        { title: "Doc mot bai ngan truoc", content: "Bat dau tu bai viet 5-7 phut de nhan ra nhip van cua thu vien." },
        { title: "Ket thuc bang mot ghi chu", content: "Ghi lai mot cau danh dong tam de tao noi ket noi voi buoi doc sau." },
      ],
    },
    {
      title: "Lap thoi khoa niem chu 7 ngay",
      guideType: "practice",
      duration: "7 ngay",
      stepNumber: 2,
      order: 2,
      description: "Ke hoach co ban de thiet lap tinh deu trong viec niem chu.",
      content: "Muc tieu cua 7 ngay dau tien khong phai la so bien cao ma la giu duoc khung gio co dinh. Chon mot khung 10-15 phut khong bi ngan doan.",
      details: [
        { title: "Khung gio co dinh", content: "Tot nhat la som sang hoac cuoi toi." },
        { title: "Preset nho", content: "Bat dau tu 7 bien Dai Bi Chu hoac 21 cau niem Phat." },
        { title: "Ghi lai tam trang", content: "So sanh tam trang truoc va sau buoi niem." },
      ],
    },
    {
      title: "Cach doc kinh ma van giu duoc hieu ung dung",
      guideType: "starter",
      duration: "20 phut",
      stepNumber: 3,
      order: 3,
      description: "Khong can hieu het, nhung can tim duoc mot dieu de song theo.",
      content: "Moi lan doc, chi can tim mot cum tu, mot cau hoac mot y co the nhac lai trong ngay. Su lap lai nay quan trong hon viec doc nhieu ma khong luu lai duoc gi.",
      details: [
        { title: "Doc cham", content: "Doan ngan nhung doc that cham va ro." },
        { title: "Danh dau", content: "Luu mot cum tu de quay lai sau." },
        { title: "Ung dung ngay", content: "Hoi xem y nay dung vao viec gi trong hom nay." },
      ],
    },
    {
      title: "FAQ: phong sinh dung tam y",
      guideType: "faq",
      duration: "8 phut",
      stepNumber: 4,
      order: 4,
      description: "Giai dap nhung nham lan pho bien ve phong sinh.",
      content: "FAQ nay giam nhung thao tac vo tinh bien hanh tri thanh hinh thuc, dong thoi nhac nguoi doc uu tien su can than va ton trong moi truong song cua vat.",
      details: [
        { title: "Khong can lam lon", content: "Tam y va cach lam dung quan trong hon quy mo." },
        { title: "Trach tiep tay", content: "Can tim hieu nguon goc con vat va boi canh phong sinh." },
        { title: "Kem hanh tri khac", content: "Neu duoc, ket hop voi viec giup do nguoi gap kho." },
      ],
    },
    {
      title: "Nhat ky tam linh cho gia dinh tre",
      guideType: "practice",
      duration: "14 ngay",
      stepNumber: 5,
      order: 5,
      description: "Mau thuc hanh nho cho vo chong hoac nguoi cham soc gia dinh.",
      content: "Nhat ky gom ba cot: dieu minh biet on, dieu minh dang lo, va mot viec thien ngay mai. Cach ghi nay giup gia dinh noi chuyen voi nhau bang su that va su diu lai.",
      details: [
        { title: "Lam deu moi toi", content: "Chi mat 5 phut nhung rat hieu qua." },
        { title: "Khong phan xet", content: "Chi ghi nhan va lang nghe." },
        { title: "Chon mot viec thien", content: "Nho nhat co the nhung phai lam duoc." },
      ],
    },
  ] as const;

  const guides = [];

  for (const [index, guideInput] of guideInputs.entries()) {
    const guide = await upsertByField({
      payload,
      collection: "beginnerGuides",
      field: "title",
      value: guideInput.title,
      data: {
        _status: "published",
        publicId: "",
        title: guideInput.title,
        description: guideInput.description,
        content: wrapLexicalContent(guideInput.content),
        guideType: guideInput.guideType,
        duration: guideInput.duration,
        stepNumber: guideInput.stepNumber,
        details: guideInput.details,
        iconName: index % 2 === 0 ? "lotus" : "book-open",
        images: [media.lotusDawn.id, media.libraryAltar.id],
        pdfURL: "https://phapmontamlinh.vn/",
        videoURL: "https://www.youtube.com/",
        order: guideInput.order,
        seo: {
          title: guideInput.title,
          description: guideInput.description,
        },
      },
    });

    guides.push(guide);
  }

  const downloadInputs = [
    {
      title: "Cau an can ban cho gia dinh",
      description: "Tai lieu tong hop bai ngan de doc trong nhung ngay tam chua yen.",
      externalURL: "https://phapmontamlinh.vn/",
      fileType: "pdf",
      fileSizeMB: 1.4,
      category: "tai-lieu",
      groupYear: 2026,
      groupLabel: "Tai lieu gia dinh",
      notes: "Phu hop cho nguoi moi, co the in ra doc.",
      isNew: true,
      sortOrder: 1,
    },
    {
      title: "Checklist 21 ngay niem Dai Bi Chu",
      description: "Bang theo doi de duy tri chuoi hanh tri lien tuc.",
      externalURL: "https://phapmontamlinh.vn/",
      fileType: "pdf",
      fileSizeMB: 0.8,
      category: "chanting",
      groupYear: 2026,
      groupLabel: "Tai lieu niem chu",
      notes: "Kem theo huong dan ghi nhat ky.",
      isNew: true,
      sortOrder: 2,
    },
    {
      title: "Tong hop bai khai thi cho nguoi dang met moi vi cong viec",
      description: "Cum bai viet duoc bien tap thanh mot goi de doc nhanh.",
      externalURL: "https://phapmontamlinh.vn/",
      fileType: "pdf",
      fileSizeMB: 2.3,
      category: "khai-thi",
      groupYear: 2026,
      groupLabel: "Tai lieu theo chu de",
      notes: "Dung de test khu vuc downloads va bo loc group.",
      isNew: false,
      sortOrder: 3,
    },
    {
      title: "So tay phong sinh dung tam y",
      description: "Tai lieu tong hop nhung luu y can than truoc khi phong sinh.",
      externalURL: "https://phapmontamlinh.vn/",
      fileType: "pdf",
      fileSizeMB: 1.1,
      category: "phong-sinh",
      groupYear: 2025,
      groupLabel: "Tai lieu thuc hanh",
      notes: "Ban demo phuc vu admin va search.",
      isNew: false,
      sortOrder: 4,
    },
  ] as const;

  const downloads = [];

  for (const downloadInput of downloadInputs) {
    const download = await upsertByField({
      payload,
      collection: "downloads",
      field: "title",
      value: downloadInput.title,
      data: {
        _status: "published",
        publicId: "",
        title: downloadInput.title,
        description: downloadInput.description,
        externalURL: downloadInput.externalURL,
        fileType: downloadInput.fileType,
        fileSizeMB: downloadInput.fileSizeMB,
        category: downloadInput.category,
        groupYear: downloadInput.groupYear,
        groupLabel: downloadInput.groupLabel,
        notes: downloadInput.notes,
        thumbnail: media.libraryAltar.id,
        isUpdating: false,
        isNew: downloadInput.isNew,
        sortOrder: downloadInput.sortOrder,
      },
    });

    downloads.push(download);
  }

  const eventInputs = [
    {
      title: "Phap dam online: giu tam an trong gia dinh hien dai",
      slug: "phap-dam-online-giu-tam-an-trong-gia-dinh",
      description: "Buoi chia se online danh cho nguoi dang can mot nhip dung de soi lai giao tiep trong nha.",
      content: "Noi dung gom 3 phan: lam diu noi tam, nghe nhau trong quan he than thiet, va dat mot nghi thuc gia dinh nho moi tuan.",
      date: daysFromNow(5),
      timeString: "20:00",
      location: "Zoom / PMTL_VN",
      type: "talk",
      speaker: "Ban bien tap PMTL",
      eventStatus: "upcoming",
      coverImage: media.lotusDawn.id,
    },
    {
      title: "Khoa tu mini 1 ngay: niem Phat va viet nhat ky tam",
      slug: "khoa-tu-mini-1-ngay-niem-phat-viet-nhat-ky",
      description: "Su kien online-offline ket hop de nguoi moi trai nghiem mot ngay song cham va co cau truc.",
      content: "Chu de xoay quanh mot nhip ngay gon: doc bai ngan, thoi khoa niem Phat, viet nhat ky va chia se kinh nghiem giu deu nep.",
      date: daysFromNow(12),
      timeString: "08:30",
      location: "TP. Ho Chi Minh",
      type: "retreat",
      speaker: "Nhom huong dan PMTL",
      eventStatus: "upcoming",
      coverImage: media.chantingCircle.id,
    },
    {
      title: "Tong ket livestream cau an dau thang",
      slug: "tong-ket-livestream-cau-an-dau-thang",
      description: "Su kien tong hop noi dung livestream va tai lieu tham khao cho nguoi bo lo phat truc tiep.",
      content: "Buoi recap nhan lai y chinh cua livestream: benh tat can su binh tinh, cau an la mot nep tro ve tam va gia dinh can ho tro nhau bang hanh dong cu the.",
      date: daysAgo(2),
      timeString: "19:30",
      location: "YouTube",
      type: "livestream",
      speaker: "PMTL_VN",
      eventStatus: "past",
      coverImage: media.libraryAltar.id,
    },
  ] as const;

  const events = [];

  for (const eventInput of eventInputs) {
    const event = await upsertByField({
      payload,
      collection: "events",
      field: "slug",
      value: eventInput.slug,
      data: {
        _status: "published",
        publicId: "",
        title: eventInput.title,
        slug: eventInput.slug,
        description: eventInput.description,
        content: wrapLexicalContent(eventInput.content),
        date: eventInput.date,
        timeString: eventInput.timeString,
        location: eventInput.location,
        type: eventInput.type,
        speaker: eventInput.speaker,
        language: "vi",
        link: "https://phapmontamlinh.vn/",
        embedURL: "https://www.youtube.com/",
        coverImage: eventInput.coverImage,
        gallery: [media.lotusDawn.id, media.chantingCircle.id],
        files: [media.libraryAltar.id],
        seo: {
          title: eventInput.title,
          description: eventInput.description,
        },
        eventStatus: eventInput.eventStatus,
      },
    });

    events.push(event);
  }

  const hubInputs = [
    {
      title: "Tu hoc can ban",
      slug: "tu-hoc-can-ban",
      description: "Cua vao cho nguoi moi: bai khai thi ngan, huong dan nhap mon, tai lieu co ban va mot thoi khoa nho.",
      visualTheme: "sand",
      menuLabel: "Nhap mon",
      menuIconName: "book-open",
      sortOrder: 1,
      curatedPosts: posts.slice(0, 4).map((post) => post.id),
      downloads: downloads.slice(0, 2).map((download) => download.id),
      coverImage: media.libraryAltar.id,
      blocks: [
        { type: "intro", title: "Bat dau that nhe", content: "Chi can chon mot bai ngan, mot ghi chu, mot nghi thuc 10 phut." },
        { type: "checklist", title: "3 buoc mo dau", content: "Doc, niem, ghi lai." },
      ],
    },
    {
      title: "Cau an va benh tat",
      slug: "cau-an-va-benh-tat",
      description: "Tong hop bai viet, su kien va checklist phu hop cho gia dinh dang co nguoi met hoac tri lieu.",
      visualTheme: "amber",
      menuLabel: "Cau an",
      menuIconName: "heart-handshake",
      sortOrder: 2,
      curatedPosts: posts.filter((post) => ["giu-nep-cau-an-thuc-te-khi-benh-tat", "5-mon-qua-tinh-than-giu-tam-an"].includes(String(post.slug))).map((post) => post.id),
      downloads: downloads.slice(0, 1).map((download) => download.id),
      coverImage: media.lotusDawn.id,
      blocks: [
        { type: "reminder", title: "Tam linh va doi song", content: "Giu tam binh tinh song song voi viec theo doi y khoa." },
        { type: "practice", title: "Nghi thuc 5 phut", content: "On tam, doc ngan, tri an." },
      ],
    },
    {
      title: "Gia dinh va cac moi quan he",
      slug: "gia-dinh-va-cac-moi-quan-he",
      description: "Khong gian danh cho viec lam diu xung dot, hoc lang nghe va xay lai nhung nep song nho trong nha.",
      visualTheme: "olive",
      menuLabel: "Gia dinh",
      menuIconName: "home",
      sortOrder: 3,
      curatedPosts: posts.filter((post) => ["bot-nong-trong-cac-moi-quan-he-than-thiet", "giu-nep-tri-an-cha-me", "nhan-duyen-sinh-con-va-chuan-bi-noi-tam"].includes(String(post.slug))).map((post) => post.id),
      downloads: downloads.slice(0, 1).map((download) => download.id),
      coverImage: media.libraryAltar.id,
      blocks: [
        { type: "insight", title: "Quan he can nhiep tam", content: "Neu tam gap, loi noi se gap theo." },
        { type: "routine", title: "Nhat ky gia dinh", content: "5 phut moi toi de noi dieu dang lo va dieu dang biet on." },
      ],
    },
    {
      title: "Niem chu va lich hanh tri",
      slug: "niem-chu-va-lich-hanh-tri",
      description: "Tong hop chant item, ke hoach 7 ngay, 21 ngay va cac ngay via can luu y.",
      visualTheme: "charcoal",
      menuLabel: "Niem chu",
      menuIconName: "sparkles",
      sortOrder: 4,
      curatedPosts: posts.filter((post) => ["21-ngay-niem-dai-bi-chu", "niem-kinh-buoi-sang-10-phut"].includes(String(post.slug))).map((post) => post.id),
      downloads: downloads.slice(1, 2).map((download) => download.id),
      coverImage: media.chantingCircle.id,
      blocks: [
        { type: "preset", title: "Preset de bat dau", content: "7, 14, 21 bien de theo kha nang." },
        { type: "calendar", title: "Theo ngay via", content: "Tang muc tieu vao nhung ngay ram, mung mot va ngay via dac biet." },
      ],
    },
  ] as const;

  const hubPages = [];

  for (const hubInput of hubInputs) {
    const hub = await upsertByField({
      payload,
      collection: "hubPages",
      field: "slug",
      value: hubInput.slug,
      data: {
        _status: "published",
        publicId: "",
        title: hubInput.title,
        slug: hubInput.slug,
        description: hubInput.description,
        coverImage: hubInput.coverImage,
        visualTheme: hubInput.visualTheme,
        blocks: hubInput.blocks,
        curatedPosts: hubInput.curatedPosts,
        downloads: hubInput.downloads,
        menuLabel: hubInput.menuLabel,
        menuIconName: hubInput.menuIconName,
        showInMenu: true,
        sortOrder: hubInput.sortOrder,
        seo: {
          title: hubInput.title,
          description: hubInput.description,
        },
      },
    });

    hubPages.push(hub);
  }

  return {
    categories,
    tags,
    posts,
    guides,
    downloads,
    events,
    hubPages,
  };
}

async function seedCommunity(payload: PayloadClient, input: {
  memberId: number | string;
  moderatorId: number | string;
  postIds: Array<number | string>;
  mediaId: number | string;
}) {
  const memberStory = await upsertByField({
    payload,
    collection: "communityPosts",
    field: "slug",
    value: "hanh-trinh-7-ngay-niem-dai-bi",
    data: {
      _status: "published",
      publicId: "",
      title: "Hanh trinh 7 ngay niem Dai Bi dau tien",
      slug: "hanh-trinh-7-ngay-niem-dai-bi",
      content:
        "Con bat dau tu muc 7 bien moi sang. Dieu thay ro nhat khong phai la het lo ngay, ma la minh biet dung lai som hon truoc khi phan ung.",
      type: "reflection",
      category: "niem-chu",
      rating: 5,
      tags: [{ value: "chu-dai-bi" }, { value: "nguoi-moi" }],
      coverImage: input.mediaId,
      authorUser: input.memberId,
      authorNameSnapshot: "Phat tu Thanh Tam",
      moderationStatus: "approved",
      spamScore: 0,
      reportCount: 0,
      commentsCount: 1,
      pinned: true,
      isHidden: false,
    },
  });

  const memberQuestion = await upsertByField({
    payload,
    collection: "communityPosts",
    field: "slug",
    value: "hoi-ve-cach-doc-kinh-khi-rat-ban",
    data: {
      _status: "published",
      publicId: "",
      title: "Hoi ve cach doc kinh khi lich lam viec rat ban",
      slug: "hoi-ve-cach-doc-kinh-khi-rat-ban",
      content:
        "Con muon giu nep doc kinh nhung gio giac chua deu. Co nen chia nho thanh 2 lan hay la giu mot khung rat ngan nhung co dinh?",
      type: "question",
      category: "cong-viec",
      rating: 4,
      tags: [{ value: "doc-kinh" }, { value: "su-nghiep" }],
      authorUser: input.memberId,
      authorNameSnapshot: "Phat tu Thanh Tam",
      moderationStatus: "approved",
      spamScore: 0,
      reportCount: 1,
      commentsCount: 1,
      lastReportReason: "Can bo sung them boi canh",
      pinned: false,
      isHidden: false,
    },
  });

  await upsertByField({
    payload,
    collection: "communityComments",
    field: "publicId",
    value: "seed-pmtl-community-comment-1",
    context: {
      skipCommunityCommentRecompute: true,
    },
    data: {
      publicId: "seed-pmtl-community-comment-1",
      post: memberStory.id,
      content: "Cach ghi nhan tam trang truoc va sau buoi niem la rat hay. Nho ban tiep tuc cap nhat them sau 21 ngay.",
      authorUser: input.moderatorId,
      authorNameSnapshot: "PMTL Dieu Phoi Cong Dong",
      moderationStatus: "approved",
      spamScore: 0,
      reportCount: 0,
      isHidden: false,
    },
  });

  await upsertByField({
    payload,
    collection: "communityComments",
    field: "publicId",
    value: "seed-pmtl-community-comment-2",
    context: {
      skipCommunityCommentRecompute: true,
    },
    data: {
      publicId: "seed-pmtl-community-comment-2",
      post: memberQuestion.id,
      content: "Nen giu mot khung rat ngan nhung co dinh truoc. Sau khi da deu roi moi tang them thoi luong.",
      authorUser: input.moderatorId,
      authorNameSnapshot: "PMTL Dieu Phoi Cong Dong",
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
    value: "seed-pmtl-guestbook-1",
    data: {
      publicId: "seed-pmtl-guestbook-1",
      authorName: "Dao huu Ngoc An",
      message: "Cam on PMTL_VN da sap xep noi dung theo chu de song. Nguoi moi vao doc de hon rat nhieu.",
      country: "Viet Nam",
      entryType: "message",
      questionCategory: "tri-an",
      approvalStatus: "approved",
      submittedByUser: input.memberId,
    },
  });

  const parentComment = await upsertByField({
    payload,
    collection: "postComments",
    field: "publicId",
    value: "seed-pmtl-post-comment-1",
    context: {
      skipPostCommentRecompute: true,
    },
    data: {
      publicId: "seed-pmtl-post-comment-1",
      post: input.postIds[0],
      content: "Bai nay de doc ma danh trung dung giai doan hien tai cua con. Phan 3 hoi tho truoc khi noi rat thuc te.",
      authorName: "Doc gia Mau 01",
      badge: "Thanh vien",
      isOfficialReply: false,
      submittedByUser: input.memberId,
      submittedByIpHash: "seed-ip-hash-member",
      moderationStatus: "approved",
      likes: 4,
      spamScore: 0,
      reportCount: 0,
      isHidden: false,
    },
  });

  await upsertByField({
    payload,
    collection: "postComments",
    field: "publicId",
    value: "seed-pmtl-post-comment-2",
    context: {
      skipPostCommentRecompute: true,
    },
    data: {
      publicId: "seed-pmtl-post-comment-2",
      post: input.postIds[0],
      parent: parentComment.id,
      content: "Ban bien tap da bo sung them mot bai lien quan trong hub Gia dinh, ban co the doc tiep de noi mach no ro hon.",
      authorName: "PMTL Moderator",
      badge: "Dieu phoi",
      isOfficialReply: true,
      submittedByUser: input.moderatorId,
      submittedByIpHash: "seed-ip-hash-moderator",
      moderationStatus: "approved",
      likes: 2,
      spamScore: 0,
      reportCount: 0,
      isHidden: false,
    },
  });

  return {
    communityPosts: [memberStory, memberQuestion],
  };
}

async function seedChanting(payload: PayloadClient, input: { memberId: number | string; mediaId: number | string; postIds: Array<number | string> }) {
  const chantInputs = [
    {
      title: "Dai Bi Chu",
      slug: "dai-bi-chu",
      kind: "mantra",
      openingPrayer: "Nguyen dem cong duc nay huong ve khap tat ca, nguoi benh kho duoc an tam.",
      content: "Nam mo ha ra da na da ra da da...",
      recommendedPresets: [
        { label: "Co ban", target: 7 },
        { label: "Thuc hanh deu", target: 21 },
      ],
    },
    {
      title: "Niem danh hieu A Di Da Phat",
      slug: "niem-danh-hieu-a-di-da-phat",
      kind: "chant",
      openingPrayer: "Xin cho tam con duoc on dinh va biet quay ve mot niem thanh tinh.",
      content: "Nam mo A Di Da Phat.",
      recommendedPresets: [
        { label: "Buoi sang", target: 108 },
        { label: "Buoi toi", target: 54 },
      ],
    },
    {
      title: "Khai kinh ngan truoc buoi doc",
      slug: "khai-kinh-ngan",
      kind: "opening",
      openingPrayer: "Xin mo long de tiep nhan y nghia kinh van.",
      content: "Vo thuong tham tham vi dieu phap...",
      recommendedPresets: [{ label: "1 lan", target: 1 }],
    },
    {
      title: "Hoi huong cuoi thoi",
      slug: "hoi-huong-cuoi-thoi",
      kind: "dedication",
      openingPrayer: "Ket thuc thoi khoa trong su tri an va nhe long.",
      content: "Nguyen dem cong duc nay...",
      recommendedPresets: [{ label: "Ket thuc", target: 1 }],
    },
  ] as const;

  const chantItems = [];

  for (const chantInput of chantInputs) {
    const chantItem = await upsertByField({
      payload,
      collection: "chantItems",
      field: "slug",
      value: chantInput.slug,
      data: {
        publicId: "",
        title: chantInput.title,
        slug: chantInput.slug,
        kind: chantInput.kind,
        openingPrayer: chantInput.openingPrayer,
        content: wrapLexicalContent(chantInput.content),
        scriptPreviewImages: [input.mediaId],
        recommendedPresets: chantInput.recommendedPresets,
        timeRules: [
          {
            dateFrom: daysAgo(10),
            dateTo: daysFromNow(30),
            lunarDay: 15,
            notes: "Khuyen khich tang muc do hanh tri vao ngay ram.",
          },
        ],
      },
    });

    chantItems.push(chantItem);
  }

  const morningPlan = await upsertByField({
    payload,
    collection: "chantPlans",
    field: "slug",
    value: "cong-phu-buoi-sang-an-dinh",
    data: {
      publicId: "",
      title: "Cong phu buoi sang an dinh",
      slug: "cong-phu-buoi-sang-an-dinh",
      planType: "daily",
      planItems: [
        { chantItem: chantItems[2]?.id, target: 1, isOptional: false },
        { chantItem: chantItems[0]?.id, target: 7, isOptional: false },
        { chantItem: chantItems[3]?.id, target: 1, isOptional: false },
      ],
    },
  });

  const eveningPlan = await upsertByField({
    payload,
    collection: "chantPlans",
    field: "slug",
    value: "buoi-toi-giu-nep-binh-an",
    data: {
      publicId: "",
      title: "Buoi toi giu nep binh an",
      slug: "buoi-toi-giu-nep-binh-an",
      planType: "daily",
      planItems: [
        { chantItem: chantItems[1]?.id, target: 54, isOptional: false },
        { chantItem: chantItems[3]?.id, target: 1, isOptional: true },
      ],
    },
  });

  const lunarEventInputs = [
    {
      title: "Mung mot hang thang",
      publicId: "seed-pmtl-lunar-event-01",
      lunarMonth: undefined,
      lunarDay: 1,
      eventType: "monthly-reset",
      priority: 1,
    },
    {
      title: "Ngay ram hang thang",
      publicId: "seed-pmtl-lunar-event-02",
      lunarMonth: undefined,
      lunarDay: 15,
      eventType: "monthly-focus",
      priority: 2,
    },
    {
      title: "Via Quan The Am",
      publicId: "seed-pmtl-lunar-event-03",
      lunarMonth: 2,
      lunarDay: 19,
      eventType: "special-day",
      priority: 3,
    },
  ] as const;

  const lunarEvents = [];

  for (const lunarEventInput of lunarEventInputs) {
    const lunarEvent = await upsertByField({
      payload,
      collection: "lunarEvents",
      field: "publicId",
      value: lunarEventInput.publicId,
      data: {
        publicId: lunarEventInput.publicId,
        title: lunarEventInput.title,
        recurrenceData: {
          lunarMonth: lunarEventInput.lunarMonth,
          lunarDay: lunarEventInput.lunarDay,
          isLeapMonth: false,
        },
        eventType: lunarEventInput.eventType,
        priority: lunarEventInput.priority,
        relatedPosts: input.postIds.slice(0, 2),
      },
    });

    lunarEvents.push(lunarEvent);
  }

  await upsertByField({
    payload,
    collection: "lunarEventOverrides",
    field: "publicId",
    value: "seed-pmtl-lunar-override-01",
    data: {
      publicId: "seed-pmtl-lunar-override-01",
      lunarEvent: lunarEvents[1]?.id,
      chantItem: chantItems[0]?.id,
      mode: "append",
      target: 21,
      max: 21,
      priority: 2,
      note: "Ngay ram tang muc tieu Dai Bi Chu de giu nhiep tam.",
    },
  });

  await upsertByField({
    payload,
    collection: "lunarEventOverrides",
    field: "publicId",
    value: "seed-pmtl-lunar-override-02",
    data: {
      publicId: "seed-pmtl-lunar-override-02",
      lunarEvent: lunarEvents[2]?.id,
      chantItem: chantItems[1]?.id,
      mode: "replace",
      target: 108,
      max: 108,
      priority: 3,
      note: "Ngay via dac biet uu tien niem danh hieu A Di Da Phat.",
    },
  });

  await upsertByField({
    payload,
    collection: "chantPreferences",
    field: "publicId",
    value: "seed-pmtl-chant-preference-01",
    data: {
      publicId: "seed-pmtl-chant-preference-01",
      user: input.memberId,
      plan: morningPlan.id,
      enabledOptionalItems: chantItems[3]?.id ? [{ chantItem: chantItems[3].id }] : [],
      targetsByItem: [
        { chantItem: chantItems[0]?.id, target: 7 },
        { chantItem: chantItems[1]?.id, target: 54 },
      ],
      intentionsByItem: [
        { chantItem: chantItems[0]?.id, intention: "Cau binh an cho gia dinh va nguoi dang benh." },
        { chantItem: chantItems[1]?.id, intention: "On dinh tam va giam tan loan khi lam viec." },
      ],
    },
  });

  await upsertByField({
    payload,
    collection: "practiceLogs",
    field: "publicId",
    value: "seed-pmtl-practice-log-01",
    data: {
      publicId: "seed-pmtl-practice-log-01",
      user: input.memberId,
      plan: morningPlan.id,
      practiceDate: daysAgo(1),
      itemStates: [
        { chantItem: chantItems[2]?.id, completed: true, count: 1 },
        { chantItem: chantItems[0]?.id, completed: true, count: 7 },
        { chantItem: chantItems[3]?.id, completed: true, count: 1 },
      ],
      sessionConfig: {
        durationMinutes: 18,
        notes: "Buoi thuc hanh co tam on hon sau khi ghi lai y nguyen truoc khi niem.",
      },
      startedAt: daysAgo(1),
      completedAt: daysAgo(1),
      isCompleted: true,
    },
  });

  await upsertByField({
    payload,
    collection: "practiceLogs",
    field: "publicId",
    value: "seed-pmtl-practice-log-02",
    data: {
      publicId: "seed-pmtl-practice-log-02",
      user: input.memberId,
      plan: eveningPlan.id,
      practiceDate: daysAgo(0),
      itemStates: [
        { chantItem: chantItems[1]?.id, completed: true, count: 54 },
        { chantItem: chantItems[3]?.id, completed: true, count: 1 },
      ],
      sessionConfig: {
        durationMinutes: 22,
        notes: "Buoi toi thuc hanh sau gio lam de diu tam.",
      },
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      isCompleted: true,
    },
  });

  return {
    chantItems,
    chantPlans: [morningPlan, eveningPlan],
    lunarEvents,
  };
}

async function seedSutra(payload: PayloadClient, input: {
  memberId: number | string;
  tagId: number | string;
}) {
  const sutra = await upsertByField({
    payload,
    collection: "sutras",
    field: "slug",
    value: "kinh-a-di-da",
    data: {
      _status: "published",
      publicId: "",
      title: "Kinh A Di Da",
      slug: "kinh-a-di-da",
      description: "Ban kinh mau cho khu vuc reader, glossary va reading progress trong admin.",
      shortExcerpt: "Nhat tam huong ve Tay Phuong de giu noi tam sang va an.",
      translator: "Ban dich PMTL seed",
      reviewer: "PMTL Bien Tap",
      tags: [input.tagId],
      isFeatured: true,
      sortOrder: 1,
    },
  });

  const volume = await upsertByField({
    payload,
    collection: "sutraVolumes",
    field: "publicId",
    value: "seed-pmtl-sutra-volume-01",
    data: {
      publicId: "seed-pmtl-sutra-volume-01",
      sutra: sutra.id,
      title: "Quyen 1",
      volumeNumber: 1,
      sortOrder: 1,
      description: "Quyen mo dau gom cac doan can ban phuc vu reader demo.",
    },
  });

  const chapterOne = await upsertByField({
    payload,
    collection: "sutraChapters",
    field: "slug",
    value: "kinh-a-di-da-chuong-mo-dau",
    data: {
      _status: "published",
      publicId: "",
      sutra: sutra.id,
      volume: volume.id,
      title: "Chuong mo dau",
      slug: "kinh-a-di-da-chuong-mo-dau",
      chapterNumber: 1,
      content: wrapLexicalContent("Nhu thi nga van. Nhat thoi Phat tai Xa Ve Quoc, Ky Thu Cap Co Doc vien..."),
      openingText: "Nam mo A Di Da Phat.",
      endingText: "Het chuong mo dau.",
      sortOrder: 1,
    },
  });

  const chapterTwo = await upsertByField({
    payload,
    collection: "sutraChapters",
    field: "slug",
    value: "kinh-a-di-da-chuong-quan-tuong",
    data: {
      _status: "published",
      publicId: "",
      sutra: sutra.id,
      volume: volume.id,
      title: "Chuong quan tuong",
      slug: "kinh-a-di-da-chuong-quan-tuong",
      chapterNumber: 2,
      content: wrapLexicalContent("Xa Loi Phat, tu phuong chung sinh van gia..."),
      openingText: "Tiep noi mach doc kinh.",
      endingText: "Het chuong quan tuong.",
      sortOrder: 2,
    },
  });

  await upsertByField({
    payload,
    collection: "sutraGlossary",
    field: "publicId",
    value: "seed-pmtl-sutra-glossary-01",
    data: {
      publicId: "seed-pmtl-sutra-glossary-01",
      sutra: sutra.id,
      volume: volume.id,
      chapter: chapterOne.id,
      term: "Nhat tam",
      meaning: "Trang thai tam co mot diem quy huong, biet quay ve va khong de tan loan keo di qua xa.",
      sortOrder: 1,
      markerKey: "nhat-tam",
    },
  });

  await upsertByField({
    payload,
    collection: "sutraGlossary",
    field: "publicId",
    value: "seed-pmtl-sutra-glossary-02",
    data: {
      publicId: "seed-pmtl-sutra-glossary-02",
      sutra: sutra.id,
      volume: volume.id,
      chapter: chapterTwo.id,
      term: "Tay Phuong",
      meaning: "Bieu tuong cua noi quy huong thanh tinh trong truyen thong Tinh do.",
      sortOrder: 2,
      markerKey: "tay-phuong",
    },
  });

  await upsertByField({
    payload,
    collection: "sutraBookmarks",
    field: "publicId",
    value: "seed-pmtl-sutra-bookmark-01",
    data: {
      publicId: "seed-pmtl-sutra-bookmark-01",
      user: input.memberId,
      sutra: sutra.id,
      location: {
        chapter: chapterOne.id,
        paragraph: "p-2",
      },
      excerpt: "Nhu thi nga van...",
      note: "Danh dau doan muon doc lai trong buoi toi.",
    },
  });

  await upsertByField({
    payload,
    collection: "sutraReadingProgress",
    field: "publicId",
    value: "seed-pmtl-sutra-progress-01",
    data: {
      publicId: "seed-pmtl-sutra-progress-01",
      user: input.memberId,
      sutra: sutra.id,
      location: {
        chapter: chapterTwo.id,
        paragraph: "p-1",
      },
      scrollPercent: 62,
      lastReadAt: new Date().toISOString(),
    },
  });

  return {
    sutra,
    volume,
    chapters: [chapterOne, chapterTwo],
  };
}

async function seedSystem(payload: PayloadClient, input: {
  memberId: number | string;
  moderatorId: number | string;
  communityPostId: number | string;
  postId: number | string;
}) {
  await upsertByField({
    payload,
    collection: "pushSubscriptions",
    field: "publicId",
    value: "seed-pmtl-push-subscription-01",
    data: {
      publicId: "seed-pmtl-push-subscription-01",
      user: input.memberId,
      endpoint: "https://push.example.test/subscriptions/pmtl-member-01",
      keys: {
        p256dh: "seed-p256dh-key",
        auth: "seed-auth-key",
      },
      timezone: "Asia/Ho_Chi_Minh",
      isActive: true,
      failedCount: 0,
      notificationPrefs: {
        posts: true,
        events: true,
        community: true,
      },
      quietHours: {
        from: "22:00",
        to: "06:00",
      },
      lastSentAt: daysAgo(1),
      lastError: "",
    },
  });

  await upsertByField({
    payload,
    collection: "pushJobs",
    field: "publicId",
    value: "seed-pmtl-push-job-01",
    data: {
      publicId: "seed-pmtl-push-job-01",
      kind: "content_update",
      status: "completed",
      chunkSize: 100,
      message: "Cap nhat hub Niem chu va bai moi ve cau an da san sang.",
      url: "/hub/niem-chu-va-lich-hanh-tri",
      tag: "pmtl-seed-content-update",
      payload: {
        title: "PMTL_VN",
        body: "Da co them bai moi va lich hanh tri trong thu vien PMTL_VN.",
        recipientRoles: ["member"],
        excludeUserIds: [String(input.moderatorId)],
      },
      cursor: 1,
      sentCount: 1,
      failedCount: 0,
      startedAt: daysAgo(1),
      finishedAt: daysAgo(1),
    },
  });

  await upsertByField({
    payload,
    collection: "moderationReports",
    field: "publicId",
    value: "seed-pmtl-moderation-report-01",
    data: {
      publicId: "seed-pmtl-moderation-report-01",
      entityType: "communityPost",
      entityPublicId: "seed-community-post-review-01",
      status: "pending",
      entityRef: {
        collection: "communityPosts",
        id: String(input.communityPostId),
      },
      reason: "Can kiem tra them ve ngu canh cau hoi de gan category dung hon.",
      notes: "Du lieu mau de test moderation inbox.",
      reporterUser: input.memberId,
      reporterIpHash: "seed-report-ip-hash",
    },
  });

  await upsertByField({
    payload,
    collection: "auditLogs",
    field: "publicId",
    value: "seed-pmtl-audit-log-01",
    data: {
      publicId: "seed-pmtl-audit-log-01",
      action: "seed.pmtl.completed",
      actorType: "system",
      targetType: "post",
      actorUser: input.moderatorId,
      targetPublicId: "seed-post-audit-target",
      targetRef: {
        collection: "posts",
        id: String(input.postId),
      },
      requestId: "seed-pmtl-request-01",
      ipHash: "seed-audit-ip-hash",
      userAgent: "seed-script/1.0",
      changedFields: [{ field: "title" }, { field: "excerptOverride" }, { field: "tags" }],
      metadata: {
        reason: "Initial PMTL seed import",
        importedAt: new Date().toISOString(),
      },
    },
  });

  await upsertByField({
    payload,
    collection: "requestGuards",
    field: "guardKey",
    value: "seed:pmtl:guestbook:daily",
    data: {
      guardKey: "seed:pmtl:guestbook:daily",
      scope: "guestbook.submit",
      notes: "Request guard mau cho guestbook de test admin system tables.",
      expiresAt: daysFromNow(30),
      lastSeenAt: new Date().toISOString(),
      hits: 3,
    },
  });
}

async function main() {
  const payload = await getPayload({ config });
  const shouldReset = process.argv.includes("--reset");

  if (shouldReset) {
    logger.info("Resetting PMTL seed collections before reseeding");
    await resetSeedCollections(payload);
  }

  logger.info("Seeding PMTL globals");
  await seedGlobals(payload);

  logger.info("Seeding PMTL media");
  const media = await seedMedia(payload);

  logger.info("Seeding PMTL users");
  const users = await seedUsers(payload, media.lotusDawn.id);
  const memberId = getDocumentId(users.member, "member user");
  const moderatorId = getDocumentId(users.moderator, "moderator user");

  logger.info("Seeding PMTL editorial content");
  const editorial = await seedEditorial(payload, media);
  const firstPost = getRequiredValue(editorial.posts[0], "first editorial post");
  const secondEditorialPost = getRequiredValue(editorial.posts[1], "second editorial post");
  const thirdEditorialPost = getRequiredValue(editorial.posts[2], "third editorial post");
  const docKinhTag = getRequiredValue(editorial.tags.get("doc-kinh"), "doc-kinh tag");

  logger.info("Seeding PMTL community");
  const community = await seedCommunity(payload, {
    memberId,
    moderatorId,
    postIds: [getDocumentId(firstPost, "first editorial post"), getDocumentId(secondEditorialPost, "second editorial post")],
    mediaId: media.chantingCircle.id,
  });
  const secondCommunityPost = getRequiredValue(community.communityPosts[1], "second community post");

  logger.info("Seeding PMTL chanting");
  const chanting = await seedChanting(payload, {
    memberId,
    mediaId: media.chantingCircle.id,
    postIds: [
      getDocumentId(firstPost, "first editorial post"),
      getDocumentId(secondEditorialPost, "second editorial post"),
      getDocumentId(thirdEditorialPost, "third editorial post"),
    ],
  });

  logger.info("Seeding PMTL sutra library");
  const sutra = await seedSutra(payload, {
    memberId,
    tagId: getDocumentId(docKinhTag, "doc-kinh tag"),
  });

  logger.info("Seeding PMTL system records");
  await seedSystem(payload, {
    memberId,
    moderatorId,
    communityPostId: getDocumentId(secondCommunityPost, "second community post"),
    postId: getDocumentId(firstPost, "first editorial post"),
  });

  process.stdout.write(
    `${JSON.stringify(
      {
        ok: true,
        credentials: {
          superAdmin: { email: "admin@pmtl.local", password: "PmtlAdmin!123" },
          admin: { email: "ops@pmtl.local", password: "PmtlOps!123" },
          editor: { email: "editor@pmtl.local", password: "PmtlEditor!123" },
          moderator: { email: "moderator@pmtl.local", password: "PmtlModerator!123" },
          member: { email: "member@pmtl.local", password: "PmtlMember!123" },
        },
        seeded: {
          media: 3,
          users: 5,
          categories: editorial.categories.size,
          tags: editorial.tags.size,
          posts: editorial.posts.length,
          beginnerGuides: editorial.guides.length,
          downloads: editorial.downloads.length,
          hubPages: editorial.hubPages.length,
          events: editorial.events.length,
          communityPosts: community.communityPosts.length,
          chantItems: chanting.chantItems.length,
          chantPlans: chanting.chantPlans.length,
          lunarEvents: chanting.lunarEvents.length,
          sutraChapters: sutra.chapters.length,
        },
      },
      null,
      2,
    )}\n`,
  );
}

void main().catch((error) => {
  logger.error(withError(undefined, error), "PMTL seed failed");
  process.exit(1);
});
