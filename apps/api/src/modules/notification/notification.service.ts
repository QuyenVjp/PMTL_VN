import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { NotificationQuery, MarkReadInput } from "./notification.schemas.js";

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  listNotifications(userId: string, query: NotificationQuery) {
    return { data: [], total: 0, unreadCount: 0, userId, page: query.page };
  }

  markAsRead(userId: string, input: MarkReadInput) {
    return { updated: input.notificationIds.length, userId };
  }

  markAllAsRead(userId: string) {
    return { updated: 0, userId };
  }
}
