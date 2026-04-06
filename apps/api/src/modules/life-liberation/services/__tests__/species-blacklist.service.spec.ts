/**
 * Species Blacklist Service Tests
 * Tests: blacklist checking, validation, caching
 */

import { Test, TestingModule } from "@nestjs/testing";
import { SpeciesBlacklistService } from "../species-blacklist.service.js";
import { CacheService } from "../../../../common/cache/cache.service.js";

describe("SpeciesBlacklistService", () => {
  let service: SpeciesBlacklistService;
  let cacheServiceMock: any;

  beforeEach(async () => {
    cacheServiceMock = {
      getJson: jest.fn(),
      setJson: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpeciesBlacklistService,
        {
          provide: CacheService,
          useValue: cacheServiceMock,
        },
      ],
    }).compile();

    service = module.get<SpeciesBlacklistService>(SpeciesBlacklistService);
  });

  describe("isBlacklisted", () => {
    it("should return true for TURTLE (blacklisted species)", async () => {
      cacheServiceMock.getJson.mockResolvedValue(null);
      cacheServiceMock.setJson.mockResolvedValue(undefined);

      const result = await service.isBlacklisted("TURTLE");

      expect(result).toBe(true);
      expect(cacheServiceMock.set).toHaveBeenCalled();
    });

    it("should return true for BIRD (blacklisted species)", async () => {
      cacheServiceMock.get.mockResolvedValue(null);
      cacheServiceMock.set.mockResolvedValue(undefined);

      const result = await service.isBlacklisted("BIRD");

      expect(result).toBe(true);
    });

    it("should return false for FISH (not blacklisted)", async () => {
      cacheServiceMock.get.mockResolvedValue(null);
      cacheServiceMock.set.mockResolvedValue(undefined);

      const result = await service.isBlacklisted("FISH");

      expect(result).toBe(false);
    });

    it("should return false for INSECT (not blacklisted)", async () => {
      cacheServiceMock.get.mockResolvedValue(null);
      cacheServiceMock.set.mockResolvedValue(undefined);

      const result = await service.isBlacklisted("INSECT");

      expect(result).toBe(false);
    });

    it("should return false for FROG (not blacklisted)", async () => {
      cacheServiceMock.get.mockResolvedValue(null);
      cacheServiceMock.set.mockResolvedValue(undefined);

      const result = await service.isBlacklisted("FROG");

      expect(result).toBe(false);
    });

    it("should return false for CRAB (not blacklisted)", async () => {
      cacheServiceMock.get.mockResolvedValue(null);
      cacheServiceMock.set.mockResolvedValue(undefined);

      const result = await service.isBlacklisted("CRAB");

      expect(result).toBe(false);
    });

    it("should return false for OTHER (not blacklisted)", async () => {
      cacheServiceMock.get.mockResolvedValue(null);
      cacheServiceMock.set.mockResolvedValue(undefined);

      const result = await service.isBlacklisted("OTHER");

      expect(result).toBe(false);
    });
  });

  describe("getBlacklistEntry", () => {
    it("should return entry for TURTLE with reason", async () => {
      cacheServiceMock.get.mockResolvedValue(null);
      cacheServiceMock.set.mockResolvedValue(undefined);

      const entry = await service.getBlacklistEntry("TURTLE");

      expect(entry).toBeDefined();
      expect(entry?.species).toBe("TURTLE");
      expect(entry?.reason).toBe("Protected under CITES and SE Asian conservation laws");
      expect(entry?.regionRestrictions).toContain("VN");
    });

    it("should return entry for BIRD with reason", async () => {
      cacheServiceMock.get.mockResolvedValue(null);
      cacheServiceMock.set.mockResolvedValue(undefined);

      const entry = await service.getBlacklistEntry("BIRD");

      expect(entry).toBeDefined();
      expect(entry?.species).toBe("BIRD");
      expect(entry?.reason).toContain("endangered");
    });

    it("should return undefined for non-blacklisted species", async () => {
      cacheServiceMock.get.mockResolvedValue(null);
      cacheServiceMock.set.mockResolvedValue(undefined);

      const entry = await service.getBlacklistEntry("FISH");

      expect(entry).toBeUndefined();
    });
  });

  describe("getBlacklist", () => {
    it("should return cached blacklist on second call", async () => {
      const mockBlacklist = [
        {
          species: "TURTLE",
          reason: "Protected",
          regionRestrictions: ["VN"],
        },
      ];

      cacheServiceMock.getJson.mockResolvedValueOnce(null);
      cacheServiceMock.getJson.mockResolvedValueOnce(mockBlacklist);

      // First call - cache miss
      await service.getBlacklist();
      expect(cacheServiceMock.setJson).toHaveBeenCalled();

      // Second call - cache hit
      const result = await service.getBlacklist();
      expect(result).toEqual(mockBlacklist);
    });

    it("should return full blacklist", async () => {
      cacheServiceMock.getJson.mockResolvedValue(null);
      cacheServiceMock.setJson.mockResolvedValue(undefined);

      const blacklist = await service.getBlacklist();

      expect(blacklist.length).toBeGreaterThan(0);
      expect(blacklist.some((e) => e.species === "TURTLE")).toBe(true);
      expect(blacklist.some((e) => e.species === "BIRD")).toBe(true);
    });
  });

  describe("validateSpecies", () => {
    it("should return valid=true for all permitted species", async () => {
      cacheServiceMock.get.mockResolvedValue(null);
      cacheServiceMock.set.mockResolvedValue(undefined);

      const result = await service.validateSpecies(["FISH", "INSECT", "FROG"]);

      expect(result.valid).toBe(true);
    });

    it("should return violations for blacklisted species", async () => {
      cacheServiceMock.get.mockResolvedValue(null);
      cacheServiceMock.set.mockResolvedValue(undefined);

      const result = await service.validateSpecies(["TURTLE", "FISH", "BIRD"]);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.violations.length).toBe(2);
        expect(result.violations.some((v) => v.species === "TURTLE")).toBe(true);
        expect(result.violations.some((v) => v.species === "BIRD")).toBe(true);
        expect(result.violations.every((v) => v.reason)).toBe(true);
      }
    });

    it("should handle empty species array", async () => {
      cacheServiceMock.get.mockResolvedValue(null);
      cacheServiceMock.set.mockResolvedValue(undefined);

      const result = await service.validateSpecies([]);

      expect(result.valid).toBe(true);
    });

    it("should handle single blacklisted species", async () => {
      cacheServiceMock.get.mockResolvedValue(null);
      cacheServiceMock.set.mockResolvedValue(undefined);

      const result = await service.validateSpecies(["TURTLE"]);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.violations.length).toBe(1);
        expect(result.violations[0].species).toBe("TURTLE");
      }
    });
  });

  describe("logViolation", () => {
    it("should log violation with pino", async () => {
      const logSpy = jest.spyOn(service as any, "logger").mockImplementation({
        warn: jest.fn(),
      });

      service.logViolation("user-123", "TURTLE", "Protected species");

      expect((service as any).logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: "species_blacklist.violation_detected",
          userId: "user-123",
          species: "TURTLE",
          reason: "Protected species",
        }),
        expect.any(String),
      );

      logSpy.mockRestore();
    });
  });
});
