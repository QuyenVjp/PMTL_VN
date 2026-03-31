# MODERATION_PIPELINE — AI Pre-filter + Human Review Workflow

File này chốt workflow moderation cho PMTL_VN.
Nội dung Phật pháp là sacred — cần bảo vệ nghiêm túc.

> **Related**: `AUDIT_POLICY.md`, `design/03-domains/community/`

---

## 1. Pipeline Overview

```
User submits content
        │
        ▼
┌───────────────────────────────────────┐
│ 1. Pre-validation (Zod schema)       │
│    - Length limits                    │
│    - Required fields                  │
│    - Format validation                │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│ 2. AI Pre-filter (Optional Phase 2+) │
│    - Toxicity detection               │
│    - Spam detection                   │
│    - Off-topic detection              │
│    Result: score 0-100                │
└───────────────────────────────────────┘
        │
        ├── Score < 30 ──────────────────────────┐
        │   (Auto-reject with reason)            │
        │                                        ▼
        │                              ┌─────────────────┐
        │                              │ REJECTED        │
        │                              │ → Notify user   │
        │                              │ → Log audit     │
        │                              └─────────────────┘
        │
        ├── Score 30-70 ─────────────────────────┐
        │   (Quarantine for review)              │
        │                                        ▼
        │                              ┌─────────────────┐
        │                              │ QUARANTINE      │
        │                              │ → Human review  │
        │                              │ → BullMQ queue  │
        │                              └─────────────────┘
        │
        └── Score > 70 ──────────────────────────┐
            (Auto-approve)                       │
                                                 ▼
                                       ┌─────────────────┐
                                       │ APPROVED        │
                                       │ → Publish       │
                                       │ → Log audit     │
                                       └─────────────────┘
```

---

## 2. Moderation States

```prisma
enum ModerationStatus {
  PENDING      // Chờ AI pre-filter
  QUARANTINED  // Chờ human review
  APPROVED     // Đã duyệt, hiển thị
  REJECTED     // Bị từ chối
  HIDDEN       // Đã hide sau khi publish
  ESCALATED    // Cần senior review
}
```

---

## 3. AI Pre-filter Service (Phase 2+)

```typescript
// apps/api/src/platform/moderation/ai-filter.service.ts
import { Injectable, Logger } from "@nestjs/common";

export interface FilterResult {
  score: number;           // 0-100 (higher = safer)
  categories: FilterCategory[];
  confidence: number;      // 0-1
  suggestedAction: "approve" | "quarantine" | "reject";
  reasons: string[];
}

export interface FilterCategory {
  name: string;
  score: number;
  threshold: number;
}

@Injectable()
export class AiFilterService {
  private readonly logger = new Logger(AiFilterService.name);

  /**
   * Phase 1: Rule-based filter (no external AI)
   * Phase 2+: OpenAI Moderation API or local model
   */
  async filter(content: string, contentType: string): Promise<FilterResult> {
    // Rule-based checks (Phase 1)
    const categories: FilterCategory[] = [];
    const reasons: string[] = [];
    let baseScore = 100;

    // 1. Spam patterns
    const spamScore = this.checkSpam(content);
    categories.push({ name: "spam", score: spamScore, threshold: 50 });
    if (spamScore < 50) {
      baseScore -= 30;
      reasons.push("Phát hiện mẫu spam");
    }

    // 2. Link abuse
    const linkScore = this.checkLinks(content);
    categories.push({ name: "links", score: linkScore, threshold: 60 });
    if (linkScore < 60) {
      baseScore -= 20;
      reasons.push("Quá nhiều liên kết");
    }

    // 3. Keyword blacklist
    const keywordScore = this.checkKeywords(content);
    categories.push({ name: "keywords", score: keywordScore, threshold: 40 });
    if (keywordScore < 40) {
      baseScore -= 40;
      reasons.push("Chứa từ khóa không phù hợp");
    }

    // 4. Length anomaly
    const lengthScore = this.checkLength(content, contentType);
    categories.push({ name: "length", score: lengthScore, threshold: 30 });
    if (lengthScore < 30) {
      baseScore -= 10;
      reasons.push("Độ dài bất thường");
    }

    const finalScore = Math.max(0, baseScore);
    
    return {
      score: finalScore,
      categories,
      confidence: 0.8, // Rule-based is less confident than ML
      suggestedAction: this.suggestAction(finalScore),
      reasons,
    };
  }

  private checkSpam(content: string): number {
    const spamPatterns = [
      /(.)\1{5,}/,           // Repeated characters
      /\b(mua|bán|sale)\b/gi, // Commercial spam
      /\d{10,}/,              // Long number sequences
      /(http[s]?:\/\/\S+)/gi, // URLs (count them)
    ];
    
    let violations = 0;
    for (const pattern of spamPatterns) {
      if (pattern.test(content)) violations++;
    }
    
    return Math.max(0, 100 - violations * 25);
  }

  private checkLinks(content: string): number {
    const urlMatches = content.match(/(http[s]?:\/\/\S+)/gi) || [];
    const linkCount = urlMatches.length;
    
    if (linkCount === 0) return 100;
    if (linkCount <= 2) return 80;
    if (linkCount <= 5) return 50;
    return 20;
  }

  private checkKeywords(content: string): number {
    const blacklist = [
      // Add inappropriate keywords
      // Keeping this minimal for spiritual content
    ];
    
    const lowerContent = content.toLowerCase();
    for (const word of blacklist) {
      if (lowerContent.includes(word)) return 0;
    }
    
    return 100;
  }

  private checkLength(content: string, contentType: string): number {
    const limits: Record<string, { min: number; max: number }> = {
      "guestbook": { min: 10, max: 500 },
      "comment": { min: 5, max: 2000 },
      "post": { min: 50, max: 10000 },
    };
    
    const limit = limits[contentType] || { min: 10, max: 5000 };
    const len = content.length;
    
    if (len < limit.min) return 20;
    if (len > limit.max) return 30;
    return 100;
  }

  private suggestAction(score: number): "approve" | "quarantine" | "reject" {
    if (score >= 70) return "approve";
    if (score >= 30) return "quarantine";
    return "reject";
  }
}
```

