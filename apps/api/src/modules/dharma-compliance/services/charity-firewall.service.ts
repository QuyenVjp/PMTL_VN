/**
 * CharityFirewall Service — Content Scanning & Fraud Detection
 *
 * Core responsibility: Scan user-generated content for bank account patterns,
 * cross-reference against charity whitelist, and create violations + escalation alerts.
 *
 * Design: Atomic Outbox pattern ensures events are persisted iff business transaction succeeds.
 * Reference: design/02-platform-baseline/optional-scale/EVENT_SOURCING_ARCHITECTURE.md
 */

import { Injectable } from "@nestjs/common";
import { nanoid } from "nanoid";
import pino from "pino";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { CacheService } from "../../../common/cache/cache.service.js";
import { OutboxService } from "../../../platform/outbox/outbox.service.js";
import { AuditService, type AuditContext } from "../../../platform/audit/audit.service.js";
import { OUTBOX_EVENTS, type OutboxEventType } from "../../../platform/outbox/outbox.constants.js";
import { detectBankPatterns } from "./bank-pattern.detector.js";
import { contentScanInputSchema, type ScanResult } from "../dharma-compliance.schemas.js";

/**
 * Cache key for whitelisted charity bank accounts
 * Format: "charity:whitelist:accounts"
 */
const WHITELIST_CACHE_KEY = "charity:whitelist:accounts";
const WHITELIST_CACHE_TTL_SECONDS = 300; // 5 minutes

/**
 * Whitelisted account entry in cache
 */
interface WhitelistedAccount {
  charityId: string;
  charityName: string;
  bankAccount: string;
}


@Injectable()
export class CharityFirewallService {
  private readonly logger = pino({ name: CharityFirewallService.name });

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly outbox: OutboxService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Scan content for bank account patterns and create violation if unwhitelisted
   *
   * Atomic guarantee: If transaction fails, both violation + event are rolled back.
   *
   * @param userId - User who posted/submitted the content
   * @param contentType - Type of content (POST, COMMENT, DONATION_FORM, etc)
   * @param contentId - Unique identifier for the content
   * @param text - Content text to scan
   * @param auditCtx - Audit context for logging
   * @returns Scan result with violation status and escalation info
   */
  async scanContent(
    userId: string,
    contentType: string,
    contentId: string,
    text: string,
    auditCtx: AuditContext,
  ): Promise<ScanResult> {
    // Validate input
    const validated = contentScanInputSchema.safeParse({ text, contentType });
    if (!validated.success) {
      this.logger.warn(
        {
          msg: "charity_firewall.scan_validation_failed",
          userId,
          contentType,
          errors: validated.error.issues,
        },
        "Content scan validation failed",
      );
      return {
        userId,
        contentType,
        contentId,
        text,
        detectedPatterns: [],
        hasViolation: false,
        userViolationCount: 0,
        escalatedToAlert: false,
      };
    }

    // Detect bank patterns
    const patterns = detectBankPatterns(text);
    const detectedPatterns = patterns.map((p) => ({
      type: p.type,
      confidence: p.confidence,
      matchedText: this.maskAccountNumber(p.matchedText),
    }));

    // If no patterns detected, return clean scan
    if (patterns.length === 0) {
      this.logger.debug(
        {
          msg: "charity_firewall.scan_clean",
          userId,
          contentId,
        },
        "No patterns detected",
      );
      return {
        userId,
        contentType,
        contentId,
        text,
        detectedPatterns: [],
        hasViolation: false,
        userViolationCount: 0,
        escalatedToAlert: false,
      };
    }

    // Get whitelisted accounts (cached)
    const whitelist = await this.getWhitelistedAccounts();

    // Check each pattern against whitelist
    let violationCreated = false;
    let violationId: string | undefined;
    let whitelistedMatch: { charityName: string; bankAccount: string } | undefined;
    let alertId: string | undefined;

    // Process in transaction to ensure atomic commitment
    const result = await this.prisma.$transaction(async (tx) => {
      for (const pattern of patterns) {
        const matchedAccount = this.normalizeAccountNumber(pattern.matchedText);
        const whitelisted = whitelist.find((w) => this.normalizeAccountNumber(w.bankAccount) === matchedAccount);

        if (whitelisted) {
          // Account is whitelisted, but log it for audit
          this.logger.info(
            {
              msg: "charity_firewall.whitelisted_match",
              userId,
              contentId,
              charityName: whitelisted.charityName,
              maskedAccount: this.maskAccountNumber(pattern.matchedText),
            },
            "Whitelisted account found in content",
          );
          whitelistedMatch = {
            charityName: whitelisted.charityName,
            bankAccount: this.maskAccountNumber(pattern.matchedText),
          };
          continue;
        }

        // Account not whitelisted - create violation
        if (!violationCreated) {
          const violPublicId = nanoid(21);
          violationCreated = true;
          violationId = violPublicId;

          // Create ContentViolation record
          // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          await (tx as any).fraudDetectionAlert.create({
            data: {
              publicId: violPublicId,
              alertType: "ACCOUNT_ANOMALY",
              severity: "HIGH",
              detectedContent: contentId,
              matchedAccount: this.maskAccountNumber(pattern.matchedText),
              isWhitelisted: false,
              reportedById: userId,
            },
          });

          this.logger.info(
            {
              msg: "charity_firewall.violation_created",
              userId,
              contentId,
              violationId: violPublicId,
              maskedAccount: this.maskAccountNumber(pattern.matchedText),
              pattern: pattern.type,
              confidence: pattern.confidence,
            },
            "Unwhitelisted account detected, violation created",
          );

          // Append outbox event for event sourcing
          await this.outbox.appendEvent(
            OUTBOX_EVENTS.CHARITY_CONTENT_VIOLATION_DETECTED as OutboxEventType,
            violPublicId,
            {
              userId,
              contentType,
              contentId,
              matchedAccount: this.maskAccountNumber(pattern.matchedText),
              patternType: pattern.type,
              confidence: pattern.confidence,
              timestamp: new Date().toISOString(),
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
            tx as any,
          );

          // Audit log
          await this.audit.appendInTransaction(
            tx,
            auditCtx,
            "charity.content_violation_detected",
            "content_violation",
            violPublicId,
            {
              userId,
              contentId,
              patternType: pattern.type,
              maskedAccount: this.maskAccountNumber(pattern.matchedText),
            },
          );
        }
      }

      return {
        violationCreated,
        violationId,
      };
    });

