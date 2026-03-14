import { SectionTitle } from "@/components/ui/section-title";
import { EventList } from "@/features/events/components/event-list";
import { upcomingEventFixtures } from "@/features/events/utils/fixtures";

export default function EventsPage() {
  return (
    <section className="section-stack">
      <SectionTitle
        title="Events domain"
        description="Listing va filter event tach rieng khoi post, nhung van dung chung shared schema."
      />
      <EventList events={upcomingEventFixtures} />
    </section>
  );
}