---

## 4. Moderation Queue Service

```typescript
// apps/api/src/platform/moderation/moderation-queue.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { Queue, Worker, Job } from "bullmq";
import { InjectRedis } from "@nestjs-modules/ioredis";
import { Redis } from "ioredis";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { AuditService } from "../audit/audit.service.js";

export interface ModerationJob {
  contentType: "guestbook" | "comment" | "post" | "community_post";
  contentId: string;
  contentPublicId: string;
  authorId: string;
  content: string;
  aiScore?: number;
  aiReasons?: string[];
}

@Injectable()
export class ModerationQueueService {
  private readonly logger = new Logger(ModerationQueueService.name);
  private readonly queue: Queue<ModerationJob>;
  private readonly worker: Worker<ModerationJob>;

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {
    this.queue = new Queue("moderation", {
      connection: redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      },
    });

    this.worker = new Worker("moderation", this.processJob.bind(this), {
      connection: redis,
      concurrency: 5,
    });

    this.worker.on("completed", (job) => {
      this.logger.log({ msg: "moderation.job.completed", jobId: job.id });
    });

    this.worker.on("failed", (job, error) => {
      this.logger.error({
        msg: "moderation.job.failed",
        jobId: job?.id,
        error: error.message,
      });
    });
  }

  async addToQueue(data: ModerationJob) {
    const job = await this.queue.add("review", data, {
      priority: this.getPriority(data),
    });
    
    this.logger.log({
      msg: "moderation.queued",
      jobId: job.id,
      contentType: data.contentType,
      contentId: data.contentPublicId,
    });
    
    return job;
  }

  private getPriority(data: ModerationJob): number {
    // Lower number = higher priority
    // Reported content gets higher priority
    if (data.aiScore && data.aiScore < 50) return 1;
    if (data.contentType === "post") return 2;
    return 3;
  }

  private async processJob(job: Job<ModerationJob>) {
    const { data } = job;
    
    // Auto-escalate if job has been pending too long
    const jobAge = Date.now() - job.timestamp;
    if (jobAge > 24 * 60 * 60 * 1000) { // 24 hours
      await this.escalateToSenior(data);
      return;
    }

    // For now, mark as requiring human review
    // In production, this would wait for admin action
    this.logger.log({
      msg: "moderation.awaiting_review",
      contentType: data.contentType,
      contentId: data.contentPublicId,
      aiScore: data.aiScore,
    });
  }

  private async escalateToSenior(data: ModerationJob) {
    // Update status to ESCALATED
    // Notify senior moderators
    this.logger.warn({
      msg: "moderation.escalated",
      contentType: data.contentType,
      contentId: data.contentPublicId,
      reason: "pending_too_long",
    });
  }

  async getQueueStats() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
    ]);

    return { waiting, active, completed, failed };
  }
}
```

---

## 5. Admin Moderation API

