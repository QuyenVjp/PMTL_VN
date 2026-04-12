/**
 * Species Blacklist Service — Dharma-compliant species management
 *
 * Responsibility: Maintain and query the list of species that cannot be released.
 * Enforces dharma precepts: prevents harm to endangered, sacred, or protected species.
 *
 * Reference: design/03-domains/engagement/USE_CASES/life-liberation-ritual-procedure.md
 * "Predatory species guard prevents releasing invasive or protected species"
 */

import { Injectable } from "@nestjs/common";
import pino from "pino";
import { CacheService } from "../../../common/cache/cache.service.js";

/**
 * Species that cannot be released per dharma compliance rules.
 * Rationale: Protected, endangered, or invasive species that would violate
 * ecological balance or violate conservation laws.
 */
const _BLACKLISTED_SPECIES = [
  "TURTLE", // Protected in most SE Asian countries
  "BIRD", // Many species are endangered (eagles, cranes, etc.)
  "SNAKEHEAD", // Predatory invasive species (cá lóc)
  "CATFISH", // Predatory invasive species (cá trê)
  "CRAB", // Predatory/eco-risk species in ritual context
] as const;

/**
 * Blacklist entry with reason for compliance audits
 */
interface BlacklistEntry {
  species: string;
  reason: string; // e.g., "CITES Appendix I", "Endangered species", "Invasive"
  regionRestrictions?: string[]; // Regions where this species is banned
}

const BLACKLIST_ENTRIES: BlacklistEntry[] = [
  {
    species: "TURTLE",
    reason: "Protected under CITES and SE Asian conservation laws",
    regionRestrictions: ["VN", "TH", "KH", "LA"],
  },
  {
    species: "BIRD",
    reason: "Many bird species are endangered (eagles, cranes, owls, etc.)",
    regionRestrictions: ["VN", "TH", "KH", "LA", "MY", "SG"],
  },
  {
    species: "SNAKEHEAD",
    reason: "Predatory invasive species; release requires strict ecological controls",
    regionRestrictions: ["VN", "TH", "KH", "LA"],
  },
  {
    species: "CATFISH",
    reason: "Predatory invasive species; release requires strict ecological controls",
    regionRestrictions: ["VN", "TH", "KH", "LA"],
  },
  {
    species: "CRAB",
    reason: "Predatory/high-risk species in life-liberation safety policy",
    regionRestrictions: ["VN", "TH", "KH", "LA"],
  },
];

/**
 * Cache key for blacklist
 */
const BLACKLIST_CACHE_KEY = "life-liberation:species-blacklist";
const BLACKLIST_CACHE_TTL_SECONDS = 3600; // 1 hour

@Injectable()
export class SpeciesBlacklistService {
  private readonly logger = pino({ name: SpeciesBlacklistService.name });

  constructor(private readonly cache: CacheService) {}

  /**
   * Check if a species is blacklisted for release
   *
   * @param species Species name (e.g., "TURTLE", "FISH")
   * @returns true if species is blacklisted and cannot be released
   */
  async isBlacklisted(species: string): Promise<boolean> {
    const blacklist = await this.getBlacklist();
    return blacklist.some((entry) => entry.species === species);
  }

  /**
   * Get the blacklist entry for a species (for audit/compliance)
   *
   * @param species Species name
   * @returns Blacklist entry with reason, or undefined if not blacklisted
   */
  async getBlacklistEntry(species: string): Promise<BlacklistEntry | undefined> {
    const blacklist = await this.getBlacklist();
    return blacklist.find((entry) => entry.species === species);
  }

  /**
   * Get full blacklist (cached)
   *
   * @returns Array of blacklisted species with reasons
   */
  async getBlacklist(): Promise<BlacklistEntry[]> {
    // Try cache first
    const cached = await this.cache.getJson<BlacklistEntry[]>(BLACKLIST_CACHE_KEY);
    if (cached) {
      return cached;
    }

    // Return default list (in real app, would load from database)
    const blacklist = BLACKLIST_ENTRIES;

    // Cache for 1 hour
    await this.cache.setJson(BLACKLIST_CACHE_KEY, blacklist, BLACKLIST_CACHE_TTL_SECONDS);

    return blacklist;
  }

  /**
   * Validate a list of species for release
   *
   * @param species Array of species names
   * @returns { valid: true } or { valid: false, violations: [species, ...] }
   */
  async validateSpecies(species: string[]): Promise<
    | { valid: true }
    | {
        valid: false;
        violations: Array<{
          species: string;
          reason: string;
        }>;
      }
  > {
    const violations = [];

    for (const sp of species) {
      const entry = await this.getBlacklistEntry(sp);
      if (entry) {
        violations.push({
          species: sp,
          reason: entry.reason,
        });
      }
    }

    if (violations.length > 0) {
      return { valid: false, violations };
    }

    return { valid: true };
  }

  /**
   * Log blacklist violation for audit trail
   *
   * @param userId User attempting the release
   * @param species Species that was blocked
   * @param reason Reason for blocking (from blacklist)
   */
  logViolation(userId: string, species: string, reason: string): void {
    this.logger.warn(
      {
        msg: "species_blacklist.violation_detected",
        userId,
        species,
        reason,
      },
      "Attempted release of blacklisted species",
    );
  }
}
