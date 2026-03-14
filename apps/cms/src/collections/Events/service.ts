import { slugify, validateEventRange } from "@pmtl/shared";

type EventInput = {
  title?: string | null;
  slug?: string | null;
  startAt?: string | null;
  endAt?: string | null;
};

export function prepareEventData(input: EventInput): EventInput {
  if (input.startAt && input.endAt) {
    const isValidRange = validateEventRange(new Date(input.startAt), new Date(input.endAt));

    if (!isValidRange) {
      throw new Error("Event endAt must be greater than or equal to startAt.");
    }
  }

  const slug = input.slug?.trim() || (input.title ? slugify(input.title) : null);

  return {
    ...input,
    slug,
  };
}
