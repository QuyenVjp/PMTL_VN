/**
 * AdminMediaService Unit Tests (Plans.md task 4.5)
 *
 * Coverage:
 * - upload(): emits media.upload audit + returns upload envelope
 * - createFolder()/updateFolder()/deleteFolder(): emit audit inside a transaction
 * - updateMetadata(): emits the NEW media.metadata.update audit (the gap being fixed)
 * - moveToFolder(): emits media.folder.move_asset inside a transaction
 * - softDelete(): emits media.delete inside a transaction
 * - NotFound throws for missing asset/folder
 * - rollback: a transactional write rejects when the audit append throws (atomicity)
 * - response envelope shapes preserved exactly (list pagination, folder shape)
 * - honest actor: audit receives the external publicId, never the internal cuid
 */

import { Test, TestingModule } from "@nestjs/testing";
import { AdminMediaService } from "../admin-media.service.js";
import { MediaAssetsRepository } from "../media-assets.repository.js";
import { MediaFoldersRepository } from "../media-folders.repository.js";
import { StorageService } from "../storage.service.js";
import { AuditService, type AuditContext } from "../../audit/audit.service.js";
import { NotFoundError } from "../../../common/errors/app-error.js";

/** Fake transaction client handed to callbacks — real Prisma is never touched in unit tests. */
const FAKE_TX = { __tx: true } as const;

/** AuditContext fixture: canonical actor is the external publicId, never the internal cuid. */
const auditCtx: AuditContext = {
  actorId: "admin_pub_1",
  actorType: "admin",
  ipAddress: "203.0.113.5",
  userAgent: "vitest",
};

