/**
 * OutboxService Unit Tests
 * Tests: appendEvent, findUnprocessed, markProcessed, markFailed, cleanupOld
 */
import { Test, TestingModule } from "@nestjs/testing";
import { OutboxService } from "../outbox.service";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { OUTBOX_CONFIG, OUTBOX_EVENTS } from "../outbox.constants";

describe("OutboxService", () => {
  let service: OutboxService;
  let prismaMock: any;

  beforeEach(async () => {
    // Mock PrismaService
    prismaMock = {
      $transaction: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutboxService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<OutboxService>(OutboxService);
  });

  describe("appendEvent", () => {
    it("should append event to outbox within transaction", async () => {
      const mockEvent = {
        id: "event-1",
        createdAt: new Date(),
        processedAt: null,
        eventType: OUTBOX_EVENTS.CHARITY_FRAUD_DETECTED,
        aggregateId: "charity-123",
        payload: { userId: "user-1", reason: "spam" },
        error: null,
        retryCount: 0,
      };

      // Mock transaction client
      const mockTx = {
        outboxEvent: {
          create: vi.fn().mockResolvedValue(mockEvent),
        },
      };

      const result = await service.appendEvent(
        OUTBOX_EVENTS.CHARITY_FRAUD_DETECTED,
        "charity-123",
        { userId: "user-1", reason: "spam" },
        mockTx as any,
      );

      expect(result).toEqual(mockEvent);
      expect(mockTx.outboxEvent.create).toHaveBeenCalledWith({
        data: {
          eventType: OUTBOX_EVENTS.CHARITY_FRAUD_DETECTED,
          aggregateId: "charity-123",
          payload: { userId: "user-1", reason: "spam" },
          retryCount: 0,
        },
      });
    });
  });

  describe("findUnprocessed", () => {
    it("should find unprocessed events ordered by creation time", async () => {
      const mockEvents = [
        {
          id: "event-1",
          createdAt: new Date("2024-01-01"),
          processedAt: null,
          eventType: OUTBOX_EVENTS.CHARITY_FRAUD_DETECTED,
          aggregateId: "charity-1",
          payload: {},
          error: null,
          retryCount: 0,
        },
        {
          id: "event-2",
          createdAt: new Date("2024-01-02"),
          processedAt: null,
          eventType: OUTBOX_EVENTS.POST_CREATED,
          aggregateId: "post-1",
          payload: {},
          error: null,
          retryCount: 1,
        },
      ];

      const mockOutboxEvent = {
        findMany: vi.fn().mockResolvedValue(mockEvents),
      };

      // Patch the service to use our mock
      vi.spyOn(service as any, "prisma", "get").mockReturnValue({
        outboxEvent: mockOutboxEvent,
      });

      const result = await service.findUnprocessed(50);

      expect(result).toEqual(mockEvents);
      expect(mockOutboxEvent.findMany).toHaveBeenCalledWith({
        where: {
          processedAt: null,
          retryCount: {
            lt: OUTBOX_CONFIG.MAX_RETRIES,
          },
        },
        orderBy: {
          createdAt: "asc",
        },
        take: 50,
      });
    });

    it("should exclude events at max retries", async () => {
      const mockOutboxEvent = {
        findMany: vi.fn().mockResolvedValue([]),
      };

      vi.spyOn(service as any, "prisma", "get").mockReturnValue({
        outboxEvent: mockOutboxEvent,
      });

      await service.findUnprocessed(50);

      const query = mockOutboxEvent.findMany.mock.calls[0][0];
      expect(query.where.retryCount.lt).toBe(OUTBOX_CONFIG.MAX_RETRIES);
    });
  });

  describe("markProcessed", () => {
    it("should mark event as processed with timestamp", async () => {
      const mockUpdatedEvent = {
        id: "event-1",
        createdAt: new Date(),
        processedAt: new Date(),
        eventType: OUTBOX_EVENTS.CHARITY_FRAUD_DETECTED,
        aggregateId: "charity-123",
        payload: {},
        error: null,
        retryCount: 0,
      };

      const mockOutboxEvent = {
        update: vi.fn().mockResolvedValue(mockUpdatedEvent),
      };

      vi.spyOn(service as any, "prisma", "get").mockReturnValue({
        outboxEvent: mockOutboxEvent,
      });

      const result = await service.markProcessed("event-1");

      expect(result).toEqual(mockUpdatedEvent);
      expect(mockOutboxEvent.update).toHaveBeenCalledWith({
        where: { id: "event-1" },
        data: {
          processedAt: expect.any(Date),
          error: null,
        },
      });
    });
  });

  describe("markFailed", () => {
    it("should increment retryCount and set error", async () => {
      const mockUpdatedEvent = {
        id: "event-1",
        createdAt: new Date(),
        processedAt: null,
        eventType: OUTBOX_EVENTS.CHARITY_FRAUD_DETECTED,
        aggregateId: "charity-123",
        payload: {},
        error: "Network timeout",
        retryCount: 1,
      };

      const mockOutboxEvent = {
        update: vi.fn().mockResolvedValue(mockUpdatedEvent),
      };

      vi.spyOn(service as any, "prisma", "get").mockReturnValue({
        outboxEvent: mockOutboxEvent,
      });

      const result = await service.markFailed("event-1", "Network timeout");

      expect(result).toEqual(mockUpdatedEvent);
      expect(mockOutboxEvent.update).toHaveBeenCalledWith({
        where: { id: "event-1" },
        data: {
          retryCount: { increment: 1 },
          error: "Network timeout",
        },
      });
    });

    it("should truncate error message to 500 chars", async () => {
      const longError = "x".repeat(600);
      const mockOutboxEvent = {
        update: vi.fn().mockResolvedValue({}),
      };

      vi.spyOn(service as any, "prisma", "get").mockReturnValue({
        outboxEvent: mockOutboxEvent,
      });

      await service.markFailed("event-1", longError);

      const callArgs = mockOutboxEvent.update.mock.calls[0][0];
      expect(callArgs.data.error).toHaveLength(500);
    });
  });

  describe("cleanupOld", () => {
    it("should delete processed events older than retention days", async () => {
      const mockOutboxEvent = {
        deleteMany: vi.fn().mockResolvedValue({ count: 42 }),
      };

      vi.spyOn(service as any, "prisma", "get").mockReturnValue({
        outboxEvent: mockOutboxEvent,
      });

      const result = await service.cleanupOld();

      expect(result).toBe(42);
      expect(mockOutboxEvent.deleteMany).toHaveBeenCalledWith({
        where: {
          processedAt: {
            lt: expect.any(Date),
          },
        },
      });

      const cutoffDate = mockOutboxEvent.deleteMany.mock.calls[0][0].where.processedAt.lt;
      const expectedCutoff = new Date();
      expectedCutoff.setDate(
        expectedCutoff.getDate() - OUTBOX_CONFIG.RETENTION_DAYS,
      );

      // Allow 1 second difference due to execution time
      expect(
        Math.abs(cutoffDate.getTime() - expectedCutoff.getTime()),
      ).toBeLessThan(1000);
    });
  });

  describe("getStats", () => {
    it("should return queue statistics", async () => {
      const mockOutboxEvent = {
        count: vi
          .fn()
          .mockResolvedValueOnce(10) // unprocessed
          .mockResolvedValueOnce(2) // processing (at max retries)
          .mockResolvedValueOnce(5) // failed
          .mockResolvedValueOnce(17), // total
      };

      vi.spyOn(service as any, "prisma", "get").mockReturnValue({
        outboxEvent: mockOutboxEvent,
      });

      const result = await service.getStats();

      expect(result).toEqual({
        unprocessed: 10,
        processing: 2,
        failed: 5,
        total: 17,
      });
      expect(mockOutboxEvent.count).toHaveBeenCalledTimes(4);
    });
  });
});
