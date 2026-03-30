import { Test } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { ContactService } from "./contact.service.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { AuditService } from "../../platform/audit/audit.service.js";

describe("ContactService", () => {
  let service: ContactService;
  let prisma: jest.Mocked<PrismaService>;
  let audit: jest.Mocked<AuditService>;

  beforeEach(async () => {
    const mockPrisma = {
      contactSubmission: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const mockAudit = {
      append: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        ContactService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAudit },
      ],
    }).compile();

    service = module.get<ContactService>(ContactService);
    prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;
    audit = module.get(AuditService) as jest.Mocked<AuditService>;
  });

  describe("submit", () => {
    it("should create contact submission successfully", async () => {
      const input = {
        name: "Nguyễn Văn A",
        email: "test@example.com",
        subject: "general" as const,
        message: "Test message content here",
      };

      const mockSubmission = {
        publicId: "test-id",
        name: input.name,
        email: input.email,
        subject: input.subject,
        message: input.message,
        status: "new",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.contactSubmission.create.mockResolvedValue(mockSubmission);

      const result = await service.submit(input);

      expect(prisma.contactSubmission.create).toHaveBeenCalledWith({
        data: {
          publicId: expect.any(String),
          name: input.name,
          email: input.email,
          subject: input.subject,
          message: input.message,
          status: "new",
        },
      });

      expect(result).toEqual({
        id: "test-id",
        name: input.name,
        subject: input.subject,
        status: "submitted",
      });
    });
  });

  describe("listContacts", () => {
    it("should return paginated contacts", async () => {
      const query = { page: 1, pageSize: 20 };
      const mockContacts = [
        {
          publicId: "contact-1",
          name: "Nguyễn Văn A",
          email: "a@example.com",
          subject: "general",
          message: "Test message",
          status: "new",
          createdAt: new Date(),
        },
      ];

      prisma.contactSubmission.findMany.mockResolvedValue(mockContacts);
      prisma.contactSubmission.count.mockResolvedValue(1);

      const result = await service.listContacts(query);

      expect(prisma.contactSubmission.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: "desc" },
        skip: 0,
        take: 20,
        select: {
          publicId: true,
          name: true,
          email: true,
          subject: true,
          message: true,
          status: true,
          createdAt: true,
        },
      });

      expect(result).toEqual({
        data: mockContacts,
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      });
    });

    it("should filter by subject and status", async () => {
      const query = { 
        page: 1, 
        pageSize: 20,
        subject: "support" as const,
        status: "new" as const,
      };

      prisma.contactSubmission.findMany.mockResolvedValue([]);
      prisma.contactSubmission.count.mockResolvedValue(0);

      await service.listContacts(query);

      expect(prisma.contactSubmission.findMany).toHaveBeenCalledWith({
        where: {
          subject: "support",
          status: "new",
        },
        orderBy: { createdAt: "desc" },
        skip: 0,
        take: 20,
        select: expect.any(Object),
      });
    });
  });

  describe("getContactById", () => {
    it("should return contact by publicId", async () => {
      const publicId = "contact-123";
      const mockContact = {
        id: "internal-id",
        publicId,
        name: "Nguyễn Văn A",
        email: "a@example.com",
        subject: "general",
        message: "Test message",
        status: "new",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.contactSubmission.findUnique.mockResolvedValue(mockContact);

      const result = await service.getContactById(publicId);

      expect(prisma.contactSubmission.findUnique).toHaveBeenCalledWith({
        where: { publicId },
      });

      expect(result).toEqual(mockContact);
    });

    it("should throw NotFoundException when contact not found", async () => {
      const publicId = "non-existent";

      prisma.contactSubmission.findUnique.mockResolvedValue(null);

      await expect(service.getContactById(publicId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getContactById(publicId)).rejects.toThrow(
        "Liên hệ không tồn tại",
      );
    });
  });
});