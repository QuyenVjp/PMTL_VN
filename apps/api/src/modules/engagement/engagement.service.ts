import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { ToggleReactionInput, ToggleBookmarkInput } from "./engagement.schemas.js";

@Injectable()
export class EngagementService {
  constructor(private readonly prisma: PrismaService) {}

  toggleReaction(input: ToggleReactionInput, actorId: string) {
    return { toggled: true, targetId: input.targetId, actorId };
  }

  toggleBookmark(input: ToggleBookmarkInput, actorId: string) {
    return { toggled: true, targetId: input.targetId, actorId };
  }

  getBookmarks(userId: string) {
    return { data: [], total: 0, userId };
  }
}
