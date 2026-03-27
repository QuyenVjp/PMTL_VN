import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { CreateCommunityPostInput, CommunityPostQuery } from "./community.schemas.js";

@Injectable()
export class CommunityService {
  constructor(private readonly prisma: PrismaService) {}

  listPosts(query: CommunityPostQuery) {
    return { data: [], total: 0, page: query.page, pageSize: query.pageSize };
  }

  createPost(input: CreateCommunityPostInput, actorId: string) {
    return { id: actorId, title: input.title, message: "Chức năng đang phát triển" };
  }

  getPostById(id: string) {
    return { id, message: "Chức năng đang phát triển" };
  }
}
