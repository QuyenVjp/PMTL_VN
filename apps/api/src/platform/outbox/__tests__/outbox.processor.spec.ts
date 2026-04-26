/**
 * OutboxProcessor Unit Tests
 * Tests: pollAndDispatch, cleanup cron, health check, mutex prevention
 */
import { Test, TestingModule } from "@nestjs/testing";
import { OutboxProcessor } from "../outbox.processor";
import { OutboxService } from "../outbox.service";
import { QueueService } from "../../queue/queue.service";
import { OUTBOX_EVENTS } from "../outbox.constants";

describe("OutboxProcessor", () => {
  let processor: OutboxProcessor;
  let outboxServiceMock: any;
  let queueServiceMock: any;

  beforeEach(async () => {
    outboxServiceMock = {
      findUnprocessed: vi.fn(),
      markProcessed: vi.fn(),
      markFailed: vi.fn(),
      cleanupOld: vi.fn(),
      getStats: vi.fn(),
    };

    queueServiceMock = {
      enqueueOutboxEvent: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutboxProcessor,
        {
          provide: OutboxService,
          useValue: outboxServiceMock,
        },
        {
          provide: QueueService,
          useValue: queueServiceMock,
        },
      ],
    }).compile();

    processor = module.get<OutboxProcessor>(OutboxProcessor);
  });

  describe("pollAndDispatch", () => {
    it("should fetch, enqueue, and mark events as processed", async () => {
      const mockEvents = [
        {
          id: "event-1",
          createdAt: new Date(),
          processedAt: null,
          eventType: OUTBOX_EVENTS.CHARITY_FRAUD_DETECTED,
          aggregateId: "charity-123",
          payload: { userId: "user-1" },
          error: null,
          retryCount: 0,
        },
        {
          id: "event-2",
          createdAt: new Date(),
          processedAt: null,
          eventType: OUTBOX_EVENTS.POST_CREATED,
          aggregateId: "post-456",
          payload: { title: "New Post" },
          error: null,
          retryCount: 0,
        },
      ];

      outboxServiceMock.findUnprocessed.mockResolvedValue(mockEvents);

      await processor.pollAndDispatch();

      // Verify all events were enqueued
      expect(queueServiceMock.enqueueOutboxEvent).toHaveBeenCalledTimes(2);
      expect(queueServiceMock.enqueueOutboxEvent).toHaveBeenCalledWith(mockEvents[0]);
      expect(queueServiceMock.enqueueOutboxEvent).toHaveBeenCalledWith(mockEvents[1]);

      // Verify all events were marked as processed
      expect(outboxServiceMock.markProcessed).toHaveBeenCalledTimes(2);
      expect(outboxServiceMock.markProcessed).toHaveBeenCalledWith("event-1");
      expect(outboxServiceMock.markProcessed).toHaveBeenCalledWith("event-2");
    });

    it("should skip poll if already processing (mutex)", async () => {
      // Simulate ongoing processing
      (processor as any).isProcessing = true;

      const mockEvents = [{ id: "event-1" }];
      outboxServiceMock.findUnprocessed.mockResolvedValue(mockEvents);

      await processor.pollAndDispatch();

      // No DB calls should be made
      expect(outboxServiceMock.findUnprocessed).not.toHaveBeenCalled();
    });

    it("should mark failed event on dispatch error", async () => {
      const mockEvent = {
        id: "event-1",
        createdAt: new Date(),
        processedAt: null,
        eventType: OUTBOX_EVENTS.CHARITY_FRAUD_DETECTED,
        aggregateId: "charity-123",
        payload: {},
        error: null,
        retryCount: 0,
      };

      outboxServiceMock.findUnprocessed.mockResolvedValue([mockEvent]);
      queueServiceMock.enqueueOutboxEvent.mockRejectedValue(
        new Error("Queue connection failed"),
      );

      await processor.pollAndDispatch();

      // Event should be marked as failed
      expect(outboxServiceMock.markFailed).toHaveBeenCalledWith(
        "event-1",
        "Queue connection failed",
      );
      // Should NOT be marked as processed
      expect(outboxServiceMock.markProcessed).not.toHaveBeenCalled();
    });

    it("should reset mutex after processing", async () => {
      outboxServiceMock.findUnprocessed.mockResolvedValue([]);

      await processor.pollAndDispatch();

      expect((processor as any).isProcessing).toBe(false);
    });

    it("should reset mutex even on error", async () => {
      outboxServiceMock.findUnprocessed.mockRejectedValue(
        new Error("DB error"),
      );

      await processor.pollAndDispatch();

      expect((processor as any).isProcessing).toBe(false);
    });

    it("should handle empty batch gracefully", async () => {
      outboxServiceMock.findUnprocessed.mockResolvedValue([]);

      await processor.pollAndDispatch();

      expect(outboxServiceMock.markProcessed).not.toHaveBeenCalled();
      expect(queueServiceMock.enqueueOutboxEvent).not.toHaveBeenCalled();
    });

    it("should handle partial batch failure", async () => {
      const mockEvents = [
        {
          id: "event-1",
          createdAt: new Date(),
          eventType: OUTBOX_EVENTS.CHARITY_FRAUD_DETECTED,
          aggregateId: "charity-1",
          payload: {},
          error: null,
          retryCount: 0,
        },
        {
          id: "event-2",
          createdAt: new Date(),
          eventType: OUTBOX_EVENTS.POST_CREATED,
          aggregateId: "post-2",
          payload: {},
          error: null,
          retryCount: 0,
        },
        {
          id: "event-3",
          createdAt: new Date(),
          eventType: OUTBOX_EVENTS.POST_CREATED,
          aggregateId: "post-3",
          payload: {},
          error: null,
          retryCount: 0,
        },
      ];

      outboxServiceMock.findUnprocessed.mockResolvedValue(mockEvents);

      // Fail on second event
      queueServiceMock.enqueueOutboxEvent
        .mockResolvedValueOnce("job-1") // event-1 success
        .mockRejectedValueOnce(new Error("Network error")) // event-2 failure
        .mockResolvedValueOnce("job-3"); // event-3 success

      await processor.pollAndDispatch();

      expect(outboxServiceMock.markProcessed).toHaveBeenCalledTimes(2);
      expect(outboxServiceMock.markProcessed).toHaveBeenCalledWith("event-1");
      expect(outboxServiceMock.markProcessed).toHaveBeenCalledWith("event-3");

      expect(outboxServiceMock.markFailed).toHaveBeenCalledTimes(1);
      expect(outboxServiceMock.markFailed).toHaveBeenCalledWith(
        "event-2",
        "Network error",
      );
    });
  });

  describe("cleanupOldEvents", () => {
    it("should call outboxService.cleanupOld()", async () => {
      outboxServiceMock.cleanupOld.mockResolvedValue(42);

      await processor.cleanupOldEvents();

      expect(outboxServiceMock.cleanupOld).toHaveBeenCalledOnce();
    });

    it("should handle cleanup errors gracefully", async () => {
      outboxServiceMock.cleanupOld.mockRejectedValue(
        new Error("DB cleanup failed"),
      );

      // Should not throw
      await expect(processor.cleanupOldEvents()).resolves.not.toThrow();
    });
  });

  describe("getHealth", () => {
    it("should return health status with stats", async () => {
      const mockStats = {
        unprocessed: 10,
        processing: 2,
        failed: 1,
        total: 13,
      };

      outboxServiceMock.getStats.mockResolvedValue(mockStats);

      const health = await processor.getHealth();

      expect(health).toEqual({
        status: "healthy",
        ...mockStats,
      });
    });
  });
});
