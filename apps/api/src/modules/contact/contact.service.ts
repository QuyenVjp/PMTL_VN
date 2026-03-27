import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { SubmitContactInput, ContactQuery } from "./contact.schemas.js";

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  submit(input: SubmitContactInput) {
    return { id: "placeholder", name: input.name, subject: input.subject };
  }

  listContacts(query: ContactQuery) {
    return { data: [], total: 0, page: query.page, pageSize: query.pageSize };
  }

  getContactById(id: string) {
    return { id, message: "Chức năng đang phát triển" };
  }
}
