import { Injectable } from "@nestjs/common";
import { nanoid } from "nanoid";
import { StorageService } from "./storage.service.js";
import { MediaAssetsRepository } from "./media-assets.repository.js";
import { MediaFoldersRepository, type TransactionClient } from "./media-folders.repository.js";
import { AuditService, type AuditContext } from "../audit/audit.service.js";
import { NotFoundError } from "../../common/errors/app-error.js";
import type { AssetStatus, MediaItemType } from "../../generated/prisma/client.js";

// ── Service input contracts ─────────────────────────────────────────────────────

export interface UploadMediaInput {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  uploaderId: string;
  folderPublicId?: string;
}

export interface ListMediaQuery {
  status?: AssetStatus;
  mimeType?: string;
  mediaKind?: "image" | "video" | "document";
  folderPublicId?: string;
  search?: string;
  limit: number;
  offset: number;
}

export interface ListFoldersQuery {
  mimeType?: string;
  mediaKind?: "image" | "video" | "document";
}

export interface UpdateMediaMetadataInput {
  altText?: string;
  caption?: string;
  description?: string;
}

export interface MoveMediaAssetInput {
  folderPublicId?: string | null;
}

/**
 * Owns all media business logic: upload orchestration, folder CRUD, asset
 * metadata/move/soft-delete, and the audit boundary for every visible mutation.
 * The controller only validates input and calls into this service.
 */
@Injectable()
export class AdminMediaService {
  constructor(
    private readonly assets: MediaAssetsRepository,
    private readonly folders: MediaFoldersRepository,
    private readonly storage: StorageService,
    private readonly audit: AuditService,
  ) {}

  // ── Upload ────────────────────────────────────────────────────────────────────

  async upload(input: UploadMediaInput, auditContext: AuditContext) {
    const asset = await this.storage.uploadFile(
      input.buffer,
      input.originalname,
      input.mimetype,
      input.uploaderId,
    );

    if (input.folderPublicId) {
      await this.attachAssetToFolder(input.folderPublicId, asset.id, asset.mimeType);
    }

    await this.audit.append(
      auditContext,
      "media.upload",
      "media_asset",
      asset.publicId,
      { filename: asset.filename, mimeType: asset.mimeType, size: asset.size },
    );

    return {
      data: {
        publicId: asset.publicId,
        url: asset.url,
        filename: asset.filename,
        mimeType: asset.mimeType,
        size: asset.size,
      },
    };
  }

  // ── Folders ─────────────────────────────────────────────────────────────────────

  async listFolders(query: ListFoldersQuery) {
    const folders = await this.folders.listFolders();

    const data = folders.map((folder) => {
      const itemCount = folder.items.filter((item) => {
        const asset = item.mediaAsset;
        if (!asset || asset.status === "DELETED") return false;
        return this.matchesMediaFilter(asset.mimeType, query.mediaKind, query.mimeType);
      }).length;

      return {
        publicId: folder.publicId,
        name: folder.title,
        slug: folder.slug,
        itemCount,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
      };
    });

    return { data };
  }

  async createFolder(input: { name: string }, createdById: string, auditContext: AuditContext) {
    const slugBase = this.slugifyFolderName(input.name);
    const slug = await this.folders.nextFolderSlug(slugBase);
    const publicId = nanoid(21);

    // Write + audit in one transaction: if the audit chain append fails, the
    // folder insert rolls back so we never persist an unaudited write.
    const folder = await this.folders.runInTransaction(async (tx) => {
      const created = await this.folders.createFolder(
        { publicId, title: input.name, slug, createdById },
        tx,
      );
      await this.audit.appendInTransaction(
        tx,
        auditContext,
        "media.folder.create",
        "media_collection",
        created.publicId,
        { title: created.title, slug: created.slug },
      );
      return created;
    });

    return {
      data: {
        publicId: folder.publicId,
        name: folder.title,
        slug: folder.slug,
        itemCount: 0,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
      },
    };
  }

