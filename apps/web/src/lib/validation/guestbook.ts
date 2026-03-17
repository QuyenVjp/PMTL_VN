import type { GuestbookSubmitInput } from "@pmtl/shared";
import { guestbookSubmitSchema } from "@pmtl/shared";

export const guestbookFormSchema = guestbookSubmitSchema;

export type GuestbookFormValues = GuestbookSubmitInput
