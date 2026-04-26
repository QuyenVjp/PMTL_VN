/**
 * CharityFirewall Service Tests
 *
 * Test coverage:
 * - No patterns → no violation
 * - Whitelisted account → no violation, logged as match
 * - Unwhitelisted account → violation created, event appended
 * - 3rd violation → escalation alert created
 * - Transaction rollback scenario
 * - Cache hit/miss for whitelist
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { CharityFirewallService } from "../charity-firewall.service.js";
import { PrismaService } from "../../../../common/prisma/prisma.service.js";
import { CacheService } from "../../../../common/cache/cache.service.js";
import { OutboxService } from "../../../../platform/outbox/outbox.service.js";
import { AuditService } from "../../../../platform/audit/audit.service.js";
import type { AuditContext } from "../../../../platform/audit/audit.service.js";

describe("CharityFirewallService", () => {
  let service: CharityFirewallService;
  let prismaService: PrismaService;
  let cacheService: CacheService;
  let outboxService: OutboxService;
  let auditService: AuditService;

  const mockAuditContext: AuditContext = {
    actorType: "USER",
    actorId: "test-admin",
  };

  beforeEach(() => {
    // Mock dependencies
    prismaService = {
      charityWhitelist: {
        findMany: vi.fn(),
      },
      fraudDetectionAlert: {
        create: vi.fn(),
        count: vi.fn(),
      },
      $transaction: vi.fn((cb) => cb(prismaService)),
    } as any;

    cacheService = {
      getJson: vi.fn(),
      setJson: vi.fn(),
    } as any;

    outboxService = {
      appendEvent: vi.fn(),
    } as any;

    auditService = {
      appendInTransaction: vi.fn(),
    } as any;

    service = new CharityFirewallService(prismaService, cacheService, outboxService, auditService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("scanContent", () => {
    it("should return clean scan when no patterns detected", async () => {
      // Arrange
      const userId = "user-123";
      const contentType = "POST";
      const contentId = "post-456";
      const cleanText = "This is a donation message about helping families in need.";

      vi.spyOn(cacheService, "getJson").mockResolvedValue(null);
      vi.spyOn(cacheService, "setJson").mockResolvedValue(undefined);
      vi.spyOn(prismaService.charityWhitelist, "findMany").mockResolvedValue([]);

      // Act
      const result = await service.scanContent(userId, contentType, contentId, cleanText, mockAuditContext);

      // Assert
      expect(result).toMatchObject({
        userId,
        contentType,
        contentId,
        hasViolation: false,
        detectedPatterns: [],
        userViolationCount: 0,
        escalatedToAlert: false,
      });
      expect(prismaService.$transaction).not.toHaveBeenCalled();
    });

    it("should not create violation when detected account is whitelisted", async () => {
      // Arrange
      const userId = "user-123";
      const contentType = "DONATION_FORM";
      const contentId = "form-456";
      const textWithAccount = "Donate to Vietcombank 1234567890 for education";

      const whitelistedAccounts = [
        {
          charityId: "charity-1",
          charityName: "Education Fund",
          bankAccount: "1234567890",
        },
      ];

      vi.spyOn(cacheService, "getJson").mockResolvedValue(whitelistedAccounts);
      vi.spyOn(cacheService, "setJson").mockResolvedValue(undefined);

      // Act
      const result = await service.scanContent(userId, contentType, contentId, textWithAccount, mockAuditContext);

      // Assert
      expect(result).toMatchObject({
        hasViolation: false,
        whitelistedMatch: {
          charityName: "Education Fund",
          bankAccount: expect.stringMatching(/^\d{2}\*+\d{2}$/),
        },
      });
      expect(prismaService.fraudDetectionAlert.create).not.toHaveBeenCalled();
      expect(outboxService.appendEvent).not.toHaveBeenCalled();
    });

    it("should create violation and append outbox event when account is unwhitelisted", async () => {
      // Arrange
      const userId = "user-123";
      const contentType = "POST";
      const contentId = "post-456";
      const textWithUnwhitelistedAccount = "Send money to Vietcombank 9876543210 for profit";

      const whitelistedAccounts = [
        {
          charityId: "charity-1",
          charityName: "Education Fund",
          bankAccount: "1234567890",
        },
      ];

      vi.spyOn(cacheService, "getJson").mockResolvedValue(whitelistedAccounts);
      vi.spyOn(cacheService, "setJson").mockResolvedValue(undefined);
      vi.spyOn(prismaService.fraudDetectionAlert, "count").mockResolvedValue(1);

      let capturedOutboxEvent: any;
      vi.spyOn(outboxService, "appendEvent").mockImplementation(async (eventType, aggregateId, payload) => {
        capturedOutboxEvent = { eventType, aggregateId, payload };
        return { id: "event-123" } as any;
      });

      // Mock transaction to actually call the callback
      vi.spyOn(prismaService, "$transaction").mockImplementation(async (cb) => {
        const mockTx = {
          fraudDetectionAlert: {
            create: vi.fn().mockResolvedValue({ publicId: "alert-123" }),
          },
        };
        return cb(mockTx);
      });

      // Act
      const result = await service.scanContent(
        userId,
        contentType,
        contentId,
        textWithUnwhitelistedAccount,
        mockAuditContext,
      );

      // Assert
      expect(result).toMatchObject({
        hasViolation: true,
        violationId: expect.any(String),
        userViolationCount: 1,
        escalatedToAlert: false,
      });

      // Verify outbox event was appended
      expect(outboxService.appendEvent).toHaveBeenCalledWith(
        "charity.content_violation_detected",
        expect.any(String),
        expect.objectContaining({
          userId,
          contentType,
          contentId,
          patternType: expect.any(String),
          confidence: expect.stringMatching(/^(HIGH|MEDIUM|LOW)$/),
        }),
        expect.any(Object),
      );

      // Verify audit log was recorded
      expect(auditService.appendInTransaction).toHaveBeenCalledWith(
        expect.any(Object),
        mockAuditContext,
        "charity.content_violation_detected",
        "content_violation",
        expect.any(String),
        expect.objectContaining({
          userId,
          contentId,
        }),
      );
    });

    it("should create escalation alert when user reaches 3 violations in 30 days", async () => {
      // Arrange
      const userId = "user-123";
      const contentType = "POST";
      const contentId = "post-456";
      const textWithUnwhitelistedAccount = "Send money to Vietcombank 9876543210 for profit";

      const whitelistedAccounts = [
        {
          charityId: "charity-1",
          charityName: "Education Fund",
          bankAccount: "1234567890",
        },
      ];

      vi.spyOn(cacheService, "getJson").mockResolvedValue(whitelistedAccounts);
      vi.spyOn(cacheService, "setJson").mockResolvedValue(undefined);

      // Mock violation count as 3 (at threshold)
      vi.spyOn(prismaService.fraudDetectionAlert, "count").mockResolvedValue(3);

      let escalationAlertId: string | undefined;
      vi.spyOn(outboxService, "appendEvent").mockImplementation(async (eventType) => {
        if (eventType === "charity.fraud_escalation_alert") {
          escalationAlertId = "alert-123";
        }
        return { id: "event-123" } as any;
      });

      vi.spyOn(prismaService, "$transaction").mockImplementation(async (cb) => {
        const mockTx = {
          fraudDetectionAlert: {
            create: vi.fn().mockResolvedValue({ publicId: "alert-123" }),
          },
        };
        return cb(mockTx);
      });

      // Act
      const result = await service.scanContent(
        userId,
        contentType,
        contentId,
        textWithUnwhitelistedAccount,
        mockAuditContext,
      );

      // Assert
      expect(result).toMatchObject({
        hasViolation: true,
        userViolationCount: 3,
        escalatedToAlert: true,
        alertId: expect.any(String),
      });

      // Verify escalation event was appended
      expect(outboxService.appendEvent).toHaveBeenCalledWith(
        "charity.fraud_escalation_alert",
        expect.any(String),
        expect.objectContaining({
          userId,
          violationCount: 3,
          reason: expect.stringContaining("Multiple unwhitelisted"),
        }),
        expect.any(Object),
      );
    });

    it("should handle invalid input gracefully", async () => {
      // Arrange
      const userId = "user-123";
      const contentType = "INVALID_TYPE" as any;
      const contentId = "post-456";
      const text = "test";

      // Act
      const result = await service.scanContent(userId, contentType, contentId, text, mockAuditContext);

      // Assert
      expect(result).toMatchObject({
        hasViolation: false,
        detectedPatterns: [],
        userViolationCount: 0,
      });
      expect(prismaService.$transaction).not.toHaveBeenCalled();
    });

    it("should scan route-level content types used by the interceptor", async () => {
      // Arrange
      const userId = "user-123";
      const contentType = "guestbook";
      const contentId = "POST:/guestbook";
      const text = "Xin gửi lời cảm niệm. STK: 9876543210";

      vi.spyOn(cacheService, "getJson").mockResolvedValue([]);
      vi.spyOn(cacheService, "setJson").mockResolvedValue(undefined);
      vi.spyOn(prismaService.charityWhitelist, "findMany").mockResolvedValue([]);
      vi.spyOn(prismaService.fraudDetectionAlert, "count").mockResolvedValue(1);

      // Act
      const result = await service.scanContent(userId, contentType, contentId, text, mockAuditContext);

      // Assert
      expect(result.hasViolation).toBe(true);
      expect(prismaService.$transaction).toHaveBeenCalled();
    });

    it("should reject empty text", async () => {
      // Arrange
      const userId = "user-123";
      const contentType = "POST";
      const contentId = "post-456";
      const emptyText = "";

      // Act
      const result = await service.scanContent(userId, contentType, contentId, emptyText, mockAuditContext);

      // Assert
      expect(result).toMatchObject({
        hasViolation: false,
        detectedPatterns: [],
      });
    });
  });

  describe("getWhitelistedAccounts", () => {
    it("should return cached whitelist on cache hit", async () => {
      // Arrange
      const cachedAccounts = [
        {
          charityId: "charity-1",
          charityName: "Education Fund",
          bankAccount: "1234567890",
        },
      ];

      vi.spyOn(cacheService, "getJson").mockResolvedValue(cachedAccounts);

      // Act
      const result = await service.getWhitelistedAccounts();

      // Assert
      expect(result).toEqual(cachedAccounts);
      expect(cacheService.getJson).toHaveBeenCalledWith("charity:whitelist:accounts");
      expect(cacheService.setJson).not.toHaveBeenCalled();
      expect(prismaService.charityWhitelist.findMany).not.toHaveBeenCalled();
    });

    it("should fetch from database and cache on cache miss", async () => {
      // Arrange
      vi.spyOn(cacheService, "getJson").mockResolvedValue(null);
      vi.spyOn(cacheService, "setJson").mockResolvedValue(undefined);

      const dbCharities = [
        {
          id: "charity-1",
          name: "Education Fund",
          bankAccounts: ["1234567890", "9876543210"],
        },
        {
          id: "charity-2",
          name: "Medical Aid",
          bankAccounts: ["1111111111"],
        },
      ];

      vi.spyOn(prismaService.charityWhitelist, "findMany").mockResolvedValue(dbCharities);

      // Act
      const result = await service.getWhitelistedAccounts();

      // Assert
      expect(result).toHaveLength(3);
      expect(result).toContainEqual({
        charityId: "charity-1",
        charityName: "Education Fund",
        bankAccount: "1234567890",
      });
      expect(cacheService.setJson).toHaveBeenCalledWith(
        "charity:whitelist:accounts",
        expect.any(Array),
        300,
      );
    });

    it("should return empty array when no active charities exist", async () => {
      // Arrange
      vi.spyOn(cacheService, "getJson").mockResolvedValue(null);
      vi.spyOn(cacheService, "setJson").mockResolvedValue(undefined);
      vi.spyOn(prismaService.charityWhitelist, "findMany").mockResolvedValue([]);

      // Act
      const result = await service.getWhitelistedAccounts();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("getUserViolationCount", () => {
    it("should return violation count for 30-day window", async () => {
      // Arrange
      const userId = "user-123";
      vi.spyOn(prismaService.fraudDetectionAlert, "count").mockResolvedValue(2);

      // Act
      const result = await service.getUserViolationCount(userId, 30);

      // Assert
      expect(result).toBe(2);
      expect(prismaService.fraudDetectionAlert.count).toHaveBeenCalledWith({
        where: {
          reportedById: userId,
          alertType: "ACCOUNT_ANOMALY",
          createdAt: {
            gte: expect.any(Date),
          },
        },
      });
    });

    it("should accept custom time window", async () => {
      // Arrange
      const userId = "user-123";
      vi.spyOn(prismaService.fraudDetectionAlert, "count").mockResolvedValue(1);

      // Act
      const result = await service.getUserViolationCount(userId, 7);

      // Assert
      expect(result).toBe(1);
      const callArgs = vi.mocked(prismaService.fraudDetectionAlert.count).mock.calls[0][0];
      // Verify the date is approximately 7 days ago
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - 7);
      expect((callArgs as any).where.createdAt.gte.getTime()).toBeLessThanOrEqual(expectedDate.getTime());
    });

    it("should return zero when no violations exist", async () => {
      // Arrange
      const userId = "user-123";
      vi.spyOn(prismaService.fraudDetectionAlert, "count").mockResolvedValue(0);

      // Act
      const result = await service.getUserViolationCount(userId, 30);

      // Assert
      expect(result).toBe(0);
    });
  });

  describe("Transaction Atomicity", () => {
    it("should rollback violation and event on transaction failure", async () => {
      // Arrange
      const userId = "user-123";
      const contentType = "POST";
      const contentId = "post-456";
      const textWithUnwhitelistedAccount = "Send money to Vietcombank 9876543210";

      const whitelistedAccounts = [
        {
          charityId: "charity-1",
          charityName: "Education Fund",
          bankAccount: "1234567890",
        },
      ];

      vi.spyOn(cacheService, "getJson").mockResolvedValue(whitelistedAccounts);

      const transactionError = new Error("Database connection lost");
      vi.spyOn(prismaService, "$transaction").mockRejectedValue(transactionError);

      // Act & Assert
      await expect(
        service.scanContent(userId, contentType, contentId, textWithUnwhitelistedAccount, mockAuditContext),
      ).rejects.toThrow("Database connection lost");
    });

    it("should ensure violation and event are created together atomically", async () => {
      // Arrange
      const userId = "user-123";
      const contentType = "POST";
      const contentId = "post-456";
      const textWithUnwhitelistedAccount = "Send money to Vietcombank 9876543210";

      const whitelistedAccounts: any[] = [];
      vi.spyOn(cacheService, "getJson").mockResolvedValue(whitelistedAccounts);
      vi.spyOn(cacheService, "setJson").mockResolvedValue(undefined);
      vi.spyOn(prismaService.charityWhitelist, "findMany").mockResolvedValue([]);
      vi.spyOn(prismaService.fraudDetectionAlert, "count").mockResolvedValue(1);

      let violationCreated = false;
      let eventAppended = false;

      vi.spyOn(prismaService, "$transaction").mockImplementation(async (cb) => {
        const mockTx = {
          fraudDetectionAlert: {
            create: vi.fn().mockImplementation(() => {
              violationCreated = true;
              return Promise.resolve({ publicId: "alert-123" });
            }),
          },
        };
        await cb(mockTx);
        return {};
      });

      vi.spyOn(outboxService, "appendEvent").mockImplementation(async () => {
        eventAppended = true;
        return { id: "event-123" } as any;
      });

      // Act
      const result = await service.scanContent(
        userId,
        contentType,
        contentId,
        textWithUnwhitelistedAccount,
        mockAuditContext,
      );

      // Assert
      expect(result.hasViolation).toBe(true);
      expect(violationCreated).toBe(true);
      expect(eventAppended).toBe(true);
    });
  });

  describe("Whitelist Caching TTL", () => {
    it("should use 5-minute cache TTL", async () => {
      // Arrange
      vi.spyOn(cacheService, "getJson").mockResolvedValue(null);
      vi.spyOn(cacheService, "setJson").mockResolvedValue(undefined);
      vi.spyOn(prismaService.charityWhitelist, "findMany").mockResolvedValue([]);

      // Act
      await service.getWhitelistedAccounts();

      // Assert
      expect(cacheService.setJson).toHaveBeenCalledWith(
        "charity:whitelist:accounts",
        expect.any(Array),
        300, // 5 minutes in seconds
      );
    });
  });

  describe("Pino Structured Logging", () => {
    it("should log violations with structured context", async () => {
      // Arrange
      const userId = "user-123";
      const contentId = "post-456";
      const textWithUnwhitelistedAccount = "Send money to Vietcombank 9876543210";

      vi.spyOn(cacheService, "getJson").mockResolvedValue([]);
      vi.spyOn(cacheService, "setJson").mockResolvedValue(undefined);
      vi.spyOn(prismaService.charityWhitelist, "findMany").mockResolvedValue([]);
      vi.spyOn(prismaService.fraudDetectionAlert, "count").mockResolvedValue(1);

      const loggerSpy = vi.spyOn(service["logger"], "info");

      vi.spyOn(prismaService, "$transaction").mockImplementation(async (cb) => {
        const mockTx = {
          fraudDetectionAlert: {
            create: vi.fn().mockResolvedValue({ publicId: "alert-123" }),
          },
        };
        return cb(mockTx);
      });

      // Act
      await service.scanContent(userId, "POST", contentId, textWithUnwhitelistedAccount, mockAuditContext);

      // Assert
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: "charity_firewall.violation_created",
          userId,
          contentId,
        }),
        expect.any(String),
      );
    });
  });
});