  async updateFolder(publicId: string, input: { name: string }, auditContext: AuditContext) {
    const existing = await this.folders.findFolderRefByPublicId(publicId);
    if (!existing) {
      throw new NotFoundError("Media folder", publicId);
    }

    const slugBase = this.slugifyFolderName(input.name);
    const slug = await this.folders.nextFolderSlug(slugBase, publicId);

    const updated = await this.folders.runInTransaction(async (tx) => {
      const result = await this.folders.updateFolder(publicId, { title: input.name, slug }, tx);
      await this.audit.appendInTransaction(
        tx,
        auditContext,
        "media.folder.update",
        "media_collection",
        publicId,
        { title: result.title, slug: result.slug },
      );
      return result;
    });

    return {
      data: {
        publicId: updated.publicId,
        name: updated.title,
        slug: updated.slug,
        itemCount: updated._count.items,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    };
  }

  async deleteFolder(publicId: string, auditContext: AuditContext) {
    const folder = await this.folders.findFolderForDelete(publicId);
    if (!folder) {
      throw new NotFoundError("Media folder", publicId);
    }

    await this.folders.runInTransaction(async (tx) => {
      await this.folders.deleteFolder(publicId, tx);
      await this.audit.appendInTransaction(
        tx,
        auditContext,
        "media.folder.delete",
        "media_collection",
        publicId,
        { title: folder.title },
      );
    });

    return { data: { publicId, deleted: true } };
  }

  // ── Assets ────────────────────────────────────────────────────────────────────

  async list(query: ListMediaQuery) {
    const { assets, total } = await this.assets.listAssets({
      ...(query.status !== undefined && { status: query.status }),
      ...(query.mediaKind !== undefined && { mediaKind: query.mediaKind }),
      ...(query.mimeType !== undefined && { mimeType: query.mimeType }),
      ...(query.search !== undefined && { search: query.search }),
      ...(query.folderPublicId !== undefined && { folderPublicId: query.folderPublicId }),
      limit: query.limit,
      offset: query.offset,
    });

    const data = await Promise.all(
      assets.map(async (a) => ({
        publicId: a.publicId,
        filename: a.filename,
        mimeType: a.mimeType,
        size: a.size,
        url: (await this.storage.resolveAssetUrl(a.publicId)) ?? a.url,
        width: a.width,
        height: a.height,
        status: a.status,
        uploaderPublicId: a.uploader.publicId,
        uploaderName: a.uploader.displayName,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
    );

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

  async detail(publicId: string) {
    const asset = await this.assets.findDetailByPublicId(publicId);
    if (!asset) {
      throw new NotFoundError("Media asset", publicId);
    }

    return {
      data: {
        publicId: asset.publicId,
        filename: asset.filename,
        mimeType: asset.mimeType,
        size: asset.size,
        storageKey: asset.storageKey,
        url: (await this.storage.resolveAssetUrl(asset.publicId)) ?? asset.url,
        width: asset.width,
        height: asset.height,
        status: asset.status,
        metadata: asset.metadata,
        uploaderPublicId: asset.uploader.publicId,
        uploaderName: asset.uploader.displayName,
        uploaderEmail: asset.uploader.email,
        createdAt: asset.createdAt,
        updatedAt: asset.updatedAt,
      },
    };
  }

  /**
   * Resolve the storageKey/mimeType/url for a binary preview. Only the Prisma
   * lookup lives here; the controller keeps the fs read / redirect / StreamableFile
   * handling since that is a read with no audit and no domain logic.
   */
  async getContent(publicId: string) {
    const asset = await this.assets.findContentByPublicId(publicId);
    if (!asset) {
      throw new NotFoundError("Media asset", publicId);
    }
    return asset;
  }

  async updateMetadata(
    publicId: string,
    input: UpdateMediaMetadataInput,
    auditContext: AuditContext,
  ) {
    const asset = await this.assets.findByPublicId(publicId);
    if (!asset) {
      throw new NotFoundError("Media asset", publicId);
    }

    const existingMeta = (asset.metadata as Record<string, unknown> | null) ?? {};
    const updatedMeta = { ...existingMeta, ...input };
    const fields = Object.keys(input);

    await this.assets.runInTransaction(async (tx) => {
      await this.assets.updateMetadata(publicId, updatedMeta, tx);
      await this.audit.appendInTransaction(
        tx,
        auditContext,
        "media.metadata.update",
        "media_asset",
        publicId,
        { fields },
      );
    });

    return { data: { publicId, updated: true } };
  }

  async moveToFolder(
    publicId: string,
    input: MoveMediaAssetInput,
    auditContext: AuditContext,
  ) {
    const asset = await this.assets.findForMove(publicId);
    if (!asset) {
      throw new NotFoundError("Media asset", publicId);
    }

    const targetFolder = input.folderPublicId ?? null;

    await this.folders.runInTransaction(async (tx) => {
      await this.folders.deleteAssetFolderLinks(asset.id, tx);
      if (input.folderPublicId) {
        await this.attachAssetToFolder(input.folderPublicId, asset.id, asset.mimeType, tx);
      }
      await this.audit.appendInTransaction(
        tx,
        auditContext,
        "media.folder.move_asset",
        "media_asset",
        publicId,
        { filename: asset.filename, folderPublicId: targetFolder },
      );
    });

    return { data: { publicId, folderPublicId: targetFolder } };
  }

  async softDelete(publicId: string, auditContext: AuditContext) {
    const asset = await this.assets.findByPublicId(publicId);
    if (!asset) {
      throw new NotFoundError("Media asset", publicId);
    }

    await this.assets.runInTransaction(async (tx) => {
      await this.assets.updateStatus(publicId, "DELETED", tx);
      await this.audit.appendInTransaction(
        tx,
        auditContext,
        "media.delete",
        "media_asset",
        publicId,
        { filename: asset.filename, mimeType: asset.mimeType },
      );
    });

    return { data: { publicId, deleted: true } };
  }

  // ── Helpers (business logic moved out of the controller) ────────────────────────

  /** Attach an asset to a folder, creating the collection item with the next sortOrder. */
  private async attachAssetToFolder(
    folderPublicId: string,
    mediaAssetId: string,
    mimeType: string,
    tx?: TransactionClient,
  ): Promise<void> {
    const folder = await this.folders.findFolderIdWithCount(folderPublicId);
    if (!folder) {
      throw new NotFoundError("Media folder", folderPublicId);
    }

    await this.folders.createCollectionItem(
      {
        publicId: nanoid(21),
        collectionId: folder.id,
        mediaAssetId,
        itemType: this.itemTypeForMime(mimeType),
        sortOrder: folder.itemCount + 1,
      },
      tx,
    );
  }

  private itemTypeForMime(mimeType: string): MediaItemType {
    if (mimeType.startsWith("image/")) return "IMAGE";
    if (mimeType.startsWith("video/")) return "UPLOADED_VIDEO";
    return "DOCUMENT";
  }

  private matchesMediaFilter(
    mimeType: string,
    mediaKind?: "image" | "video" | "document",
    mimePrefix?: string,
  ): boolean {
    if (mediaKind === "image") return mimeType.startsWith("image/");
    if (mediaKind === "video") return mimeType.startsWith("video/");
    if (mediaKind === "document") {
      return !mimeType.startsWith("image/") && !mimeType.startsWith("video/");
    }
    return mimePrefix ? mimeType.startsWith(mimePrefix) : true;
  }

  private slugifyFolderName(name: string): string {
    const slug = name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "d")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return slug || `thu-muc-${nanoid(6).toLowerCase()}`;
  }
}
