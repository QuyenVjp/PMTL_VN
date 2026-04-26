import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { RolesGuard } from "../../common/auth/roles.guard.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import type { AuthenticatedUser } from "../../common/auth/auth-request.types.js";
import { AdminMediaLibraryService } from "./admin-media-library.service.js";
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";
import {
  createCollectionSchema,
  updateCollectionSchema,
  listCollectionsSchema,
  addCollectionItemSchema,
  updateCollectionItemSchema,
  listItemsSchema,
  type AddCollectionItemInput,
  type CreateCollectionInput,
  type ListCollectionsInput,
  type ListItemsInput,
  type UpdateCollectionInput,
  type UpdateCollectionItemInput,
} from "./admin-media-library.schemas.js";

@ApiTags("admin-media-library")
@Controller("admin/content/media-library")
@UseGuards(RolesGuard)
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminMediaLibraryController {
  constructor(private readonly service: AdminMediaLibraryService) {}

  // ── Collections ───────────────────────────────────────────────────

  @Get("collections/slug-check")
  @ApiOperation({ summary: "Kiểm tra slug collection có bị trùng không" })
  checkSlug(
    @Query("slug") slug: string,
    @Query("excludePublicId") excludePublicId?: string,
  ) {
    return this.service.checkCollectionSlugAvailability(slug, excludePublicId);
  }

  @Get("collections")
  @ApiOperation({ summary: "Danh sách collections thư viện pháp môn" })
  list(@Query(ZodValidate(listCollectionsSchema)) query: ListCollectionsInput) {
    return this.service.listCollections(query);
  }

  @Get("collections/:publicId")
  @ApiOperation({ summary: "Chi tiết collection" })
  detail(@Param("publicId") publicId: string) {
    return this.service.getCollection(publicId);
  }

  @Post("collections")
  @ApiOperation({ summary: "Tạo collection mới" })
  create(
    @Body(ZodValidate(createCollectionSchema)) body: CreateCollectionInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.createCollection(
      body,
      user.id,
    );
  }

  @Patch("collections/:publicId")
  @ApiOperation({ summary: "Cập nhật collection" })
  update(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(updateCollectionSchema)) body: UpdateCollectionInput,
  ) {
    return this.service.updateCollection(publicId, body);
  }

  @Post("collections/:publicId/publish")
  @ApiOperation({ summary: "Xuất bản collection" })
  publish(@Param("publicId") publicId: string) {
    return this.service.publishCollection(publicId);
  }

  @Post("collections/:publicId/unpublish")
  @ApiOperation({ summary: "Gỡ xuất bản collection" })
  unpublish(@Param("publicId") publicId: string) {
    return this.service.unpublishCollection(publicId);
  }

  @Delete("collections/:publicId")
  @ApiOperation({ summary: "Xoá collection" })
  remove(@Param("publicId") publicId: string) {
    return this.service.deleteCollection(publicId);
  }

  // ── Items ─────────────────────────────────────────────────────────

  @Get("collections/:publicId/items")
  @ApiOperation({ summary: "Danh sách items trong collection" })
  listItems(
    @Param("publicId") publicId: string,
    @Query(ZodValidate(listItemsSchema)) query: ListItemsInput,
  ) {
    return this.service.listItems(publicId, query);
  }

  @Post("collections/:publicId/items")
  @ApiOperation({ summary: "Thêm item vào collection" })
  addItem(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(addCollectionItemSchema)) body: AddCollectionItemInput,
  ) {
    return this.service.addItem(publicId, body);
  }

  @Patch("collections/:publicId/items/:itemPublicId")
  @ApiOperation({ summary: "Cập nhật item trong collection" })
  updateItem(
    @Param("publicId") publicId: string,
    @Param("itemPublicId") itemPublicId: string,
    @Body(ZodValidate(updateCollectionItemSchema)) body: UpdateCollectionItemInput,
  ) {
    return this.service.updateItem(publicId, itemPublicId, body);
  }

  @Delete("collections/:publicId/items/:itemPublicId")
  @ApiOperation({ summary: "Xoá item khỏi collection" })
  removeItem(
    @Param("publicId") publicId: string,
    @Param("itemPublicId") itemPublicId: string,
  ) {
    return this.service.removeItem(publicId, itemPublicId);
  }
}
