/**
 * Predatory Species Guard Tests
 * Tests: blacklist enforcement, error handling, request extraction
 */

import { Test, TestingModule } from "@nestjs/testing";
import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { PredatorySpeciesGuard } from "../predatory-species.guard.js";
import { SpeciesBlacklistService } from "../../services/species-blacklist.service.js";
import { AuditService } from "../../../../platform/audit/audit.service.js";

describe("PredatorySpeciesGuard", () => {
  let guard: PredatorySpeciesGuard;
  let speciesBlacklistMock: any;
  let auditMock: any;

  beforeEach(async () => {
    speciesBlacklistMock = {
      validateSpecies: vi.fn(),
      logViolation: vi.fn(),
    };
    auditMock = {
      append: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PredatorySpeciesGuard,
        {
          provide: SpeciesBlacklistService,
          useValue: speciesBlacklistMock,
        },
        {
          provide: AuditService,
          useValue: auditMock,
        },
      ],
    }).compile();

    guard = module.get<PredatorySpeciesGuard>(PredatorySpeciesGuard);
  });

  describe("canActivate", () => {
    it("should allow request with all permitted species", async () => {
      const context = createMockContext("POST", "/member/life-liberation", {
        animals: [
          { species: "FISH", quantity: 10 },
          { species: "INSECT", quantity: 50 },
        ],
      });

      speciesBlacklistMock.validateSpecies.mockResolvedValue({ valid: true });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(speciesBlacklistMock.validateSpecies).toHaveBeenCalledWith(["FISH", "INSECT"]);
    });

    it("should block request with blacklisted species", async () => {
      const context = createMockContext("POST", "/member/life-liberation", {
        animals: [
          { species: "TURTLE", quantity: 5 },
          { species: "FISH", quantity: 10 },
        ],
      });

      speciesBlacklistMock.validateSpecies.mockResolvedValue({
        valid: false,
        violations: [
          {
            species: "TURTLE",
            reason: "Protected under CITES",
            enforcement: "HABITAT_REQUIRED",
          },
        ],
      });

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
      await expect(guard.canActivate(context)).rejects.toThrow(/TURTLE/);
    });

    it("should block request with multiple blacklisted species", async () => {
      const context = createMockContext("POST", "/member/life-liberation", {
        animals: [
          { species: "TURTLE", quantity: 5 },
          { species: "BIRD", quantity: 3 },
          { species: "FISH", quantity: 10 },
        ],
      });

      speciesBlacklistMock.validateSpecies.mockResolvedValue({
        valid: false,
        violations: [
          { species: "TURTLE", reason: "Protected under CITES", enforcement: "HABITAT_REQUIRED" },
          { species: "BIRD", reason: "Endangered species", enforcement: "ALWAYS_BLOCK" },
        ],
      });

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
      const mockLogger = vi.spyOn(guard as any, "logger", "get");
      mockLogger.mockReturnValue({
        warn: vi.fn(),
      });

      expect(speciesBlacklistMock.logViolation).toHaveBeenCalledTimes(2);
    });

    it("should allow request with empty animals array", async () => {
      const context = createMockContext("POST", "/member/life-liberation", {
        animals: [],
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(speciesBlacklistMock.validateSpecies).not.toHaveBeenCalled();
    });

    it("should allow request with no body", async () => {
      const context = createMockContext("POST", "/member/life-liberation", null);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(speciesBlacklistMock.validateSpecies).not.toHaveBeenCalled();
    });

    it("should allow request with no animals field", async () => {
      const context = createMockContext("POST", "/member/life-liberation", {
        releaseDate: "2024-01-01T00:00:00Z",
        locationName: "Test Location",
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(speciesBlacklistMock.validateSpecies).not.toHaveBeenCalled();
    });

    it("should extract species from nested animal objects", async () => {
      const context = createMockContext("POST", "/member/life-liberation", {
        animals: [
          {
            species: "FISH",
            quantity: 100,
            sourceLocation: "Local pond",
            isPredatory: false,
            notes: "Carp",
          },
        ],
      });

      speciesBlacklistMock.validateSpecies.mockResolvedValue({ valid: true });

      await guard.canActivate(context);

      expect(speciesBlacklistMock.validateSpecies).toHaveBeenCalledWith(["FISH"]);
    });

    it("should skip invalid animal objects", async () => {
      const context = createMockContext("POST", "/member/life-liberation", {
        animals: [
          { species: "FISH" },
          { quantity: 10 }, // Missing species
          { species: "" }, // Empty species
          { species: "INSECT" },
        ],
      });

      speciesBlacklistMock.validateSpecies.mockResolvedValue({ valid: true });

      await guard.canActivate(context);

      expect(speciesBlacklistMock.validateSpecies).toHaveBeenCalledWith(["FISH", "INSECT"]);
    });

    it("should identify user from request", async () => {
      const context = createMockContext("POST", "/member/life-liberation", {
        animals: [{ species: "TURTLE", quantity: 5 }],
      });

      // Add user to context
      const mockRequest = createMockRequest(
        "POST",
        "/member/life-liberation",
        { animals: [{ species: "TURTLE", quantity: 5 }] },
        { id: "user-456", email: "user@example.com" },
      );

      vi.spyOn(context, "switchToHttp").mockReturnValue({
        getRequest: vi.fn().mockReturnValue(mockRequest),
      } as any);

      speciesBlacklistMock.validateSpecies.mockResolvedValue({
        valid: false,
        violations: [{ species: "TURTLE", reason: "Protected", enforcement: "HABITAT_REQUIRED" }],
      });

      try {
        await guard.canActivate(context);
      } catch {
        // Expected
      }

      expect(speciesBlacklistMock.logViolation).toHaveBeenCalledWith(
        "user-456",
        "TURTLE",
        "Protected",
      );
    });

    it("should use anonymous for unauthenticated requests", async () => {
      const context = createMockContext("POST", "/member/life-liberation", {
        animals: [{ species: "TURTLE", quantity: 5 }],
      });

      speciesBlacklistMock.validateSpecies.mockResolvedValue({
        valid: false,
        violations: [{ species: "TURTLE", reason: "Protected", enforcement: "HABITAT_REQUIRED" }],
      });

      try {
        await guard.canActivate(context);
      } catch {
        // Expected
      }

      expect(speciesBlacklistMock.logViolation).toHaveBeenCalledWith(
        "anonymous",
        "TURTLE",
        "Protected",
      );
    });

    it("should include species names in error message", async () => {
      const context = createMockContext("POST", "/member/life-liberation", {
        animals: [
          { species: "TURTLE", quantity: 5 },
          { species: "BIRD", quantity: 3 },
        ],
      });

      speciesBlacklistMock.validateSpecies.mockResolvedValue({
        valid: false,
        violations: [
          { species: "TURTLE", reason: "Protected under CITES", enforcement: "HABITAT_REQUIRED" },
          { species: "BIRD", reason: "Endangered", enforcement: "ALWAYS_BLOCK" },
        ],
      });

      try {
        await guard.canActivate(context);
        fail("Should have thrown ForbiddenException");
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        const responseText = JSON.stringify((error as ForbiddenException).getResponse());
        expect(responseText).toContain("TURTLE");
        expect(responseText).toContain("BIRD");
      }
    });

    it("should allow habitat-controlled species when safe habitat is explicitly verified", async () => {
      const context = createMockContext("POST", "/member/life-liberation", {
        habitatVerified: true,
        habitatSafe: true,
        animals: [{ species: "SNAKEHEAD", quantity: 1 }],
      });

      speciesBlacklistMock.validateSpecies.mockResolvedValue({
        valid: false,
        violations: [
          {
            species: "SNAKEHEAD",
            reason: "Predatory invasive species; release requires strict ecological controls",
            enforcement: "HABITAT_REQUIRED",
          },
        ],
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(speciesBlacklistMock.logViolation).not.toHaveBeenCalled();
    });
  });
});

/**
 * Helper to create mock ExecutionContext
 */
function createMockContext(
  method: string,
  path: string,
  body: unknown,
  user?: any,
): ExecutionContext {
  const request = createMockRequest(method, path, body, user);

  return {
    switchToHttp: vi.fn().mockReturnValue({
      getRequest: vi.fn().mockReturnValue(request),
    }),
    getHandler: vi.fn(),
  } as unknown as ExecutionContext;
}

/**
 * Helper to create mock Express request
 */
function createMockRequest(method: string, path: string, body: unknown, user?: any) {
  return {
    method,
    path,
    body,
    user,
    headers: {
      "user-agent": "Test Agent",
    },
  };
}
