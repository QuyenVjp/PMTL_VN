import type { EventSummary } from "@pmtl/shared";
import { format } from "date-fns";

type EventListProps = {
  events: EventSummary[];
};

export function EventList({ events }: EventListProps) {
  return (
    <div className="section-stack">
      {events.map((event) => (
        <article className="panel" key={event.id} style={{ padding: 24 }}>
          <h3 style={{ marginTop: 0 }}>{event.title}</h3>
          <p className="muted">{event.summary}</p>
          <p style={{ marginBottom: 8 }}>
            {format(new Date(event.startAt), "dd/MM/yyyy HH:mm")} -{" "}
            {format(new Date(event.endAt), "HH:mm")}
          </p>
          <strong>{event.location}</strong>
        </article>
      ))}
    </div>
  );
}

