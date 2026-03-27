import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { CreateVowInput, LogMeritInput, VowQuery } from "./vows-merit.schemas.js";

@Injectable()
export class VowsMeritService {
  constructor(private readonly prisma: PrismaService) {}

  listVows(userId: string, query: VowQuery) {
    return { data: [], total: 0, page: query.page, pageSize: query.pageSize, userId };
  }

  createVow(input: CreateVowInput, actorId: string) {
    return { id: actorId, type: input.type, message: "Chức năng đang phát triển" };
  }

  logMerit(input: LogMeritInput, actorId: string) {
    return { id: actorId, vowId: input.vowId, message: "Chức năng đang phát triển" };
  }

  getVowById(id: string) {
    return { id, message: "Chức năng đang phát triển" };
  }
}