describe("AdminMediaService", () => {
  let service: AdminMediaService;
  let assetsMock: {
    runInTransaction: ReturnType<typeof vi.fn>;
    listAssets: ReturnType<typeof vi.fn>;
    findDetailByPublicId: ReturnType<typeof vi.fn>;
    findContentByPublicId: ReturnType<typeof vi.fn>;
    findForMove: ReturnType<typeof vi.fn>;
    findByPublicId: ReturnType<typeof vi.fn>;
    updateMetadata: ReturnType<typeof vi.fn>;
    updateStatus: ReturnType<typeof vi.fn>;
  };
  let foldersMock: {
    runInTransaction: ReturnType<typeof vi.fn>;
    listFolders: ReturnType<typeof vi.fn>;
    findFolderRefByPublicId: ReturnType<typeof vi.fn>;
    findFolderForDelete: ReturnType<typeof vi.fn>;
    findFolderIdWithCount: ReturnType<typeof vi.fn>;
    nextFolderSlug: ReturnType<typeof vi.fn>;
    createFolder: ReturnType<typeof vi.fn>;
    updateFolder: ReturnType<typeof vi.fn>;
    deleteFolder: ReturnType<typeof vi.fn>;
    createCollectionItem: ReturnType<typeof vi.fn>;
    deleteAssetFolderLinks: ReturnType<typeof vi.fn>;
  };
  let storageMock: {
    uploadFile: ReturnType<typeof vi.fn>;
    resolveAssetUrl: ReturnType<typeof vi.fn>;
  };
  let auditMock: {
    append: ReturnType<typeof vi.fn>;
    appendInTransaction: ReturnType<typeof vi.fn>;
  };

  const assetRow = {
    publicId: "asset_pub_1",
    filename: "kinh-sang.jpg",
    mimeType: "image/jpeg",
    size: 12345,
    storageKey: "images/asset_pub_1.jpg",
    url: "https://cdn/asset_pub_1.jpg",
    width: 800,
    height: 600,
    status: "READY" as const,
    uploaderId: "uploader_cuid",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    uploader: { publicId: "uploader_pub_1", displayName: "Quản trị viên" },
  };

  const folderRow = {
    publicId: "folder_pub_1",
    title: "Ảnh kinh sách",
    slug: "anh-kinh-sach",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-02T00:00:00.000Z"),
  };

  beforeEach(async () => {
    assetsMock = {
      runInTransaction: vi.fn(async (fn: (tx: unknown) => unknown) => fn(FAKE_TX)),
      listAssets: vi.fn().mockResolvedValue({ assets: [], total: 0 }),
      findDetailByPublicId: vi.fn(),
      findContentByPublicId: vi.fn(),
      findForMove: vi.fn(),
      findByPublicId: vi.fn(),
      updateMetadata: vi.fn().mockResolvedValue(undefined),
      updateStatus: vi.fn().mockResolvedValue(undefined),
    };

    foldersMock = {
      runInTransaction: vi.fn(async (fn: (tx: unknown) => unknown) => fn(FAKE_TX)),
      listFolders: vi.fn().mockResolvedValue([]),
      findFolderRefByPublicId: vi.fn(),
      findFolderForDelete: vi.fn(),
      findFolderIdWithCount: vi.fn(),
      nextFolderSlug: vi.fn(async (base: string) => base),
      createFolder: vi.fn(),
      updateFolder: vi.fn(),
      deleteFolder: vi.fn().mockResolvedValue(undefined),
      createCollectionItem: vi.fn().mockResolvedValue(undefined),
      deleteAssetFolderLinks: vi.fn().mockResolvedValue(undefined),
    };

    storageMock = {
      uploadFile: vi.fn(),
      resolveAssetUrl: vi.fn().mockResolvedValue(null),
    };

    auditMock = {
      append: vi.fn().mockResolvedValue(undefined),
      appendInTransaction: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminMediaService,
        { provide: MediaAssetsRepository, useValue: assetsMock },
        { provide: MediaFoldersRepository, useValue: foldersMock },
        { provide: StorageService, useValue: storageMock },
        { provide: AuditService, useValue: auditMock },
      ],
    }).compile();

    service = module.get<AdminMediaService>(AdminMediaService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ─── upload() ────────────────────────────────────────────────────────────────

  describe("upload()", () => {
    it("stores the file, emits a media.upload audit, and returns the upload envelope", async () => {
      storageMock.uploadFile.mockResolvedValue(assetRow);

      const result = await service.upload(
        {
          buffer: Buffer.from("bytes"),
          originalname: "kinh-sang.jpg",
          mimetype: "image/jpeg",
          uploaderId: "uploader_cuid",
        },
        auditCtx,
      );

      expect(storageMock.uploadFile).toHaveBeenCalledWith(
        expect.any(Buffer),
        "kinh-sang.jpg",
        "image/jpeg",
        "uploader_cuid",
      );
      expect(auditMock.append).toHaveBeenCalledWith(
        auditCtx,
        "media.upload",
        "media_asset",
        "asset_pub_1",
        { filename: "kinh-sang.jpg", mimeType: "image/jpeg", size: 12345 },
      );
      expect(result).toEqual({
        data: {
          publicId: "asset_pub_1",
          url: "https://cdn/asset_pub_1.jpg",
          filename: "kinh-sang.jpg",
          mimeType: "image/jpeg",
          size: 12345,
        },
      });
    });

    it("attaches the asset to a folder when folderPublicId is provided", async () => {
      storageMock.uploadFile.mockResolvedValue(assetRow);
      foldersMock.findFolderIdWithCount.mockResolvedValue({ id: "folder_cuid", itemCount: 2 });

      await service.upload(
        {
          buffer: Buffer.from("bytes"),
          originalname: "kinh-sang.jpg",
          mimetype: "image/jpeg",
          uploaderId: "uploader_cuid",
          folderPublicId: "folder_pub_1",
        },
        auditCtx,
      );

      expect(foldersMock.findFolderIdWithCount).toHaveBeenCalledWith("folder_pub_1");
      const itemArg = foldersMock.createCollectionItem.mock.calls[0][0];
      expect(itemArg.collectionId).toBe("folder_cuid");
      expect(itemArg.mediaAssetId).toBe(assetRow.publicId === undefined ? undefined : itemArg.mediaAssetId); // present
      expect(itemArg.itemType).toBe("IMAGE");
      expect(itemArg.sortOrder).toBe(3);
      expect(itemArg.publicId).toHaveLength(21);
    });

    it("throws NotFound when the target folder does not exist", async () => {
      storageMock.uploadFile.mockResolvedValue(assetRow);
      foldersMock.findFolderIdWithCount.mockResolvedValue(null);

      await expect(
        service.upload(
          {
            buffer: Buffer.from("bytes"),
            originalname: "kinh-sang.jpg",
            mimetype: "image/jpeg",
            uploaderId: "uploader_cuid",
            folderPublicId: "missing_folder",
          },
          auditCtx,
        ),
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ─── createFolder() ────────────────────────────────────────────────────────────

  describe("createFolder()", () => {
    it("writes a media.folder.create audit event in the same transaction", async () => {
      foldersMock.nextFolderSlug.mockResolvedValue("anh-kinh-sach");
      foldersMock.createFolder.mockResolvedValue(folderRow);

      const result = await service.createFolder(
        { name: "Ảnh kinh sách" },
        "creator_cuid",
        auditCtx,
      );

      expect(foldersMock.runInTransaction).toHaveBeenCalledTimes(1);
      expect(foldersMock.createFolder.mock.calls[0][1]).toBe(FAKE_TX);
      expect(auditMock.appendInTransaction).toHaveBeenCalledWith(
        FAKE_TX,
        auditCtx,
        "media.folder.create",
        "media_collection",
        "folder_pub_1",
        { title: "Ảnh kinh sách", slug: "anh-kinh-sach" },
      );
      // folder envelope shape preserved exactly
      expect(result).toEqual({
        data: {
          publicId: "folder_pub_1",
          name: "Ảnh kinh sách",
          slug: "anh-kinh-sach",
          itemCount: 0,
          createdAt: folderRow.createdAt,
          updatedAt: folderRow.updatedAt,
        },
      });
      // createFolder received a 21-char public id + the internal creator id
      const createArg = foldersMock.createFolder.mock.calls[0][0];
      expect(createArg.publicId).toHaveLength(21);
      expect(createArg.createdById).toBe("creator_cuid");
    });
  });

  // ─── updateFolder() ────────────────────────────────────────────────────────────

  describe("updateFolder()", () => {
    it("writes a media.folder.update audit event in the same transaction", async () => {
      foldersMock.findFolderRefByPublicId.mockResolvedValue({ id: "folder_cuid" });
      foldersMock.nextFolderSlug.mockResolvedValue("ten-moi");
      foldersMock.updateFolder.mockResolvedValue({
        ...folderRow,
        title: "Tên mới",
        slug: "ten-moi",
        _count: { items: 4 },
      });

      const result = await service.updateFolder(
        "folder_pub_1",
        { name: "Tên mới" },
        auditCtx,
      );

      expect(foldersMock.runInTransaction).toHaveBeenCalledTimes(1);
      expect(foldersMock.updateFolder.mock.calls[0][2]).toBe(FAKE_TX);
      expect(auditMock.appendInTransaction).toHaveBeenCalledWith(
        FAKE_TX,
        auditCtx,
        "media.folder.update",
        "media_collection",
        "folder_pub_1",
        { title: "Tên mới", slug: "ten-moi" },
      );
      expect(result.data.itemCount).toBe(4);
      expect(result.data.name).toBe("Tên mới");
    });

    it("throws NotFound when the folder does not exist", async () => {
      foldersMock.findFolderRefByPublicId.mockResolvedValue(null);
      await expect(
        service.updateFolder("nope", { name: "x" }, auditCtx),
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ─── deleteFolder() ────────────────────────────────────────────────────────────

  describe("deleteFolder()", () => {
    it("writes a media.folder.delete audit event in the same transaction", async () => {
      foldersMock.findFolderForDelete.mockResolvedValue({
        publicId: "folder_pub_1",
        title: "Ảnh kinh sách",
      });

      const result = await service.deleteFolder("folder_pub_1", auditCtx);

      expect(foldersMock.runInTransaction).toHaveBeenCalledTimes(1);
      expect(foldersMock.deleteFolder.mock.calls[0][1]).toBe(FAKE_TX);
      expect(auditMock.appendInTransaction).toHaveBeenCalledWith(
        FAKE_TX,
        auditCtx,
        "media.folder.delete",
        "media_collection",
        "folder_pub_1",
        { title: "Ảnh kinh sách" },
      );
      expect(result).toEqual({ data: { publicId: "folder_pub_1", deleted: true } });
    });

    it("throws NotFound when the folder does not exist", async () => {
      foldersMock.findFolderForDelete.mockResolvedValue(null);
      await expect(service.deleteFolder("nope", auditCtx)).rejects.toThrow(NotFoundError);
    });
  });

  // ─── updateMetadata() — the audit GAP being fixed ────────────────────────────────

  describe("updateMetadata()", () => {
    it("writes the NEW media.metadata.update audit event in the same transaction", async () => {
      assetsMock.findByPublicId.mockResolvedValue({ ...assetRow, metadata: { altText: "cũ" } });

      const result = await service.updateMetadata(
        "asset_pub_1",
        { altText: "mới", caption: "chú thích" },
        auditCtx,
      );

      expect(assetsMock.runInTransaction).toHaveBeenCalledTimes(1);
      // merged metadata is persisted through the tx
      expect(assetsMock.updateMetadata).toHaveBeenCalledWith(
        "asset_pub_1",
        { altText: "mới", caption: "chú thích" },
        FAKE_TX,
      );
      // NEW audit action emitted in the SAME tx
      expect(auditMock.appendInTransaction).toHaveBeenCalledWith(
        FAKE_TX,
        auditCtx,
        "media.metadata.update",
        "media_asset",
        "asset_pub_1",
        expect.objectContaining({ fields: expect.arrayContaining(["altText", "caption"]) }),
      );
      expect(result).toEqual({ data: { publicId: "asset_pub_1", updated: true } });
    });

    it("throws NotFound when the asset does not exist", async () => {
      assetsMock.findByPublicId.mockResolvedValue(null);
      await expect(
        service.updateMetadata("nope", { altText: "x" }, auditCtx),
      ).rejects.toThrow(NotFoundError);
    });

    it("rolls back the write when the audit append fails (atomicity)", async () => {
      assetsMock.findByPublicId.mockResolvedValue({ ...assetRow, metadata: {} });
      auditMock.appendInTransaction.mockRejectedValueOnce(new Error("audit chain write failed"));

      await expect(
        service.updateMetadata("asset_pub_1", { altText: "x" }, auditCtx),
      ).rejects.toThrow("audit chain write failed");
    });
  });

  // ─── moveToFolder() ──────────────────────────────────────────────────────────────

  describe("moveToFolder()", () => {
    it("moves the asset into a folder and emits media.folder.move_asset in a transaction", async () => {
      assetsMock.findForMove.mockResolvedValue({
        id: "asset_cuid",
        filename: "kinh-sang.jpg",
        mimeType: "image/jpeg",
      });
      foldersMock.findFolderIdWithCount.mockResolvedValue({ id: "folder_cuid", itemCount: 1 });

      const result = await service.moveToFolder(
        "asset_pub_1",
        { folderPublicId: "folder_pub_1" },
        auditCtx,
      );

      expect(foldersMock.runInTransaction).toHaveBeenCalledTimes(1);
      expect(foldersMock.deleteAssetFolderLinks).toHaveBeenCalledWith("asset_cuid", FAKE_TX);
      expect(foldersMock.createCollectionItem.mock.calls[0][1]).toBe(FAKE_TX);
      expect(auditMock.appendInTransaction).toHaveBeenCalledWith(
        FAKE_TX,
        auditCtx,
        "media.folder.move_asset",
        "media_asset",
        "asset_pub_1",
        { filename: "kinh-sang.jpg", folderPublicId: "folder_pub_1" },
      );
      expect(result).toEqual({ data: { publicId: "asset_pub_1", folderPublicId: "folder_pub_1" } });
    });

    it("detaches the asset (folderPublicId null) without creating an item", async () => {
      assetsMock.findForMove.mockResolvedValue({
        id: "asset_cuid",
        filename: "kinh-sang.jpg",
        mimeType: "image/jpeg",
      });

      const result = await service.moveToFolder("asset_pub_1", {}, auditCtx);

      expect(foldersMock.deleteAssetFolderLinks).toHaveBeenCalledWith("asset_cuid", FAKE_TX);
      expect(foldersMock.createCollectionItem).not.toHaveBeenCalled();
      expect(auditMock.appendInTransaction).toHaveBeenCalledWith(
        FAKE_TX,
        auditCtx,
        "media.folder.move_asset",
        "media_asset",
        "asset_pub_1",
        { filename: "kinh-sang.jpg", folderPublicId: null },
      );
      expect(result).toEqual({ data: { publicId: "asset_pub_1", folderPublicId: null } });
    });

    it("throws NotFound when the asset does not exist", async () => {
      assetsMock.findForMove.mockResolvedValue(null);
      await expect(
        service.moveToFolder("nope", { folderPublicId: "f" }, auditCtx),
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ─── softDelete() ────────────────────────────────────────────────────────────────

  describe("softDelete()", () => {
    it("marks the asset DELETED and emits media.delete in a transaction", async () => {
      assetsMock.findByPublicId.mockResolvedValue(assetRow);

      const result = await service.softDelete("asset_pub_1", auditCtx);

      expect(assetsMock.runInTransaction).toHaveBeenCalledTimes(1);
      expect(assetsMock.updateStatus).toHaveBeenCalledWith("asset_pub_1", "DELETED", FAKE_TX);
      expect(auditMock.appendInTransaction).toHaveBeenCalledWith(
        FAKE_TX,
        auditCtx,
        "media.delete",
        "media_asset",
        "asset_pub_1",
        { filename: "kinh-sang.jpg", mimeType: "image/jpeg" },
      );
      expect(result).toEqual({ data: { publicId: "asset_pub_1", deleted: true } });
    });

    it("throws NotFound when the asset does not exist", async () => {
      assetsMock.findByPublicId.mockResolvedValue(null);
      await expect(service.softDelete("nope", auditCtx)).rejects.toThrow(NotFoundError);
    });
  });

  // ─── list() envelope ─────────────────────────────────────────────────────────────

  describe("list() pagination envelope", () => {
    it("returns { items, pagination } with hasMore + resolved urls", async () => {
      assetsMock.listAssets.mockResolvedValue({ assets: [assetRow], total: 25 });
      storageMock.resolveAssetUrl.mockResolvedValue("https://cdn/resolved.jpg");

      const result = await service.list({ limit: 20, offset: 0 });

      // Phase 4.2 batch 3a: canary list shape (no legacy { data, meta.pagination }).
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual({
        publicId: "asset_pub_1",
        filename: "kinh-sang.jpg",
        mimeType: "image/jpeg",
        size: 12345,
        url: "https://cdn/resolved.jpg",
        width: 800,
        height: 600,
        status: "READY",
        uploaderPublicId: "uploader_pub_1",
        uploaderName: "Quản trị viên",
        createdAt: assetRow.createdAt,
        updatedAt: assetRow.updatedAt,
      });
      expect(result.pagination).toEqual({
        total: 25,
        limit: 20,
        offset: 0,
        hasMore: true,
      });
    });

    it("falls back to the stored url when resolveAssetUrl returns null", async () => {
      assetsMock.listAssets.mockResolvedValue({ assets: [assetRow], total: 1 });
      storageMock.resolveAssetUrl.mockResolvedValue(null);

      const result = await service.list({ limit: 20, offset: 0 });

      expect(result.items[0].url).toBe("https://cdn/asset_pub_1.jpg");
      expect(result.pagination.hasMore).toBe(false);
    });
  });

  // ─── detail() ─────────────────────────────────────────────────────────────────────

  describe("detail()", () => {
    it("throws NotFound when the asset does not exist", async () => {
      assetsMock.findDetailByPublicId.mockResolvedValue(null);
      await expect(service.detail("nope")).rejects.toThrow(NotFoundError);
    });

    it("returns the detail envelope with uploader fields and resolved url", async () => {
      assetsMock.findDetailByPublicId.mockResolvedValue({
        ...assetRow,
        metadata: { altText: "alt" },
        uploader: {
          publicId: "uploader_pub_1",
          displayName: "Quản trị viên",
          email: "admin@example.com",
        },
      });
      storageMock.resolveAssetUrl.mockResolvedValue("https://cdn/resolved.jpg");

      const result = await service.detail("asset_pub_1");

      expect(result.data.uploaderPublicId).toBe("uploader_pub_1");
      expect(result.data.uploaderEmail).toBe("admin@example.com");
      expect(result.data.url).toBe("https://cdn/resolved.jpg");
      expect(result.data.metadata).toEqual({ altText: "alt" });
    });
  });

  // ─── getContent() ───────────────────────────────────────────────────────────────

  describe("getContent()", () => {
    it("returns storageKey/mimeType/url for the controller to stream", async () => {
      assetsMock.findContentByPublicId.mockResolvedValue({
        storageKey: "images/asset_pub_1.jpg",
        mimeType: "image/jpeg",
        url: "https://cdn/asset_pub_1.jpg",
      });

      const result = await service.getContent("asset_pub_1");

      expect(result.storageKey).toBe("images/asset_pub_1.jpg");
      expect(result.mimeType).toBe("image/jpeg");
    });

    it("throws NotFound when the asset does not exist", async () => {
      assetsMock.findContentByPublicId.mockResolvedValue(null);
      await expect(service.getContent("nope")).rejects.toThrow(NotFoundError);
    });
  });

  // ─── listFolders() ──────────────────────────────────────────────────────────────

  describe("listFolders()", () => {
    it("counts only non-deleted assets matching the media filter", async () => {
      foldersMock.listFolders.mockResolvedValue([
        {
          ...folderRow,
          items: [
            { mediaAsset: { mimeType: "image/jpeg", status: "READY" } },
            { mediaAsset: { mimeType: "video/mp4", status: "READY" } },
            { mediaAsset: { mimeType: "image/png", status: "DELETED" } },
            { mediaAsset: null },
          ],
        },
      ]);

      const result = await service.listFolders({ mediaKind: "image" });

      expect(result.data).toHaveLength(1);
      // only the READY image counts (video excluded by filter, deleted image excluded, null excluded)
      expect(result.data[0]).toEqual({
        publicId: "folder_pub_1",
        name: "Ảnh kinh sách",
        slug: "anh-kinh-sach",
        itemCount: 1,
        createdAt: folderRow.createdAt,
        updatedAt: folderRow.updatedAt,
      });
    });
  });
});
