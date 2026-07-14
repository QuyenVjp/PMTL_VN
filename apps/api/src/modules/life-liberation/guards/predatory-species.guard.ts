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
import { AuditService } from "../../../platform/audit/audit.service.js";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    publicId?: string;
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

function hasVerifiedSafeHabitat(body: unknown): boolean {
  if (!body || typeof body !== "object") {
    return false;
  }

  const obj = body as Record<string, unknown>;
  return obj.habitatVerified === true && obj.habitatSafe === true;
}

@Injectable()
export class PredatorySpeciesGuard implements CanActivate {
  private readonly logger = pino({ name: PredatorySpeciesGuard.name });

  constructor(
    private readonly speciesBlacklist: SpeciesBlacklistService,
    private readonly audit: AuditService,
  ) {}

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
      const habitatVerified = hasVerifiedSafeHabitat(request.body);
      const hardViolations = validation.violations.filter(
        (violation) => violation.enforcement === "ALWAYS_BLOCK" || !habitatVerified,
      );

      if (hardViolations.length === 0) {
        this.logger.warn(
          {
            msg: "predatory_species.guard_habitat_verified",
            userId,
            path: request.path,
            method: request.method,
            species: validation.violations.map((v) => v.species),
          },
          "Request contains habitat-controlled species with explicit safe habitat verification",
        );
        return true;
      }

      // Log violations
      for (const violation of hardViolations) {
        this.speciesBlacklist.logViolation(userId, violation.species, violation.reason);
      }

      // Build error message
      const blockedSpecies = hardViolations.map((v) => v.species).join(", ");
      const reasons = hardViolations.map((v) => v.reason).join("; ");

      this.logger.warn(
        {
          msg: "predatory_species.guard_blocked",
          userId,
          path: request.path,
          method: request.method,
          blockedSpecies,
          reasons,
          habitatVerified,
        },
        "Request blocked: blacklisted species detected",
      );

      await this.audit.append(
        {
          // External identity only — never internal cuid.
          actorId: request.user?.publicId,
          actorType: request.user?.publicId ? "user" : "anonymous",
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"],
        },
        "member.life_release.predatory_blocked",
        "life_release_record",
        undefined,
        {
          blockedSpecies: hardViolations.map((v) => v.species),
          reasons: hardViolations.map((v) => v.reason),
          habitatVerified,
          path: request.path,
          method: request.method,
        },
      );

      throw new ForbiddenException(
        `Không thể phóng sinh loài: ${blockedSpecies}. Lý do: ${reasons}`,
      );
    }

    // All species are permitted
    return true;
  }
}
