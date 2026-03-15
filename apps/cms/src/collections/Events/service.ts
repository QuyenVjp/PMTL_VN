import { buildSlug } from "@/services/content-helpers.service";
import { ensurePublicId } from "@/services/public-id.service";
import { syncEventSearch } from "@/services/search.service";

type EventInput = {
  id?: string | number | null | undefined;
  publicId?: string | null | undefined;
  title?: string | null | undefined;
  slug?: string | null | undefined;
  description?: string | null | undefined;
  date?: string | null | undefined;
  timeString?: string | null | undefined;
  location?: string | null | undefined;
  type?: string | null | undefined;
  speaker?: string | null | undefined;
  language?: string | null | undefined;
  link?: string | null | undefined;
  youtubeId?: string | null | undefined;
  embedURL?: string | null | undefined;
  eventStatus?: string | null | undefined;
};

export function deriveEventStatus(input: Pick<EventInput, "date">): "upcoming" | "past" {
  if (!input.date) {
    return "upcoming";
  }

  return new Date(input.date).getTime() < Date.now() ? "past" : "upcoming";
}

export function prepareEventData(input: EventInput): EventInput {
  const title = input.title?.trim() ?? "";

  return ensurePublicId(
    {
      ...input,
      title,
      slug: input.slug?.trim() || buildSlug(title),
      description: input.description?.trim() ?? "",
      timeString: input.timeString?.trim() ?? "",
      location: input.location?.trim() ?? "",
      type: input.type?.trim() ?? "talk",
      speaker: input.speaker?.trim() ?? "",
      language: input.language?.trim() ?? "",
      link: input.link?.trim() ?? "",
      youtubeId: input.youtubeId?.trim() ?? "",
      embedURL: input.embedURL?.trim() ?? "",
      eventStatus: deriveEventStatus(input),
    },
    "evt",
  );
}

export function mapEventToPublicDTO(event: EventInput) {
  return {
    id: event.publicId ?? (event.id ? String(event.id) : null),
    title: event.title ?? "",
    slug: event.slug ?? "",
    description: event.description ?? "",
    date: event.date ?? null,
    location: event.location ?? "",
    type: event.type ?? "",
    eventStatus: event.eventStatus ?? deriveEventStatus(event),
  };
}

export async function syncEventSearchDocument(document: EventInput): Promise<void> {
  await syncEventSearch({
    id: document.publicId ?? document.id ?? "",
    title: document.title ?? "",
    slug: document.slug ?? "",
    excerpt: document.description ?? "",
  });
}
