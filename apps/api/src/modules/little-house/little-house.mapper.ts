import type { LhRecord, LhRecitation, LhFraud } from "../../generated/prisma/client.js";

type RecordWithUser = LhRecord & {
  user?: { publicId: string; displayName: string; email?: string } | null;
};

export function mapLhToItem(r: RecordWithUser) {
  return {
    id: r.publicId,
    beneficiaryName: r.beneficiaryName,
    status: r.status,
    draftedAt: r.draftedAt,
    signedAt: r.signedAt,
    chantedAt: r.chantedAt,
    burnedAt: r.burnedAt,
    user: r.user ? { id: r.user.publicId, name: r.user.displayName } : null,
    createdAt: r.createdAt,
  };
}

export function mapLhToDetail(r: RecordWithUser & {
  recitations?: LhRecitation[];
  fraudLogs?: LhFraud[];
}) {
  return {
    ...mapLhToItem(r),
    vowText: r.vowText,
    recentRecitations: (r.recitations ?? []).slice(0, 5).map((rec) => ({
      recitationType: rec.recitationType,
      count: rec.count,
      sessionDate: rec.sessionDate,
      chanterName: rec.chanterName,
    })),
    fraudFlags: (r.fraudLogs ?? []).filter((f) => !f.resolvedAt).length,
  };
}

export function mapFraudToItem(f: LhFraud & {
  lhRecord?: { publicId: string; beneficiaryName: string } | null;
}) {
  return {
    id: f.id,
    reason: f.reason,
    severity: f.severity,
    flaggedAt: f.flaggedAt,
    resolvedAt: f.resolvedAt,
    resolution: f.resolution,
    record: f.lhRecord ? { id: f.lhRecord.publicId, beneficiary: f.lhRecord.beneficiaryName } : null,
  };
}
