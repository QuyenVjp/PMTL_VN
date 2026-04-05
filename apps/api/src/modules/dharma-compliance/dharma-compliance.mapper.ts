import type {
  CharityWhitelist,
  FraudDetectionAlert,
  MaritalPurityVow,
  ThoughtStateLog,
  MaritalGuidanceRequest,
} from "../../generated/prisma/client.js";

export function mapCharityToAdminItem(c: CharityWhitelist) {
  return {
    id: c.publicId,
    name: c.name,
    charityType: c.charityType,
    status: c.status,
    registrationNumber: c.registrationNumber,
    contactEmail: c.contactEmail,
    websiteUrl: c.website,
    createdAt: c.createdAt,
  };
}

export function mapCharityToDetail(c: CharityWhitelist) {
  return {
    ...mapCharityToAdminItem(c),
    description: c.notes,
  };
}

export function mapFraudAlertToItem(
  a: FraudDetectionAlert & { charity?: { publicId: string; name: string } | null },
) {
  return {
    id: a.publicId,
    severity: a.severity,
    alertType: a.alertType,
    description: a.detectedContent,
    resolved: !!a.resolvedAt,
    resolvedAt: a.resolvedAt,
    resolution: a.resolutionNote,
    charity: a.charity ? { id: a.charity.publicId, name: a.charity.name } : null,
    createdAt: a.createdAt,
  };
}

type VowWithPractitioner = MaritalPurityVow & {
  practitioner?: { publicId: string; displayName: string; email?: string } | null;
};

export function mapVowToAdminItem(v: VowWithPractitioner) {
  return {
    id: v.publicId,
    purityLevel: v.purityLevel,
    status: v.status,
    vowDate: v.vowDate,
    kissAllowed: v.kissAllowed,
    hugAllowed: v.hugAllowed,
    sleepArrangement: v.sleepArrangement,
    practitioner: v.practitioner
      ? { id: v.practitioner.publicId, name: v.practitioner.displayName }
      : null,
    createdAt: v.createdAt,
  };
}

export function mapThoughtLogToItem(t: ThoughtStateLog) {
  return {
    id: t.id,
    thoughtType: t.thoughtType,
    intensity: t.intensity,
    durationMinutes: t.durationMinutes,
    trigger: t.trigger,
    responseAction: t.responseAction,
    resolved: t.resolved,
    timestamp: t.timestamp,
  };
}

export function mapGuidanceToItem(
  g: MaritalGuidanceRequest & { vow?: { publicId: string; practitioner?: { displayName: string } | null } | null },
) {
  return {
    id: g.id,
    category: g.category,
    question: g.question,
    urgency: g.urgency,
    status: g.status,
    response: g.response,
    practitioner: g.vow?.practitioner?.displayName ?? null,
    vowId: g.vow?.publicId ?? null,
    createdAt: g.createdAt,
  };
}
