import { upsertPracticeLog } from "@/services/chanting.service";

type PracticeLogHookArgs = {
  data?: Record<string, unknown>;
};

export const practiceLogHooks = {
  beforeChange: [
    ({ data }: PracticeLogHookArgs) => {
      return data ? upsertPracticeLog(data) : data;
    },
  ],
};
