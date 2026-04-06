import { Injectable, Logger } from "@nestjs/common";
import { EngagementTargetType, BookmarkTargetType, ReactionType } from "../../generated/prisma/enums.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { ToggleReactionInput, ToggleBookmarkInput, GetBookmarksQuery } from "./engagement.schemas.js";

// ─── Enum mapping helpers ─────────────────────────────────────────────────────

const REACTION_TARGET_TYPE_MAP: Record<ToggleReactionInput["targetType"], EngagementTargetType> = {
  post: EngagementTargetType.POST,
  comment: EngagementTargetType.COMMENT,
  community_post: EngagementTargetType.COMMUNITY_POST,
};

const REACTION_TYPE_MAP: Record<ToggleReactionInput["reaction"], ReactionType> = {
  like: ReactionType.LIKE,
  pray: ReactionType.PRAY,
  inspire: ReactionType.INSPIRE,
  gratitude: ReactionType.GRATITUDE,
};

const BOOKMARK_TARGET_TYPE_MAP: Record<ToggleBookmarkInput["targetType"], BookmarkTargetType> = {
  post: BookmarkTargetType.POST,
  event: BookmarkTargetType.EVENT,
  sutra: BookmarkTargetType.SUTRA,
  guide: BookmarkTargetType.GUIDE,
};

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class EngagementService {
  private readonly logger = new Logger(EngagementService.name);

  constructor(private readonly prisma: PrismaService) {}

  async toggleReaction(input: ToggleReactionInput, actorId: string) {
    const targetType = REACTION_TARGET_TYPE_MAP[input.targetType];
    const reaction = REACTION_TYPE_MAP[input.reaction];
    const { targetId } = input;

    const existing = await this.prisma.contentReaction.findUnique({
      where: { actorId_targetType_targetId: { actorId, targetType, targetId } },
    });

    if (existing) {
      if (existing.reaction === reaction) {
        // Same reaction → untoggle (delete)
        await this.prisma.contentReaction.delete({
          where: { actorId_targetType_targetId: { actorId, targetType, targetId } },
        });
        this.logger.log({ msg: "reaction.removed", actorId, targetType, targetId, reaction });
        return { toggled: false, targetId, actorId };
      }

      // Different reaction → update
      await this.prisma.contentReaction.update({
        where: { actorId_targetType_targetId: { actorId, targetType, targetId } },
        data: { reaction },
      });
      this.logger.log({ msg: "reaction.updated", actorId, targetType, targetId, reaction });
      return { toggled: true, targetId, actorId, reaction: input.reaction };
    }

    // Not exists → create
    await this.prisma.contentReaction.create({
      data: { actorId, targetType, targetId, reaction },
    });
    this.logger.log({ msg: "reaction.added", actorId, targetType, targetId, reaction });
    return { toggled: true, targetId, actorId, reaction: input.reaction };
  }

  async toggleBookmark(input: ToggleBookmarkInput, userId: string) {
    const targetType = BOOKMARK_TARGET_TYPE_MAP[input.targetType];
    const { targetId } = input;

    const existing = await this.prisma.contentBookmark.findUnique({
      where: { userId_targetType_targetId: { userId, targetType, targetId } },
    });

    if (existing) {
      await this.prisma.contentBookmark.delete({
        where: { userId_targetType_targetId: { userId, targetType, targetId } },
      });
      this.logger.log({ msg: "bookmark.removed", userId, targetType, targetId });
      return { bookmarked: false, targetId, userId };
    }

    await this.prisma.contentBookmark.create({
      data: { userId, targetType, targetId },
    });
    this.logger.log({ msg: "bookmark.added", userId, targetType, targetId });
    return { bookmarked: true, targetId, userId };
  }

  async getBookmarks(userId: string, query: GetBookmarksQuery = { page: 1, limit: 20 }) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(query.targetType ? { targetType: BOOKMARK_TARGET_TYPE_MAP[query.targetType] } : {}),
    };

    const [records, total] = await this.prisma.$transaction([
      this.prisma.contentBookmark.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: { targetType: true, targetId: true, createdAt: true },
      }),
      this.prisma.contentBookmark.count({ where }),
    ]);

    return { data: records, total, page, limit };
  }
}
