import { submitModerationReport } from "@/services/moderation.service";

type ModerationReportHookArgs = {
  data?: Record<string, unknown>;
};

export const moderationReportHooks = {
  beforeChange: [
    ({ data }: ModerationReportHookArgs) => {
      return data ? submitModerationReport(data) : data;
    },
  ],
};
