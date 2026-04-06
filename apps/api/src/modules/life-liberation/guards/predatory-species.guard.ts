/**
 * Predatory Species Guard — Route guard for dharma-compliant releases
 *
 * Responsibility: Prevent users from releasing blacklisted species.
 * Enforces dharma precepts on all POST /member/life-liberation endpoints.
 *
 * Constitution: design/03-domains/engagement/USE_CASES/life-liberation-ritual-procedure.md
 * "Guard ensures only dharma-compliant species are released"
 *
 * Registered via @UseGuards(PredatorySpeciesGuard) on controller methods.
 */

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import type { Request } from "express";
import pino from "pino";
import { SpeciesBlacklistService } from "../services/species-blacklist.service.js";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

/**
 * Extract species from request body
 * Handles both createRecord (animals array) and addProxyRelease (no animals)
 */
function extractSpeciesFromBody(body: unknown): string[] {
  if (!body || typeof body !== "object") {
    return [];
  }

  const obj = body as Record<string, unknown>;
  const animals = obj.animals;

  // For createRecord: body.animals is an array of { species, ... }
  if (Array.isArray(animals)) {
    return animals
      .filter((item) => item && typeof item === "object" && "species" in item)
      .map((item) => (item as Record<string, unknown>).species as string)
      .filter((species) => typeof species === "string" && species.length > 0);
  }

  return [];
}

@Injectable()
export class PredatorySpeciesGuard implements CanActivate {
  private readonly logger = pino({ name: PredatorySpeciesGuard.name });

  constructor(private readonly speciesBlacklist: SpeciesBlacklistService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user?.id || "anonymous";

    // Extract species from request body
    const species = extractSpeciesFromBody(request.body);

    // If no species, allow through (might be a different type of request)
    if (species.length === 0) {
      return true;
    }

    // Validate all species against blacklist
    const validation = await this.speciesBlacklist.validateSpecies(species);

    if (!validation.valid) {
      // Log violations
      for (const violation of validation.violations) {
        this.speciesBlacklist.logViolation(userId, violation.species, violation.reason);
      }

      // Build error message
      const blockedSpecies = validation.violations.map((v) => v.species).join(", ");
      const reasons = validation.violations.map((v) => v.reason).join("; ");

      this.logger.warn(
        {
          msg: "predatory_species.guard_blocked",
          userId,
          path: request.path,
          method: request.method,
          blockedSpecies,
          reasons,
        },
        "Request blocked: blacklisted species detected",
      );

      throw new ForbiddenException(
        `Không thể phóng sinh loài: ${blockedSpecies}. Lý do: ${reasons}`,
      );
    }

    // All species are permitted
    return true;
  }
}
