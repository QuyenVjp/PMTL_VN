import { buildAuditLogEntry } from "@/services/audit.service";

type AuditLogHookArgs = {
  data?: Record<string, unknown>;
};

export const auditLogHooks = {
  beforeChange: [
    ({ data }: AuditLogHookArgs) => {
      return data ? buildAuditLogEntry(data) : data;
    },
  ],
};
