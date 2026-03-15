import { submitGuestbookEntry } from "@/services/community.service";

type GuestbookEntryHookArgs = {
  data?: Record<string, unknown>;
};

export const guestbookEntryHooks = {
  beforeChange: [
    ({ data }: GuestbookEntryHookArgs) => {
      return data ? submitGuestbookEntry(data) : data;
    },
  ],
};