```typescript
// apps/api/src/platform/moderation/admin-moderation.controller.ts
import { Controller, Get, Post, Param, Body, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { AdminGuard } from "../../common/guards/admin.guard.js";
import { ModerationService } from "./moderation.service.js";
import { AuditContext } from "../audit/audit.service.js";

@ApiTags("Admin - Moderation")
@Controller("api/admin/moderation")
@UseGuards(AdminGuard)
export class AdminModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Get("queue")
  @ApiOperation({ summary: "Get moderation queue" })
  async getQueue(
    @Query("status") status?: string,
    @Query("contentType") contentType?: string,
    @Query("limit") limit = 20,
    @Query("offset") offset = 0,
  ) {
    return this.moderationService.getQueue({ status, contentType, limit, offset });
  }

  @Get("queue/stats")
  @ApiOperation({ summary: "Get queue statistics" })
  async getQueueStats() {
    return this.moderationService.getQueueStats();
  }

  @Get("item/:publicId")
  @ApiOperation({ summary: "Get item details" })
  async getItem(@Param("publicId") publicId: string) {
    return this.moderationService.getItemDetail(publicId);
  }

  @Post("item/:publicId/approve")
  @ApiOperation({ summary: "Approve item" })
  async approve(
    @Param("publicId") publicId: string,
    @Body("note") note: string,
    @AuditContext() auditCtx: AuditContext,
  ) {
    return this.moderationService.approve(publicId, note, auditCtx);
  }

  @Post("item/:publicId/reject")
  @ApiOperation({ summary: "Reject item" })
  async reject(
    @Param("publicId") publicId: string,
    @Body("reasonCode") reasonCode: string,
    @Body("note") note: string,
    @AuditContext() auditCtx: AuditContext,
  ) {
    return this.moderationService.reject(publicId, reasonCode, note, auditCtx);
  }

  @Post("item/:publicId/escalate")
  @ApiOperation({ summary: "Escalate to senior" })
  async escalate(
    @Param("publicId") publicId: string,
    @Body("note") note: string,
    @AuditContext() auditCtx: AuditContext,
  ) {
    return this.moderationService.escalate(publicId, note, auditCtx);
  }
}
```

---

## 6. Admin Queue UI Components (apps/admin)

```typescript
// apps/admin/src/features/moderation/components/ModerationQueue.tsx
import { useQuery, useMutation } from "@tanstack/react-query";
import { Table, Badge, Button, Sheet } from "@pmtl/ui";
import { moderationApi } from "../api/moderation.api";

export function ModerationQueue() {
  const { data, isLoading } = useQuery({
    queryKey: ["moderation", "queue"],
    queryFn: () => moderationApi.getQueue({ status: "QUARANTINED" }),
  });

  const approveMutation = useMutation({
    mutationFn: moderationApi.approve,
    onSuccess: () => queryClient.invalidateQueries(["moderation", "queue"]),
  });

  const rejectMutation = useMutation({
    mutationFn: moderationApi.reject,
    onSuccess: () => queryClient.invalidateQueries(["moderation", "queue"]),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Hàng đợi kiểm duyệt</h1>
        <QueueStats />
      </div>

      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Nội dung</Table.Head>
            <Table.Head>Loại</Table.Head>
            <Table.Head>AI Score</Table.Head>
            <Table.Head>Thời gian</Table.Head>
            <Table.Head>Hành động</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data?.items.map((item) => (
            <Table.Row key={item.publicId}>
              <Table.Cell className="max-w-md truncate">
                {item.contentPreview}
              </Table.Cell>
              <Table.Cell>
                <Badge variant="outline">{item.contentType}</Badge>
              </Table.Cell>
              <Table.Cell>
                <AiScoreBadge score={item.aiScore} />
              </Table.Cell>
              <Table.Cell>
                {formatRelativeTime(item.createdAt)}
              </Table.Cell>
              <Table.Cell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => approveMutation.mutate(item.publicId)}
                  >
                    Duyệt
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => rejectMutation.mutate(item.publicId)}
                  >
                    Từ chối
                  </Button>
                  <ModerationDetailSheet item={item} />
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}

function AiScoreBadge({ score }: { score: number }) {
  const variant = score >= 70 ? "success" : score >= 30 ? "warning" : "destructive";
  return <Badge variant={variant}>{score}</Badge>;
}

function QueueStats() {
  const { data } = useQuery({
    queryKey: ["moderation", "stats"],
    queryFn: moderationApi.getStats,
    refetchInterval: 30_000,
  });

  return (
    <div className="flex gap-4 text-sm">
      <div>Chờ duyệt: <strong>{data?.waiting}</strong></div>
      <div>Đang xử lý: <strong>{data?.active}</strong></div>
      <div>Hôm nay: <strong>{data?.completedToday}</strong></div>
    </div>
  );
}
```

---

## 7. Checklist

- [ ] ModerationStatus enum in Prisma schema
- [ ] AI pre-filter service (rule-based Phase 1)
- [ ] BullMQ queue for moderation
- [ ] Admin moderation API endpoints
- [ ] Admin queue UI component
- [ ] Audit logging for all moderation actions
- [ ] Notification to author on decision
- [ ] Escalation flow for pending items
- [ ] Metrics: queue length, processing time
- [ ] Alert when queue grows too large

---

*Owner: `design/03-domains/community/` · Last updated: 2026-03-31*