    // After transaction commits successfully, check violation count for escalation
    let userViolationCount = 0;
    let escalatedToAlert = false;

    if (result.violationCreated && result.violationId) {
      userViolationCount = await this.getUserViolationCount(userId, 30);

      // Check if escalation threshold reached (>= 3 violations in 30 days)
      if (userViolationCount >= 3) {
        alertId = await this.createFraudDetectionAlert(userId, userViolationCount, auditCtx);
        escalatedToAlert = true;

        this.logger.warn(
          {
            msg: "charity_firewall.escalation_alert_created",
            userId,
            violationCount: userViolationCount,
            alertId,
          },
          "User escalated to fraud alert due to violation threshold",
        );
      }
    }

    return {
      userId,
      contentType,
      contentId,
      text,
      detectedPatterns,
      hasViolation: violationCreated,
      whitelistedMatch,
      violationId,
      userViolationCount,
      escalatedToAlert,
      alertId,
    };
  }

  /**
   * Get all whitelisted charity bank accounts with caching
   *
   * Cache TTL: 5 minutes
   *
   * @returns Array of whitelisted accounts (charity name + bank account)
   */
  async getWhitelistedAccounts(): Promise<WhitelistedAccount[]> {
    // Try cache first
    const cached = await this.cache.getJson<WhitelistedAccount[]>(WHITELIST_CACHE_KEY);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      this.logger.debug(
        {
          msg: "charity_firewall.whitelist_cache_hit",
          count: cached.length,
        },
        "Whitelist loaded from cache",
      );
      return cached;
    }

    // Cache miss or empty - fetch from database
    const charities = await this.prisma.charityWhitelist.findMany({
      where: { status: "VERIFIED" },
      select: {
        id: true,
        name: true,
        bankAccounts: true,
      },
    });

    const whitelisted: WhitelistedAccount[] = [];
    for (const charity of charities) {
      for (const account of charity.bankAccounts) {
        whitelisted.push({
          charityId: charity.id,
          charityName: charity.name,
          bankAccount: account,
        });
      }
    }

    // Cache the result
    await this.cache.setJson(WHITELIST_CACHE_KEY, whitelisted, WHITELIST_CACHE_TTL_SECONDS);

    this.logger.debug(
      {
        msg: "charity_firewall.whitelist_cache_miss",
        count: whitelisted.length,
        charitiesCount: charities.length,
      },
      "Whitelist loaded from database and cached",
    );

    return whitelisted;
  }

  /**
   * Get rolling 30-day violation count for a user
   *
   * @param userId - User to check
   * @param days - Number of days to look back (default 30)
   * @returns Number of violations in the period
   */
  async getUserViolationCount(userId: string, days: number = 30): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - days);

    const count = await this.prisma.fraudDetectionAlert.count({
      where: {
        reportedById: userId,
        alertType: "ACCOUNT_ANOMALY",
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    this.logger.debug(
      {
        msg: "charity_firewall.user_violation_count",
        userId,
        days,
        count,
      },
      "User violation count calculated",
    );

    return count;
  }

  /**
   * Create a fraud detection alert for escalation
   *
   * @param userId - User who triggered escalation
   * @param violationCount - Number of violations
   * @param auditCtx - Audit context
   * @returns Alert ID
   */
  private async createFraudDetectionAlert(
    userId: string,
    violationCount: number,
    auditCtx: AuditContext,
  ): Promise<string> {
    const alertPublicId = nanoid(21);

    await this.prisma.$transaction(async (tx) => {
      // Create escalation alert
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await (tx as any).fraudDetectionAlert.create({
        data: {
          publicId: alertPublicId,
          alertType: "DONATION_ABUSE",
          severity: "CRITICAL",
          reportedById: userId,
          detectedContent: `User escalation: ${violationCount} violations in 30 days`,
        },
      });

      // Append escalation event
      await this.outbox.appendEvent(
        OUTBOX_EVENTS.CHARITY_FRAUD_ESCALATION_ALERT as OutboxEventType,
        alertPublicId,
        {
          userId,
          violationCount,
          reason: "Multiple unwhitelisted account detections",
          timestamp: new Date().toISOString(),
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
        tx as any,
      );

      // Audit log
      await this.audit.appendInTransaction(
        tx,
        auditCtx,
        "charity.fraud_escalation_alert",
        "fraud_alert",
        alertPublicId,
        {
          userId,
          violationCount,
          severity: "CRITICAL",
        },
      );
    });

    return alertPublicId;
  }

  /**
   * Normalize account numbers for comparison
   * Removes spaces, dashes, and converts to uppercase
   */
  private normalizeAccountNumber(account: string): string {
    return account.replace(/[\s-]/g, "").toUpperCase();
  }

  /**
   * Mask sensitive account numbers for logging
   * Shows first 2 and last 2 chars only
   */
  private maskAccountNumber(account: string): string {
    if (account.length <= 4) {
      return "*".repeat(account.length);
    }
    return account.substring(0, 2) + "*".repeat(account.length - 4) + account.substring(account.length - 2);
  }
}
