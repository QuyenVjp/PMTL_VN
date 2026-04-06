/**
 * Predatory Species Guard Tests
 * Tests: blacklist enforcement, error handling, request extraction
 */

import { Test, TestingModule } from "@nestjs/testing";
import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { PredatorySpeciesGuard } from "../predatory-species.guard.js";
import { SpeciesBlacklistService } from "../../services/species-blacklist.service.js";
import type { CallHandler } from "@nestjs/common";

describe("PredatorySpeciesGuard", () => {
  let guard: PredatorySpeciesGuard;
  let speciesBlacklistMock: any;

  beforeEach(async () => {
    speciesBlacklistMock = {
      validateSpecies: jest.fn(),
      logViolation: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PredatorySpeciesGuard,
        {
          provide: SpeciesBlacklistService,
          useValue: speciesBlacklistMock,
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
          { species: "TURTLE", reason: "Protected under CITES" },
          { species: "BIRD", reason: "Endangered species" },
        ],
      });

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
      const mockLogger = jest.spyOn(guard as any, "logger", "get");
      mockLogger.mockReturnValue({
        warn: jest.fn(),
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

      jest.spyOn(context, "switchToHttp").mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      } as any);

      speciesBlacklistMock.validateSpecies.mockResolvedValue({
        valid: false,
        violations: [{ species: "TURTLE", reason: "Protected" }],
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
        violations: [{ species: "TURTLE", reason: "Protected" }],
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
          { species: "TURTLE", reason: "Protected under CITES" },
          { species: "BIRD", reason: "Endangered" },
        ],
      });

      try {
        await guard.canActivate(context);
        fail("Should have thrown ForbiddenException");
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect((error as ForbiddenException).getResponse()).toContain("TURTLE");
        expect((error as ForbiddenException).getResponse()).toContain("BIRD");
      }
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
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(request),
    }),
    getHandler: jest.fn(),
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
