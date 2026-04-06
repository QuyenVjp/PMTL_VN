/**
 * OutboxService Integration Tests
 * REQUIRES: Real Prisma client + PostgreSQL database
 *
 * Tests:
 * - Event persisted atomically within transaction
 * - Transaction rollback → event also rolled back (atomicity guarantee)
 * - Full flow: appendEvent → findUnprocessed → dispatch → mark processed
 *
 * Run: npm run test:integration
 * (Requires DATABASE_URL pointing to test database)
 */
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { OutboxService } from "../outbox.service";
import { OUTBOX_EVENTS } from "../outbox.constants";

/**
 * Integration test suite — skipped if DATABASE_URL is not available
 */
describe("OutboxService Integration", () => {
  let service: OutboxService;
  let prisma: PrismaService;

  beforeAll(async () => {
    // Skip if no database available
    if (!process.env.DATABASE_URL) {
      console.log("⊘ Skipping integration tests (DATABASE_URL not set)");
      return;
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [OutboxService, PrismaService],
    }).compile();

    service = module.get<OutboxService>(OutboxService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });

  beforeEach(async () => {
    if (!service || !prisma) return;

    // Clean up test data
    await prisma.outboxEvent.deleteMany({});
  });

  describe("Atomic Event Persistence", () => {
    it("should persist event atomically within transaction", async () => {
      if (!service || !prisma) {
        console.log("⊘ Skipping test (no database)");
        return;
      }

      const aggregateId = "charity-test-1";

      const appended = await prisma.$transaction(async (tx) => {
        // Simulate business operation
        const event = await service.appendEvent(
          OUTBOX_EVENTS.CHARITY_FRAUD_DETECTED,
          aggregateId,
          { userId: "user-1", reason: "test" },
          tx,
        );
        return event;
      });

      // Event should be persisted
      const found = await prisma.outboxEvent.findUnique({
        where: { id: appended.id },
      });

      expect(found).not.toBeNull();
      expect(found?.eventType).toBe(OUTBOX_EVENTS.CHARITY_FRAUD_DETECTED);
      expect(found?.aggregateId).toBe(aggregateId);
    });

    it("should rollback event when transaction fails", async () => {
      if (!service || !prisma) {
        console.log("⊘ Skipping test (no database)");
        return;
      }

      const aggregateId = "charity-test-rollback";
      let eventId: string = "";

      try {
        await prisma.$transaction(async (tx) => {
          // Append event
          const event = await service.appendEvent(
            OUTBOX_EVENTS.CHARITY_FRAUD_DETECTED,
            aggregateId,
            { userId: "user-1" },
            tx,
          );
          eventId = event.id;

          // Force transaction to fail
          throw new Error("Simulated business error");
        });
      } catch (error) {
        // Expected to fail
      }

      // Event should be rolled back (not persisted)
      const found = await prisma.outboxEvent.findUnique({
        where: { id: eventId },
      });

      expect(found).toBeNull();
    });
  });

  describe("Full Event Lifecycle", () => {
    it("should complete full flow: append → find → enqueue → mark processed", async () => {
      if (!service || !prisma) {
        console.log("⊘ Skipping test (no database)");
        return;
      }

      // 1. Append event
      const appended = await prisma.$transaction(async (tx) => {
        return await service.appendEvent(
          OUTBOX_EVENTS.POST_CREATED,
          "post-1",
          { title: "Test Post", authorId: "author-1" },
          tx,
        );
      });

      expect(appended.id).toBeDefined();
      expect(appended.processedAt).toBeNull();

      // 2. Find unprocessed events
      const unprocessed = await service.findUnprocessed(50);

      expect(unprocessed.length).toBeGreaterThan(0);
      expect(unprocessed).toContainEqual(expect.objectContaining({
        id: appended.id,
        eventType: OUTBOX_EVENTS.POST_CREATED,
      }));

      // 3. Mark as processed (simulates dispatch success)
      const processed = await service.markProcessed(appended.id);

      expect(processed.processedAt).not.toBeNull();
      expect(processed.error).toBeNull();

      // 4. Verify no longer in unprocessed
      const stillUnprocessed = await service.findUnprocessed(50);

      expect(stillUnprocessed).not.toContainEqual(
        expect.objectContaining({ id: appended.id }),
      );
    });

    it("should track retry count on failures", async () => {
      if (!service || !prisma) {
        console.log("⊘ Skipping test (no database)");
        return;
      }

      // Create event
      const created = await prisma.$transaction(async (tx) => {
        return await service.appendEvent(
          OUTBOX_EVENTS.MODERATION_ESCALATED,
          "comment-1",
          { reportId: "report-1" },
          tx,
        );
      });

      // First failure
      let failed = await service.markFailed(created.id, "Network timeout");
      expect(failed.retryCount).toBe(1);
      expect(failed.error).toBe("Network timeout");

      // Second failure
      failed = await service.markFailed(created.id, "DB lock timeout");
      expect(failed.retryCount).toBe(2);
      expect(failed.error).toBe("DB lock timeout");

      // Third failure — should still be findable
      failed = await service.markFailed(created.id, "Service unavailable");
      expect(failed.retryCount).toBe(3);

      // Fourth failure — still at max retries, query should exclude
      const fresh = await prisma.outboxEvent.findUnique({
        where: { id: created.id },
      });
      expect(fresh?.retryCount).toBe(3);

      const unprocessed = await service.findUnprocessed(50);
      expect(unprocessed).not.toContainEqual(
        expect.objectContaining({ id: created.id }),
      );
    });
  });

  describe("Cleanup", () => {
    it("should delete old processed events", async () => {
      if (!service || !prisma) {
        console.log("⊘ Skipping test (no database)");
        return;
      }

      // Create old processed event (manually, since cleanupOld uses date math)
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 40);

      const old = await prisma.outboxEvent.create({
        data: {
          eventType: OUTBOX_EVENTS.POST_CREATED,
          aggregateId: "old-post",
          payload: {},
          processedAt: oldDate,
        },
      });

      // Create recent processed event
      const recent = await prisma.outboxEvent.create({
        data: {
          eventType: OUTBOX_EVENTS.POST_CREATED,
          aggregateId: "recent-post",
          payload: {},
          processedAt: new Date(),
        },
      });

      // Run cleanup
      const deletedCount = await service.cleanupOld();

      expect(deletedCount).toBeGreaterThanOrEqual(1);

      // Old event should be gone
      const oldFound = await prisma.outboxEvent.findUnique({
        where: { id: old.id },
      });
      expect(oldFound).toBeNull();

      // Recent event should still exist
      const recentFound = await prisma.outboxEvent.findUnique({
        where: { id: recent.id },
      });
      expect(recentFound).not.toBeNull();
    });
  });

  describe("Stats", () => {
    it("should return accurate stats", async () => {
      if (!service || !prisma) {
        console.log("⊘ Skipping test (no database)");
        return;
      }

      // Create test events
      await prisma.$transaction(async (tx) => {
        await service.appendEvent(
          OUTBOX_EVENTS.POST_CREATED,
          "post-1",
          {},
          tx,
        );
        await service.appendEvent(
          OUTBOX_EVENTS.POST_CREATED,
          "post-2",
          {},
          tx,
        );
      });

      // Mark one as processed
      const events = await service.findUnprocessed(50);
      if (events.length > 0) {
        await service.markProcessed(events[0].id);
      }

      const stats = await service.getStats();

      expect(stats.total).toBeGreaterThanOrEqual(2);
      expect(stats.unprocessed).toBeGreaterThanOrEqual(1);
    });
  });
});
